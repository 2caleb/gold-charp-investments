
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    fill?: boolean;
    tension?: number;
  }>;
}

interface InteractiveChartsProps {
  inflationData: Array<{ year: string; value: number }>;
  gdpData: Array<{ year: string; value: number }>;
  propertyData: {
    regions: string[];
    prices: number[];
  };
}

const InteractiveCharts: React.FC<InteractiveChartsProps> = ({
  inflationData,
  gdpData,
  propertyData
}) => {
  const inflationChartRef = useRef<HTMLCanvasElement>(null);
  const propertyChartRef = useRef<HTMLCanvasElement>(null);
  const gdpChartRef = useRef<HTMLCanvasElement>(null);
  const inflationChartInstance = useRef<Chart | null>(null);
  const propertyChartInstance = useRef<Chart | null>(null);
  const gdpChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Cleanup existing charts
    if (inflationChartInstance.current) {
      inflationChartInstance.current.destroy();
    }
    if (propertyChartInstance.current) {
      propertyChartInstance.current.destroy();
    }
    if (gdpChartInstance.current) {
      gdpChartInstance.current.destroy();
    }

    // Create inflation chart
    if (inflationChartRef.current) {
      inflationChartInstance.current = new Chart(inflationChartRef.current, {
        type: 'line',
        data: {
          labels: inflationData.map(d => d.year),
          datasets: [{
            label: 'Inflation Rate (%)',
            data: inflationData.map(d => d.value),
            borderColor: 'rgba(139, 92, 246, 1)',
            backgroundColor: 'rgba(139, 92, 246, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
              }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Create property chart
    if (propertyChartRef.current) {
      propertyChartInstance.current = new Chart(propertyChartRef.current, {
        type: 'bar',
        data: {
          labels: propertyData.regions,
          datasets: [{
            label: 'Average Property Price (UGX M)',
            data: propertyData.prices,
            backgroundColor: 'rgba(16, 185, 129, 0.6)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: UGX ${context.parsed.y}M`
              }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    // Create GDP chart
    if (gdpChartRef.current) {
      gdpChartInstance.current = new Chart(gdpChartRef.current, {
        type: 'line',
        data: {
          labels: gdpData.map(d => d.year),
          datasets: [{
            label: 'GDP Growth Rate (%)',
            data: gdpData.map(d => d.value),
            borderColor: 'rgba(6, 182, 212, 1)',
            backgroundColor: 'rgba(6, 182, 212, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: true },
            tooltip: {
              callbacks: {
                label: (context) => `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`
              }
            }
          },
          scales: {
            y: { beginAtZero: true }
          }
        }
      });
    }

    return () => {
      if (inflationChartInstance.current) inflationChartInstance.current.destroy();
      if (propertyChartInstance.current) propertyChartInstance.current.destroy();
      if (gdpChartInstance.current) gdpChartInstance.current.destroy();
    };
  }, [inflationData, gdpData, propertyData]);

  const downloadChart = (chartRef: React.RefObject<HTMLCanvasElement>, fileName: string) => {
    if (chartRef.current) {
      const link = document.createElement('a');
      link.download = `${fileName}.png`;
      link.href = chartRef.current.toDataURL();
      link.click();
    }
  };

  const downloadPDF = async () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Uganda Market Analytics Dashboard", 10, 20);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 10, 30);
    
    let yPosition = 50;
    
    // Add inflation chart
    if (inflationChartRef.current) {
      const inflationCanvas = await html2canvas(inflationChartRef.current);
      const inflationImgData = inflationCanvas.toDataURL('image/png');
      doc.addImage(inflationImgData, 'PNG', 10, yPosition, 180, 80);
      yPosition += 90;
    }
    
    // Add new page for property chart
    doc.addPage();
    yPosition = 20;
    
    if (propertyChartRef.current) {
      const propertyCanvas = await html2canvas(propertyChartRef.current);
      const propertyImgData = propertyCanvas.toDataURL('image/png');
      doc.addImage(propertyImgData, 'PNG', 10, yPosition, 180, 80);
      yPosition += 90;
    }
    
    // Add GDP chart
    if (gdpChartRef.current && yPosition + 80 < 280) {
      const gdpCanvas = await html2canvas(gdpChartRef.current);
      const gdpImgData = gdpCanvas.toDataURL('image/png');
      doc.addImage(gdpImgData, 'PNG', 10, yPosition, 180, 80);
    } else if (gdpChartRef.current) {
      doc.addPage();
      const gdpCanvas = await html2canvas(gdpChartRef.current);
      const gdpImgData = gdpCanvas.toDataURL('image/png');
      doc.addImage(gdpImgData, 'PNG', 10, 20, 180, 80);
    }
    
    doc.save('Uganda_Market_Analytics.pdf');
  };

  return (
    <div className="space-y-6">
      {/* Inflation Trend Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Inflation Trend (Last 5 Years)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadChart(inflationChartRef, 'Inflation_Trend')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Chart
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <canvas ref={inflationChartRef} />
          </div>
        </CardContent>
      </Card>

      {/* GDP Growth Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>GDP Growth Trend (Last 5 Years)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadChart(gdpChartRef, 'GDP_Growth_Trend')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Chart
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <canvas ref={gdpChartRef} />
          </div>
        </CardContent>
      </Card>

      {/* Regional Property Prices Chart */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Regional Property Prices (UBOS Simulated Data)</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadChart(propertyChartRef, 'Property_Prices')}
          >
            <Download className="h-4 w-4 mr-2" />
            Download Chart
          </Button>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <canvas ref={propertyChartRef} />
          </div>
        </CardContent>
      </Card>

      {/* Export Dashboard Button */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <Button onClick={downloadPDF} className="w-full" size="lg">
            <FileText className="h-4 w-4 mr-2" />
            Export Complete Dashboard to PDF
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveCharts;
