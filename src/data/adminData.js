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


// Fallback Default Admins
export const DEFAULT_SYSTEM_ADMINS = [
  "[EMAIL_ADDRESS]",
];

// Firestore Admin Helper Functions

/**
 * Fetch all system admin emails from Firestore `admins` collection
 */
export async function fetchSystemAdminsFromDb() {
  try {
    const querySnapshot = await getDocs(collection(db, "admins"));
    if (!querySnapshot.empty) {
      const firestoreAdmins = querySnapshot.docs
        .map((docSnap) => docSnap.data()?.email || docSnap.id)
        .filter(Boolean);

      if (firestoreAdmins.length > 0) {
        return firestoreAdmins;
      }
    }
  } catch (err) {
    console.warn("Could not fetch system admins from Firestore:", err);
  }
  return DEFAULT_SYSTEM_ADMINS;
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
  return trimmed;
}

/**
 * Delete admin email from Firestore `admins` collection
 */
export async function removeSystemAdminFromDb(email) {
  const trimmed = email.trim().toLowerCase();
  const adminDocId = trimmed.replace(/[^a-z0-9]/gi, "_");
  await deleteDoc(doc(db, "admins", adminDocId));
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
 * Fetch team members from Firestore `team_members` collection.
 * If collection is empty, populates it with default members.
 */
export async function fetchTeamMembersFromDb() {
  try {
    const querySnapshot = await getDocs(collection(db, "team_members"));
    if (!querySnapshot.empty) {
      return querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
    }

    // Seed initial default members into Firestore if empty
    for (const m of defaultMembers) {
      const ref = doc(db, "team_members", m.id);
      await setDoc(ref, m, { merge: true });
    }

    return defaultMembers;
  } catch (error) {
    console.error("Error fetching team members from Firestore:", error);
    return defaultMembers;
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
  return payload;
}

/**
 * Delete a Team Member from Firestore `team_members` collection
 */
export async function deleteTeamMemberFromDb(memberId) {
  if (!memberId) return;
  await deleteDoc(doc(db, "team_members", memberId));
}



