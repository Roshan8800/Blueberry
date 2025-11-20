// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extend expect with jest-dom matchers
expect.extend(matchers);

// Mock Firebase BEFORE importing App
vi.mock('../services/firebase', () => ({
  analytics: null,
  logEvent: vi.fn(),
  fetchVideos: vi.fn(async () => []),
}));

import App from '../App';

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: vi.fn(),
  writable: true
});

describe('App Navigation History Bug', () => {
  let originalPushState: any;
  let originalReplaceState: any;
  let originalBack: any;

  const historyStack: any[] = [];
  let currentIndex = -1;

  beforeEach(() => {
    historyStack.length = 0;
    historyStack.push({ state: null, url: '/' });
    currentIndex = 0;

    window.history.replaceState(null, '', '/');

    originalPushState = window.history.pushState;
    originalReplaceState = window.history.replaceState;
    originalBack = window.history.back;

    // Mock history.state getter
    Object.defineProperty(window.history, 'state', {
      get: () => historyStack[currentIndex]?.state || null,
      configurable: true,
    });

    window.history.pushState = vi.fn((state, title, url) => {
      if (currentIndex < historyStack.length - 1) {
        historyStack.splice(currentIndex + 1);
      }
      historyStack.push({ state, url });
      currentIndex++;
    });

    window.history.replaceState = vi.fn((state, title, url) => {
       if (currentIndex >= 0 && currentIndex < historyStack.length) {
          historyStack[currentIndex].state = state;
       }
    });

    window.history.back = vi.fn(() => {
      if (currentIndex > 0) {
        currentIndex--;
        const entry = historyStack[currentIndex];
        const popEvent = new PopStateEvent('popstate', { state: entry.state });
        window.dispatchEvent(popEvent);
      }
    });

    (window.history as any).forward = vi.fn(() => {
       if (currentIndex < historyStack.length - 1) {
           currentIndex++;
           const entry = historyStack[currentIndex];
           const popEvent = new PopStateEvent('popstate', { state: entry.state });
           window.dispatchEvent(popEvent);
       }
    });
  });

  afterEach(() => {
    window.history.pushState = originalPushState;
    window.history.replaceState = originalReplaceState;
    window.history.back = originalBack;
    vi.clearAllMocks();
  });

  it('correctly restores internal history after Browser Back and Forward', async () => {
    render(<App />);

    // 0. Handle Age Verification
    const ageButton = screen.queryByText(/I AM 18 OR OLDER/i);
    if (ageButton) {
      fireEvent.click(ageButton);
    }

    // 1. Start at Landing Page
    await waitFor(() => expect(screen.getByText(/Start Your Free Trial/i)).toBeInTheDocument());

    // 2. Navigate to Home (via Guest Access)
    const guestButton = screen.getByText('Continue as Guest');
    fireEvent.click(guestButton);

    // Check we are on Home
    await waitFor(() => expect(screen.getByText(/Welcome, Guest!/i)).toBeInTheDocument());

    // Check Back button is present
    expect(screen.getByLabelText("Go Back")).toBeInTheDocument();

    // 3. Simulate Browser Back
    act(() => {
        window.history.back();
    });

    // Check we are back on Landing
    await waitFor(() => expect(screen.getByText(/Start Your Free Trial/i)).toBeInTheDocument());

    // 4. Simulate Browser Forward
    act(() => {
        (window.history as any).forward();
    });

    // Check we are on Home again
    await waitFor(() => expect(screen.getByText(/Welcome, Guest!/i)).toBeInTheDocument());

    // 5. Verification: The Back button SHOULD BE present now
    const backButton = screen.queryByLabelText("Go Back");
    expect(backButton).toBeInTheDocument();

    // 6. Verify clicking Back works
    fireEvent.click(backButton!);
    // Since handleBack calls history.back(), and our mock dispatches popstate, it should go back.

    await waitFor(() => expect(screen.getByText(/Start Your Free Trial/i)).toBeInTheDocument());
  });
});
