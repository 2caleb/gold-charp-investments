
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative bg-blue-900 text-white">
      {/* Background overlay with opacity */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=4076&h=2712&q=80')",
          opacity: 0.4
        }}
      />
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Find Your Dream Home & Secure Your Future
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Gold Charp Investments Limited offers the best properties and financial solutions, all in one place.
            Discover how we can help you achieve your real estate and financial goals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/properties">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8">
                Browse Properties
              </Button>
            </Link>
            <Link to="/loans">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-blue-900 font-medium px-8">
                Explore Loans
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
