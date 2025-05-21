
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { propertyDataService, ExternalProperty } from '@/services/propertyDataService';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MapPin, BedDouble, Bath, Maximize2, ExternalLink, Search, Building, DollarSign, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SearchFormData {
  location: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  propertyType: string;
  sortBy: string;
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-UG', {
    maximumFractionDigits: 0,
  }).format(price);
};

const ExternalPropertySearch = () => {
  const { toast } = useToast();
  const [searchParams, setSearchParams] = useState<Record<string, any>>({});
  const [formData, setFormData] = useState<SearchFormData>({
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    propertyType: '',
    sortBy: 'price-asc'
  });
  const [activeTab, setActiveTab] = useState<string>('all');
  
  // Fetch property data based on search parameters and active tab
  const { data: properties, isLoading, isError, refetch } = useQuery({
    queryKey: ['properties', searchParams, activeTab],
    queryFn: async () => {
      switch (activeTab) {
        case 'lamudi':
          return await propertyDataService.fetchLamudiData(searchParams);
        case 'upc':
          return await propertyDataService.fetchUPCData(searchParams);
        default:
          return await propertyDataService.fetchAllPropertyData(searchParams);
      }
    },
    initialData: []
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert form data to search parameters
    const params: Record<string, any> = {};
    if (formData.location) params.location = formData.location;
    if (formData.minPrice) params.minPrice = parseFloat(formData.minPrice);
    if (formData.maxPrice) params.maxPrice = parseFloat(formData.maxPrice);
    if (formData.bedrooms) params.bedrooms = parseInt(formData.bedrooms);
    if (formData.propertyType) params.propertyType = formData.propertyType;
    
    setSearchParams(params);
    
    toast({
      title: "Search Initiated",
      description: "Searching for properties matching your criteria...",
    });
  };
  
  // Sort the properties based on the selected sorting option
  const sortedProperties = [...(properties || [])].sort((a, b) => {
    switch (formData.sortBy) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'size-desc':
        return (b.size || 0) - (a.size || 0);
      default:
        return 0;
    }
  });
  
  // Open external property URL
  const openExternalUrl = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">Search External Property Listings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  name="location"
                  placeholder="Location (city, district, etc.)"
                  className="pl-10"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="relative">
                <Building className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Select
                  name="propertyType"
                  value={formData.propertyType}
                  onValueChange={(value) => handleSelectChange('propertyType', value)}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="Apartment">Apartment</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Villa">Villa</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  name="minPrice"
                  placeholder="Min Price (UGX)"
                  className="pl-10"
                  type="number"
                  min="0"
                  value={formData.minPrice}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  name="maxPrice"
                  placeholder="Max Price (UGX)"
                  className="pl-10"
                  type="number"
                  min="0"
                  value={formData.maxPrice}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="relative">
                <BedDouble className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Select
                  name="bedrooms"
                  value={formData.bedrooms}
                  onValueChange={(value) => handleSelectChange('bedrooms', value)}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Bedrooms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any</SelectItem>
                    <SelectItem value="1">1+</SelectItem>
                    <SelectItem value="2">2+</SelectItem>
                    <SelectItem value="3">3+</SelectItem>
                    <SelectItem value="4">4+</SelectItem>
                    <SelectItem value="5">5+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Select
                  name="sortBy"
                  value={formData.sortBy}
                  onValueChange={(value) => handleSelectChange('sortBy', value)}
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                    <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                    <SelectItem value="size-desc">Size (Largest first)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button type="submit" className="bg-purple-700 hover:bg-purple-800">
                <Search className="mr-2 h-4 w-4" />
                Search Properties
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full mb-6">
          <TabsTrigger value="all">All Sources</TabsTrigger>
          <TabsTrigger value="lamudi">Lamudi</TabsTrigger>
          <TabsTrigger value="upc">Uganda Property Centre</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <PropertyResults properties={sortedProperties} isLoading={isLoading} isError={isError} openExternalUrl={openExternalUrl} />
        </TabsContent>
        
        <TabsContent value="lamudi" className="mt-0">
          <PropertyResults 
            properties={sortedProperties.filter(p => p.source === 'lamudi')} 
            isLoading={isLoading} 
            isError={isError}
            openExternalUrl={openExternalUrl}
            sourceName="Lamudi"
          />
        </TabsContent>
        
        <TabsContent value="upc" className="mt-0">
          <PropertyResults 
            properties={sortedProperties.filter(p => p.source === 'ugandaPropertyCentre')} 
            isLoading={isLoading} 
            isError={isError}
            openExternalUrl={openExternalUrl}
            sourceName="Uganda Property Centre"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface PropertyResultsProps {
  properties: ExternalProperty[];
  isLoading: boolean;
  isError: boolean;
  openExternalUrl: (url: string) => void;
  sourceName?: string;
}

const PropertyResults = ({ properties, isLoading, isError, openExternalUrl, sourceName }: PropertyResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-700"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-2">Error loading property data</div>
        <p className="text-gray-600">There was a problem fetching properties. Please try again later.</p>
      </div>
    );
  }
  
  if (properties.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="text-xl font-medium mb-2">No properties found</div>
        <p className="text-gray-600 dark:text-gray-400">
          {sourceName 
            ? `No listings found from ${sourceName} matching your search criteria.` 
            : 'No properties match your search criteria. Try adjusting your filters.'
          }
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="text-gray-600 dark:text-gray-400">
          Found {properties.length} properties {sourceName ? `from ${sourceName}` : 'across all sources'}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
              {property.imageUrl ? (
                <img
                  src={property.imageUrl}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  <Building className="h-12 w-12 text-gray-400" />
                </div>
              )}
              <Badge 
                className={cn(
                  "absolute top-3 right-3",
                  property.source === 'lamudi' ? "bg-blue-600" : "bg-green-600"
                )}
              >
                {property.source === 'lamudi' ? 'Lamudi' : 'UPC'}
              </Badge>
              {property.propertyType && (
                <Badge className="absolute bottom-3 left-3 bg-purple-700">
                  {property.propertyType}
                </Badge>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="line-clamp-2 text-base font-medium">{property.title}</CardTitle>
              <div className="flex items-center text-gray-500 mt-1 text-sm">
                <MapPin size={14} className="mr-1 flex-shrink-0" />
                <span className="truncate">{property.location}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-xl font-bold text-purple-700 mb-3">UGX {formatPrice(property.price)}</div>
              
              <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                {property.bedrooms && (
                  <div className="flex items-center">
                    <BedDouble size={14} className="mr-1" />
                    <span>{property.bedrooms} Beds</span>
                  </div>
                )}
                
                {property.bathrooms && (
                  <div className="flex items-center">
                    <Bath size={14} className="mr-1" />
                    <span>{property.bathrooms} Baths</span>
                  </div>
                )}
                
                {property.size && (
                  <div className="flex items-center">
                    <Maximize2 size={14} className="mr-1" />
                    <span>{property.size.toLocaleString()} sqft</span>
                  </div>
                )}
              </div>
            </CardContent>
            <Separator />
            <CardFooter className="pt-3 pb-3">
              <Button 
                onClick={() => openExternalUrl(property.externalUrl)} 
                variant="outline" 
                className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-900 dark:hover:bg-purple-900/30"
              >
                <ExternalLink size={14} className="mr-2" />
                View on {property.source === 'lamudi' ? 'Lamudi' : 'UPC'}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ExternalPropertySearch;
