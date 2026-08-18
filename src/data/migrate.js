import { db } from '../firebase';
import { collection, doc, setDoc, getDocs } from 'firebase/firestore';
import { destinationsData } from './destinationsData';
import { slidesRawData } from './Sliderdata';
import memberData from './memberdata';

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
  const destDone = localStorage.getItem("destinations_migrated_v1") === "true";
  const slidesDone = localStorage.getItem("slides_migrated_v1") === "true";
  const membersDone = localStorage.getItem("team_members_migrated_v1") === "true";

  if (destDone && slidesDone && membersDone) {
    return;
  }

  try {
    // 1. Destinations: Seed only if collection in Firestore is completely empty
    if (!destDone) {
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
      localStorage.setItem("destinations_migrated_v1", "true");
    }

    // 2. Slides: Seed only if collection in Firestore is completely empty
    if (!slidesDone) {
      const slidesCol = collection(db, "slides");
      const slidesSnap = await getDocs(slidesCol);

      if (slidesSnap.empty) {
        console.log("Seeding initial slides to Firestore...");
        for (const slide of slidesRawData) {
          const docRef = doc(slidesCol, slide.id);
          await setDoc(docRef, slide);
        }
      }
      localStorage.setItem("slides_migrated_v1", "true");
    }

    // 3. Team Members: Seed only if collection in Firestore is completely empty
    if (!membersDone) {
      const membersCol = collection(db, "team_members");
      const membersSnap = await getDocs(membersCol);

      if (membersSnap.empty) {
        console.log("Seeding initial team members to Firestore...");
        for (const member of memberData) {
          const docRef = doc(membersCol, member.id);
          await setDoc(docRef, member);
        }
      }
      localStorage.setItem("team_members_migrated_v1", "true");
    }

    console.log("Firestore check / seeding complete!");
  } catch (error) {
    console.error("Error during Firestore check / seeding:", error);
  }
}
