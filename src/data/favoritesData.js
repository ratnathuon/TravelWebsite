import { db } from "../firebase";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const FAVORITES_KEY = "favorites";
const USER_KEY = "travel_cambodia_user";

/**
 * Clean & sanitize user identifier for Firestore document keys
 */
export function sanitizeUserId(user) {
  if (!user) {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        user = parsed;
      }
    } catch {}
  }
  if (!user) return null;
  if (typeof user === "string") return user.replace(/[^a-zA-Z0-9_-]/g, "_");
  if (user.uid) return user.uid;
  if (user.email) return user.email.replace(/[^a-zA-Z0-9_-]/g, "_");
  return null;
}

/**
 * Fetch favorite places for a user directly from Firestore database (`user_favorites` collection)
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
    } else if (localFavs.length > 0) {
      // Sync local favorites to database if Firestore doc is newly created
      await saveUserFavoritesToDb(user, localFavs);
    }
  } catch (err) {
    console.error("Error fetching user favorites from Firestore database:", err);
  }
  return localFavs;
}

/**
 * Save & sync user favorites array directly into Firestore database (`user_favorites` collection)
 */
export async function saveUserFavoritesToDb(user, favoritesArray) {
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
    console.error("Error saving user favorites to Firestore database:", err);
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

  const imgSrc = place.image || place.img || "";

  if (existsIndex >= 0) {
    favorites.splice(existsIndex, 1);
  } else {
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

  await saveUserFavoritesToDb(user, favorites);
  return favorites;
}

/**
 * Check if a destination is in the user's favorite list
 */
export function isFavoriteInDb(placeName) {
  if (!placeName) return false;
  try {
    const favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    return favorites.some(
      (p) => (p.name || "").toLowerCase() === placeName.toLowerCase()
    );
  } catch {
    return false;
  }
}
