
import React from 'react';

const OurStorySection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Story</h2>
            <p className="text-lg mb-6 text-gray-600">
              Founded in 2025 in Kampala, Gold Charp Investments Limited began with a simple mission: to make property ownership and financial freedom accessible to more Ugandans.
            </p>
            <p className="text-lg mb-6 text-gray-600">
              What started as a small team of passionate real estate and finance professionals has grown into one of Uganda's most trusted investment companies, helping thousands of clients achieve their dreams of property ownership and financial security.
            </p>
            <p className="text-lg text-gray-600">
              Today, we continue to innovate and expand our services, always guided by our core values of integrity, excellence, and client satisfaction.
            </p>
          </div>
          <div className="relative">
            <img 
              src="/lovable-uploads/85878dcc-9f31-4f91-8a3a-261225e8679b.png" 
              alt="Gold Charp Investments Team" 
              className="rounded-lg shadow-lg" 
            />
            <div className="absolute -bottom-6 -right-6 bg-amber-500 text-white p-4 rounded-lg shadow-lg md:w-64">
              <p className="font-bold">Over 10 years of excellence in real estate and financial services</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurStorySection;
