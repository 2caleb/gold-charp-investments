
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, House } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from 'react-router-dom';

// Sample property data - in a real app, this would come from an API
const residentialProperties = [
  {
    id: 1,
    title: "Modern Downtown Apartment",
    address: "123 Financial District, Lagos",
    price: 450000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    type: "Apartment",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2426&h=1728&q=80"
  },
  {
    id: 2,
    title: "Luxury Family Home",
    address: "456 Suburban Ave, Lekki",
    price: 875000,
    bedrooms: 4,
    bathrooms: 3,
    sqft: 2800,
    type: "House",
    image: "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3847&h=5583&q=80"
  },
  {
    id: 3,
    title: "Urban Loft Space",
    address: "789 Downtown Blvd, Victoria Island",
    price: 525000,
    bedrooms: 1,
    bathrooms: 2,
    sqft: 1500,
    type: "Loft",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=6000&h=4000&q=80"
  },
  {
    id: 4,
    title: "Waterfront Villa",
    address: "321 Beach View, Ikoyi",
    price: 1250000,
    bedrooms: 5,
    bathrooms: 4,
    sqft: 3500,
    type: "Villa",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1351&h=893&q=80"
  }
];

const commercialProperties = [
  {
    id: 5,
    title: "Prime Office Space",
    address: "100 Business Park, Lagos",
    price: 780000,
    sqft: 3200,
    type: "Office",
    features: ["Open floor plan", "Conference rooms", "Reception area"],
    image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=900&q=80"
  },
  {
    id: 6,
    title: "Retail Storefront",
    address: "250 Shopping District, Victoria Island",
    price: 625000,
    sqft: 1800,
    type: "Retail",
    features: ["High foot traffic", "Display windows", "Storage room"],
    image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=900&q=80"
  },
  {
    id: 7,
    title: "Industrial Warehouse",
    address: "500 Industrial Zone, Apapa",
    price: 950000,
    sqft: 8500,
    type: "Warehouse",
    features: ["Loading docks", "High ceilings", "Security system"],
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=900&q=80"
  }
];

const Properties = () => {
  const formatPrice = (price: number) => {
    return price.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    });
  };

  const PropertyCard = ({ property, isResidential = true }: { property: any, isResidential?: boolean }) => (
    <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-64">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <Badge className="absolute top-4 right-4 bg-purple-700">{property.type}</Badge>
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
          <div className="text-2xl font-bold text-purple-700">{formatPrice(property.price)}</div>
        </div>
        {isResidential ? (
          <div className="flex justify-between text-sm">
            <span>{property.bedrooms} Beds</span>
            <span>{property.bathrooms} Baths</span>
            <span>{property.sqft.toLocaleString()} sq ft</span>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-sm">{property.sqft.toLocaleString()} sq ft</div>
            <ul className="text-sm list-disc list-inside text-gray-600">
              {property.features.map((feature: string, index: number) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Link to={`/properties/${property.id}`} className="w-full">
          <Button className="w-full bg-purple-700 hover:bg-purple-800">View Details</Button>
        </Link>
      </CardFooter>
    </Card>
  );

  return (
    <Layout>
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Our Properties</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover exceptional residential and commercial properties selected by Gold Charp Investments Limited to meet your needs.
            </p>
          </div>

          <Tabs defaultValue="residential" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="residential" className="flex items-center gap-2">
                <House size={18} />
                Residential Properties
              </TabsTrigger>
              <TabsTrigger value="commercial" className="flex items-center gap-2">
                <Building size={18} />
                Commercial Properties
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="residential">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {residentialProperties.map(property => (
                  <PropertyCard key={property.id} property={property} isResidential={true} />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="commercial">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {commercialProperties.map(property => (
                  <PropertyCard key={property.id} property={property} isResidential={false} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Properties;
