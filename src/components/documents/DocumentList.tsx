
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, Trash2, Eye, ShieldCheck, Check } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Badge } from '@/components/ui/badge';
import { UploadedDocument } from '@/types/document';

interface DocumentListProps {
  documents: UploadedDocument[];
  onDelete: (id: string) => Promise<void>;
  onPreview: (id: string) => Promise<string | null>;
  onVerify?: (id: string) => Promise<void>;
  isVerifying?: boolean;
  renderBadge?: (documentId: string) => React.ReactNode;
  isLoading?: boolean;
  title?: string;
}

export const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  onDelete,
  onPreview,
  onVerify,
  isVerifying = false,
  renderBadge,
  isLoading = false,
  title = 'Uploaded Documents'
}) => {
  const [activeDocument, setActiveDocument] = useState<{id: string, url: string | null}>({ id: '', url: null });
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<Record<string, boolean>>({});
  const [previewLoading, setPreviewLoading] = useState(false);
  const [verified, setVerified] = useState<Record<string, boolean>>({});

  const handlePreview = async (id: string) => {
    setPreviewLoading(true);
    const url = await onPreview(id);
    setActiveDocument({ id, url });
    setPreviewLoading(false);
    setIsPreviewOpen(true);
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(prev => ({ ...prev, [id]: true }));
    await onDelete(id);
    setIsDeleting(prev => ({ ...prev, [id]: false }));
  };
  
  const handleVerify = async (id: string) => {
    if (onVerify) {
      await onVerify(id);
      // Simulate verification success
      setVerified(prev => ({ ...prev, [id]: true }));
    }
  };

  const isImage = (fileType: string) => {
    return fileType.startsWith('image/');
  };

  const isPdf = (fileType: string) => {
    return fileType === 'application/pdf';
  };

  if (documents.length === 0 && !isLoading) {
    return (
      <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300 bg-gray-50 dark:bg-gray-800/50">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6 shadow-md hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-blue-600" />
          {title}
        </h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-6 w-6 animate-spin mr-2 text-blue-600" />
            <p>Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md border border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-200 transform hover:translate-y-[-2px] hover:shadow-md">
                <div className="flex items-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full mr-3">
                    <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {doc.fileName}
                      </p>
                      {renderBadge && renderBadge(doc.id)}
                      {verified[doc.id] && (
                        <Badge className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(doc.fileSize / 1024).toFixed(1)} KB • {doc.documentType.replace('_', ' ')}
                      {doc.uploadedAt && ` • ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(doc.id)}
                    disabled={previewLoading}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                  >
                    <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </Button>
                  
                  {onVerify && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerify(doc.id)}
                      disabled={isVerifying || verified[doc.id]}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                    >
                      {isVerifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : verified[doc.id] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                      )}
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting[doc.id]}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
                  >
                    {isDeleting[doc.id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-500" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Document Preview</DialogTitle>
            </DialogHeader>
            
            {activeDocument.url ? (
              isImage(documents.find(d => d.id === activeDocument.id)?.fileType || '') ? (
                <div className="overflow-auto max-h-[70vh]">
                  <AspectRatio ratio={16/9} className="bg-muted">
                    <img
                      src={activeDocument.url}
                      alt="Document preview"
                      className="w-full h-full object-contain"
                    />
                  </AspectRatio>
                </div>
              ) : isPdf(documents.find(d => d.id === activeDocument.id)?.fileType || '') ? (
                <iframe 
                  src={activeDocument.url} 
                  width="100%" 
                  height="500px"
                  title="PDF Document"
                  className="border-0"
                />
              ) : (
                <div className="flex flex-col items-center justify-center p-8">
                  <FileText className="h-16 w-16 mb-4 text-gray-400" />
                  <p className="mb-4">This file type can't be previewed directly.</p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-all duration-200">
                    <a href={activeDocument.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
