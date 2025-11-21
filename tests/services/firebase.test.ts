import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// CRITICAL: Unmock the service we are testing so we get the real implementation code.
vi.unmock('../../services/firebase');

// Define mocks using vi.hoisted to allow access inside vi.mock factory
const firebaseMocks = vi.hoisted(() => ({
  initializeApp: vi.fn(),
  getFirestore: vi.fn(() => ({})), // Return truthy object so 'if (!db)' passes
  collection: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn(),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  getStorage: vi.fn(),
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  getAnalytics: vi.fn(),
  logEvent: vi.fn(),
  GoogleAuthProvider: vi.fn()
}));

// Mock the firebase modules using the hoisted mocks
vi.mock('firebase/app', () => ({
  initializeApp: firebaseMocks.initializeApp
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: firebaseMocks.getFirestore,
  collection: firebaseMocks.collection,
  getDocs: firebaseMocks.getDocs,
  doc: firebaseMocks.doc,
  setDoc: firebaseMocks.setDoc,
  addDoc: firebaseMocks.addDoc,
  updateDoc: firebaseMocks.updateDoc,
  deleteDoc: firebaseMocks.deleteDoc,
  query: firebaseMocks.query,
  where: firebaseMocks.where
}));

vi.mock('firebase/auth', () => ({
  getAuth: firebaseMocks.getAuth,
  GoogleAuthProvider: firebaseMocks.GoogleAuthProvider,
  signInWithPopup: firebaseMocks.signInWithPopup,
  signOut: firebaseMocks.signOut,
  onAuthStateChanged: firebaseMocks.onAuthStateChanged,
  createUserWithEmailAndPassword: firebaseMocks.createUserWithEmailAndPassword,
  signInWithEmailAndPassword: firebaseMocks.signInWithEmailAndPassword
}));

vi.mock('firebase/storage', () => ({
  getStorage: firebaseMocks.getStorage,
  ref: firebaseMocks.ref,
  uploadBytes: firebaseMocks.uploadBytes,
  getDownloadURL: firebaseMocks.getDownloadURL
}));

vi.mock('firebase/analytics', () => ({
  getAnalytics: firebaseMocks.getAnalytics,
  logEvent: firebaseMocks.logEvent
}));

// Now import the service under test
import { fetchVideos, seedDatabaseIfEmpty, fetchModels } from '../../services/firebase';
import { MOCK_VIDEOS } from '../../constants';

describe('Firebase Service Wrapper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure getFirestore returns an object
    firebaseMocks.getFirestore.mockReturnValue({});
  });

  describe('fetchVideos', () => {
    it('should fetch videos and map them correctly', async () => {
      // Mock data return
      firebaseMocks.getDocs.mockResolvedValue({
        empty: false,
        docs: [
          {
            id: 'vid1',
            data: () => ({
              title: 'Test Video',
              views: 100,
              tags: ['test']
            })
          }
        ]
      });

      const videos = await fetchVideos();

      expect(firebaseMocks.collection).toHaveBeenCalledWith(expect.anything(), 'videos');
      expect(videos).toHaveLength(1);
      expect(videos[0].title).toBe('Test Video');
      expect(videos[0].id).toBe('vid1');
    });

    it('should return empty array on error', async () => {
      firebaseMocks.getDocs.mockRejectedValue(new Error('DB Error'));
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const videos = await fetchVideos();
      expect(videos).toEqual([]);

      spy.mockRestore();
    });
  });

  describe('fetchModels', () => {
    it('should fetch models', async () => {
      firebaseMocks.getDocs.mockResolvedValue({
        docs: [{ id: 'm1', data: () => ({ name: 'Model X' }) }]
      });
      const models = await fetchModels();
      expect(models).toHaveLength(1);
      expect(models[0].id).toBe('m1');
    });
  });

  describe('seedDatabaseIfEmpty', () => {
    it('should seed videos if collection is empty', async () => {
      // First call (videos) returns empty
      // Second call (models) returns not empty (to simplify test)
      // Third call (posts) returns not empty
      firebaseMocks.getDocs
        .mockResolvedValueOnce({ empty: true, docs: [] }) // videos
        .mockResolvedValueOnce({ empty: false, docs: [{}] }) // models
        .mockResolvedValueOnce({ empty: false, docs: [{}] }); // posts

      await seedDatabaseIfEmpty();

      // Should have called setDoc for each MOCK_VIDEO
      expect(firebaseMocks.setDoc).toHaveBeenCalledTimes(MOCK_VIDEOS.length);
    });

    it('should NOT seed if collection is not empty', async () => {
      firebaseMocks.getDocs.mockResolvedValue({ empty: false, docs: [{}] });

      await seedDatabaseIfEmpty();

      expect(firebaseMocks.setDoc).not.toHaveBeenCalled();
    });
  });
});
