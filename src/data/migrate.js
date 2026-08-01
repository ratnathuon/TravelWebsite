import { db } from '../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { destinationsData } from './destinationsData';

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
  if (localStorage.getItem("destinations_migrated_v1") === "true") {
    return;
  }

  console.log("Starting Firestore migration...");

  try {
    const destinationsCol = collection(db, "destinations");

    // Since destinationsData has duplicate entries, we deduplicate by ID
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
      
      // Determine the correct public path for the image
      const publicImgPath = imgPathMap[destination.id] || "/assets/profile.jpg";

      const cleanedDestination = {
        id: destination.id,
        name: destination.name,
        searchNames: destination.searchNames || [],
        location: destination.location || "",
        rating: Number(destination.rating) || 5,
        img: publicImgPath,
        cat: destination.cat || "",
        about: destination.about || "",
        mapSearch: destination.mapSearch || "",
        reviews: destination.reviews || []
      };

      await setDoc(docRef, cleanedDestination);
      console.log(`Uploaded destination: ${destination.id}`);
    }

    localStorage.setItem("destinations_migrated_v1", "true");
    console.log("Firestore migration complete!");
  } catch (error) {
    console.error("Error during Firestore migration:", error);
  }
}
