import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const STORAGE_KEY = "travel_cambodia_user";
const FAVORITES_KEY = "favorites";

/**
 * Helper to sanitize user identifier for Firestore document keys
 */
export function sanitizeUserId(user) {
  if (!user) return null;
  if (typeof user === "string") return user.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (user.uid) return user.uid;
  if (user.email) return user.email.replace(/[^a-zA-Z0-9_-]/g, "_");
  return null;
}

/**
 * Save or update user profile account information into Firestore database (`users` collection)
 */
export async function saveUserProfileToDb(user, profileData = {}) {
  const userId = sanitizeUserId(user);
  if (!userId) return null;

  const userRef = doc(db, "users", userId);

  // Fetch existing Firestore snapshot to preserve populated profile fields
  let existingData = {};
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      existingData = docSnap.data();
    }
  } catch {}

  const fullName = profileData.name || user.displayName || user.name || existingData.name || "Explorer";

  let firstName = profileData.firstName;
  let lastName = profileData.lastName;
  if (!firstName && !lastName && fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  const payload = {
    uid: user.uid || userId,
    email: user.email || profileData.email || existingData.email || "",
    name: fullName,
    firstName: firstName || existingData.firstName || "",
    lastName: lastName || existingData.lastName || "",
    phone: (profileData.phone !== undefined && profileData.phone !== "") ? profileData.phone : (existingData.phone || ""),
    location: (profileData.location !== undefined && profileData.location !== "") ? profileData.location : (existingData.location || ""),
    bio: (profileData.bio !== undefined && profileData.bio !== "") ? profileData.bio : (existingData.bio || ""),
    photoURL: profileData.photoURL || user.photoURL || existingData.photoURL || null,
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(userRef, payload, { merge: true });
  } catch (err) {
    console.error("Error saving user profile to Firestore database:", err);
  }

  // Sync local storage cache
  try {
    const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const merged = { ...currentLocal, ...payload };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {}

  return payload;
}

/**
 * Fetch user profile account information from Firestore database (`users` collection)
 */
export async function fetchUserProfileFromDb(user) {
  const userId = sanitizeUserId(user);
  if (!userId) return null;

  try {
    const userRef = doc(db, "users", userId);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Update local storage cache
      try {
        const currentLocal = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...currentLocal, ...data }));
      } catch {}
      return data;
    }
  } catch (err) {
    console.error("Error fetching user profile from Firestore database:", err);
  }
  return null;
}

/**
 * Fetch user favorite places from Firestore database (`user_favorites` collection)
 */
export async function fetchUserFavoritesFromDb(user) {
  const userId = sanitizeUserId(user);
  let localFavs = [];
  try {
    localFavs = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {}

  if (!userId) return localFavs;

  try {
    const favRef = doc(db, "user_favorites", userId);
    const docSnap = await getDoc(favRef);
    if (docSnap.exists() && Array.isArray(docSnap.data()?.favorites)) {
      const dbFavs = docSnap.data().favorites;
      try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(dbFavs));
        window.dispatchEvent(new Event("favoritesUpdated"));
      } catch {}
      return dbFavs;
    }
  } catch (err) {
    console.error("Error fetching user favorites from Firestore database:", err);
  }
  return localFavs;
}

/**
 * Save / Sync entire user favorites array into Firestore database (`user_favorites` collection)
 */
export async function syncFavoritesToDb(user, favoritesArray) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesArray));
    window.dispatchEvent(new Event("favoritesUpdated"));
  } catch {}

  const userId = sanitizeUserId(user);
  if (!userId) return;

  try {
    const favRef = doc(db, "user_favorites", userId);
    await setDoc(
      favRef,
      {
        userId,
        favorites: favoritesArray,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    console.error("Error syncing user favorites to Firestore database:", err);
  }
}

/**
 * Toggle a destination in user's favorite places and store in Firestore database
 */
export async function toggleFavoriteInDb(user, place) {
  let favorites = [];
  try {
    favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {}

  const placeNameLower = (place.name || "").toLowerCase();
  const existsIndex = favorites.findIndex(
    (p) => (p.name || "").toLowerCase() === placeNameLower
  );

  if (existsIndex >= 0) {
    favorites.splice(existsIndex, 1);
  } else {
    const imgSrc = place.image || place.img || "";
    favorites.push({
      id: place.id || `place_${Date.now()}`,
      name: place.name,
      cat: place.cat || "plains",
      location: place.location || "Cambodia",
      rating: place.rating || 5,
      img: imgSrc,
      image: imgSrc,
      searchNames: place.searchNames || [place.name],
    });
  }

  await syncFavoritesToDb(user, favorites);
  return favorites;
}
