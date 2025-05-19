
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Calculator } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="bg-gradient-to-r from-purple-700 to-indigo-800 dark:from-purple-900 dark:to-indigo-950 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48ZyBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIxIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMxLjE1MiAwIDIuMDU0LjMyIDIuNzA2Ljk2LjY1Mi42NC45NzggMS41NDguOTc4IDIuNzI0IDAgMS4xNzYtLjMyNiAyLjA4LS45NzggMi43Mi0uNjUyLjY0LTEuNTU0Ljk2LTIuNzA2Ljk2cy0yLjA1NC0uMzItMi43MDYtLjk2Yy0uNjUyLS42NC0uOTc4LTEuNTQ0LS45NzgtMi43MiAwLTEuMTc2LjMyNi0yLjA4NC45NzgtMi43MjQuNjUyLS42NCAxLjU1NC0uOTYgMi43MDYtLjk2eiIvPjwvZz48L3N2Zz4=')] bg-center opacity-20"></div>
      </div>
      
      <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6 text-white">
            Ready to Start Your <span className="text-yellow-300">Financial Journey?</span>
          </h2>
          <p className="text-xl mb-10 text-purple-100 max-w-2xl mx-auto">
            Whether you're buying your first home, investing in property, or looking to refinance,
            our experts at Gold Charp Investments Limited are here to guide you every step of the way.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-white text-purple-700 hover:bg-purple-50 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group px-6 py-6">
              <Link to="/contact">
                <span>Contact an Advisor</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-purple-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group px-6 py-6">
              <Link to="/calculator">
                <Calculator className="mr-2 h-5 w-5" />
                <span>Calculate Your Mortgage</span>
              </Link>
            </Button>
            <Button asChild size="lg" className="bg-yellow-500 text-purple-900 hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md group px-6 py-6">
              <Link to="/property-evaluation">
                <BarChart3 className="mr-2 h-5 w-5" />
                <span>Evaluate Property</span>
                <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
