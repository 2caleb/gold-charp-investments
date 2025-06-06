
import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useExcelUpload } from '@/hooks/use-excel-upload';
import { Upload, FileSpreadsheet, AlertCircle, Lock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import SecurityGuard from '@/components/security/SecurityGuard';

const ExcelUploadCard: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadExcelFile, uploadProgress } = useExcelUpload();

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];

    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    await uploadExcelFile(file);
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isUploading = uploadProgress.uploading || uploadProgress.processing;

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center text-blue-800">
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Excel File Upload
          <SecurityGuard action="canUploadExcel" showMessage={false}>
            <span className="ml-2 text-sm text-green-600">(Authorized)</span>
          </SecurityGuard>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SecurityGuard
          action="canUploadExcel"
          fallback={
            <div className="text-center py-8">
              <Lock className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">Upload access restricted</p>
              <p className="text-gray-400 text-sm">Contact Director Caleb for file uploads</p>
            </div>
          }
        >
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Upload Excel files (.xlsx, .xls) to share data with all users. Maximum file size: 10MB.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button
              onClick={handleFileSelect}
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? 'Processing...' : 'Select Excel File'}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{uploadProgress.stage}</span>
                  <span>{uploadProgress.progress}%</span>
                </div>
                <Progress value={uploadProgress.progress} className="w-full" />
              </div>
            )}
          </div>
        </SecurityGuard>
      </CardContent>
    </Card>
  );
};

export default ExcelUploadCard;
