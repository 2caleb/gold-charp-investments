import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Printer, Camera, ScanLine, File, Video, Eye, Download, Trash2 } from 'lucide-react';
import { DocumentUpload } from "@/components/documents/DocumentUpload";
import { UploadedDocument, DocumentType } from "@/types/document";
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DocumentsTabProps {
  applicationId: string | null;
  onFinish: () => void;
  onUploadIdDocument: (file: File, description?: string) => Promise<void>;
  onUploadPassportPhoto: (file: File, description?: string) => Promise<void>;
  onUploadGuarantor1Photo: (file: File, description?: string) => Promise<void>;
  onUploadGuarantor2Photo: (file: File, description?: string) => Promise<void>;
  isUploadingId: boolean;
  isUploadingPassport: boolean;
  isUploadingGuarantor1: boolean;
  isUploadingGuarantor2: boolean;
  idDocuments: UploadedDocument[];
  passportPhotos: UploadedDocument[];
  guarantor1Photos: UploadedDocument[];
  guarantor2Photos: UploadedDocument[];
  deleteIdDocument: (fileId: string, documentType?: DocumentType) => Promise<void>;
  deletePassportPhoto: (fileId: string, documentType?: DocumentType) => Promise<void>;
  deleteGuarantor1Photo: (fileId: string, documentType?: DocumentType) => Promise<void>;
  deleteGuarantor2Photo: (fileId: string, documentType?: DocumentType) => Promise<void>;
  formReady: boolean;
  enableScanning?: boolean;
  enableMediaCapture?: boolean;
  showAttachments?: boolean;
  recordingOnsite?: boolean;
  setRecordingOnsite?: React.Dispatch<React.SetStateAction<boolean>>;
}

export const DocumentsTab: React.FC<DocumentsTabProps> = ({
  applicationId,
  onFinish,
  onUploadIdDocument,
  onUploadPassportPhoto,
  onUploadGuarantor1Photo,
  onUploadGuarantor2Photo,
  isUploadingId,
  isUploadingPassport,
  isUploadingGuarantor1,
  isUploadingGuarantor2,
  idDocuments,
  passportPhotos,
  guarantor1Photos,
  guarantor2Photos,
  deleteIdDocument,
  deletePassportPhoto,
  deleteGuarantor1Photo,
  deleteGuarantor2Photo,
  formReady,
  enableScanning = false,
  enableMediaCapture = false,
  showAttachments = false,
  recordingOnsite = false,
  setRecordingOnsite = () => {}
}) => {
  const [activeDocTab, setActiveDocTab] = useState<string>("upload");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");

  // Function to preview a document
  const handlePreviewDocument = async (url: string, type: string, name: string) => {
    setPreviewUrl(url);
    setPreviewType(type);
    setPreviewName(name);
  };

  // Function to close preview
  const handleClosePreview = () => {
    setPreviewUrl(null);
  };

  // Format document timestamp
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // All documents collected
  const allDocuments = [
    ...idDocuments.map(doc => ({ ...doc, category: "Identification" })),
    ...passportPhotos.map(doc => ({ ...doc, category: "Passport Photo" })),
    ...guarantor1Photos.map(doc => ({ ...doc, category: "Guarantor 1" })),
    ...guarantor2Photos.map(doc => ({ ...doc, category: "Guarantor 2" }))
  ];

  // Update this specific part in the render method where document deletion happens
  const handleDeleteDocument = (doc: UploadedDocument) => {
    // Delete based on document type
    if (doc.documentType === 'id_document') {
      deleteIdDocument(doc.id);
    } else if (doc.documentType === 'passport_photo') {
      deletePassportPhoto(doc.id);
    } else if (doc.documentType === 'guarantor1_photo') {
      deleteGuarantor1Photo(doc.id);
    } else if (doc.documentType === 'guarantor2_photo') {
      deleteGuarantor2Photo(doc.id);
    }
  };

  return (
    <div className="space-y-6">
      {previewUrl ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">{previewName}</h3>
            <Button variant="ghost" size="sm" onClick={handleClosePreview}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-2 mb-4">
            {previewType.startsWith('image/') ? (
              <img src={previewUrl} alt="Document Preview" className="max-w-full mx-auto rounded" />
            ) : previewType.startsWith('video/') ? (
              <video src={previewUrl} controls className="max-w-full mx-auto rounded"></video>
            ) : (
              <div className="p-8 text-center">
                <File className="h-12 w-12 mx-auto text-blue-600 mb-2" />
                <p>This document type cannot be previewed directly.</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2" 
                  onClick={() => window.open(previewUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
          <h3 className="text-lg font-semibold mb-2 text-blue-800 dark:text-blue-300">Document Requirements</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            For compliance and KYC requirements, please upload clear, legible copies of the following documents:
          </p>
          <ul className="list-disc list-inside text-sm mt-2 text-gray-700 dark:text-gray-300 space-y-1">
            <li>Valid government-issued ID (passport, driver's license, or national ID card)</li>
            <li>Recent passport-sized photograph</li>
            <li>Guarantor's identification document and photograph</li>
          </ul>
        </div>
      )}

      <Tabs value={activeDocTab} onValueChange={setActiveDocTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="upload">Document Upload</TabsTrigger>
          <TabsTrigger value="view" disabled={allDocuments.length === 0}>All Attachments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentUpload
              title="National ID Document"
              documentType="id_document"
              onUpload={onUploadIdDocument}
              isUploading={isUploadingId}
              uploadedFiles={idDocuments.map(doc => ({
                name: doc.fileName,
                size: doc.fileSize,
                type: doc.fileType,
                id: doc.id,
                documentType: doc.documentType
              }))}
              onDelete={deleteIdDocument}
              iconType="id"
              enableScanning={enableScanning}
              enableCapture={enableMediaCapture}
              isPrintable={true}
              isPrintReady={formReady}
            />
            
            <DocumentUpload
              title="Passport Photo"
              documentType="passport_photo"
              onUpload={onUploadPassportPhoto}
              isUploading={isUploadingPassport}
              uploadedFiles={passportPhotos.map(doc => ({
                name: doc.fileName,
                size: doc.fileSize,
                type: doc.fileType,
                id: doc.id,
                documentType: doc.documentType
              }))}
              onDelete={deletePassportPhoto}
              iconType="user"
              enableCapture={enableMediaCapture}
              isPrintable={true}
              isPrintReady={formReady}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DocumentUpload
              title="Guarantor 1 Photo"
              documentType="guarantor1_photo"
              onUpload={onUploadGuarantor1Photo}
              isUploading={isUploadingGuarantor1}
              uploadedFiles={guarantor1Photos.map(doc => ({
                name: doc.fileName,
                size: doc.fileSize,
                type: doc.fileType,
                id: doc.id,
                documentType: doc.documentType
              }))}
              onDelete={deleteGuarantor1Photo}
              iconType="user"
              enableCapture={enableMediaCapture}
              isPrintable={true}
              isPrintReady={formReady}
            />
            
            <DocumentUpload
              title="Guarantor 2 Photo (Optional)"
              documentType="guarantor2_photo"
              onUpload={onUploadGuarantor2Photo}
              isUploading={isUploadingGuarantor2}
              uploadedFiles={guarantor2Photos.map(doc => ({
                name: doc.fileName,
                size: doc.fileSize,
                type: doc.fileType,
                id: doc.id,
                documentType: doc.documentType
              }))}
              onDelete={deleteGuarantor2Photo}
              iconType="user"
              enableCapture={enableMediaCapture}
              isPrintable={true}
              isPrintReady={formReady}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="view" className="space-y-6">
          {showAttachments && allDocuments.length > 0 ? (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-medium mb-4">All Uploaded Attachments</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-800">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Document</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Size</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {allDocuments.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{doc.fileName}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {/* Use the upload date if available, or a placeholder */}
                              {formatDate(doc.uploadedAt)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{doc.category}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900 dark:text-white">{doc.fileType.split('/')[1]}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {Math.round(doc.fileSize / 1024)} KB
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => {
                                  // This would typically fetch the URL from the server
                                  handlePreviewDocument(`/api/document/${doc.id}`, doc.fileType, doc.fileName);
                                }}
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleDeleteDocument(doc)}
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center p-8">
              <File className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No documents have been uploaded yet</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-between mt-8">
        <Button variant="outline" className="flex items-center" onClick={() => window.print()} disabled={!formReady}>
          <Printer className="mr-2 h-4 w-4" />
          Print All Documents
        </Button>
        
        <Button onClick={onFinish} className="bg-blue-700 hover:bg-blue-800">
          <Check className="mr-2 h-4 w-4" />
          Continue to Terms
        </Button>
      </div>
    </div>
  );
};
