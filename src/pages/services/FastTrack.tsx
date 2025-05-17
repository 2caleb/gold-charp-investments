
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Clock, Zap, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const FastTrack = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mr-6">
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-gradient">Fast Track Approval</h1>
          </div>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
            When time is of the essence, our Fast Track Approval service accelerates your loan application process without compromising on quality or thoroughness.
          </p>
          
          <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 mb-12">
            <h3 className="text-2xl font-bold mb-6">How It Works</h3>
            
            <div className="space-y-8">
              {[
                {
                  step: "Priority Processing",
                  description: "Your application is flagged for immediate review by our dedicated fast-track team.",
                  icon: <Zap className="h-8 w-8 text-purple-600" />
                },
                {
                  step: "Expedited Documentation",
                  description: "We handle document collection and verification in parallel rather than sequentially.",
                  icon: <Clock className="h-8 w-8 text-purple-600" />
                },
                {
                  step: "Direct Underwriting",
                  description: "Your application goes directly to senior underwriters for faster decision-making.",
                  icon: <CheckCircle className="h-8 w-8 text-purple-600" />
                }
              ].map((item, index) => (
                <div key={index} className="flex">
                  <div className="w-16 h-16 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center mr-6 flex-shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="text-xl font-bold mb-2">{item.step}</h4>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white p-8 rounded-xl mb-12">
            <h3 className="text-2xl font-serif font-bold mb-4">Fast Track Benefits</h3>
            <ul className="space-y-3 mb-6">
              {[
                'Decisions in as little as 72 hours',
                'Dedicated application specialist',
                'Regular status updates via SMS and email',
                'Evening and weekend processing available'
              ].map((item, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Button size="lg" variant="secondary" asChild>
              <Link to="/loans">Apply For Fast Track</Link>
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">
              For urgent financing needs, contact our Fast Track specialists at{' '}
              <a href="mailto:info@goldcharpinvestments.com" className="text-purple-600 dark:text-purple-400 hover:underline">
                info@goldcharpinvestments.com
              </a>{' '}
              or call{' '}
              <a href="tel:+256-790501202" className="text-purple-600 dark:text-purple-400 hover:underline">
                +256-790501202
              </a>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FastTrack;
