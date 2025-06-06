
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Bed, Bath, Square, ArrowLeft, Phone, Mail } from 'lucide-react';

const PropertyDetail = () => {
  const { id } = useParams<{ id: string }>();
  
  // Sample property data - in a real app, this would come from an API based on the ID
  const property = {
    id: parseInt(id || '1'),
    title: "Modern Downtown Apartment",
    address: "123 Financial District, Kampala",
    price: 350000000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1200,
    description: "Beautiful modern apartment in the heart of Kampala's financial district. Features include contemporary finishes, spacious layouts, and premium amenities.",
    features: ["Air Conditioning", "Parking", "Security", "Gym", "Swimming Pool", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2426&h=1728&q=80",
      "https://images.unsplash.com/photo-1494891848038-7bd202a2afeb?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=3847&h=5583&q=80"
    ]
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('en-UG', {
      maximumFractionDigits: 0,
    });
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <Link to="/properties" className="inline-flex items-center text-purple-600 dark:text-purple-400 hover:underline mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Properties
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Images */}
            <div className="space-y-4">
              <div className="relative h-96 rounded-lg overflow-hidden">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />
                <Badge className="absolute top-4 right-4 bg-purple-700">Featured</Badge>
              </div>
              {property.images.length > 1 && (
                <div className="grid grid-cols-2 gap-4">
                  {property.images.slice(1).map((image, index) => (
                    <div key={index} className="h-48 rounded-lg overflow-hidden">
                      <img
                        src={image}
                        alt={`${property.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-2 dark:text-white">{property.title}</h1>
                <div className="flex items-center text-gray-600 dark:text-gray-400 mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address}</span>
                </div>
                <div className="text-3xl font-bold text-purple-700 dark:text-purple-400 mb-4">
                  UGX {formatPrice(property.price)}
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Property Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Bed className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bedrooms</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Bath className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Bathrooms</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Square className="h-6 w-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
                      <div className="font-semibold">{property.sqft.toLocaleString()}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Sq Ft</div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3 dark:text-white">Description</h3>
                    <p className="text-gray-600 dark:text-gray-400">{property.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-3 dark:text-white">Features</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {property.features.map((feature, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-2 h-2 bg-purple-600 dark:bg-purple-400 rounded-full mr-2"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/contact" className="flex-1">
                  <Button className="w-full bg-purple-700 hover:bg-purple-800">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Agent
                  </Button>
                </Link>
                <Link to="/loans" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Get Financing
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyDetail;
