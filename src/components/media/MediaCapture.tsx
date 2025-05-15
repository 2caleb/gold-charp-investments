
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video, X, RotateCcw } from 'lucide-react';

interface MediaCaptureProps {
  type: 'photo' | 'video';
  onCapture: (data: string) => void;
  onCancel: () => void;
}

export const MediaCapture: React.FC<MediaCaptureProps> = ({ type, onCapture, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [facing, setFacing] = useState<'user' | 'environment'>('environment');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<number | null>(null);
  
  // Initialize camera
  useEffect(() => {
    const startCamera = async () => {
      try {
        const constraints = {
          video: {
            facingMode: facing,
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: type === 'video'
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        mediaStreamRef.current = stream;
        
        if (type === 'video') {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunksRef.current.push(e.data);
            }
          };
          
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            chunksRef.current = [];
          };
        }
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
      
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [type, facing]);
  
  const takePhoto = () => {
    if (!videoRef.current) return;
    
    // Start countdown
    setCountdown(3);
    
    const countdownTimer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimer);
          
          // Take the photo
          const canvas = document.createElement('canvas');
          canvas.width = videoRef.current!.videoWidth;
          canvas.height = videoRef.current!.videoHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setPreviewUrl(dataUrl);
          }
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };
  
  const startRecording = () => {
    if (!mediaRecorderRef.current) return;
    
    chunksRef.current = [];
    mediaRecorderRef.current.start();
    setIsRecording(true);
    
    // Set up timer to display recording duration
    setRecordingDuration(0);
    const interval = window.setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
    setRecordingInterval(interval);
  };
  
  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
    
    mediaRecorderRef.current.stop();
    setIsRecording(false);
    
    // Clear the recording timer
    if (recordingInterval) {
      clearInterval(recordingInterval);
      setRecordingInterval(null);
    }
  };
  
  const switchCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setFacing(prev => prev === 'user' ? 'environment' : 'user');
  };
  
  const resetCapture = () => {
    setPreviewUrl(null);
  };
  
  const confirmCapture = () => {
    if (previewUrl) {
      onCapture(previewUrl);
    }
  };
  
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">
            {type === 'photo' ? 'Take a Photo' : 'Record a Video'}
          </h3>
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
              
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-6xl font-bold">
                  {countdown}
                </div>
              )}
              
              {isRecording && (
                <div className="absolute top-4 left-4 flex items-center bg-red-500 text-white px-3 py-1 rounded-full">
                  <span className="h-3 w-3 bg-white rounded-full mr-2 animate-pulse"></span>
                  Recording... {formatDuration(recordingDuration)}
                </div>
              )}
            </>
          ) : (
            type === 'photo' ? (
              <img src={previewUrl} alt="Captured" className="w-full h-full object-contain" />
            ) : (
              <video src={previewUrl} controls className="w-full h-full" />
            )
          )}
        </div>
        
        <div className="mt-4 flex justify-between">
          {!previewUrl ? (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={switchCamera} className="flex-1">
                <RotateCcw className="mr-2" size={18} />
                Switch Camera
              </Button>
              
              {type === 'photo' ? (
                <Button 
                  onClick={takePhoto} 
                  className="flex-1 bg-purple-700 hover:bg-purple-800"
                  disabled={countdown > 0}
                >
                  <Camera className="mr-2" size={18} />
                  {countdown > 0 ? `Taking in ${countdown}...` : 'Take Photo'}
                </Button>
              ) : (
                !isRecording ? (
                  <Button 
                    onClick={startRecording} 
                    className="flex-1 bg-purple-700 hover:bg-purple-800"
                  >
                    <Video className="mr-2" size={18} />
                    Start Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording} 
                    variant="destructive"
                    className="flex-1"
                  >
                    Stop Recording
                  </Button>
                )
              )}
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button variant="outline" onClick={resetCapture} className="flex-1">
                Retake
              </Button>
              <Button 
                onClick={confirmCapture} 
                className="flex-1 bg-purple-700 hover:bg-purple-800"
              >
                Use {type === 'photo' ? 'Photo' : 'Video'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
