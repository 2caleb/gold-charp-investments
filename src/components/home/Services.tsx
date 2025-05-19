
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, House, Landmark, Wallet } from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
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
    link: "/loans"
  },
  {
    title: "Investment Opportunities",
    description: "Grow your wealth with our curated investment properties in Uganda offering strong returns and growth potential.",
    icon: Wallet,
    link: "/properties?type=investment"
  },
];

const Services = () => {
  return (
    <section className="bg-gray-50 py-16 md:py-24 dark:bg-gray-900/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Services</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto dark:text-gray-300">
            Gold Charp Investments Limited offers comprehensive real estate and financial services to meet all your property needs in Uganda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="flex flex-col h-full hover:shadow-lg transition-shadow dark:bg-gray-800 border-gray-100 dark:border-gray-700">
              <CardHeader>
                <div className="w-12 h-12 flex items-center justify-center rounded-full bg-purple-100 text-purple-700 mb-4 dark:bg-purple-900/30 dark:text-purple-300">
                  <service.icon size={24} />
                </div>
                <CardTitle className="text-xl dark:text-white">{service.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  {service.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Link to={service.link} className="w-full">
                  <Button variant="outline" className="w-full hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-700 dark:hover:text-purple-300 transition-colors">
                    Learn More
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
