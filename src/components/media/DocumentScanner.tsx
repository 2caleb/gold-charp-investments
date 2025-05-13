
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScanLine, X, RotateCcw } from 'lucide-react';

interface DocumentScannerProps {
  onScan: (data: string) => void;
  onCancel: () => void;
}

export const DocumentScanner: React.FC<DocumentScannerProps> = ({ onScan, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  
  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        mediaStreamRef.current = stream;
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    };
    
    startCamera();
    
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [facing]);
  
  const scanDocument = () => {
    if (!videoRef.current) return;
    
    // Start countdown
    setCountdown(3);
    
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          
          // Capture the document
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current!.videoWidth;
          canvas.height = videoRef.current!.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
            
            // Apply some basic document enhancement
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            // Simple document enhancement - increase contrast
            for (let i = 0; i < data.length; i += 4) {
              // Convert to grayscale with higher contrast
              const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
              const newVal = avg > 128 ? 255 : 0; // threshold for high contrast
              
              data[i] = data[i + 1] = data[i + 2] = newVal;
            }
            
            ctx.putImageData(imageData, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPreviewUrl(dataUrl);
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const switchCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setFacing(prev => prev === 'user' ? 'environment' : 'user');
  };
  
  const resetScan = () => {
    setPreviewUrl(null);
  };
  
  const confirmScan = () => {
    if (previewUrl) {
      onScan(previewUrl);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Scan Document</h3>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X size={18} />
          </Button>
        </div>
        
        <div className="relative w-full h-[300px] md:h-[400px] bg-black rounded-md overflow-hidden">
          {!previewUrl ? (
            <>
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover"
              />
              
              {/* Scan overlay */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-[90%] h-[90%] mx-auto my-auto border-2 border-dashed border-white rounded-md mt-[5%]"></div>
              </div>
              
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-6xl font-bold">
                  {countdown}
                </div>
              )}
            </>
          ) : (
            <img src={previewUrl} alt="Scanned Document" className="w-full h-full object-contain" />
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          {!previewUrl ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={switchCamera} className="flex-1">
                <RotateCcw className="mr-2" size={18} />
                Switch Camera
              </Button>
              
              <Button 
                onClick={scanDocument} 
                className="flex-1 bg-purple-700 hover:bg-purple-800"
                disabled={countdown > 0}
              >
                <ScanLine className="mr-2" size={18} />
                {countdown > 0 ? `Scanning in ${countdown}...` : 'Scan Document'}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={resetScan} className="flex-1">
                Rescan
              </Button>
              <Button 
                onClick={confirmScan} 
                className="flex-1 bg-purple-700 hover:bg-purple-800"
              >
                Use Document
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
