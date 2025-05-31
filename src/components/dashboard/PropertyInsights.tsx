
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
      <Card className="shadow-lg">
        <CardContent className="p-12">
          <div className="flex justify-center items-center h-32">
            <Loader2 className="h-8 w-8 animate-spin text-purple-700" />
            <span className="ml-3 text-gray-600">Loading property insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 w-full">
      {/* Header Section - Improved Spacing */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex items-center">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-purple-500 rounded-xl flex items-center justify-center mr-3 lg:mr-4 flex-shrink-0">
              <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg lg:text-2xl text-purple-900 truncate">Property Analytics Dashboard</CardTitle>
              <CardDescription className="text-purple-600 mt-1 text-sm">
                Real-time insights into property portfolio performance and market trends
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Main Analytics Section - Improved Responsive Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Property Type Distribution */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base lg:text-lg">
              <DollarSign className="mr-2 h-4 w-4 lg:h-5 lg:w-5 text-purple-600 flex-shrink-0" />
              <span className="truncate">Property Type Distribution</span>
            </CardTitle>
            <CardDescription className="text-sm">Portfolio breakdown by property category</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="w-full" style={{ height: '280px' }}>
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
            <div className="flex flex-wrap justify-center gap-3 lg:gap-6 mt-4">
              {typeData.map((entry) => (
                <div key={entry.name} className="flex items-center">
                  <div 
                    className="w-3 h-3 lg:w-4 lg:h-4 mr-2 rounded-sm flex-shrink-0" 
                    style={{ backgroundColor: entry.color }} 
                  />
                  <span className="text-xs lg:text-sm font-medium truncate">{entry.name}: {entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Property Price Trends */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-base lg:text-lg">
              <TrendingUp className="mr-2 h-4 w-4 lg:h-5 lg:w-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Property Price Trends</span>
            </CardTitle>
            <CardDescription className="text-sm">Monthly price movements across property types</CardDescription>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="w-full" style={{ height: '280px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    tickFormatter={(value) => `${value}K`}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`UGX ${Number(value).toLocaleString()}K`, '']}
                    labelStyle={{ fontSize: '12px' }}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="residential" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Residential" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="commercial" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Commercial" 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="agricultural" 
                    stroke="#ffc658" 
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name="Agricultural" 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Properties Section - Improved Responsive Table */}
      <Card className="shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center min-w-0 flex-1">
              <MapPin className="mr-2 h-4 w-4 lg:h-5 lg:w-5 text-green-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <CardTitle className="text-lg lg:text-xl truncate">Top Performing Properties</CardTitle>
                <CardDescription className="mt-1 text-sm">Highest valued property transactions this quarter</CardDescription>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl lg:text-2xl font-bold text-green-600">
                {topProperties.length}
              </p>
              <p className="text-sm text-gray-500">Properties</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 lg:p-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <TableHead className="font-semibold text-gray-700 py-3 text-sm">Location</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 text-sm">Type</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 text-sm">Sale Price</TableHead>
                  <TableHead className="font-semibold text-gray-700 py-3 text-sm">Sale Date</TableHead>
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
                    <TableCell className="font-medium py-3 text-sm truncate max-w-32">{property.location}</TableCell>
                    <TableCell className="py-3">
                      <span 
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    <TableCell className="font-mono font-semibold text-green-600 py-3 text-sm truncate">
                      UGX {property.price.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-600 py-3 text-sm">
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
