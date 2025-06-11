
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface WeeklyReport {
  id: string;
  role_type: string;
  report_week: string;
  applications_reviewed: number;
  applications_approved: number;
  applications_rejected: number;
  pending_applications: number;
  created_at: string;
}

interface PDFExportOptions {
  includeCharts?: boolean;
  includeHeader?: boolean;
  companyName?: string;
}

export const exportWeeklyReportToPDF = async (
  report: WeeklyReport,
  financialData?: any,
  options: PDFExportOptions = {}
) => {
  const {
    includeCharts = true,
    includeHeader = true,
    companyName = 'Gold Charp Financial Services'
  } = options;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header Section
    if (includeHeader) {
      pdf.setFontSize(20);
      pdf.setTextColor(124, 58, 237); // Purple color
      pdf.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Weekly Workflow Report', pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 8;
      pdf.setFontSize(12);
      pdf.setTextColor(75, 85, 99);
      const reportDate = new Date(report.report_week).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Report Period: Week of ${reportDate}`, pageWidth / 2, yPosition, { align: 'center' });
      pdf.text(`Role: ${report.role_type.toUpperCase()}`, pageWidth / 2, yPosition + 5, { align: 'center' });
      
      yPosition += 20;
      
      // Add horizontal line
      pdf.setDrawColor(124, 58, 237);
      pdf.setLineWidth(0.5);
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 15;
    }

    // Executive Summary Section
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Executive Summary', 20, yPosition);
    yPosition += 10;

    // Summary metrics
    const totalApplications = report.applications_reviewed;
    const approvalRate = totalApplications > 0 ? ((report.applications_approved / totalApplications) * 100).toFixed(1) : '0';
    const rejectionRate = totalApplications > 0 ? ((report.applications_rejected / totalApplications) * 100).toFixed(1) : '0';

    pdf.setFontSize(10);
    pdf.setTextColor(75, 85, 99);
    
    const summaryText = [
      `• Total Applications Processed: ${totalApplications}`,
      `• Applications Approved: ${report.applications_approved} (${approvalRate}%)`,
      `• Applications Rejected: ${report.applications_rejected} (${rejectionRate}%)`,
      `• Pending Applications: ${report.pending_applications}`,
      `• Overall Approval Rate: ${approvalRate}%`
    ];

    summaryText.forEach((text, index) => {
      pdf.text(text, 25, yPosition + (index * 6));
    });
    yPosition += 40;

    // Performance Metrics Table
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Detailed Performance Metrics', 20, yPosition);
    yPosition += 10;

    // Create table
    const tableData = [
      ['Metric', 'Count', 'Percentage'],
      ['Applications Reviewed', report.applications_reviewed.toString(), '100%'],
      ['Applications Approved', report.applications_approved.toString(), `${approvalRate}%`],
      ['Applications Rejected', report.applications_rejected.toString(), `${rejectionRate}%`],
      ['Pending Applications', report.pending_applications.toString(), 
       totalApplications > 0 ? `${((report.pending_applications / totalApplications) * 100).toFixed(1)}%` : '0%']
    ];

    // Draw table
    const cellWidth = (pageWidth - 40) / 3;
    const cellHeight = 8;
    
    tableData.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const x = 20 + (colIndex * cellWidth);
        const y = yPosition + (rowIndex * cellHeight);
        
        // Header row styling
        if (rowIndex === 0) {
          pdf.setFillColor(124, 58, 237);
          pdf.rect(x, y - 2, cellWidth, cellHeight, 'F');
          pdf.setTextColor(255, 255, 255);
          pdf.setFontSize(10);
        } else {
          pdf.setTextColor(0, 0, 0);
          pdf.setFontSize(9);
          // Alternate row colors
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(248, 250, 252);
            pdf.rect(x, y - 2, cellWidth, cellHeight, 'F');
          }
        }
        
        // Draw cell borders
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(x, y - 2, cellWidth, cellHeight);
        
        // Add text
        pdf.text(cell, x + 2, y + 3);
      });
    });
    yPosition += (tableData.length * cellHeight) + 15;

    // Visual Progress Bars Section
    if (includeCharts) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Performance Visualization', 20, yPosition);
      yPosition += 15;

      // Draw approval rate progress bar
      const barWidth = pageWidth - 80;
      const barHeight = 6;
      const approvalPercentage = parseFloat(approvalRate) / 100;

      pdf.setFontSize(10);
      pdf.text('Approval Rate:', 20, yPosition);
      pdf.text(`${approvalRate}%`, pageWidth - 40, yPosition);

      // Background bar
      pdf.setFillColor(229, 231, 235);
      pdf.rect(20, yPosition + 2, barWidth, barHeight, 'F');

      // Progress bar
      pdf.setFillColor(34, 197, 94); // Green
      pdf.rect(20, yPosition + 2, barWidth * approvalPercentage, barHeight, 'F');

      yPosition += 20;

      // Draw rejection rate progress bar
      const rejectionPercentage = parseFloat(rejectionRate) / 100;

      pdf.text('Rejection Rate:', 20, yPosition);
      pdf.text(`${rejectionRate}%`, pageWidth - 40, yPosition);

      // Background bar
      pdf.setFillColor(229, 231, 235);
      pdf.rect(20, yPosition + 2, barWidth, barHeight, 'F');

      // Progress bar
      pdf.setFillColor(239, 68, 68); // Red
      pdf.rect(20, yPosition + 2, barWidth * rejectionPercentage, barHeight, 'F');

      yPosition += 25;
    }

    // Financial Overview Section (if data available)
    if (financialData) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Financial Overview', 20, yPosition);
      yPosition += 10;

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
          style: 'currency',
          currency: 'UGX',
          minimumFractionDigits: 0,
        }).format(amount || 0);
      };

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      
      const financialMetrics = [
        `• Total Income: ${formatCurrency(financialData.total_income)}`,
        `• Total Expenses: ${formatCurrency(financialData.total_expenses)}`,
        `• Net Income: ${formatCurrency(financialData.net_income)}`,
        `• Loan Portfolio: ${formatCurrency(financialData.total_loan_portfolio)}`,
        `• Collection Rate: ${(financialData.collection_rate || 0).toFixed(1)}%`
      ];

      financialMetrics.forEach((text, index) => {
        pdf.text(text, 25, yPosition + (index * 6));
      });
      yPosition += 40;
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    const generatedDate = new Date().toLocaleString();
    pdf.text(`Generated on: ${generatedDate}`, 20, pageHeight - 20);
    pdf.text('Confidential - Internal Use Only', pageWidth - 60, pageHeight - 20);

    // Generate filename
    const filename = `weekly-report-${report.role_type}-${report.report_week}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF report');
  }
};

export const exportMultipleReportsToPDF = async (
  reports: WeeklyReport[],
  financialData?: any,
  options: PDFExportOptions = {}
) => {
  const { companyName = 'Gold Charp Financial Services' } = options;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 20;

    // Header for consolidated report
    pdf.setFontSize(20);
    pdf.setTextColor(124, 58, 237);
    pdf.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Consolidated Weekly Reports', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Summary table for all reports
    const tableHeaders = ['Role', 'Week', 'Reviewed', 'Approved', 'Rejected', 'Pending'];
    const cellWidth = (pageWidth - 40) / tableHeaders.length;
    const cellHeight = 8;

    // Draw headers
    tableHeaders.forEach((header, index) => {
      const x = 20 + (index * cellWidth);
      pdf.setFillColor(124, 58, 237);
      pdf.rect(x, yPosition - 2, cellWidth, cellHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(9);
      pdf.text(header, x + 2, yPosition + 3);
    });
    yPosition += cellHeight;

    // Draw data rows
    reports.forEach((report, rowIndex) => {
      const rowData = [
        report.role_type.toUpperCase(),
        new Date(report.report_week).toLocaleDateString(),
        report.applications_reviewed.toString(),
        report.applications_approved.toString(),
        report.applications_rejected.toString(),
        report.pending_applications.toString()
      ];

      rowData.forEach((cell, colIndex) => {
        const x = 20 + (colIndex * cellWidth);
        const y = yPosition;
        
        // Alternate row colors
        if (rowIndex % 2 === 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(x, y - 2, cellWidth, cellHeight, 'F');
        }
        
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(x, y - 2, cellWidth, cellHeight);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(8);
        pdf.text(cell, x + 2, y + 3);
      });
      yPosition += cellHeight;
    });

    // Generate filename
    const filename = `consolidated-weekly-reports-${new Date().toISOString().split('T')[0]}.pdf`;
    
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating consolidated PDF:', error);
    throw new Error('Failed to generate consolidated PDF report');
  }
};
