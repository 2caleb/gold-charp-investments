
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Insurance = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mr-6">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient">Insurance Options</h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Protect your most valuable assets with our comprehensive insurance solutions designed specifically for Ugandan property owners and investors.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">Property Insurance</h3>
              <ul className="space-y-3">
                {['Full structural coverage', 'Contents protection', 'Natural disaster coverage', 'Liability protection'].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4">Mortgage Insurance</h3>
              <ul className="space-y-3">
                {['Payment protection', 'Coverage during financial hardship', 'Flexible terms', 'Competitive rates'].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                    <span className="text-gray-600 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-xl mb-12">
            <h3 className="text-2xl font-serif font-bold mb-4">Why Choose Our Insurance Services?</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Our partnerships with Uganda's top insurance providers ensure you receive the most competitive rates and comprehensive coverage options. We handle all the paperwork and negotiations, making the process seamless for you.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/contact">Get a Quote</Link>
              </Button>
              <Button variant="outline" asChild size="lg">
                <Link to="/services">Explore More Services</Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Have questions about our insurance options? Contact our specialists at{' '}
              <a href="mailto:info@goldcharpinvestments.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                info@goldcharpinvestments.com
              </a>{' '}
              or call{' '}
              <a href="tel:+256-393103974" className="text-purple-600 dark:text-purple-400 hover:underline">
                +256-393103974
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Insurance;
