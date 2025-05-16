
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import DesktopNav from './DesktopNav';
import MobileNav from './MobileNav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const isMobile = useIsMobile();
  
  // Add scroll event listener with enhanced effect
  useEffect(() => {
    const handleScroll = () => {
      // Calculate scroll percentage for gradual effect (max at 100px scroll)
      const scrollY = window.scrollY;
      const isScrolled = scrollY > 10;
      const scrollPercentage = Math.min(scrollY / 100, 1);
      
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
      
      setScrollProgress(scrollPercentage);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Calculate opacity based on scroll progress
  const backdropOpacity = 0.6 + (scrollProgress * 0.3); // 60% to 90% opacity
  const backdropBlur = 4 + (scrollProgress * 8); // 4px to 12px blur
  const bgOpacity = 0.7 + (scrollProgress * 0.3); // 70% to 100% opacity

  return (
    <header 
      className="w-full sticky top-0 z-50 transition-all duration-300 border-b border-gray-200 dark:border-gray-800"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
        backdropFilter: `blur(${backdropBlur}px)`,
        WebkitBackdropFilter: `blur(${backdropBlur}px)`,
      }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center group transition-transform duration-300 hover:scale-105">
          <span className="text-2xl font-serif font-bold text-purple-700 dark:text-purple-400">Gold<span className="text-amber-500">Charp</span></span>
        </Link>

        {/* Desktop Navigation */}
        <DesktopNav />

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="ghost"
            size="icon"
            className="ml-2 text-gray-700 dark:text-gray-300 hover:text-purple-700 dark:hover:text-purple-400"
            aria-label="Toggle menu"
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <MobileNav isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </header>
  );
};

export default Navbar;
