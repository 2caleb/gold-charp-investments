
import React, { useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import LoanOptions from '@/components/home/LoanOptions';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';
import ContactForm from '@/components/contact/ContactForm';

const Index = () => {
  // Add scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          entry.target.style.opacity = '1';
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      el.classList.add('opacity-0');
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  }, []);
  
  return (
    <Layout>
      <Hero />
      <div className="w-full">
        <div className="animate-on-scroll">
          <Services />
        </div>
        <div className="animate-on-scroll">
          <FeaturedProperties />
        </div>
        <div className="animate-on-scroll">
          <LoanOptions />
        </div>
        <div className="animate-on-scroll">
          <Testimonials />
        </div>
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50 animate-on-scroll">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-400 dark:to-blue-400">Get In Touch</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Have questions or ready to explore your options? Contact our team today.
              </p>
            </div>
            <div className="max-w-2xl mx-auto transition-all duration-300 hover:shadow-lg rounded-lg">
              <ContactForm />
            </div>
          </div>
        </section>
        <div className="animate-on-scroll">
          <CTASection />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
