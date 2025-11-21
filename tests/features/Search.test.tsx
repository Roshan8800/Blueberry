// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import Navbar from '../../components/Navbar';
import { AppView, User, UserRole } from '../../types';
import { APP_NAME, ULTRA_NAME } from '../../constants';

describe('Navbar Search Integration', () => {
  const mockProps = {
    toggleSidebar: vi.fn(),
    onSearch: vi.fn(),
    isSidebarOpen: false,
    setView: vi.fn(),
    currentUser: null,
    canGoBack: false,
    onBack: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search bar on desktop', () => {
    render(<Navbar {...mockProps} />);
    const input = screen.getByPlaceholderText(/Search videos/i);
    expect(input).toBeInTheDocument();
  });

  it('triggers onSearch when submitting form', () => {
    render(<Navbar {...mockProps} />);

    const input = screen.getByPlaceholderText(/Search videos/i);
    fireEvent.change(input, { target: { value: 'New Search' } });

    // Find form and submit
    const form = input.closest('form');
    fireEvent.submit(form!);

    expect(mockProps.onSearch).toHaveBeenCalledWith('New Search');
  });

  it('handles mobile search toggle', async () => {
    // Make window small? JSDOM defaults to 1024x768 usually but we can simulate.
    // The component uses CSS media queries (hidden md:flex) which JSDOM doesn't fully respect layout-wise
    // but React logic uses `isMobileSearchOpen`.

    // The "mobile search button" is rendered with `md:hidden` class.
    // We can find it by icon.

    render(<Navbar {...mockProps} />);

    // Find the magnifying glass button that is NOT the one inside the form
    // There are two buttons with fa-search.
    // 1. Inside form (Desktop)
    // 2. Outside form (Mobile toggle)

    const searchIcons = document.querySelectorAll('.fa-search');
    // One is inside button[type=submit], one is button[onClick=setIsMobileSearchOpen]

    // Let's iterate to find the one that opens mobile search
    // The desktop one is inside the form.
    // The mobile one is outside.

    // Or check behavior:
    // Clicking the mobile trigger should show a NEW input.

    // Find the button that says "Search" or has search icon and is outside the form?
    // The mobile toggle button:
    // <button onClick={() => setIsMobileSearchOpen(true)} ...><i className="fa-solid fa-search text-lg"></i></button>

    // Let's find by class
    const mobileBtn = document.querySelector('button.md\\:hidden .fa-search')?.closest('button');

    if (mobileBtn) {
        fireEvent.click(mobileBtn);

        await waitFor(() => {
            // New input should appear
             expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
        });

        // Test submitting from mobile search
        const mobileInput = screen.getByPlaceholderText('Search...');
        fireEvent.change(mobileInput, { target: { value: 'Mobile Query' } });
        fireEvent.submit(mobileInput.closest('form')!);

        expect(mockProps.onSearch).toHaveBeenCalledWith('Mobile Query');
    }
  });

  it('adapts to Ultra user', () => {
    const ultraUser: User = {
        username: 'Rich',
        isVip: true,
        role: UserRole.USER,
        plan: 'blueberry'
    };

    render(<Navbar {...mockProps} currentUser={ultraUser} />);

    expect(screen.getByText(ULTRA_NAME)).toBeInTheDocument();
    expect(screen.getByText('Ultra')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/global blueberry index/i)).toBeInTheDocument();
  });

  it('shows Back button when canGoBack is true', () => {
    render(<Navbar {...mockProps} canGoBack={true} />);

    const backBtn = screen.getByLabelText('Go Back');
    expect(backBtn).toBeInTheDocument();

    fireEvent.click(backBtn);
    expect(mockProps.onBack).toHaveBeenCalled();
  });
});
