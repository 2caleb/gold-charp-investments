
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-serif font-bold text-purple-700">Gold<span className="text-amber-500">Charp</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">Home</Link>
          <Link to="/properties" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">Properties</Link>
          <Link to="/loans" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">Loans</Link>
          <Link to="/calculator" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">Calculator</Link>
          <Link to="/about" className="text-gray-700 hover:text-purple-700 font-medium transition-colors">About Us</Link>
          <Button variant="default" size="sm" className="bg-purple-700 hover:bg-purple-800">
            Contact Us
          </Button>
        </nav>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-700 hover:text-purple-700 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden py-4 px-4 bg-white border-t border-gray-100 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-purple-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/properties" 
              className="text-gray-700 hover:text-purple-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Properties
            </Link>
            <Link 
              to="/loans" 
              className="text-gray-700 hover:text-purple-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Loans
            </Link>
            <Link 
              to="/calculator" 
              className="text-gray-700 hover:text-purple-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Calculator
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-purple-700 font-medium px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              About Us
            </Link>
            <Button variant="default" className="bg-purple-700 hover:bg-purple-800 w-full">
              Contact Us
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
