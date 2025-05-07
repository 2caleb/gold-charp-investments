
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <div className="relative text-white overflow-hidden">
      {/* Video Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          className="object-cover w-full h-full"
          poster="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=4076&h=2712&q=80"
        >
          <source src="https://player.vimeo.com/external/562967998.hd.mp4?s=42470153d921c9a43ab9a3c60c132d683c363caa&profile_id=175&oauth2_token_id=57447761" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-purple-900/80 mix-blend-multiply"></div>
      </div>
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-3xl animate-fade-in">
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-6 leading-tight text-gradient">
            Find Your Dream Home & Secure Your Future
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100">
            Gold Charp Investments Limited offers the best properties and financial solutions in Uganda.
            Discover how we can help you achieve your real estate and financial goals.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/properties">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-8 hover-scale">
                Browse Properties
              </Button>
            </Link>
            <Link to="/loans">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-900 font-medium px-8 hover-scale">
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
