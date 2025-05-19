
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Clock, Shield, Building, Check, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Service data - would typically come from a database
const services = {
  'insurance': {
    title: 'Insurance Options',
    description: 'Protect your property investment with comprehensive insurance packages tailored to Ugandan real estate.',
    longDescription: 'Our insurance solutions are specifically designed for the Ugandan market, offering comprehensive coverage for residential and commercial properties. We partner with top-rated insurance providers to ensure you receive the best protection at competitive rates.',
    icon: Shield,
    benefits: [
      'Property value protection against damage and natural disasters',
      'Liability coverage for property owners',
      'Special coverage options for rental properties',
      'Customized packages for different property types',
      'Quick claims processing and settlement',
    ],
    offerings: [
      { name: 'Basic Property Insurance', price: 'From UGX 300,000/year', description: 'Essential coverage for structural damage' },
      { name: 'Comprehensive Coverage', price: 'From UGX 750,000/year', description: 'Full protection for property and contents' },
      { name: 'Landlord Protection', price: 'From UGX 500,000/year', description: 'Specialized for rental property owners' },
      { name: 'Commercial Property Insurance', price: 'Custom Pricing', description: 'Tailored for business properties' },
    ]
  },
  'fast-track': {
    title: 'Fast Track Approval',
    description: 'Expedite your loan application process with our premium fast-track service for urgent financing needs.',
    longDescription: 'When time is of the essence, our Fast Track Approval service provides accelerated processing of loan applications for qualified clients. This premium service reduces the typical approval timeline from weeks to just days, allowing you to secure property deals quickly.',
    icon: Clock,
    benefits: [
      'Priority processing of your application',
      'Dedicated loan officer assigned to your case',
      'Expedited property valuation',
      'Faster document verification',
      '24-hour updates on application status',
    ],
    offerings: [
      { name: 'Express Review', price: 'UGX 250,000', description: '72-hour initial assessment' },
      { name: 'Priority Processing', price: 'UGX 500,000', description: 'Fast-tracked through all approval stages' },
      { name: 'VIP Service', price: 'UGX 1,000,000', description: 'Comprehensive expedited service with personal banker' },
    ]
  },
  'business-support': {
    title: 'Business Support',
    description: 'Get expert advice for commercial property investments and business expansion loans in Uganda.',
    longDescription: 'Our Business Support services provide comprehensive assistance for entrepreneurs and business owners looking to invest in commercial properties or expand their operations in Uganda. Our team of experts offers personalized guidance on financing options, market analysis, and business planning.',
    icon: Building,
    benefits: [
      'Expert commercial property market insights',
      'Business plan review and optimization',
      'Customized financing solutions',
      'Regulatory compliance guidance',
      'Network of business service providers',
    ],
    offerings: [
      { name: 'Business Consultation', price: 'UGX 300,000', description: '2-hour session with business advisor' },
      { name: 'Market Analysis Report', price: 'From UGX 500,000', description: 'Comprehensive market assessment' },
      { name: 'Business Expansion Package', price: 'From UGX 1,200,000', description: 'Full support for business growth' },
      { name: 'Commercial Property Analysis', price: 'Custom Pricing', description: 'In-depth evaluation of potential properties' },
    ]
  },
  'other': {
    title: 'Custom Service Request',
    description: 'Tailored financial and real estate solutions for your unique needs in the Ugandan market.',
    longDescription: 'We understand that every client has unique requirements. Our Custom Service option allows you to specify exactly what you need, and our team will create a tailored solution that addresses your specific situation in the Ugandan financial and real estate markets.',
    icon: Check,
    benefits: [
      'Personalized service designed for your specific needs',
      'Flexibility to combine different service offerings',
      'Custom pricing based on actual requirements',
      'Dedicated team assigned to your request',
      'Regular progress updates and consultations',
    ],
    offerings: []
  }
};

const ServiceDetail = () => {
  const { serviceId } = useParams<{ serviceId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customRequest, setCustomRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCustomForm, setShowCustomForm] = useState(serviceId === 'other');

  // Use the service ID to get the service details or default to 'other'
  const service = serviceId && services[serviceId as keyof typeof services] 
    ? services[serviceId as keyof typeof services] 
    : services.other;

  useEffect(() => {
    // If an invalid service ID is provided, redirect to the services page
    if (serviceId && !services[serviceId as keyof typeof services] && serviceId !== 'other') {
      toast({
        title: "Service Not Found",
        description: "The requested service does not exist.",
        variant: "destructive",
      });
      navigate('/services');
    }
    
    // Update the form visibility when serviceId changes
    setShowCustomForm(serviceId === 'other');
  }, [serviceId, navigate, toast]);

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Request Submitted",
        description: "We've received your custom service request. Our team will contact you shortly.",
      });
      setLoading(false);
      setCustomRequest('');
      navigate('/services');
    }, 1500);
  };

  const handleQuoteRequest = (offeringName: string) => {
    toast({
      title: "Quote Requested",
      description: `We'll prepare a detailed quote for ${offeringName} and contact you soon.`,
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full mr-4">
              <service.icon className="h-8 w-8 text-purple-700 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold">{service.title}</h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">{service.description}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <h2 className="text-2xl font-serif font-bold mb-4">Overview</h2>
              <p className="text-gray-700 dark:text-gray-300">{service.longDescription}</p>
              
              <h3 className="text-xl font-serif font-bold mt-8 mb-4">Benefits</h3>
              <ul className="space-y-2">
                {service.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {service.offerings.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold mb-6">Services & Pricing</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {service.offerings.map((offering, index) => (
                    <div 
                      key={index} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-purple-300 dark:hover:border-purple-700 transition-all duration-300"
                    >
                      <h3 className="text-lg font-bold mb-1">{offering.name}</h3>
                      <p className="text-purple-700 dark:text-purple-400 font-semibold mb-2">{offering.price}</p>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{offering.description}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        onClick={() => handleQuoteRequest(offering.name)}
                      >
                        Request Quote
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {showCustomForm && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6">
                <h2 className="text-2xl font-serif font-bold mb-4">Custom Service Request</h2>
                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Please provide details about the specific service you're looking for, and our team will create a tailored solution for your needs.
                </p>
                
                <form onSubmit={handleRequestSubmit}>
                  <div className="mb-4">
                    <label htmlFor="customRequest" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Describe your requirements
                    </label>
                    <textarea
                      id="customRequest"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      rows={5}
                      placeholder="Please provide details about your needs, budget considerations, and timeline..."
                      value={customRequest}
                      onChange={(e) => setCustomRequest(e.target.value)}
                      required
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="bg-purple-600 hover:bg-purple-700 text-white mt-2"
                    disabled={loading}
                  >
                    {loading ? 'Submitting...' : 'Submit Request'}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-8">
            <Button variant="outline" onClick={() => navigate('/services')}>
              Back to All Services
            </Button>
            
            <Button 
              onClick={() => navigate('/contact')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              Contact Our Team
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServiceDetail;
