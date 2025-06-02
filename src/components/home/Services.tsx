
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, House, Landmark, Wallet, Send, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    title: "International Money Transfer",
    description: "Send money globally with competitive rates and lightning-fast delivery. Transfer to over 50 countries with our premium service.",
    icon: Send,
    link: "/money-transfer",
    featured: true
  },
  {
    title: "Residential Properties",
    description: "Find your perfect home with our extensive listings of houses, condos, and apartments across prime locations in Uganda.",
    icon: House,
    link: "/properties?type=residential"
  },
  {
    title: "Commercial Properties",
    description: "Expand your business with our selection of office spaces, retail locations, and industrial properties in Uganda's growing markets.",
    icon: Building,
    link: "/properties?type=commercial"
  },
  {
    title: "Mortgage Solutions",
    description: "Get personalized mortgage options with competitive rates designed to fit your financial situation in the Ugandan market.",
    icon: Landmark,
    link: "/services/mortgage"
  },
  {
    title: "Investment Opportunities",
    description: "Grow your wealth with our curated investment properties in Uganda offering strong returns and growth potential.",
    icon: Wallet,
    link: "/properties?type=investment"
  },
  {
    title: "Global Financial Services",
    description: "Access international banking, forex exchange, and cross-border financial solutions for businesses and individuals.",
    icon: Globe,
    link: "/services"
  }
];

const Services = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Premium Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Gold Charp Investments Limited offers world-class financial services including international money transfers, real estate, and investment solutions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className={`flex flex-col h-full hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 ${
              service.featured ? 'ring-2 ring-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20' : ''
            } dark:bg-gray-800 border-gray-100 dark:border-gray-700`}>
              <CardHeader>
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                  service.featured ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700'
                } mb-4 dark:bg-purple-900/30 dark:text-purple-300`}>
                  <service.icon size={24} />
                </div>
                <CardTitle className={`text-xl ${service.featured ? 'text-purple-700 dark:text-purple-300' : ''} dark:text-white`}>
                  {service.title}
                  {service.featured && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-500 text-white rounded-full">
                      Featured
                    </span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link to={service.link} className="w-full">
                  <Button 
                    variant={service.featured ? "default" : "outline"} 
                    className={`w-full transition-colors ${
                      service.featured 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300'
                    }`}
                  >
                    {service.featured ? 'Transfer Now' : 'Learn More'}
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
