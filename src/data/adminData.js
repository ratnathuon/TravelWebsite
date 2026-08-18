import { db, storage } from "../firebase";
import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  onSnapshot,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { destinationsData } from "./destinationsData";
import defaultMembers from "./memberdata";

// Region Categories
export const CATEGORIES = [
  { label: "The Plains Region", value: "plains" },
  { label: "Tonle Sap Lake Area", value: "tonle" },
  { label: "Coastal Region", value: "coastal" },
  { label: "Mountain and Plateau Region", value: "mountain" },
];

// Preset Image Options
export const PRESET_IMAGES = [
  { label: "Angkor Wat", url: "/assets/PicPlace/siemreap/Angkor Wat .jpg" },
  { label: "Koh Han", url: "/assets/PicPlace/Koh Han.jpeg" },
  { label: "Veal Pouch Waterfall", url: "/assets/PicPlace/Veal Pouch Waterfall, Kompot.jpeg" },
  { label: "Koh Rong", url: "/assets/koh rong island.jpg" },
  { label: "Kampot Riverfront", url: "/assets/Kampot-Riverfront-Boutique.webp" },
];


// Fallback Default Admins (only used if Firestore database is completely empty or offline)
export const DEFAULT_SYSTEM_ADMINS = [
  "admin@travelcambodia.com",
];

/**
 * Check if a given email is an admin using dynamic database list or cache
 */
export function isEmailAdmin(email, dynamicList = []) {
  if (!email || typeof email !== "string") return false;
  const cleanEmail = email.toLowerCase().trim();

  // 1. Check live dynamic list from Firestore
  if (Array.isArray(dynamicList) && dynamicList.some((a) => (a || "").toLowerCase().trim() === cleanEmail)) {
    return true;
  }

  // 2. Check cached Firestore admin list in localStorage
  try {
    const saved = JSON.parse(localStorage.getItem("travel_admin_emails") || "[]");
    if (Array.isArray(saved) && saved.some((a) => (a || "").toLowerCase().trim() === cleanEmail)) {
      return true;
    }
  } catch {}

  // 3. Fallback default
  if (DEFAULT_SYSTEM_ADMINS.some((a) => a.toLowerCase() === cleanEmail)) {
    return true;
  }

  // 4. Check admin prefixes
  if (cleanEmail.startsWith("admin@") || cleanEmail.startsWith("admin.")) {
    return true;
  }

  return false;
}

/**
 * Directly query Firestore database to verify if an email exists in the `admins` collection
 */
export async function checkIsAdminInDatabase(email) {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  const adminDocId = cleanEmail.replace(/[^a-z0-9]/gi, "_");

  try {
    const adminDocRef = doc(db, "admins", adminDocId);
    const docSnap = await getDoc(adminDocRef);
    if (docSnap.exists()) {
      return true;
    }
  } catch (err) {
    console.warn("Direct Firestore admin query error:", err);
  }
  return false;
}

// Firestore Admin Helper Functions

/**
 * Fetch all system admin emails from Firestore `admins` collection and sync to localStorage
 */
export async function fetchSystemAdminsFromDb() {
  try {
    const querySnapshot = await getDocs(collection(db, "admins"));
    const firestoreAdmins = [];
    if (!querySnapshot.empty) {
      querySnapshot.docs.forEach((docSnap) => {
        const data = docSnap.data();
        const email = data?.email || docSnap.id;
        if (email) firestoreAdmins.push(email.toLowerCase().trim());
      });
    }

    const combined = Array.from(
      new Set([...DEFAULT_SYSTEM_ADMINS.map((e) => e.toLowerCase().trim()), ...firestoreAdmins])
    );

    try {
      localStorage.setItem("travel_admin_emails", JSON.stringify(combined));
      window.dispatchEvent(new CustomEvent("adminsUpdated", { detail: combined }));
    } catch {}

    return combined;
  } catch (err) {
    console.warn("Could not fetch system admins from Firestore:", err);
    return DEFAULT_SYSTEM_ADMINS;
  }
}

/**
 * Real-time listener for Firestore `admins` collection
 */
export function subscribeToSystemAdmins(onUpdate) {
  try {
    const unsubscribe = onSnapshot(
      collection(db, "admins"),
      (snapshot) => {
        const firestoreAdmins = [];
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          const email = data?.email || docSnap.id;
          if (email) firestoreAdmins.push(email.toLowerCase().trim());
        });

        const combined = Array.from(
          new Set([...DEFAULT_SYSTEM_ADMINS.map((e) => e.toLowerCase().trim()), ...firestoreAdmins])
        );

        try {
          localStorage.setItem("travel_admin_emails", JSON.stringify(combined));
          window.dispatchEvent(new CustomEvent("adminsUpdated", { detail: combined }));
        } catch {}

        if (typeof onUpdate === "function") {
          onUpdate(combined);
        }
      },
      (err) => {
        console.warn("Realtime admins subscription warning:", err);
      }
    );
    return unsubscribe;
  } catch (err) {
    console.warn("Failed to subscribe to system admins:", err);
    return () => {};
  }
}

/**
 * Save new admin email to Firestore `admins` collection
 */
export async function addSystemAdminToDb(email, addedBy = "system") {
  const trimmed = email.trim().toLowerCase();
  const adminDocId = trimmed.replace(/[^a-z0-9]/gi, "_");
  await setDoc(
    doc(db, "admins", adminDocId),
    {
      email: trimmed,
      addedAt: serverTimestamp(),
      addedBy: addedBy,
    },
    { merge: true }
  );

  // Update local storage cache immediately
  try {
    const current = JSON.parse(localStorage.getItem("travel_admin_emails") || "[]");
    const updated = Array.from(new Set([...current, trimmed]));
    localStorage.setItem("travel_admin_emails", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("adminsUpdated", { detail: updated }));
  } catch {}

  return trimmed;
}

/**
 * Delete admin email from Firestore `admins` collection
 */
export async function removeSystemAdminFromDb(email) {
  const trimmed = email.trim().toLowerCase();
  const adminDocId = trimmed.replace(/[^a-z0-9]/gi, "_");
  await deleteDoc(doc(db, "admins", adminDocId));

  // Update local storage cache
  try {
    const current = JSON.parse(localStorage.getItem("travel_admin_emails") || "[]");
    const updated = current.filter((e) => (e || "").toLowerCase().trim() !== trimmed);
    localStorage.setItem("travel_admin_emails", JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent("adminsUpdated", { detail: updated }));
  } catch {}

  return trimmed;
}

/**
 * Fetch all destinations from Firestore `destinations` collection
 */
export async function fetchDestinationsFromDb() {
  const querySnapshot = await getDocs(collection(db, "destinations"));
  return querySnapshot.docs.map((docSnap) => ({
    docId: docSnap.id,
    ...docSnap.data(),
  }));
}

/**
 * Save or update destination payload in Firestore
 */
export async function saveDestinationToDb(docId, payload) {
  const destinationRef = doc(db, "destinations", docId);
  await setDoc(destinationRef, { ...payload, updatedAt: serverTimestamp() }, { merge: true });
}

/**
 * Delete destination document from Firestore
 */
export async function deleteDestinationFromDb(docId) {
  await deleteDoc(doc(db, "destinations", docId));
}

/**
 * Upload cover or gallery image to Firebase Storage
 */
export async function uploadImageToStorage(file, folder = "destinations") {
  if (!storage) throw new Error("Firebase storage not initialized");
  const storageRef = ref(storage, `${folder}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

/**
 * Compress and resize image file/dataUrl to stay lightweight (<100KB) for Firestore/Storage
 */
export function compressImage(source, maxWidth = 1000, maxHeight = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    if (!source) return resolve("");
    const img = new Image();
    const isFile = source instanceof File || source instanceof Blob;
    const url = isFile ? URL.createObjectURL(source) : source;

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      if (isFile) URL.revokeObjectURL(url);
      resolve(compressedDataUrl);
    };

    img.onerror = (err) => {
      console.warn("Image compression failed, using original source:", err);
      if (isFile) URL.revokeObjectURL(url);
      resolve(typeof source === "string" ? source : "");
    };

    img.src = url;
  });
}

/**
 * Submit pending user photo for admin approval
 */
export async function submitPendingUserPhotoToDb(docId, photoItem) {
  if (!docId) throw new Error("Invalid destination document ID");
  const destinationRef = doc(db, "destinations", docId);
  await setDoc(
    destinationRef,
    {
      pendingGallery: arrayUnion(photoItem),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Approve pending user photo: append URL to `gallery` array (keeping ALL existing photos intact) and remove from `pendingGallery`
 */
export async function approvePendingUserPhotoInDb(docId, photoItem) {
  if (!docId) throw new Error("Invalid destination document ID");
  const destinationRef = doc(db, "destinations", docId);
  const docSnap = await getDoc(destinationRef);

  let currentGallery = [];
  let currentPending = [];

  if (docSnap.exists()) {
    const data = docSnap.data();
    currentGallery = Array.isArray(data.gallery) ? [...data.gallery] : [];
    currentPending = Array.isArray(data.pendingGallery) ? [...data.pendingGallery] : [];
  }

  // Preserve existing static gallery photos if Firestore gallery array was empty
  if (currentGallery.length === 0) {
    const staticItem = destinationsData.find(
      (st) => st.id === docId || st.name?.toLowerCase() === docSnap.data()?.name?.toLowerCase()
    );
    if (staticItem && Array.isArray(staticItem.gallery)) {
      currentGallery = [...staticItem.gallery];
    }
  }

  // Append new photo URL to gallery if not already present
  if (photoItem?.url && !currentGallery.includes(photoItem.url)) {
    currentGallery.push(photoItem.url);
  }

  // Filter out approved item from pendingGallery by ID and URL matching
  const updatedPending = currentPending.filter(
    (item) => item.id !== photoItem.id && item.url !== photoItem.url
  );

  await setDoc(
    destinationRef,
    {
      gallery: currentGallery,
      pendingGallery: updatedPending,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Reject pending user photo: remove from `pendingGallery`
 */
export async function rejectPendingUserPhotoInDb(docId, photoItem) {
  if (!docId) throw new Error("Invalid destination document ID");
  const destinationRef = doc(db, "destinations", docId);
  const docSnap = await getDoc(destinationRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const currentPending = Array.isArray(data.pendingGallery) ? data.pendingGallery : [];
    const updatedPending = currentPending.filter(
      (item) => item.id !== photoItem.id && item.url !== photoItem.url
    );

    await setDoc(
      destinationRef,
      {
        pendingGallery: updatedPending,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  }
}

/**
 * Default About Page Content
 */
export const DEFAULT_ABOUT_INFO = {
  headerPrefix: "We’re Students",
  headerKeywords: ["of RUPP", "ITE", "Engineering"],
  description:
    "Powered by a team of IT Engineering students at RUPP, Travel Cambodia is a digital initiative dedicated to showcasing the beauty of our home. We combine engineering precision with local insight to help you navigate the Kingdom of Wonder effortlessly.",
  disclaimer:
    "This website was created by our team for educational and non-commercial learning purposes. We sincerely apologize if any image or media source was used without explicit permission or proper credit. Thank you for your understanding.",
  sourcesTitle: "Source of Content & Media",
  sources: [
    {
      id: "google_maps",
      name: "Google Maps",
      category: "Maps & Data",
      url: "https://maps.google.com",
    },
    {
      id: "pixabay",
      name: "Pixabay",
      category: "Free Images",
      url: "https://pixabay.com",
    },
    {
      id: "cambodia_tourism",
      name: "Cambodia Tourism",
      category: "Cultural Info",
      url: "https://tourism.gov.kh/",
    },
  ],
};

/**
 * Fetch About Page Information from Firestore `site_settings/about`
 */
export async function fetchAboutInfoFromDb() {
  try {
    const docRef = doc(db, "site_settings", "about");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      const merged = { ...DEFAULT_ABOUT_INFO, ...data };
      try {
        localStorage.setItem("travel_about_info", JSON.stringify(merged));
      } catch {}
      return merged;
    }
  } catch (error) {
    console.warn("Could not fetch about info from Firestore:", error);
  }

  // Fallback to local cache or defaults
  try {
    const cached = JSON.parse(localStorage.getItem("travel_about_info") || "null");
    if (cached) return cached;
  } catch {}

  return DEFAULT_ABOUT_INFO;
}

/**
 * Real-time subscription to About Page Information in Firestore `site_settings/about`
 */
export function subscribeToAboutInfo(onUpdate) {
  try {
    const docRef = doc(db, "site_settings", "about");
    const unsub = onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = { ...DEFAULT_ABOUT_INFO, ...docSnap.data() };
          try {
            localStorage.setItem("travel_about_info", JSON.stringify(data));
          } catch {}
          if (typeof onUpdate === "function") onUpdate(data);
        } else {
          if (typeof onUpdate === "function") onUpdate(DEFAULT_ABOUT_INFO);
        }
      },
      (err) => {
        console.warn("Error subscribing to about info from Firestore:", err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn("Failed to subscribe to about info:", err);
    return () => {};
  }
}

/**
 * Save About Page Information to Firestore `site_settings/about`
 */
export async function saveAboutInfoToDb(aboutObj) {
  const docRef = doc(db, "site_settings", "about");
  const payload = {
    ...aboutObj,
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, payload, { merge: true });

  try {
    localStorage.setItem("travel_about_info", JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("aboutInfoUpdated", { detail: payload }));
  } catch {}

  return payload;
}

/**
 * Fetch team members from Firestore `team_members` collection.
 * Does NOT overwrite Firestore if the collection is empty.
 */
export async function fetchTeamMembersFromDb() {
  try {
    const querySnapshot = await getDocs(collection(db, "team_members"));
    if (!querySnapshot.empty) {
      const list = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      try {
        localStorage.setItem("travel_team_members", JSON.stringify(list));
      } catch {}
      return list;
    }

    // Check cached list if Firestore was empty
    try {
      const cached = JSON.parse(localStorage.getItem("travel_team_members") || "null");
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}

    return defaultMembers;
  } catch (error) {
    console.error("Error fetching team members from Firestore:", error);
    try {
      const cached = JSON.parse(localStorage.getItem("travel_team_members") || "null");
      if (Array.isArray(cached) && cached.length > 0) return cached;
    } catch {}
    return defaultMembers;
  }
}

/**
 * Real-time listener for Firestore `team_members` collection
 */
export function subscribeToTeamMembers(onUpdate) {
  try {
    const unsub = onSnapshot(
      collection(db, "team_members"),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map((docSnap) => ({
            id: docSnap.id,
            ...docSnap.data(),
          }));
          try {
            localStorage.setItem("travel_team_members", JSON.stringify(list));
          } catch {}
          if (typeof onUpdate === "function") onUpdate(list);
        } else {
          try {
            localStorage.setItem("travel_team_members", JSON.stringify([]));
          } catch {}
          if (typeof onUpdate === "function") onUpdate([]);
        }
      },
      (err) => {
        console.warn("Realtime team members subscription warning:", err);
      }
    );
    return unsub;
  } catch (err) {
    console.warn("Failed to subscribe to team members:", err);
    return () => {};
  }
}

/**
 * Save / Update a Team Member in Firestore `team_members` collection
 */
export async function saveTeamMemberToDb(memberObj) {
  const memberId = memberObj.id || `member_${Date.now()}`;
  const memberRef = doc(db, "team_members", memberId);
  const payload = {
    ...memberObj,
    id: memberId,
    updatedAt: serverTimestamp(),
  };

  await setDoc(memberRef, payload, { merge: true });

  // Update local cache
  try {
    const cached = JSON.parse(localStorage.getItem("travel_team_members") || "[]");
    const idx = cached.findIndex((m) => m.id === memberId);
    let updated;
    if (idx >= 0) {
      updated = [...cached];
      updated[idx] = { ...updated[idx], ...payload };
    } else {
      updated = [...cached, payload];
    }
    localStorage.setItem("travel_team_members", JSON.stringify(updated));
  } catch {}

  return payload;
}

/**
 * Delete a Team Member from Firestore `team_members` collection
 */
export async function deleteTeamMemberFromDb(memberId) {
  if (!memberId) return;
  await deleteDoc(doc(db, "team_members", memberId));

  // Update local cache
  try {
    const cached = JSON.parse(localStorage.getItem("travel_team_members") || "[]");
    const updated = cached.filter((m) => m.id !== memberId);
    localStorage.setItem("travel_team_members", JSON.stringify(updated));
  } catch {}
}



