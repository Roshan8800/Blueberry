import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { Video } from "../types";

const firebaseConfig = {
  apiKey: "AIzaSyBUv0KXB8-2nD9ecOpu1NAarMxrCVauU9I",
  authDomain: "playnite-3-complete-5032-aabb1.firebaseapp.com",
  databaseURL: "https://playnite-3-complete-5032-aabb1-default-rtdb.firebaseio.com",
  projectId: "playnite-3-complete-5032-aabb1",
  storageBucket: "playnite-3-complete-5032-aabb1.firebasestorage.app",
  messagingSenderId: "637434311909",
  appId: "1:637434311909:web:9cabae9bf226e36f2cd00c",
  measurementId: "G-18PSVYDZ1G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Defensive initialization for Analytics and Firestore
let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Firebase Analytics failed to initialize:", e);
}

let db = null;
try {
  db = getFirestore(app);
} catch (e) {
  console.error("Firebase Firestore failed to initialize:", e);
}

/**
 * Fetches all videos from the 'videos' collection in Firestore.
 */
export const fetchVideos = async (): Promise<Video[]> => {
  if (!db) {
    console.warn("Firestore is not available. Returning empty video list.");
    return [];
  }

  try {
    const querySnapshot = await getDocs(collection(db, "videos"));
    if (querySnapshot.empty) {
        console.warn("No videos found in 'videos' collection.");
        return [];
    }
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Map Firestore data to Video interface, providing defaults for missing fields
      // Explicitly casting numbers to strings for text-based UI components
      return {
        id: doc.id,
        title: data.title || "Untitled Video",
        thumbnail: data.thumbnail || "https://picsum.photos/seed/default/600/400",
        duration: data.duration || "00:00",
        views: data.views ? String(data.views) : "0",
        author: data.author || "Unknown",
        category: data.category || "Uncategorized",
        embedUrl: data.embedUrl || "",
        description: data.description || "No description available.",
        rating: typeof data.rating === 'number' ? data.rating : 0,
        tags: Array.isArray(data.tags) ? data.tags : []
      } as Video;
    });
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return [];
  }
};

export { app, analytics, logEvent, db };