
import React, { useEffect } from 'react';
import Hero from '@/components/home/Hero';
import Services from '@/components/home/Services';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import LoanOptions from '@/components/home/LoanOptions';
import Testimonials from '@/components/home/Testimonials';
import CTASection from '@/components/home/CTASection';
import ContactForm from '@/components/contact/ContactForm';
import RestoredNavBar from '@/components/layout/RestoredNavBar';
import Footer from '@/components/layout/Footer';
import { motion } from 'framer-motion';
import { Shield, Clock, Building, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ScrollFade, ScrollReveal, StaggerChildren } from '@/components/home/ScrollAnimations';

const Index = () => {
  // Add scroll animation effect
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          // Fix the TypeScript error by checking if target is an HTMLElement
          if (entry.target instanceof HTMLElement) {
            entry.target.style.opacity = '1';
          }
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <RestoredNavBar />
      
      <main className="flex-1">
        <Hero />
        <div className="w-full">
          <ScrollFade delay={0.2}>
            <Services />
          </ScrollFade>
          
          <ScrollReveal delay={0.3}>
            <FeaturedProperties />
          </ScrollReveal>
          
          <ScrollFade y={50} delay={0.2}>
            <LoanOptions />
          </ScrollFade>
          
          <StaggerChildren>
            <Testimonials />
          </StaggerChildren>
          
          <ScrollReveal delay={0.3}>
            <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800/50">
              <div className="container mx-auto px-4">
                <ScrollFade delay={0.4}>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-400 dark:to-blue-400">Get In Touch</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                      Have questions or ready to explore your options? Contact our team today.
                    </p>
                  </div>
                </ScrollFade>
                
                <div className="max-w-2xl mx-auto transition-all duration-300 hover:shadow-lg rounded-lg">
                  <ContactForm />
                </div>
              </div>
            </section>
          </ScrollReveal>
          
          <ScrollFade>
            <CTASection />
          </ScrollFade>
          
          {/* Additional Services Section - Enhanced with working links */}
          <ScrollReveal delay={0.2}>
            <section className="py-16 bg-white dark:bg-gray-900">
              <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-600 dark:from-purple-400 dark:to-blue-400">
                    Additional Services
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                    Beyond real estate and loans, Gold Charp Investments offers these specialized services to meet your financial needs.
                  </p>
                </div>
                
                <StaggerChildren staggerDelay={0.15}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                      {
                        title: "Insurance Options",
                        description: "Protect your property investment with comprehensive insurance packages tailored to Ugandan real estate.",
                        icon: "Shield",
                        link: "/services/insurance",
                      },
                      {
                        title: "Fast Track Approval",
                        description: "Expedite your loan application process with our premium fast-track service for urgent financing needs.",
                        icon: "Clock",
                        link: "/services/fast-track",
                      },
                      {
                        title: "Business Support",
                        description: "Get expert advice for commercial property investments and business expansion loans in Uganda.",
                        icon: "Building",
                        link: "/services/business-support",
                      }
                    ].map((service, index) => (
                      <motion.div 
                        key={index}
                        whileHover={{ y: -5 }}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="mb-4 h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          {service.icon === "Shield" && <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                          {service.icon === "Clock" && <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                          {service.icon === "Building" && <Building className="h-6 w-6 text-purple-600 dark:text-purple-400" />}
                        </div>
                        <h3 className="text-xl font-serif font-bold mb-2 dark:text-white">{service.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">{service.description}</p>
                        <Link 
                          to={service.link} 
                          className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium hover:underline"
                        >
                          Learn more
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </StaggerChildren>
                
                <div className="mt-12 text-center">
                  <p className="text-gray-600 dark:text-gray-400">
                    Need assistance? Contact our support team at{' '}
                    <a href="mailto:info@goldcharpinvestments.com" className="text-purple-600 dark:text-purple-400 hover:underline transition-colors">
                      info@goldcharpinvestments.com
                    </a>{' '}
                    or call us at{' '}
                    <a href="tel:+256-393103974" className="text-purple-600 dark:text-purple-400 hover:underline transition-colors">
                      +256-393103974
                    </a>
                  </p>
                </div>
              </div>
            </section>
          </ScrollReveal>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
