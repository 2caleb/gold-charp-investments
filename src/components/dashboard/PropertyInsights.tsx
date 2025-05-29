
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
import { Loader2, TrendingUp, MapPin, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

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
        // Mock property type data with better distribution
        const mockTypeData: PropertyTypeData[] = [
          { name: 'Residential', value: 65, color: '#8884d8' },
          { name: 'Commercial', value: 20, color: '#82ca9d' },
          { name: 'Agricultural', value: 15, color: '#ffc658' },
        ];
        
        // Mock property price trends with realistic data
        const mockPriceData: PropertyPriceData[] = [
          { month: 'Jan', residential: 1200, commercial: 1900, agricultural: 800 },
          { month: 'Feb', residential: 1250, commercial: 1800, agricultural: 820 },
          { month: 'Mar', residential: 1400, commercial: 2100, agricultural: 850 },
          { month: 'Apr', residential: 1350, commercial: 2000, agricultural: 900 },
          { month: 'May', residential: 1500, commercial: 2300, agricultural: 950 },
          { month: 'Jun', residential: 1650, commercial: 2500, agricultural: 1000 },
        ];
        
        // Mock top properties with realistic Uganda data
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
      <Card className="p-12">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
          <span className="ml-3 text-gray-600">Loading property insights...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 w-full">
      {/* Header Section */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
        <CardHeader className="pb-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-4">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-purple-900">Property Analytics Dashboard</CardTitle>
              <CardDescription className="text-purple-600 mt-1">
                Real-time insights into property portfolio performance and market trends
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Analytics Section - Improved Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Property Type Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <DollarSign className="mr-2 h-5 w-5 text-purple-600" />
              Property Type Distribution
            </CardTitle>
            <CardDescription>Portfolio breakdown by property category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
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
            <div className="flex justify-center gap-6 mt-4">
              {typeData.map((entry) => (
                <div key={entry.name} className="flex items-center">
                  <div 
                    className="w-4 h-4 mr-2 rounded-sm" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="text-sm font-medium">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Price Trends */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-600" />
              Property Price Trends
            </CardTitle>
            <CardDescription>Monthly price movements across property types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `${value}K`} />
                  <Tooltip formatter={(value) => `UGX ${Number(value).toLocaleString()}K`} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="residential" 
                    stroke="#8884d8" 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Residential" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commercial" 
                    stroke="#82ca9d" 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Commercial" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="agricultural" 
                    stroke="#ffc658" 
                    strokeWidth={3}
                    dot={{ r: 5 }}
                    activeDot={{ r: 7 }}
                    name="Agricultural" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Properties Section - Improved Table Design */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-green-600" />
              <div>
                <CardTitle className="text-xl">Top Performing Properties</CardTitle>
                <CardDescription className="mt-1">Highest valued property transactions this quarter</CardDescription>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {topProperties.length}
              </p>
              <p className="text-sm text-gray-500">Properties</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <TableHead className="font-semibold text-gray-700 py-4">Location</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Sale Price</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-4">Sale Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProperties.map((property, index) => (
                  <motion.tr
                    key={property.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 transition-all duration-200"
                  >
                    <TableCell className="font-medium py-4">{property.location}</TableCell>
                    <TableCell className="py-4">
                      <span 
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          property.type === 'Residential' 
                            ? 'bg-purple-100 text-purple-800' 
                            : property.type === 'Commercial' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {property.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono font-semibold text-green-600 py-4">
                      UGX {property.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4">
                      {new Date(property.salesDate).toLocaleDateString()}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
