
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample property data - in a real app, this would come from an API
const allProperties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    address: "123 Financial District, Kampala",
    price: 350000000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    type: "residential",
    category: "apartment",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2426&h=1728&q=80"
  },
  {
    id: 2,
    title: "Luxury Family Home",
    address: "456 Suburban Ave, Entebbe",
    price: 675000000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    type: "residential",
    category: "house",
    image: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3847&h=5583&q=80"
  },
  {
    id: 3,
    title: "Commercial Office Space",
    address: "789 Business District, Kampala",
    price: 1200000000,
    bedrooms: 0,
    bathrooms: 4,
    sqft: 3500,
    type: "commercial",
    category: "office",
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2426&h=1365&q=80"
  },
  {
    id: 4,
    title: "Investment Rental Property",
    address: "321 Investment Row, Jinja",
    price: 450000000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1800,
    type: "investment",
    category: "rental",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=6000&h=4000&q=80"
  },
  {
    id: 5,
    title: "Retail Shopping Space",
    address: "654 Commercial Ave, Mukono",
    price: 800000000,
    bedrooms: 0,
    bathrooms: 2,
    sqft: 2200,
    type: "commercial",
    category: "retail",
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&h=1560&q=80"
  },
  {
    id: 6,
    title: "High-Yield Apartment Complex",
    address: "987 Growth Street, Mbarara",
    price: 2500000000,
    bedrooms: 0,
    bathrooms: 8,
    sqft: 8500,
    type: "investment",
    category: "complex",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=2340&h=1560&q=80"
  }
];

const Properties = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [filteredProperties, setFilteredProperties] = useState(allProperties);

  // Get type filter from URL params
  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam && ['residential', 'commercial', 'investment'].includes(typeParam)) {
      setSelectedType(typeParam);
    }
  }, [searchParams]);

  // Filter properties based on search and type
  useEffect(() => {
    let filtered = allProperties;

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProperties(filtered);
  }, [selectedType, searchTerm]);

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-UG', {
      maximumFractionDigits: 0,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'residential': return 'bg-blue-100 text-blue-800';
      case 'commercial': return 'bg-green-100 text-green-800';
      case 'investment': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Properties for Sale</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover our extensive collection of residential, commercial, and investment properties across Uganda.
          </p>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search properties by title or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedType} onValueChange={setSelectedType}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Property Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="residential">Residential</SelectItem>
              <SelectItem value="commercial">Commercial</SelectItem>
              <SelectItem value="investment">Investment</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Properties Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-64">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-4 right-4 ${getTypeColor(property.type)}`}>
                  {property.type.charAt(0).toUpperCase() + property.type.slice(1)}
                </Badge>
              </div>
              <CardHeader>
                <h3 className="text-xl font-semibold">{property.title}</h3>
                <div className="flex items-center text-gray-500">
                  <MapPin size={16} className="mr-1" />
                  <span className="text-sm">{property.address}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between mb-4">
                  <div className="text-2xl font-bold text-purple-700">UGX {formatPrice(property.price)}</div>
                </div>
                <div className="flex justify-between text-sm">
                  {property.bedrooms > 0 && <span>{property.bedrooms} Beds</span>}
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.sqft.toLocaleString()} sq ft</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/properties/${property.id}`} className="w-full">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-400">
              No properties found matching your criteria. Please try adjusting your search or filters.
            </p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-serif font-bold mb-4">Looking for Something Specific?</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Our team can help you find the perfect property that meets your exact requirements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/contact">Contact Our Team</Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link to="/property-evaluation">Get Property Valuation</Link>
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Properties;
