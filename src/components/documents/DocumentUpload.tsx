
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, X, FileText, Camera, Home, File } from 'lucide-react';
import { useMediaCapture } from '@/hooks/use-media-capture';
import { DocumentScanner } from '@/components/media/DocumentScanner';

interface DocumentUploadProps {
  title: string;
  documentType: 'id_document' | 'collateral_photo' | 'property_document' | 'loan_agreement';
  onUpload: (file: File, description?: string, tags?: string[]) => Promise<void>;
  isUploading: boolean;
  iconType?: 'id' | 'photo' | 'property' | 'document';
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  title,
  documentType,
  onUpload,
  isUploading,
  iconType = 'document'
}) => {
  const [description, setDescription] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { captureImage, MediaCaptureUI } = useMediaCapture();
  
  const icons = {
    id: <FileText className="h-6 w-6" />,
    photo: <Camera className="h-6 w-6" />,
    property: <Home className="h-6 w-6" />,
    document: <File className="h-6 w-6" />
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file, description);
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
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      await onUpload(file, description);
      setDescription('');
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  const handleScanDocument = async (dataUrl: string) => {
    setShowScanner(false);
    try {
      // Convert base64 to file
      const base64Response = await fetch(dataUrl);
      const blob = await base64Response.blob();
      const file = new File([blob], `scan-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      await onUpload(file, description);
      setDescription('');
    } catch (error) {
      console.error('Error processing scanned document:', error);
    }
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
            <div className="flex items-center mb-4">
              {icons[iconType]}
              <h3 className="text-lg font-medium ml-2">{title}</h3>
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
                />
                
                <div className="flex flex-wrap gap-2">
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
                  
                  {(documentType === 'id_document' || documentType === 'property_document') && (
                    <Button 
                      onClick={() => setShowScanner(true)}
                      disabled={isUploading}
                      variant="outline"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Scan Document
                    </Button>
                  )}
                  
                  {(documentType === 'collateral_photo') && (
                    <Button 
                      onClick={handleCaptureImage}
                      disabled={isUploading}
                      variant="outline"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};
