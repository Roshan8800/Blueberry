// @vitest-environment jsdom
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import UploadPage from '../../components/UploadPage';
import { uploadBytes, getDownloadURL, addDoc } from '../../services/firebase';

describe('UploadPage Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock alert
    window.alert = vi.fn();
  });

  it('renders initial drop zone', () => {
    render(<UploadPage />);
    expect(screen.getByText(/Drag and drop video files/i)).toBeInTheDocument();
  });

  it('handles file selection via input', async () => {
    render(<UploadPage />);

    const file = new File(['(⌐□_□)'], 'chucknorris.mp4', { type: 'video/mp4' });
    // Input is hidden, but we can trigger it via label or directly if we select it carefully
    const input = document.querySelector('input[type="file"]');

    fireEvent.change(input!, { target: { files: [file] } });

    await waitFor(() => {
        expect(screen.getByText('chucknorris.mp4')).toBeInTheDocument();
    });
  });

  it('fills form and submits upload successfully', async () => {
    render(<UploadPage />);

    // Select file
    const file = new File(['dummy content'], 'test.mp4', { type: 'video/mp4' });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => screen.getByText('test.mp4'));

    // Fill Form
    const titleInput = screen.getByPlaceholderText('Video Title');
    const descInput = screen.getByPlaceholderText('Describe your video...');

    fireEvent.change(titleInput, { target: { value: 'My Awesome Video' } });
    fireEvent.change(descInput, { target: { value: 'Best video ever.' } });

    // Mock Upload Success
    (uploadBytes as any).mockResolvedValue({});
    (getDownloadURL as any).mockResolvedValue('http://download.url/vid.mp4');
    (addDoc as any).mockResolvedValue({ id: 'new-doc-id' });

    // Click Upload
    const uploadBtn = screen.getByText('Publish Video');
    fireEvent.click(uploadBtn);

    // Check Loading State
    expect(screen.getByText('Uploading...')).toBeInTheDocument();

    await waitFor(() => {
        expect(uploadBytes).toHaveBeenCalled();
        expect(getDownloadURL).toHaveBeenCalled();
        expect(addDoc).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
                title: 'My Awesome Video',
                description: 'Best video ever.',
                embedUrl: 'http://download.url/vid.mp4'
            })
        );
        expect(window.alert).toHaveBeenCalledWith('Upload Successful!');
    });
  });

  it('handles upload failure', async () => {
    render(<UploadPage />);

    const file = new File(['d'], 'fail.mp4', { type: 'video/mp4' });
    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput!, { target: { files: [file] } });

    await waitFor(() => screen.getByText('fail.mp4'));

    // Mock Failure
    (uploadBytes as any).mockRejectedValue(new Error('Network Error'));

    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    fireEvent.click(screen.getByText('Publish Video'));

    await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Upload failed. See console.');
    });

    spy.mockRestore();
  });
});
