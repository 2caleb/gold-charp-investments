
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

// Sample property data - in a real app, this would come from an API
const properties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    address: "123 Financial District, New York",
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2426&h=1728&q=80"
  },
  {
    id: 2,
    title: "Luxury Family Home",
    address: "456 Suburban Ave, Los Angeles",
    price: 875000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3847&h=5583&q=80"
  },
  {
    id: 3,
    title: "Urban Loft Space",
    address: "789 Downtown Blvd, Chicago",
    price: 525000,
    bedrooms: 1,
    bathrooms: 2,
    sqft: 1500,
    isFeatured: true,
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=6000&h=4000&q=80"
  }
];

const FeaturedProperties = () => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Featured Properties</h2>
            <p className="text-lg text-gray-600">
              Discover our handpicked selection of premium properties
            </p>
          </div>
          <Link to="/properties">
            <Button variant="outline">View All Properties</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-64">
                <img
                  src={property.image}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-blue-700">Featured</Badge>
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
                  <div className="text-2xl font-bold text-blue-700">{formatPrice(property.price)}</div>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{property.bedrooms} Beds</span>
                  <span>{property.bathrooms} Baths</span>
                  <span>{property.sqft.toLocaleString()} sq ft</span>
                </div>
              </CardContent>
              <CardFooter>
                <Link to={`/properties/${property.id}`} className="w-full">
                  <Button className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;
