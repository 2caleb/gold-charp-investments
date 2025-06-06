import React from 'react';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PropertyValuationForm from '@/components/property-evaluation/PropertyValuationForm';
import PropertyAnalytics from '@/components/property-evaluation/PropertyAnalytics';
import RegionalComparison from '@/components/property-evaluation/RegionalComparison';
import ExternalPropertySearch from '@/components/property-evaluation/ExternalPropertySearch';
import EnhancedPropertyValuationForm from '@/components/property-evaluation/EnhancedPropertyValuationForm';

const PropertyEvaluation = () => {
  return (
    <Layout>
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">Smart Property Evaluation System</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
              Advanced property valuation using GIS analysis, market data, and professional assessment algorithms
            </p>
          </div>
          
          <Tabs defaultValue="valuation" className="w-full">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-4">
              <TabsTrigger value="valuation">Smart Valuation</TabsTrigger>
              <TabsTrigger value="search">Property Search</TabsTrigger>
              <TabsTrigger value="regional">Regional Analysis</TabsTrigger>
              <TabsTrigger value="analytics">Market Analytics</TabsTrigger>
            </TabsList>
            <TabsContent value="valuation" className="pt-6">
              <EnhancedPropertyValuationForm />
            </TabsContent>
            <TabsContent value="search" className="pt-6">
              <ExternalPropertySearch />
            </TabsContent>
            <TabsContent value="regional" className="pt-6">
              <RegionalComparison />
            </TabsContent>
            <TabsContent value="analytics" className="pt-6">
              <PropertyAnalytics />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default PropertyEvaluation;
