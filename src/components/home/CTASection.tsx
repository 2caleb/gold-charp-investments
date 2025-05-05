
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const CTASection = () => {
  return (
    <section className="bg-purple-700">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">
            Ready to Start Your Real Estate Journey?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Whether you're buying your first home, investing in property, or looking to refinance,
            our experts at Gold Charp Investments Limited are here to guide you every step of the way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-white text-purple-700 hover:bg-purple-50">
                Contact an Advisor
              </Button>
            </Link>
            <Link to="/calculator">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-purple-600">
                Calculate Your Mortgage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
