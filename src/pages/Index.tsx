
import React from 'react';
import Layout from '@/components/layout/Layout';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import LoanOptions from '@/components/home/LoanOptions';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';
import ContactForm from '@/components/contact/ContactForm';

const Index = () => {
  return (
    <Layout>
      <Hero />
      <div className="animate-fade-in">
        <Services />
        <FeaturedProperties />
        <LoanOptions />
        <Testimonials />
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-white">Get In Touch</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Have questions or ready to explore your options? Contact our team today.
              </p>
            </div>
            <div className="max-w-2xl mx-auto">
              <ContactForm />
            </div>
          </div>
        </section>
        <CTASection />
      </div>
    </Layout>
  );
};

export default Index;
