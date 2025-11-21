// @vitest-environment jsdom
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import Player from '../../components/Player';
import { Video, User } from '../../types';

// Mock Video Element methods since jsdom doesn't support them fully
window.HTMLMediaElement.prototype.load = vi.fn();
window.HTMLMediaElement.prototype.play = vi.fn().mockResolvedValue(undefined);
window.HTMLMediaElement.prototype.pause = vi.fn();
window.HTMLMediaElement.prototype.requestPictureInPicture = vi.fn().mockResolvedValue(undefined as unknown as PictureInPictureWindow);

describe('Player Component', () => {
  const mockVideo: Video = {
    id: 'v1',
    title: 'Test Video',
    thumbnail: 'thumb.jpg',
    embedUrl: 'test-video.mp4', // Direct file
    duration: '10:00',
    views: '100',
    author: 'Test Author',
    category: 'Test Cat',
    description: 'Test Desc',
    rating: 5,
    tags: ['tag1']
  };

  const mockUser: User = {
    id: 'testuser',
    username: 'TestUser',
    role: 'USER' as any,
    avatar: 'avatar.jpg'
  };

  const mockProps = {
    video: mockVideo,
    currentUser: mockUser,
    onVideoSelect: vi.fn(),
    isFavorite: false,
    onToggleFavorite: vi.fn(),
    isWatchLater: vi.fn(() => false),
    onToggleWatchLater: vi.fn(),
    onShowToast: vi.fn(),
    setView: vi.fn(),
    videos: [mockVideo]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders a direct video tag when embedUrl is a file', async () => {
    render(<Player {...mockProps} />);

    // Using container query selector since getByRole('application') was flaky
    // and there is no obvious role on the main wrapper.
    const { container } = render(<Player {...mockProps} />);

    // Check for the presence of a video tag
    const videoEl = document.querySelector('video');
    expect(videoEl).toBeInTheDocument();
    expect(videoEl).toHaveAttribute('src', 'test-video.mp4');
  });

  it('renders an iframe when embedUrl is an embed link (e.g. youtube)', () => {
    const iframeVideo = { ...mockVideo, embedUrl: 'https://www.youtube.com/embed/xyz' };
    render(<Player {...mockProps} video={iframeVideo} />);

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);
    expect(iframes[0]).toHaveAttribute('src', 'https://www.youtube.com/embed/xyz');

    // Video tag should NOT be present
    const videos = document.querySelectorAll('video');
    expect(videos.length).toBe(0);
  });

  it('toggles play/pause on click (direct video)', async () => {
    render(<Player {...mockProps} />);

    // Look for the Play/Pause button.
    // Initially it might be auto-playing so icon is 'fa-pause'.
    // But in JSDOM auto-play might not trigger 'playing' event automatically unless simulated.
    // However, the component sets isPlaying=true in useEffect.

    const pauseIcon = document.querySelector('.fa-pause');
    // If we see pause icon, it means it THINKS it is playing.

    if (pauseIcon) {
       const btn = pauseIcon.closest('button');
       fireEvent.click(btn!);
       await waitFor(() => expect(document.querySelector('.fa-play')).toBeInTheDocument());
    } else {
       const playIcon = document.querySelector('.fa-play');
       const btn = playIcon!.closest('button');
       fireEvent.click(btn!);
       await waitFor(() => expect(document.querySelector('.fa-pause')).toBeInTheDocument());
    }
  });

  it('handles volume changes', () => {
    render(<Player {...mockProps} />);

    const volumeInput = document.querySelector('input[type="range"][step="0.05"]') as HTMLInputElement;
    expect(volumeInput).toBeInTheDocument();

    fireEvent.change(volumeInput, { target: { value: '0.5' } });

    const video = document.querySelector('video');
    // Since we use a react ref, changing state updates the ref property.
    // We check if the component logic updated the video element volume.
    // Note: JSDOM <video> property support is limited, but our component explicitly sets videoRef.current.volume
    // So we can inspect the property on the element if JSDOM preserves it.

    // Actually, we mocked HTMLMediaElement prototypes but not properties on instances.
    // But JSDOM implementation of volume usually exists.

    // Wait for state update
    expect(video?.volume).toBe(0.5);
  });

  it('toggles favorite status', () => {
    render(<Player {...mockProps} />);

    const heartBtn = document.querySelector('.fa-heart')?.closest('button');
    fireEvent.click(heartBtn!);

    expect(mockProps.onToggleFavorite).toHaveBeenCalled();
  });

  it('renders comments and allows adding a new one', () => {
    render(<Player {...mockProps} />);

    expect(screen.getByText('Great content! The production quality is amazing.')).toBeInTheDocument();

    const input = screen.getByPlaceholderText('Add a comment...');
    fireEvent.change(input, { target: { value: 'New Test Comment' } });

    const submitBtn = screen.getByText('Comment');
    fireEvent.click(submitBtn);

    expect(screen.getByText('New Test Comment')).toBeInTheDocument();
    expect(mockProps.onShowToast).toHaveBeenCalledWith('Comment posted!');
  });

  it('handles sidebar video selection', () => {
    render(<Player {...mockProps} />);

    const upNextHeader = screen.getByText('Up Next');
    expect(upNextHeader).toBeInTheDocument();
  });
});
