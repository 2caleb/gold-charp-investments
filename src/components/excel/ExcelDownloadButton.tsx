
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useSharedExcelData } from '@/hooks/use-shared-excel-data';
import { toast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ExcelDownloadButtonProps {
  filteredData?: any[];
  fileName?: string;
}

const ExcelDownloadButton: React.FC<ExcelDownloadButtonProps> = ({ 
  filteredData, 
  fileName = 'shared_excel_data' 
}) => {
  const { excelData } = useSharedExcelData();
  const dataToDownload = filteredData || excelData || [];

  const handleDownload = () => {
    if (dataToDownload.length === 0) {
      toast({
        title: "No Data Available",
        description: "There is no data to download.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare data for Excel export
      const exportData = dataToDownload.map((row, index) => {
        const flattenedData: Record<string, any> = {
          'Row #': index + 1,
          'Sheet Name': row.sheet_name || 'Unknown',
          'Row Index': row.row_index || 'N/A',
          'Upload Date': new Date(row.created_at).toLocaleDateString(),
        };

        // Flatten the row_data object
        if (row.row_data && typeof row.row_data === 'object') {
          Object.entries(row.row_data).forEach(([key, value]) => {
            flattenedData[key] = value;
          });
        }

        return flattenedData;
      });

      // Create workbook and worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');

      // Generate Excel file and download
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Download Complete",
        description: `${dataToDownload.length} rows exported successfully.`
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the Excel file.",
        variant: "destructive"
      });
    }
  };

  return (
    <Button
      onClick={handleDownload}
      variant="outline"
      size="sm"
      className="flex items-center"
      disabled={dataToDownload.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      Download Excel
    </Button>
  );
};

export default ExcelDownloadButton;
