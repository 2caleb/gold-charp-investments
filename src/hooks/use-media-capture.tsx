
import { useState } from 'react';
import { MediaCapture } from '@/components/media/MediaCapture';

type MediaType = 'photo' | 'video';

export function useMediaCapture() {
  const [showMediaCapture, setShowMediaCapture] = useState(false);
  const [mediaType, setMediaType] = useState<MediaType>('photo');
  const [capturedMedia, setCapturedMedia] = useState<string | null>(null);

  const captureImage = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      setMediaType('photo');
      setShowMediaCapture(true);
      
      const handleCapture = (data: string) => {
        setCapturedMedia(data);
        setShowMediaCapture(false);
        resolve(data);
      };
      
      const handleCancel = () => {
        setShowMediaCapture(false);
        reject(new Error('Media capture cancelled'));
      };
      
      // These handlers will be used in the JSX returned below
      window.mediaCaptureFunctions = {
        handleCapture,
        handleCancel,
        type: 'photo'
      };
    });
  };

  const captureVideo = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      setMediaType('video');
      setShowMediaCapture(true);
      
      const handleCapture = (data: string) => {
        setCapturedMedia(data);
        setShowMediaCapture(false);
        resolve(data);
      };
      
      const handleCancel = () => {
        setShowMediaCapture(false);
        reject(new Error('Media capture cancelled'));
      };
      
      // These handlers will be used in the JSX returned below
      window.mediaCaptureFunctions = {
        handleCapture,
        handleCancel,
        type: 'video'
      };
    });
  };

  const scanDocument = (): Promise<string> => {
    // For now, this just uses the photo capture functionality
    // In a real app, you might use a dedicated document scanning library
    return captureImage();
  };

  // Component to render the media capture UI when needed
  const MediaCaptureUI = showMediaCapture ? (
    <MediaCapture
      type={mediaType}
      onCapture={(data) => {
        if (window.mediaCaptureFunctions) {
          window.mediaCaptureFunctions.handleCapture(data);
        }
      }}
      onCancel={() => {
        if (window.mediaCaptureFunctions) {
          window.mediaCaptureFunctions.handleCancel();
        }
      }}
    />
  ) : null;

  return {
    captureImage,
    captureVideo,
    scanDocument,
    capturedMedia,
    MediaCaptureUI
  };
}

// Add this to the global Window interface
declare global {
  interface Window {
    mediaCaptureFunctions?: {
      handleCapture: (data: string) => void;
      handleCancel: () => void;
      type: MediaType;
    };
  }
}
