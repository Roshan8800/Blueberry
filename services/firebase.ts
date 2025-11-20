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
 * Maps specific database fields (pornstar, catagory, iframe code, etc.) to the application's Video type.
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
      
      // Handle Views: Ensure it's a string.
      let safeViews = "0";
      if (data.views !== undefined && data.views !== null) {
        safeViews = String(data.views);
      } else {
         // Fallback: estimate views based on thumbs if actual views missing
         // Check both 'thumsup' (from your data) and 'thumbsup'
         const up = Number(data.thumsup || data.thumbsup || 0);
         const down = Number(data.thumbsdown || 0);
         if (up + down > 0) safeViews = String((up + down) * 12); 
      }

      // Handle Rating: Calculate from thumbs if not provided explicitly
      let safeRating = 95;
      if (typeof data.rating === 'number') {
        safeRating = data.rating;
      } else if (data.rating && !isNaN(Number(data.rating))) {
        safeRating = Number(data.rating);
      } else {
         const up = Number(data.thumsup || data.thumbsup || 0);
         const down = Number(data.thumbsdown || 0);
         const total = up + down;
         if (total > 0) {
            safeRating = Math.round((up / total) * 100);
         }
      }

      // Handle Iframe/Embed Code robustly
      // Specific field name 'iframe code'
      let embedUrl = "";
      const rawIframe = data['iframe code'] || data.embedUrl;
      if (rawIframe) {
        const stringIframe = String(rawIframe);
        if (stringIframe.includes('<iframe')) {
            // Try to extract src from iframe tag
            const match = stringIframe.match(/src=["']([^"']+)["']/);
            embedUrl = match ? match[1] : "";
        } else {
            // Assuming it's a direct link
            embedUrl = stringIframe;
        }
      }

      // Map Firestore fields to Video interface
      // We check multiple possible field names to be robust against DB variations
      // Using String() constructor prevents 'undefined' values from causing issues or circular refs
      return {
        id: doc.id,
        
        // Title
        title: String(data.title || "Untitled Video"),
        
        // Thumbnail: Prioritize 'thumbnail URL' and 'screenshot URL'
        thumbnail: String(data['thumbnail URL'] || data['screenshot URL'] || data.thumbnail || "https://picsum.photos/seed/default/600/400"),
        
        // Duration
        duration: String(data.duration || "00:00"),
        
        // Views
        views: safeViews,
        
        // Author: Prioritize 'pornstar' and 'perform' (common in adult datasets)
        author: String(data.pornstar || data.perform || data.author || "Unknown Star"),
        
        // Category: Prioritize 'catagory' (common typo in datasets)
        category: String(data.catagory || data.category || "Uncategorized"),
        
        // Embed
        embedUrl: embedUrl,
        
        // Description
        description: String(data.description || ""),
        
        // Rating
        rating: safeRating,
        
        // Tags
        tags: Array.isArray(data.tags) ? data.tags.map(String) : []
      } as Video;
    });
  } catch (error) {
    console.error("Error fetching videos from Firestore:", error);
    return [];
  }
};

export { app, analytics, logEvent, db };