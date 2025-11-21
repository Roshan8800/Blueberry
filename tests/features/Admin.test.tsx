// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import AdminPanel from '../../components/AdminPanel';
import { fetchVideos, deleteDoc, addDoc } from '../../services/firebase';

describe('AdminPanel Feature', () => {
  const mockVideos = [
    { id: '1', title: 'Video One', author: 'Author A', category: 'Trending', views: 100, rating: 90, thumbnail: 't.jpg' },
    { id: '2', title: 'Video Two', author: 'Author B', category: 'Premium', views: 50, rating: 80, thumbnail: 't.jpg' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (fetchVideos as any).mockResolvedValue({ success: true, data: mockVideos });
    window.confirm = vi.fn(() => true);
    window.alert = vi.fn();
  });

  it('renders stats and video list', async () => {
    render(<AdminPanel />);

    await waitFor(() => {
        expect(screen.getByText('Video One')).toBeInTheDocument();
        expect(screen.getByText('Video Two')).toBeInTheDocument();
    });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });

  it('filters videos by search', async () => {
    render(<AdminPanel />);
    await waitFor(() => screen.getByText('Video One'));

    const searchInput = screen.getByPlaceholderText('Search filenames...');
    fireEvent.change(searchInput, { target: { value: 'One' } });

    expect(screen.getByText('Video One')).toBeInTheDocument();
    expect(screen.queryByText('Video Two')).not.toBeInTheDocument();
  });

  it('handles deletion of a video', async () => {
    render(<AdminPanel />);
    await waitFor(() => screen.getByText('Video One'));

    const buttons = document.querySelectorAll('.fa-trash-can');
    expect(buttons.length).toBeGreaterThan(0);

    fireEvent.click(buttons[0].closest('button')!);

    expect(window.confirm).toHaveBeenCalled();
    expect(deleteDoc).toHaveBeenCalled();

    await waitFor(() => {
        expect(screen.queryByText('Video One')).not.toBeInTheDocument();
    });
  });

  it('handles bulk delete', async () => {
    render(<AdminPanel />);
    await waitFor(() => screen.getByText('Video One'));

    // 1. Find Checkboxes
    // Note: We expect 3 checkboxes (1 header + 2 rows)
    const checkboxes = await screen.findAllByRole('checkbox');
    expect(checkboxes.length).toBeGreaterThanOrEqual(3);

    // 2. Click "Select All" (Header checkbox)
    // Usually the first one in DOM order for table
    fireEvent.click(checkboxes[0]);

    // 3. Verify "Delete Selected" button appears
    const bulkDeleteBtn = await screen.findByText('Delete Selected');
    expect(bulkDeleteBtn).toBeInTheDocument();

    // 4. Click Bulk Delete
    fireEvent.click(bulkDeleteBtn);

    // 5. Confirm dialog
    expect(window.confirm).toHaveBeenCalled();

    // 6. Wait for async deletions
    // Important: The component iterates and calls deleteDoc. This happens in an async handler.
    await waitFor(() => {
       // Expect 2 calls because we had 2 videos and selected all
       expect(deleteDoc).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
       expect(screen.queryByText('Video One')).not.toBeInTheDocument();
       expect(screen.queryByText('Video Two')).not.toBeInTheDocument();
    });
  });

});
