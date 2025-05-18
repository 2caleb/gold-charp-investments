
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { Award, Clock, Users, MapPin, Mail, Phone, CheckCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-purple-700 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">About Gold Charp Investments Limited</h1>
            <p className="text-xl mb-8">
              We're dedicated to helping Ugandans achieve their real estate and financial goals through innovative solutions and exceptional service.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6">Our Story</h2>
              <p className="text-lg mb-6 text-gray-600">
                Founded in 2025 in Kampala, Gold Charp Investments Limited began with a simple mission: to make property ownership and financial freedom accessible to more Ugandans.
              </p>
              <p className="text-lg mb-6 text-gray-600">
                What started as a small team of passionate real estate and finance professionals has grown into one of Uganda's most trusted investment companies, helping thousands of clients achieve their dreams of property ownership and financial security.
              </p>
              <p className="text-lg text-gray-600">
                Today, we continue to innovate and expand our services, always guided by our core values of integrity, excellence, and client satisfaction.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80" 
                alt="Gold Charp Investments Team" 
                className="rounded-lg shadow-lg" 
              />
              <div className="absolute -bottom-6 -right-6 bg-amber-500 text-white p-4 rounded-lg shadow-lg md:w-64">
                <p className="font-bold">Over 10 years of excellence in real estate and financial services</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Core Values</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do at Gold Charp Investments Limited.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <Award size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Integrity</h3>
              <CardContent className="p-0">
                <p className="text-gray-600">
                  We operate with the highest ethical standards, ensuring transparency and honesty in all our dealings.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <Clock size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <CardContent className="p-0">
                <p className="text-gray-600">
                  We strive for excellence in every aspect of our business, from property selection to client service.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white text-center p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-purple-100 text-purple-700">
                  <Users size={32} />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">Client Focus</h3>
              <CardContent className="p-0">
                <p className="text-gray-600">
                  Our clients' needs and goals are at the center of everything we do, driving our decisions and services.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Leadership Team</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Meet the experienced professionals who guide our company's vision and operations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mb-4 relative">
                <Avatar className="w-40 h-40 mx-auto">
                  <AvatarImage src="/lovable-uploads/b84c30a3-778a-4b51-9c6d-063035a7ece9.png" alt="Chris Mubiru" className="object-cover" />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-4xl">CM</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold">Chris Mubiru</h3>
              <p className="text-purple-700 font-medium mb-2">Chief Executive Officer</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                With 20+ years of experience in real estate and finance, Chris leads our company with vision and integrity.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <Avatar className="w-40 h-40 mx-auto">
                  <AvatarImage src="/lovable-uploads/db9623bc-a03d-4540-ab36-44ec0e7344e9.png" alt="Geofrey Mubiru" className="object-cover" />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-4xl">GM</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold">Geofrey Mubiru</h3>
              <p className="text-purple-700 font-medium mb-2">Chief Operations Officer</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                Geofrey oversees our day-to-day operations, ensuring excellent service delivery and operational efficiency.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-4">
                <Avatar className="w-40 h-40 mx-auto">
                  <AvatarImage src="/lovable-uploads/854b9bda-1aea-4e1c-89bf-f6defcfa2dc3.png" alt="Paul Mubiru" className="object-cover" />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-4xl">PM</AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-xl font-bold">Paul Mubiru</h3>
              <p className="text-purple-700 font-medium mb-2">Chief Financial Officer</p>
              <p className="text-gray-600 max-w-xs mx-auto">
                Paul brings his financial expertise to help our clients make sound investment decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Why Choose Gold Charp Investments</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We offer unique advantages that set us apart in the Ugandan real estate and finance industry.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Comprehensive Solutions</h3>
                <p className="text-gray-600">
                  We offer end-to-end services, from property selection to financing, making your journey seamless.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Local Expertise</h3>
                <p className="text-gray-600">
                  Our deep understanding of the Ugandan market allows us to provide relevant and effective solutions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Personalized Approach</h3>
                <p className="text-gray-600">
                  We tailor our services to meet your specific needs and goals, not one-size-fits-all solutions.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-4 mt-1">
                <CheckCircle className="h-6 w-6 text-purple-700" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Track Record of Success</h3>
                <p className="text-gray-600">
                  Our portfolio of satisfied clients and successful investments speaks to our expertise and reliability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
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
    </Layout>
  );
};

export default About;
