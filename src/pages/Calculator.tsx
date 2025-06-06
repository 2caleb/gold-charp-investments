
import React from 'react';
import Layout from '@/components/layout/Layout';
import UgandanMortgageCalculator from '@/components/calculator/MortgageCalculator';

const Calculator = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Ugandan Mortgage Calculator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Calculate your estimated monthly mortgage payments using current Ugandan market rates and terms.
          </p>
        </div>
        
        <UgandanMortgageCalculator />
      </div>
    </Layout>
  );
};

export default Calculator;
