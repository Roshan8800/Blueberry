import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Video, Model, CommunityPost } from "../types";
import { MOCK_VIDEOS, MOCK_MODELS, MOCK_POSTS } from "../constants";

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

// Services
let analytics: any = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Firebase Analytics failed to initialize:", e);
}

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  collection,
  addDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  ref,
  uploadBytes,
  getDownloadURL,
  getDocs,
  logEvent,
  analytics
};

/**
 * Seeding Utility: Checks if collections are empty and populates them with initial data.
 */
export const seedDatabaseIfEmpty = async () => {
  if (!db) return;

  try {
    // 1. Seed Videos
    const videosRef = collection(db, "videos");
    const videoSnap = await getDocs(videosRef);
    if (videoSnap.empty) {
      console.log("Seeding Videos...");
      for (const video of MOCK_VIDEOS) {
        await setDoc(doc(db, "videos", video.id), video);
      }
    }

    // 2. Seed Models
    const modelsRef = collection(db, "models");
    const modelSnap = await getDocs(modelsRef);
    if (modelSnap.empty) {
      console.log("Seeding Models...");
      for (const model of MOCK_MODELS) {
         await setDoc(doc(db, "models", model.id), model);
      }
    }

    // 3. Seed Posts
    const postsRef = collection(db, "community_posts");
    const postSnap = await getDocs(postsRef);
    if (postSnap.empty) {
       console.log("Seeding Posts...");
       for (const post of MOCK_POSTS) {
          await setDoc(doc(db, "community_posts", post.id), post);
       }
    }

    console.log("Database check/seed complete.");
  } catch (e) {
    console.error("Error seeding database:", e);
  }
};

/**
 * Fetches all videos from the 'videos' collection in Firestore.
 */
export const fetchVideos = async (): Promise<Video[]> => {
  if (!db) return [];

  try {
    const querySnapshot = await getDocs(collection(db, "videos"));
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: String(data.title || "Untitled"),
        thumbnail: String(data.thumbnail || "https://picsum.photos/seed/default/600/400"),
        duration: String(data.duration || "00:00"),
        views: String(data.views || "0"),
        author: String(data.author || "Unknown"),
        category: String(data.category || "Uncategorized"),
        embedUrl: String(data.embedUrl || ""),
        description: String(data.description || ""),
        rating: Number(data.rating || 0),
        tags: Array.isArray(data.tags) ? data.tags : []
      } as Video;
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
};

export const fetchModels = async (): Promise<Model[]> => {
    if (!db) return [];
    try {
        const snap = await getDocs(collection(db, "models"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Model));
    } catch (e) {
        console.error("Error fetching models", e);
        return [];
    }
};

export const fetchUsers = async (): Promise<any[]> => {
  if (!db) return [];
  try {
      // For demo purposes, we might not have a 'users' collection publicly readable
      // But we can try. If it fails (rules), we return mock.
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
      console.error("Error fetching users", e);
      return [];
  }
};

export const updateUserProfile = async (uid: string, data: any) => {
  if (!db) return;
  try {
    const userRef = doc(db, "users", uid);
    // Use setDoc with merge to create if not exists
    await setDoc(userRef, data, { merge: true });
  } catch (e) {
    console.error("Error updating user profile", e);
    throw e;
  }
};

export const fetchPosts = async (): Promise<CommunityPost[]> => {
    if (!db) return [];
    try {
        const snap = await getDocs(collection(db, "community_posts"));
        return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as CommunityPost));
    } catch (e) {
        console.error("Error fetching posts", e);
        return [];
    }
};
