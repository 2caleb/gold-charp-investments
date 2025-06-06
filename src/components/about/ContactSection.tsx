
import React from 'react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';

const ContactSection = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="bg-purple-700 text-white rounded-lg shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="p-12">
              <h2 className="text-3xl font-bold mb-6">Visit Our Office</h2>
              <div className="space-y-6">
                <div className="flex items-start">
                  <MapPin className="h-6 w-6 mr-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">Headquarters</h3>
                    <p>Nansana Heights Building<br />Nansana-Yesu Amala<br />Wakiso, Uganda</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="h-6 w-6 mr-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">Email</h3>
                    <p>info@goldcharpinvestments.com</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="h-6 w-6 mr-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold mb-1">Phone</h3>
                    <p>+256-393103974</p>
                    <p>+256-790501202</p>
                    <p>+256-200943073</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8">
                <Link to="/contact">
                  <Button className="bg-white text-purple-700 hover:bg-gray-100">Contact Us</Button>
                </Link>
              </div>
            </div>
            <div className="bg-cover bg-center hidden md:block" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=6000&h=4000&q=80')` }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
