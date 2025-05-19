
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Home, Calculator } from 'lucide-react';

const Hero = () => {
  // Variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="relative text-white overflow-hidden">
      {/* Video Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <video 
          autoPlay 
          muted 
          loop 
          className="w-full h-full object-cover"
          poster="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=4076&h=2712&q=80"
        >
          <source src="https://player.vimeo.com/external/562967998.hd.mp4?s=42470153d921c9a43ab9a3c60c132d683c363caa&profile_id=175&oauth2_token_id=57447761" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-purple-900/80 mix-blend-multiply"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 py-20 md:py-32 relative z-10">
        <motion.div
          className="max-w-3xl"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.h1 
            className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight"
            variants={childVariants}
          >
            Find Your Dream Home & Secure Your Future
          </motion.h1>
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl mb-8 text-gray-100"
            variants={childVariants}
          >
            Gold Charp Investments Limited offers the best properties and financial solutions in Uganda.
            Discover how we can help you achieve your real estate and financial goals.
          </motion.p>
          <motion.div 
            className="flex flex-wrap gap-4"
            variants={childVariants}
          >
            <Link to="/properties">
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-6 sm:px-8 transition-all duration-300 hover:scale-105 transform">
                <Home className="mr-2" size={18} />
                Browse Properties
              </Button>
            </Link>
            <Link to="/loans">
              <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-purple-900 font-medium px-6 sm:px-8 transition-all duration-300 hover:scale-105 transform">
                Explore Loans
              </Button>
            </Link>
            <Link to="/property-evaluation">
              <Button size="lg" className="bg-yellow-500 text-purple-900 hover:bg-yellow-400 font-medium px-6 sm:px-8 transition-all duration-300 hover:scale-105 transform">
                <BarChart3 className="mr-2" size={18} />
                Evaluate Property
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Hero;
