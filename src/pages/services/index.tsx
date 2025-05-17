
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield, Clock, Building, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const ServicesPage = () => {
  const serviceCategories = [
    {
      title: "Real Estate Services",
      services: [
        { name: "Property Sales", link: "/properties" },
        { name: "Property Rentals", link: "/properties?type=rental" },
        { name: "Property Management", link: "/services/property-management" },
        { name: "Real Estate Consulting", link: "/services/consulting" }
      ]
    },
    {
      title: "Loan Services",
      services: [
        { name: "Mortgage Loans", link: "/services/mortgage" },
        { name: "Business Loans", link: "/services/commercial" },
        { name: "Refinancing", link: "/services/refinance" },
        { name: "First-Time Buyer Programs", link: "/services/firsttime" }
      ]
    },
    {
      title: "Additional Services",
      services: [
        { name: "Insurance Options", link: "/services/insurance" },
        { name: "Fast Track Approval", link: "/services/fast-track" },
        { name: "Business Support", link: "/services/business-support" },
        { name: "Investment Advisory", link: "/services/investment" }
      ]
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-400 dark:to-blue-400">
            Our Services
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Gold Charp Investments offers a comprehensive range of services to meet all your real estate and financial needs in Uganda.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
          >
            <div className="mb-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 dark:text-white">Insurance Options</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Protect your property investment with comprehensive insurance packages tailored to Ugandan real estate.
            </p>
            <Link 
              to="/services/insurance" 
              className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Learn more
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
          >
            <div className="mb-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 dark:text-white">Fast Track Approval</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Expedite your loan application process with our premium fast-track service for urgent financing needs.
            </p>
            <Link 
              to="/services/fast-track" 
              className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Learn more
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </motion.div>
          
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
          >
            <div className="mb-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-serif font-bold mb-2 dark:text-white">Business Support</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Get expert advice for commercial property investments and business expansion loans in Uganda.
            </p>
            <Link 
              to="/services/business-support" 
              className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium hover:underline"
            >
              Learn more
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </motion.div>
        </div>
        
        <div className="space-y-12 mb-16">
          {serviceCategories.map((category, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 md:p-8 shadow-md">
              <h2 className="text-2xl font-serif font-bold mb-6 dark:text-white">{category.title}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {category.services.map((service, serviceIndex) => (
                  <Link
                    key={serviceIndex}
                    to={service.link}
                    className="p-4 border border-gray-100 dark:border-gray-700 rounded-md hover:bg-purple-50 dark:hover:bg-purple-900/10 hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-300"
                  >
                    <span className="flex items-center text-gray-700 dark:text-gray-300 font-medium">
                      {service.name}
                      <ChevronRight className="h-4 w-4 ml-1 text-purple-600 dark:text-purple-400" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center p-8 bg-purple-50 dark:bg-purple-900/10 rounded-xl">
          <h3 className="text-2xl font-serif font-bold mb-4 dark:text-white">Need Custom Services?</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Don't see what you're looking for? Contact our team to discuss customized solutions for your specific needs.
          </p>
          <div className="text-gray-600 dark:text-gray-400">
            Contact our support team at{' '}
            <a href="mailto:info@goldcharpinvestments.com" className="text-purple-600 dark:text-purple-400 hover:underline transition-colors">
              info@goldcharpinvestments.com
            </a>{' '}
            or call us at{' '}
            <a href="tel:+256-393103974" className="text-purple-600 dark:text-purple-400 hover:underline transition-colors">
              +256-393103974
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServicesPage;
