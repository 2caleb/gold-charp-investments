
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

interface FinancialData {
  total_income?: number;
  total_expenses?: number;
  net_income?: number;
  total_loan_portfolio?: number;
  total_repaid?: number;
  outstanding_balance?: number;
  active_loan_holders?: number;
  collection_rate?: number;
}

interface TransactionData {
  id: string;
  amount: number;
  description: string;
  category: string;
  transaction_type: string;
  date: string;
  status: string;
}

interface PDFExportOptions {
  includeCharts?: boolean;
  includeHeader?: boolean;
  companyName?: string;
}

export const exportWeeklyReportToPDF = async (
  report: WeeklyReport,
  financialData?: FinancialData,
  transactionData?: TransactionData[],
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
      pdf.setTextColor(124, 58, 237);
      pdf.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
      
      yPosition += 10;
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Comprehensive Financial & Workflow Report', pageWidth / 2, yPosition, { align: 'center' });
      
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
    pdf.text('Executive Financial Summary', 20, yPosition);
    yPosition += 10;

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-UG', {
        style: 'currency',
        currency: 'UGX',
        minimumFractionDigits: 0,
      }).format(amount || 0);
    };

    // Financial KPIs
    if (financialData) {
      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      
      const financialMetrics = [
        `• Total Income: ${formatCurrency(financialData.total_income || 0)}`,
        `• Total Expenses: ${formatCurrency(financialData.total_expenses || 0)}`,
        `• Net Income: ${formatCurrency(financialData.net_income || 0)}`,
        `• Loan Portfolio Value: ${formatCurrency(financialData.total_loan_portfolio || 0)}`,
        `• Total Repaid: ${formatCurrency(financialData.total_repaid || 0)}`,
        `• Outstanding Balance: ${formatCurrency(financialData.outstanding_balance || 0)}`,
        `• Active Loan Holders: ${financialData.active_loan_holders || 0}`,
        `• Collection Rate: ${(financialData.collection_rate || 0).toFixed(1)}%`
      ];

      financialMetrics.forEach((text, index) => {
        pdf.text(text, 25, yPosition + (index * 6));
      });
      yPosition += 55;
    }

    // Financial Performance Analysis
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Financial Performance Analysis', 20, yPosition);
    yPosition += 10;

    if (financialData) {
      // Income vs Expenses Analysis
      const incomeVsExpenseRatio = financialData.total_income && financialData.total_expenses 
        ? (financialData.total_income / financialData.total_expenses).toFixed(2)
        : '0.00';
      
      const profitMargin = financialData.total_income && financialData.net_income
        ? ((financialData.net_income / financialData.total_income) * 100).toFixed(1)
        : '0.0';

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      
      const analysisText = [
        `• Income to Expense Ratio: ${incomeVsExpenseRatio}:1`,
        `• Profit Margin: ${profitMargin}%`,
        `• Portfolio Health: ${financialData.collection_rate && financialData.collection_rate >= 80 ? 'Healthy' : 'Needs Attention'}`,
        `• Outstanding Risk Level: ${financialData.outstanding_balance && financialData.total_loan_portfolio 
          ? ((financialData.outstanding_balance / financialData.total_loan_portfolio) * 100).toFixed(1) + '%'
          : '0.0%'} of portfolio`
      ];

      analysisText.forEach((text, index) => {
        pdf.text(text, 25, yPosition + (index * 6));
      });
      yPosition += 35;
    }

    // Visual Progress Bars Section
    if (includeCharts && financialData) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Financial Performance Indicators', 20, yPosition);
      yPosition += 15;

      const barWidth = pageWidth - 80;
      const barHeight = 6;

      // Collection Rate Progress Bar
      const collectionRate = (financialData.collection_rate || 0) / 100;
      pdf.setFontSize(10);
      pdf.text('Collection Rate:', 20, yPosition);
      pdf.text(`${(financialData.collection_rate || 0).toFixed(1)}%`, pageWidth - 40, yPosition);

      // Background bar
      pdf.setFillColor(229, 231, 235);
      pdf.rect(20, yPosition + 2, barWidth, barHeight, 'F');

      // Progress bar
      const collectionColor = collectionRate >= 0.8 ? [34, 197, 94] : collectionRate >= 0.6 ? [251, 191, 36] : [239, 68, 68];
      pdf.setFillColor(collectionColor[0], collectionColor[1], collectionColor[2]);
      pdf.rect(20, yPosition + 2, barWidth * collectionRate, barHeight, 'F');

      yPosition += 20;

      // Profit Margin Progress Bar (if applicable)
      if (financialData.total_income && financialData.net_income) {
        const profitMargin = Math.max(0, Math.min(1, financialData.net_income / financialData.total_income));
        pdf.text('Profit Margin:', 20, yPosition);
        pdf.text(`${(profitMargin * 100).toFixed(1)}%`, pageWidth - 40, yPosition);

        // Background bar
        pdf.setFillColor(229, 231, 235);
        pdf.rect(20, yPosition + 2, barWidth, barHeight, 'F');

        // Progress bar
        const profitColor = profitMargin >= 0.2 ? [34, 197, 94] : profitMargin >= 0.1 ? [251, 191, 36] : [239, 68, 68];
        pdf.setFillColor(profitColor[0], profitColor[1], profitColor[2]);
        pdf.rect(20, yPosition + 2, barWidth * profitMargin, barHeight, 'F');

        yPosition += 25;
      }
    }

    // Check if we need a new page
    if (yPosition > pageHeight - 80) {
      pdf.addPage();
      yPosition = 20;
    }

    // Workflow Performance Section
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Workflow Performance Metrics', 20, yPosition);
    yPosition += 10;

    // Summary metrics
    const totalApplications = report.applications_reviewed;
    const approvalRate = totalApplications > 0 ? ((report.applications_approved / totalApplications) * 100).toFixed(1) : '0';
    const rejectionRate = totalApplications > 0 ? ((report.applications_rejected / totalApplications) * 100).toFixed(1) : '0';

    pdf.setFontSize(10);
    pdf.setTextColor(75, 85, 99);
    
    const workflowMetrics = [
      `• Total Applications Processed: ${totalApplications}`,
      `• Applications Approved: ${report.applications_approved} (${approvalRate}%)`,
      `• Applications Rejected: ${report.applications_rejected} (${rejectionRate}%)`,
      `• Pending Applications: ${report.pending_applications}`,
      `• Overall Approval Rate: ${approvalRate}%`
    ];

    workflowMetrics.forEach((text, index) => {
      pdf.text(text, 25, yPosition + (index * 6));
    });
    yPosition += 40;

    // Recent Financial Activity Section
    if (transactionData && transactionData.length > 0) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Recent Financial Activity', 20, yPosition);
      yPosition += 10;

      // Group transactions by type
      const incomeTransactions = transactionData.filter(t => t.transaction_type === 'income').slice(0, 5);
      const expenseTransactions = transactionData.filter(t => t.transaction_type === 'expense').slice(0, 5);

      if (incomeTransactions.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(34, 197, 94);
        pdf.text('Recent Income:', 20, yPosition);
        yPosition += 8;

        incomeTransactions.forEach((transaction, index) => {
          pdf.setFontSize(9);
          pdf.setTextColor(75, 85, 99);
          const amount = formatCurrency(transaction.amount);
          const description = transaction.description.substring(0, 40) + (transaction.description.length > 40 ? '...' : '');
          pdf.text(`• ${description}: ${amount}`, 25, yPosition + (index * 5));
        });
        yPosition += (incomeTransactions.length * 5) + 10;
      }

      if (expenseTransactions.length > 0) {
        pdf.setFontSize(12);
        pdf.setTextColor(239, 68, 68);
        pdf.text('Recent Expenses:', 20, yPosition);
        yPosition += 8;

        expenseTransactions.forEach((transaction, index) => {
          pdf.setFontSize(9);
          pdf.setTextColor(75, 85, 99);
          const amount = formatCurrency(transaction.amount);
          const description = transaction.description.substring(0, 40) + (transaction.description.length > 40 ? '...' : '');
          pdf.text(`• ${description}: ${amount}`, 25, yPosition + (index * 5));
        });
        yPosition += (expenseTransactions.length * 5) + 10;
      }
    }

    // Risk Assessment Section
    if (financialData) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Risk Assessment', 20, yPosition);
      yPosition += 10;

      const riskFactors = [];
      
      if (financialData.collection_rate && financialData.collection_rate < 70) {
        riskFactors.push('• LOW COLLECTION RATE: Collection rate below 70% indicates payment issues');
      }
      
      if (financialData.net_income && financialData.net_income < 0) {
        riskFactors.push('• NEGATIVE NET INCOME: Operating at a loss this period');
      }
      
      if (financialData.outstanding_balance && financialData.total_loan_portfolio) {
        const outstandingRatio = (financialData.outstanding_balance / financialData.total_loan_portfolio) * 100;
        if (outstandingRatio > 50) {
          riskFactors.push(`• HIGH OUTSTANDING BALANCE: ${outstandingRatio.toFixed(1)}% of portfolio outstanding`);
        }
      }

      if (riskFactors.length === 0) {
        riskFactors.push('• No significant risk factors identified in current period');
      }

      pdf.setFontSize(10);
      pdf.setTextColor(75, 85, 99);
      riskFactors.forEach((risk, index) => {
        pdf.text(risk, 25, yPosition + (index * 6));
      });
      yPosition += (riskFactors.length * 6) + 15;
    }

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(107, 114, 128);
    const generatedDate = new Date().toLocaleString();
    pdf.text(`Generated on: ${generatedDate}`, 20, pageHeight - 20);
    pdf.text('Confidential - Internal Use Only', pageWidth - 60, pageHeight - 20);

    // Generate filename
    const filename = `comprehensive-report-${report.role_type}-${report.report_week}.pdf`;
    
    // Save the PDF
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating comprehensive PDF:', error);
    throw new Error('Failed to generate comprehensive PDF report');
  }
};

export const exportMultipleReportsToPDF = async (
  reports: WeeklyReport[],
  financialData?: FinancialData,
  transactionData?: TransactionData[],
  options: PDFExportOptions = {}
) => {
  const { companyName = 'Gold Charp Financial Services' } = options;

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header for consolidated report
    pdf.setFontSize(20);
    pdf.setTextColor(124, 58, 237);
    pdf.text(companyName, pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Consolidated Financial & Workflow Reports', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 15;

    // Financial Summary at the top
    if (financialData) {
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Overall Financial Performance', 20, yPosition);
      yPosition += 10;

      const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-UG', {
          style: 'currency',
          currency: 'UGX',
          minimumFractionDigits: 0,
        }).format(amount || 0);
      };

      const summaryMetrics = [
        `Total Income: ${formatCurrency(financialData.total_income || 0)}`,
        `Total Expenses: ${formatCurrency(financialData.total_expenses || 0)}`,
        `Net Income: ${formatCurrency(financialData.net_income || 0)}`,
        `Portfolio Value: ${formatCurrency(financialData.total_loan_portfolio || 0)}`,
        `Collection Rate: ${(financialData.collection_rate || 0).toFixed(1)}%`
      ];

      // Create summary table
      const cellWidth = (pageWidth - 40) / 2;
      const cellHeight = 8;
      
      summaryMetrics.forEach((metric, index) => {
        const x = 20 + ((index % 2) * cellWidth);
        const y = yPosition + (Math.floor(index / 2) * cellHeight);
        
        pdf.setFillColor(248, 250, 252);
        pdf.rect(x, y - 2, cellWidth, cellHeight, 'F');
        pdf.setDrawColor(229, 231, 235);
        pdf.rect(x, y - 2, cellWidth, cellHeight);
        pdf.setFontSize(9);
        pdf.setTextColor(0, 0, 0);
        pdf.text(metric, x + 2, y + 3);
      });
      
      yPosition += (Math.ceil(summaryMetrics.length / 2) * cellHeight) + 15;
    }

    // Workflow summary table for all reports
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Workflow Performance by Role', 20, yPosition);
    yPosition += 10;

    const tableHeaders = ['Role', 'Week', 'Reviewed', 'Approved', 'Rejected', 'Pending', 'Rate'];
    const cellWidth = (pageWidth - 40) / tableHeaders.length;
    const cellHeight = 8;

    // Draw headers
    tableHeaders.forEach((header, index) => {
      const x = 20 + (index * cellWidth);
      pdf.setFillColor(124, 58, 237);
      pdf.rect(x, yPosition - 2, cellWidth, cellHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(header, x + 2, yPosition + 3);
    });
    yPosition += cellHeight;

    // Draw data rows
    reports.forEach((report, rowIndex) => {
      const approvalRate = report.applications_reviewed > 0 
        ? ((report.applications_approved / report.applications_reviewed) * 100).toFixed(1) + '%'
        : '0%';
        
      const rowData = [
        report.role_type.toUpperCase().substring(0, 8),
        new Date(report.report_week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        report.applications_reviewed.toString(),
        report.applications_approved.toString(),
        report.applications_rejected.toString(),
        report.pending_applications.toString(),
        approvalRate
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
        pdf.setFontSize(7);
        pdf.text(cell, x + 2, y + 3);
      });
      yPosition += cellHeight;
    });

    // Add totals row
    const totalReviewed = reports.reduce((sum, r) => sum + r.applications_reviewed, 0);
    const totalApproved = reports.reduce((sum, r) => sum + r.applications_approved, 0);
    const totalRejected = reports.reduce((sum, r) => sum + r.applications_rejected, 0);
    const totalPending = reports.reduce((sum, r) => sum + r.pending_applications, 0);
    const overallRate = totalReviewed > 0 ? ((totalApproved / totalReviewed) * 100).toFixed(1) + '%' : '0%';

    const totalsData = ['TOTALS', '', totalReviewed.toString(), totalApproved.toString(), 
                       totalRejected.toString(), totalPending.toString(), overallRate];

    totalsData.forEach((cell, colIndex) => {
      const x = 20 + (colIndex * cellWidth);
      pdf.setFillColor(124, 58, 237);
      pdf.rect(x, yPosition - 2, cellWidth, cellHeight, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(cell, x + 2, yPosition + 3);
    });

    // Generate filename
    const filename = `consolidated-comprehensive-reports-${new Date().toISOString().split('T')[0]}.pdf`;
    
    pdf.save(filename);
    
    return { success: true, filename };
  } catch (error) {
    console.error('Error generating consolidated comprehensive PDF:', error);
    throw new Error('Failed to generate consolidated comprehensive PDF report');
  }
};
