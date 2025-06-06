
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSharedExcelData } from '@/hooks/use-shared-excel-data';
import { FileSpreadsheet, Download, Eye, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const SharedExcelViewer: React.FC = () => {
  const { excelData, uploadHistory, groupedData, isLoading } = useSharedExcelData();
  const [selectedUpload, setSelectedUpload] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSheet, setSelectedSheet] = useState<string>('all');

  console.log('SharedExcelViewer - excelData:', excelData);
  console.log('SharedExcelViewer - uploadHistory:', uploadHistory);
  console.log('SharedExcelViewer - groupedData:', groupedData);

  // Get available sheets for the selected upload
  const availableSheets = useMemo(() => {
    if (selectedUpload === 'all') {
      const allSheets = new Set<string>();
      excelData?.forEach(row => {
        if (row.sheet_name && row.sheet_name.trim() !== '') {
          allSheets.add(row.sheet_name);
        }
      });
      return Array.from(allSheets);
    } else {
      const uploadData = groupedData[selectedUpload] || [];
      const sheets = new Set<string>();
      uploadData.forEach(row => {
        if (row.sheet_name && row.sheet_name.trim() !== '') {
          sheets.add(row.sheet_name);
        }
      });
      return Array.from(sheets);
    }
  }, [selectedUpload, excelData, groupedData]);

  // Filter data based on selections and search
  const filteredData = useMemo(() => {
    let data = excelData || [];
    
    // Filter by upload
    if (selectedUpload !== 'all') {
      data = groupedData[selectedUpload] || [];
    }
    
    // Filter by sheet
    if (selectedSheet !== 'all') {
      data = data.filter(row => row.sheet_name === selectedSheet);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      data = data.filter(row => {
        const searchLower = searchTerm.toLowerCase();
        return (
          row.sheet_name?.toLowerCase().includes(searchLower) ||
          JSON.stringify(row.row_data).toLowerCase().includes(searchLower)
        );
      });
    }
    
    return data;
  }, [excelData, groupedData, selectedUpload, selectedSheet, searchTerm]);

  // Reset sheet selection when upload changes
  React.useEffect(() => {
    setSelectedSheet('all');
  }, [selectedUpload]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading shared data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getFileFromHistory = (uploadId: string) => {
    return uploadHistory?.find(file => file.id === uploadId);
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center text-purple-800">
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          Shared Excel Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">File</label>
            <Select value={selectedUpload} onValueChange={setSelectedUpload}>
              <SelectTrigger>
                <SelectValue placeholder="Select file" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Files</SelectItem>
                {uploadHistory?.map((upload) => (
                  <SelectItem key={upload.id} value={upload.id}>
                    {upload.original_file_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Sheet</label>
            <Select value={selectedSheet} onValueChange={setSelectedSheet}>
              <SelectTrigger>
                <SelectValue placeholder="Select sheet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sheets</SelectItem>
                {availableSheets.map((sheet) => (
                  <SelectItem key={sheet} value={sheet}>
                    {sheet}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        {/* Data Display */}
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <FileSpreadsheet className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg mb-2">No data available</p>
            <p className="text-gray-400 text-sm">
              {uploadHistory?.length === 0 
                ? "Upload an Excel file to get started"
                : "Try adjusting your filters or search term"
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                {filteredData.length} rows
              </Badge>
              {selectedUpload !== 'all' && (
                <div className="text-sm text-gray-600">
                  From: {getFileFromHistory(selectedUpload)?.original_file_name}
                </div>
              )}
            </div>

            <div className="max-h-96 overflow-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Sheet</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Row</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Data</th>
                    <th className="px-4 py-2 text-left font-medium text-gray-700">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.slice(0, 100).map((row) => (
                    <tr key={row.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2 font-medium">{row.sheet_name}</td>
                      <td className="px-4 py-2 text-gray-600">{row.row_index}</td>
                      <td className="px-4 py-2">
                        <div className="max-w-md overflow-hidden">
                          <details className="group">
                            <summary className="cursor-pointer text-blue-600 hover:text-blue-800 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              View Data
                            </summary>
                            <div className="mt-2 p-2 bg-gray-100 rounded text-xs max-h-32 overflow-auto">
                              <pre>{JSON.stringify(row.row_data, null, 2)}</pre>
                            </div>
                          </details>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-xs">
                        {new Date(row.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredData.length > 100 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Showing first 100 rows of {filteredData.length} total
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SharedExcelViewer;
