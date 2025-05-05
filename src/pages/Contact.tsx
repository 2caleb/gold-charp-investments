
import React from 'react';
import Layout from '@/components/layout/Layout';
import ContactForm from '@/components/contact/ContactForm';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help you with all your real estate and financial needs. Reach out to our team for personalized assistance.
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-16">
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Phone className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold mb-2">Call Us</h3>
            <p className="text-gray-600 mb-3">Our team is available Monday-Friday, 9am-5pm</p>
            <a href="tel:+256-123-4567" className="text-purple-700 font-medium">+256 123-4567</a>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold mb-2">Email Us</h3>
            <p className="text-gray-600 mb-3">Send us an email and we'll get back to you within 24 hours</p>
            <a href="mailto:info@goldcharpinvestments.com" className="text-purple-700 font-medium">info@goldcharpinvestments.com</a>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mb-4">
              <MapPin className="h-6 w-6 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-3">Our office is centrally located in Nasana-Wakiso</p>
            <address className="not-italic text-purple-700 font-medium">123 Main Street, Nasana-Wakiso, Uganda</address>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <ContactForm />
          </div>
          <div className="h-96 bg-gray-200 rounded-lg overflow-hidden shadow-md">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63835.97415086419!2d32.52955549177439!3d0.36071371799514254!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x177dbb11d5e8c721%3A0xb6bf941f4edc9bed!2sNansana%2C%20Wakiso%2C%20Uganda!5e0!3m2!1sen!2sus!4v1698765432109!5m2!1sen!2sus" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
