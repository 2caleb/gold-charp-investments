
import React, { useState, useEffect } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

interface PropertyTypeData {
  name: string;
  value: number;
  color: string;
}

interface PropertyPriceData {
  month: string;
  residential: number;
  commercial: number;
  agricultural: number;
}

interface TopPropertyData {
  id: string;
  location: string;
  price: number;
  type: string;
  salesDate: string;
}

export const PropertyInsights = () => {
  const [typeData, setTypeData] = useState<PropertyTypeData[]>([]);
  const [priceData, setPriceData] = useState<PropertyPriceData[]>([]);
  const [topProperties, setTopProperties] = useState<TopPropertyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch data from Supabase
        // For now, we'll use mock data
        
        // Mock property type data
        const mockTypeData: PropertyTypeData[] = [
          { name: 'Residential', value: 65, color: '#8884d8' },
          { name: 'Commercial', value: 20, color: '#82ca9d' },
          { name: 'Agricultural', value: 15, color: '#ffc658' },
        ];
        
        // Mock property price trends
        const mockPriceData: PropertyPriceData[] = [
          { month: 'Jan', residential: 1200, commercial: 1900, agricultural: 800 },
          { month: 'Feb', residential: 1250, commercial: 1800, agricultural: 820 },
          { month: 'Mar', residential: 1400, commercial: 2100, agricultural: 850 },
          { month: 'Apr', residential: 1350, commercial: 2000, agricultural: 900 },
          { month: 'May', residential: 1500, commercial: 2300, agricultural: 950 },
          { month: 'Jun', residential: 1650, commercial: 2500, agricultural: 1000 },
        ];
        
        // Mock top properties
        const mockTopProperties: TopPropertyData[] = [
          { id: '1', location: 'Kampala Central', price: 450000000, type: 'Residential', salesDate: '2025-04-15' },
          { id: '2', location: 'Entebbe Road', price: 380000000, type: 'Commercial', salesDate: '2025-04-02' },
          { id: '3', location: 'Muyenga Hill', price: 520000000, type: 'Residential', salesDate: '2025-03-28' },
          { id: '4', location: 'Kololo', price: 780000000, type: 'Residential', salesDate: '2025-03-20' },
          { id: '5', location: 'Nakasero', price: 640000000, type: 'Commercial', salesDate: '2025-03-15' },
        ];
        
        setTypeData(mockTypeData);
        setPriceData(mockPriceData);
        setTopProperties(mockTopProperties);
      } catch (err) {
        console.error('Error fetching property data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPropertyData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Property Type Distribution</CardTitle>
            <CardDescription>Breakdown of property types in portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Property Price Trends</CardTitle>
            <CardDescription>Average price per square foot over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => `UGX ${Number(value).toLocaleString()}`} />
                  <Legend />
                  <Line type="monotone" dataKey="residential" stroke="#8884d8" name="Residential" />
                  <Line type="monotone" dataKey="commercial" stroke="#82ca9d" name="Commercial" />
                  <Line type="monotone" dataKey="agricultural" stroke="#ffc658" name="Agricultural" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Properties</CardTitle>
          <CardDescription>Highest valued property sales in the past month</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sale Price</TableHead>
                <TableHead>Sale Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProperties.map((property) => (
                <TableRow key={property.id}>
                  <TableCell className="font-medium">{property.location}</TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>UGX {property.price.toLocaleString()}</TableCell>
                  <TableCell>{new Date(property.salesDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
