
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, PieChart, BarChart3, DollarSign, ArrowUpRight, ArrowDownRight, Map, Clock } from 'lucide-react';
import { Input } from "@/components/ui/input";

const PropertyAnalytics = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sample data for analytics - in a real app, this would come from an API
  const propertyStats = {
    averagePrice: "UGX 450,000,000",
    medianPrice: "UGX 380,000,000",
    priceChange: 5.2,
    inventoryChange: -3.8,
    totalListings: 568,
    averageDaysOnMarket: 62,
  };
  
  const neighborhoodData = [
    { name: "Kololo", averagePrice: "UGX 950M", priceChange: 7.1, positive: true },
    { name: "Nakasero", averagePrice: "UGX 820M", priceChange: 6.2, positive: true },
    { name: "Naguru", averagePrice: "UGX 680M", priceChange: 4.5, positive: true },
    { name: "Bukoto", averagePrice: "UGX 510M", priceChange: 3.9, positive: true },
    { name: "Ntinda", averagePrice: "UGX 380M", priceChange: 2.1, positive: true },
    { name: "Kira", averagePrice: "UGX 320M", priceChange: -1.2, positive: false },
    { name: "Bugolobi", averagePrice: "UGX 490M", priceChange: 5.3, positive: true },
    { name: "Naalya", averagePrice: "UGX 280M", priceChange: 1.8, positive: true },
  ];
  
  const propertyTypes = [
    { type: "Apartments", percentage: 35, color: "bg-purple-500" },
    { type: "Single Family", percentage: 25, color: "bg-blue-500" },
    { type: "Townhouses", percentage: 20, color: "bg-green-500" },
    { type: "Commercial", percentage: 15, color: "bg-yellow-500" },
    { type: "Industrial", percentage: 5, color: "bg-red-500" },
  ];
  
  const filteredNeighborhoods = searchTerm
    ? neighborhoodData.filter(hood => 
        hood.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : neighborhoodData;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-gray-100">Property Market Analytics</h2>
          <p className="text-gray-500 dark:text-gray-400">Current market insights for Uganda's real estate</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search neighborhoods..."
            className="pl-8 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Property Price</CardTitle>
            <DollarSign className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.averagePrice}</div>
            <div className="flex items-center pt-1">
              <span className={`text-xs ${propertyStats.priceChange > 0 ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                {propertyStats.priceChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {Math.abs(propertyStats.priceChange)}% from last year
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Property Inventory</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.totalListings} listings</div>
            <div className="flex items-center pt-1">
              <span className={`text-xs ${propertyStats.inventoryChange > 0 ? 'text-green-500' : 'text-red-500'} font-medium flex items-center`}>
                {propertyStats.inventoryChange > 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {Math.abs(propertyStats.inventoryChange)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Days on Market</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{propertyStats.averageDaysOnMarket} days</div>
            <p className="text-xs text-gray-500">Average time to sell a property</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Neighborhood Price Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredNeighborhoods.map((hood, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{hood.name}</div>
                    <div className="text-xs text-gray-500">{hood.averagePrice}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs ${hood.positive ? 'text-green-500' : 'text-red-500'} font-medium`}>
                      {hood.positive ? '+' : ''}{hood.priceChange}%
                    </span>
                    <div className="w-24 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div 
                        className={`${hood.positive ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`} 
                        style={{ width: `${Math.min(Math.abs(hood.priceChange) * 8, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
              
              {filteredNeighborhoods.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-gray-500">No neighborhoods match your search.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Property Types</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {propertyTypes.map((type, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{type.type}</div>
                    <div className="text-xs font-medium">{type.percentage}%</div>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div 
                      className={`${type.color} h-2 rounded-full`} 
                      style={{ width: `${type.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Regional Market Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6 border border-dashed rounded-lg bg-gray-50 dark:bg-gray-800/50 text-gray-500">
            <div className="flex flex-col items-center">
              <Map className="h-10 w-10 mb-2" />
              <p>Interactive property map will be displayed here</p>
              <p className="text-xs text-gray-400 mt-1">Showing price trends across Uganda</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAnalytics;
