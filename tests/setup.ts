import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// --- Global Mocks ---

// Mock Window properties
Object.defineProperty(window, 'scrollTo', {
    value: vi.fn(),
    writable: true
});

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

// Mock IntersectionObserver
class IntersectionObserver {
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();
}
Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  configurable: true,
  value: IntersectionObserver,
});

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  })),
});

// Mock Firebase Global
// This mocks the app's 'services/firebase.ts' module which re-exports firebase functions.
// We ensure it has the same shape as the real file.
vi.mock('../services/firebase', () => {
    const onAuthStateChanged = vi.fn((auth, callback) => {
        return vi.fn();
    });

    return {
        auth: {
            currentUser: null,
            signOut: vi.fn(),
        },
        db: {},
        storage: {},
        analytics: {
            app: {},
            logEvent: vi.fn()
        },
        logEvent: vi.fn(),
        collection: vi.fn(() => 'mock-collection-ref'),
        doc: vi.fn(),
        getDocs: vi.fn(async () => ({ empty: true, docs: [] })),
        setDoc: vi.fn(),
        addDoc: vi.fn(),
        updateDoc: vi.fn(),
        deleteDoc: vi.fn(),
        query: vi.fn(),
        where: vi.fn(),
        signInWithPopup: vi.fn(),
        GoogleAuthProvider: vi.fn(),
        onAuthStateChanged: onAuthStateChanged,
        createUserWithEmailAndPassword: vi.fn(),
        signInWithEmailAndPassword: vi.fn(),
        signOut: vi.fn(),
        fetchVideos: vi.fn(async () => ({ success: true, data: [] })),
        fetchModels: vi.fn(async () => ({ success: true, data: [] })),
        fetchPosts: vi.fn(async () => ({ success: true, data: [] })),
        fetchUsers: vi.fn(async () => ({ success: true, data: [] })),
        seedDatabaseIfEmpty: vi.fn(async () => ({ success: true, data: true })),
        updateUserProfile: vi.fn(),
    };
});

// Mock Google GenAI SDK globally
// Use vi.fn() to allow mockImplementation in tests
vi.mock('@google/genai', () => {
    const GoogleGenAI = vi.fn(function(config) {
        return {
            models: {
                generateContent: vi.fn(async () => ({
                    text: "Mocked AI Description from SDK"
                }))
            }
        };
    });
    return { GoogleGenAI };
});
