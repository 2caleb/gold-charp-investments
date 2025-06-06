
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useSharedExcelData } from '@/hooks/use-shared-excel-data';
import { Search, FileSpreadsheet, Download, Filter, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

const SharedExcelViewer: React.FC = () => {
  const { groupedData, uploadHistory, isLoading } = useSharedExcelData();
  const [selectedUpload, setSelectedUpload] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<string>('');

  // Get available uploads and sheets
  const availableUploads = uploadHistory?.filter(upload => upload.status === 'completed') || [];
  const selectedUploadData = selectedUpload ? groupedData[selectedUpload] || [] : [];
  const availableSheets = [...new Set(selectedUploadData.map(row => row.sheet_name))];

  // Filter data based on search and sheet selection
  const filteredData = useMemo(() => {
    let data = selectedUploadData;

    if (selectedSheet) {
      data = data.filter(row => row.sheet_name === selectedSheet);
    }

    if (searchTerm) {
      data = data.filter(row => 
        Object.values(row.row_data).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    return data.sort((a, b) => a.row_index - b.row_index);
  }, [selectedUploadData, selectedSheet, searchTerm]);

  // Get column headers from first row
  const headers = filteredData.length > 0 
    ? Object.keys(filteredData[0].row_data) 
    : [];

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const exportToCSV = () => {
    if (filteredData.length === 0) return;
    
    const csvHeaders = headers.join(',');
    const csvRows = filteredData.map(row => 
      headers.map(header => {
        const value = row.row_data[header];
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value || '';
      }).join(',')
    );
    
    const csvContent = [csvHeaders, ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `excel_data_${selectedUpload}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading shared Excel data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileSpreadsheet className="mr-2 h-5 w-5" />
            Shared Excel Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {availableUploads.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No Excel files have been uploaded yet.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={selectedUpload} onValueChange={setSelectedUpload}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an uploaded file" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUploads.map((upload) => (
                      <SelectItem key={upload.id} value={upload.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{upload.original_file_name}</span>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(upload.file_size)} • {upload.total_rows} rows • {new Date(upload.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedUpload && availableSheets.length > 1 && (
                  <Select value={selectedSheet} onValueChange={setSelectedSheet}>
                    <SelectTrigger>
                      <SelectValue placeholder="All sheets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All sheets</SelectItem>
                      {availableSheets.map((sheet) => (
                        <SelectItem key={sheet} value={sheet}>
                          {sheet}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {selectedUpload && (
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search data..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={exportToCSV}
                    variant="outline"
                    disabled={filteredData.length === 0}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export CSV
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Data Display */}
      {selectedUpload && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Eye className="mr-2 h-5 w-5" />
                Data View
              </CardTitle>
              <div className="flex gap-2">
                {selectedSheet && (
                  <Badge variant="secondary">{selectedSheet}</Badge>
                )}
                <Badge variant="outline">
                  {filteredData.length} rows
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredData.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No data found matching your criteria.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16">#</TableHead>
                      {selectedSheet === '' && (
                        <TableHead>Sheet</TableHead>
                      )}
                      {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredData.map((row, index) => (
                      <motion.tr
                        key={row.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-mono text-sm">
                          {row.row_index}
                        </TableCell>
                        {selectedSheet === '' && (
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {row.sheet_name}
                            </Badge>
                          </TableCell>
                        )}
                        {headers.map((header) => (
                          <TableCell key={header} className="max-w-xs truncate">
                            {row.row_data[header] || '-'}
                          </TableCell>
                        ))}
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SharedExcelViewer;
