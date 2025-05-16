
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Download, Trash2, Eye, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AspectRatio } from '@/components/ui/aspect-ratio';

import { UploadedDocument } from '@/hooks/use-document-upload';

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
      <Card className="mb-6">
        <CardContent className="p-6">
          <h3 className="text-lg font-medium mb-4">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400">No documents uploaded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">{title}</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <p>Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-gray-500" />
                  <div>
                    <div className="flex items-center">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {doc.fileName}
                      </p>
                      {renderBadge && renderBadge(doc.id)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {(doc.fileSize / 1024).toFixed(1)} KB • {doc.documentType.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handlePreview(doc.id)}
                    disabled={previewLoading}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  {onVerify && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleVerify(doc.id)}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
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
                  <Button asChild>
                    <a href={activeDocument.url} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                </div>
              )
            ) : (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
