
import React from 'react';
import Layout from '@/components/layout/Layout';
import MortgageCalculator from '@/components/calculator/MortgageCalculator';

const Calculator = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Mortgage Calculator</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Use our mortgage calculator to estimate your monthly payments and the total cost of your loan.
          </p>
        </div>
        
        <MortgageCalculator />
      </div>
    </Layout>
  );
};

export default Calculator;
