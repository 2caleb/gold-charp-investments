
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, FileText, Camera, Home, File, Video, ScanLine, Trash2, Printer } from 'lucide-react';
import { useMediaCapture } from '@/hooks/use-media-capture';
import { DocumentScanner } from '@/components/media/DocumentScanner';

interface UploadedFile {
  name: string;
  size: number;
  url?: string;
  type: string;
  id?: string;
}

interface DocumentUploadProps {
  title: string;
  documentType: 'id_document' | 'collateral_photo' | 'property_document' | 'loan_agreement' | 'video_evidence' | 'passport_photo' | 'guarantor1_photo' | 'guarantor2_photo';
  onUpload: (file: File, description?: string, tags?: string[]) => Promise<void>;
  isUploading: boolean;
  iconType?: 'id' | 'photo' | 'property' | 'document' | 'video' | 'user';
  enableScanning?: boolean;
  enableCapture?: boolean;
  uploadedFiles?: UploadedFile[];
  onDelete?: (fileId: string) => Promise<void>;
  isPrintable?: boolean;
  isPrintReady?: boolean;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  documentType,
  onUpload,
  isUploading,
  iconType = 'document',
  enableScanning = false,
  enableCapture = false,
  uploadedFiles = [],
  onDelete,
  isPrintable = false,
  isPrintReady = false
}) => {
  const [description, setDescription] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [localUploadedFiles, setLocalUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { captureImage, captureVideo, MediaCaptureUI } = useMediaCapture();
  
  const icons = {
    id: <FileText className="h-6 w-6" />,
    photo: <Camera className="h-6 w-6" />,
    property: <Home className="h-6 w-6" />,
    document: <File className="h-6 w-6" />,
    video: <Video className="h-6 w-6" />,
    user: <Camera className="h-6 w-6" />
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file, description);
      setLocalUploadedFiles(prev => [...prev, file]);
      setDescription('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCaptureImage = async () => {
    try {
      const imageData = await captureImage();
      // Convert base64 to file
      const base64Response = await fetch(imageData);
      const blob = await base64Response.blob();
      
      // Create file from blob with proper type information
      const fileName = `capture-${Date.now()}.jpg`;
      const fileOptions = { type: 'image/jpeg' };
      const file = new Blob([blob], fileOptions) as any;
      file.name = fileName;
      file.lastModified = Date.now();
      
      await onUpload(file as File, description);
      setLocalUploadedFiles(prev => [...prev, file as File]);
      setDescription('');
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const handleCaptureVideo = async () => {
    try {
      const videoData = await captureVideo();
      // Convert base64 to file
      const base64Response = await fetch(videoData);
      const blob = await base64Response.blob();
      
      // Create file from blob with proper type information
      const fileName = `video-${Date.now()}.webm`;
      const fileOptions = { type: 'video/webm' };
      const file = new Blob([blob], fileOptions) as any;
      file.name = fileName;
      file.lastModified = Date.now();
      
      await onUpload(file as File, description);
      setLocalUploadedFiles(prev => [...prev, file as File]);
      setDescription('');
    } catch (error) {
      console.error('Error capturing video:', error);
    }
  };

  const handleScanDocument = async (dataUrl: string) => {
    setShowScanner(false);
    try {
      // Convert base64 to file
      const base64Response = await fetch(dataUrl);
      const blob = await base64Response.blob();
      
      // Create file from blob with proper type information
      const fileName = `scan-${Date.now()}.jpg`;
      const fileOptions = { type: 'image/jpeg' };
      const file = new Blob([blob], fileOptions) as any;
      file.name = fileName;
      file.lastModified = Date.now();
      
      await onUpload(file as File, description);
      setLocalUploadedFiles(prev => [...prev, file as File]);
      setDescription('');
    } catch (error) {
      console.error('Error processing scanned document:', error);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (onDelete && fileId) {
      await onDelete(fileId);
    }
  };

  const handlePrint = () => {
    if (!isPrintReady) return;
    window.print();
  };

  // Combine uploaded files from props and local state
  const allFiles = [
    ...uploadedFiles,
    ...localUploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      id: file.name // Use filename as temporary ID for local files
    }))
  ];

  // Function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <>
      {MediaCaptureUI}
      
      {showScanner ? (
        <DocumentScanner 
          onScan={handleScanDocument}
          onCancel={() => setShowScanner(false)}
        />
      ) : (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {icons[iconType]}
                <h3 className="text-lg font-medium ml-2">{title}</h3>
              </div>
              {isPrintable && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrint}
                  disabled={!isPrintReady}
                  className={`${!isPrintReady ? 'opacity-30 cursor-not-allowed' : ''}`}
                  title={isPrintReady ? "Print document" : "Complete the form to enable printing"}
                >
                  <Printer className="h-5 w-5" />
                </Button>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor={`description-${documentType}`}>Description (Optional)</Label>
                <Textarea
                  id={`description-${documentType}`}
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id={`file-upload-${documentType}`}
                  accept={documentType.includes('photo') ? 'image/*' : documentType === 'video_evidence' ? 'video/*' : 'image/*,.pdf,.doc,.docx'}
                />
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    variant="outline"
                  >
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Select File
                  </Button>
                  
                  {enableScanning && (
                    <Button 
                      onClick={() => setShowScanner(true)}
                      disabled={isUploading}
                      variant="outline"
                    >
                      <ScanLine className="h-4 w-4 mr-2" />
                      Scan Document
                    </Button>
                  )}
                  
                  {(enableCapture || documentType.includes('photo')) && (
                    <Button 
                      onClick={handleCaptureImage}
                      disabled={isUploading}
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {documentType.includes('passport') ? 'Take Passport Photo' : 'Take Photo'}
                    </Button>
                  )}
                  
                  {documentType === 'video_evidence' && (
                    <Button 
                      onClick={handleCaptureVideo}
                      disabled={isUploading}
                      variant="outline"
                    >
                      <Video className="h-4 w-4 mr-2" />
                      Record Video
                    </Button>
                  )}
                </div>

                {/* Display uploaded files */}
                {allFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <Label>Attachments</Label>
                    <div className="border rounded-md p-3 space-y-2">
                      {allFiles.map((file, index) => (
                        <div key={file.id || index} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-2 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-blue-500" />
                            <div>
                              <p className="text-sm font-medium">{file.name}</p>
                              <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                            </div>
                          </div>
                          {onDelete && file.id && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteFile(file.id as string)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
