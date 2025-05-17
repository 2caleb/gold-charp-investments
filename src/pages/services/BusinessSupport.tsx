
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Building, TrendingUp, Briefcase, PieChart, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const BusinessSupport = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mr-6">
              <Building className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient">Business Support</h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            Gold Charp Investments offers comprehensive business support services to help Ugandan entrepreneurs and companies grow, invest, and succeed.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {[
              {
                title: "Business Expansion Loans",
                description: "Tailored financing solutions for growing your business operations, purchasing equipment, or expanding your facilities.",
                icon: <TrendingUp className="h-8 w-8 text-purple-600" />
              },
              {
                title: "Commercial Property Advisory",
                description: "Expert guidance on purchasing, leasing, or developing commercial real estate across Uganda.",
                icon: <Building className="h-8 w-8 text-purple-600" />
              },
              {
                title: "Investment Planning",
                description: "Strategic advice on diversifying your business investments for maximum returns and stability.",
                icon: <PieChart className="h-8 w-8 text-purple-600" />
              },
              {
                title: "Business Networking",
                description: "Access to our extensive network of business owners, investors, and industry experts in Uganda.",
                icon: <Users className="h-8 w-8 text-purple-600" />
              }
            ].map((service, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700">
                <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-8 rounded-xl mb-12">
            <div className="flex items-center mb-6">
              <Briefcase className="h-8 w-8 text-purple-600 mr-4" />
              <h3 className="text-2xl font-serif font-bold">Business Support Packages</h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              We offer customized business support packages based on your company size, industry, and goals. Our team of business analysts will work closely with you to understand your needs and develop a support strategy that aligns with your vision.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link to="/contact">Schedule a Consultation</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/services">View All Services</Link>
              </Button>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              For business support inquiries, contact our business team at{' '}
              <a href="mailto:info@goldcharpinvestments.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                info@goldcharpinvestments.com
              </a>{' '}
              or call{' '}
              <a href="tel:+256-200943073" className="text-purple-600 dark:text-purple-400 hover:underline">
                +256-200943073
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BusinessSupport;
