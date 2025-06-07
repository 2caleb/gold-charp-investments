
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyValuationForm from '@/components/property-evaluation/PropertyValuationForm';
import EnhancedMarketAnalytics from '@/components/property-evaluation/EnhancedMarketAnalytics';

const PropertyEvaluation = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4 dark:text-white">Property Evaluation Center</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              Get accurate property valuations and comprehensive market insights enhanced with real-time economic data from UBOS and World Bank APIs.
            </p>
          </div>

          <Tabs defaultValue="valuation" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="valuation">Property Valuation</TabsTrigger>
              <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="valuation" className="mt-6">
              <PropertyValuationForm />
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-6">
              <EnhancedMarketAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyEvaluation;
