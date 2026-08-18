import { db } from '../firebase';
import { collection, doc, setDoc, getDocs, getDoc, serverTimestamp } from 'firebase/firestore';
import { destinationsData } from './destinationsData';
import { slidesRawData } from './Sliderdata';
import memberData from './memberdata';
import { DEFAULT_ABOUT_INFO } from './adminData';

const imgPathMap = {
  "angkor-wat": "/assets/PicPlace/siemreap/Angkor Wat .jpg",
  "koh-han": "/assets/PicPlace/Koh Han.jpeg",
  "veal-touch-waterfall": "/assets/PicPlace/Veal Pouch Waterfall, Kompot.jpeg",
  "koh-rong": "/assets/koh rong island.jpg",
  "kampot": "/assets/Kampot-Riverfront-Boutique.webp",
  "green-field": "/assets/PicPlace/Ratnak Kiri.jpeg",
  "koh-kong": "/assets/PicPlace/koh kong.jpg",
  "battambang": "/assets/Battambang Colonial Town.jpg",
  "kampong-phluk": "/assets/kompong-phluk.jpg",
  "kep": "/assets/Kep Crab Market.jpg"
};

export async function migrateDataToFirestore() {
  const destDone = localStorage.getItem("destinations_migrated_v2") === "true";
  const slidesDone = localStorage.getItem("slides_migrated_v2") === "true";
  const membersDone = localStorage.getItem("team_members_migrated_v2") === "true";
  const aboutDone = localStorage.getItem("about_info_migrated_v2") === "true";

  if (destDone && slidesDone && membersDone && aboutDone) {
    return;
  }

  try {
    // Check global system initialization marker in Firestore
    const systemRef = doc(db, "_system", "metadata");
    const systemSnap = await getDoc(systemRef);
    const isSystemInitialized = systemSnap.exists() && systemSnap.data()?.isInitialized;

    // 1. Destinations: Seed only if system was never initialized AND collection in Firestore is empty
    if (!destDone) {
      if (!isSystemInitialized) {
        const destinationsCol = collection(db, "destinations");
        const destSnap = await getDocs(destinationsCol);

        if (destSnap.empty) {
          console.log("Seeding initial destinations to Firestore...");
          const uniqueDestinations = [];
          const seenIds = new Set();

          for (const item of destinationsData) {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              uniqueDestinations.push(item);
            }
          }

          for (const destination of uniqueDestinations) {
            const docRef = doc(destinationsCol, destination.id);
            const publicImgPath = imgPathMap[destination.id] || "/assets/profile.jpg";

            const cleanedDestination = {
              id: destination.id,
              name: destination.name,
              searchNames: destination.searchNames || [],
              location: destination.location || "",
              rating: Number(destination.rating) || 5,
              img: publicImgPath,
              gallery: destination.gallery || [],
              cat: destination.cat || "",
              about: destination.about || "",
              mapSearch: destination.mapSearch || "",
              reviews: destination.reviews || []
            };

            await setDoc(docRef, cleanedDestination);
          }
        }
      }
      localStorage.setItem("destinations_migrated_v2", "true");
    }

    // 2. Slides: Seed only if system was never initialized AND collection is empty
    if (!slidesDone) {
      if (!isSystemInitialized) {
        const slidesCol = collection(db, "slides");
        const slidesSnap = await getDocs(slidesCol);

        if (slidesSnap.empty) {
          console.log("Seeding initial slides to Firestore...");
          for (const slide of slidesRawData) {
            const docRef = doc(slidesCol, slide.id);
            await setDoc(docRef, slide);
          }
        }
      }
      localStorage.setItem("slides_migrated_v2", "true");
    }

    // 3. Team Members: Seed only if system was never initialized AND collection is empty
    if (!membersDone) {
      if (!isSystemInitialized) {
        const membersCol = collection(db, "team_members");
        const membersSnap = await getDocs(membersCol);

        if (membersSnap.empty) {
          console.log("Seeding initial team members to Firestore...");
          for (const member of memberData) {
            const docRef = doc(membersCol, member.id);
            await setDoc(docRef, member);
          }
        }
      }
      localStorage.setItem("team_members_migrated_v2", "true");
    }

    // 4. About Page Information: Seed only if site_settings/about doc does not exist
    if (!aboutDone) {
      const aboutDocRef = doc(db, "site_settings", "about");
      const aboutSnap = await getDoc(aboutDocRef);
      if (!aboutSnap.exists()) {
        console.log("Seeding initial About page settings to Firestore...");
        await setDoc(aboutDocRef, {
          ...DEFAULT_ABOUT_INFO,
          createdAt: serverTimestamp(),
        });
      }
      localStorage.setItem("about_info_migrated_v2", "true");
    }

    // Mark system as initialized in Firestore
    if (!isSystemInitialized) {
      await setDoc(systemRef, {
        isInitialized: true,
        initializedAt: serverTimestamp(),
      }, { merge: true });
    }

    console.log("Firestore check / seeding complete!");
  } catch (error) {
    console.error("Error during Firestore check / seeding:", error);
  }
}

