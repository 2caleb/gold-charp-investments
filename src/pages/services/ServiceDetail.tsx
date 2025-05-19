
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
  'property-management': {
    title: 'Property Management',
    description: 'Comprehensive property management services for landlords and property owners in Uganda.',
    longDescription: 'Our Property Management services take the stress out of owning rental properties. We handle everything from tenant screening and rent collection to maintenance coordination and financial reporting, allowing you to enjoy the benefits of property ownership without the day-to-day hassles.',
    icon: Building,
    benefits: [
      'Professional tenant screening and placement',
      'Regular property inspections and maintenance',
      'Efficient rent collection and financial reporting',
      'Legal compliance and documentation management',
      '24/7 emergency response system',
    ],
    offerings: [
      { name: 'Basic Management', price: '8% of monthly rent', description: 'Core property management services' },
      { name: 'Premium Management', price: '12% of monthly rent', description: 'Comprehensive management with priority maintenance' },
      { name: 'Commercial Property Management', price: 'Custom Pricing', description: 'Specialized services for commercial properties' },
    ]
  },
  'consulting': {
    title: 'Real Estate Consulting',
    description: 'Expert guidance for property investment decisions and market analysis in Uganda.',
    longDescription: 'Our Real Estate Consulting services provide in-depth market analysis and expert guidance to help you make informed property investment decisions. Whether you\'re looking to diversify your portfolio, enter the Ugandan market, or optimize your existing real estate assets, our consultants offer tailored advice based on current market conditions and trends.',
    icon: Building,
    benefits: [
      'Comprehensive market analysis and trend forecasting',
      'Investment strategy development and optimization',
      'Property portfolio review and recommendations',
      'Risk assessment and mitigation planning',
      'Return on investment calculations and projections',
    ],
    offerings: [
      { name: 'Investment Consultation', price: 'UGX 500,000', description: 'One-time consultation for investment guidance' },
      { name: 'Market Analysis Report', price: 'From UGX 750,000', description: 'Detailed market analysis for specific regions' },
      { name: 'Portfolio Optimization', price: 'From UGX 1,500,000', description: 'Comprehensive review of property investments' },
    ]
  },
  'mortgage': {
    title: 'Mortgage Loans',
    description: 'Competitive mortgage options for home buyers in the Ugandan market.',
    longDescription: 'Our Mortgage Loan services offer competitive financing options for home buyers in Uganda. We work with multiple lending partners to find the best rates and terms suited to your financial situation, whether you\'re a first-time buyer or looking to refinance your existing home.',
    icon: Building,
    benefits: [
      'Competitive interest rates tailored to your credit profile',
      'Flexible down payment options for various financial situations',
      'Multiple term length options from 10 to 30 years',
      'Specialized programs for first-time home buyers',
      'Fast pre-approval process for stronger purchase offers',
    ],
    offerings: [
      { name: 'Standard Mortgage', price: 'From 9% interest', description: 'Traditional mortgage with fixed or variable rates' },
      { name: 'First-Time Buyer Program', price: 'From 8.5% interest', description: 'Special terms for first-time homeowners' },
      { name: 'Premium Property Mortgage', price: 'Custom Rates', description: 'Specialized terms for high-value properties' },
    ]
  },
  'commercial': {
    title: 'Commercial Loans',
    description: 'Financing solutions for business properties and commercial real estate in Uganda.',
    longDescription: 'Our Commercial Loan services provide financing solutions specifically for business properties and commercial real estate in Uganda. We understand the unique needs of business owners and investors, offering competitive rates and favorable terms for property acquisition, development, or refinancing.',
    icon: Building,
    benefits: [
      'Higher loan amounts for substantial commercial projects',
      'Flexible repayment schedules aligned with business cash flow',
      'Options for both owner-occupied and investment properties',
      'Specialized terms for different commercial property types',
      'Expert guidance through complex commercial lending requirements',
    ],
    offerings: [
      { name: 'Commercial Property Loan', price: 'From 10% interest', description: 'For purchasing existing commercial properties' },
      { name: 'Development Financing', price: 'From 11% interest', description: 'For construction and development projects' },
      { name: 'Commercial Refinancing', price: 'Custom Rates', description: 'Restructure existing commercial property loans' },
    ]
  },
  'refinance': {
    title: 'Refinancing',
    description: 'Optimize your existing loans with competitive refinancing options in Uganda.',
    longDescription: 'Our Refinancing services help you optimize your existing loans by taking advantage of better interest rates or more favorable terms. Whether you\'re looking to lower your monthly payments, reduce your overall interest costs, or access equity in your property, our refinancing options are designed to meet your financial goals.',
    icon: Clock,
    benefits: [
      'Potential for lower monthly payments through reduced interest rates',
      'Option to shorten loan term while maintaining similar payments',
      'Ability to convert variable rates to fixed rates for stability',
      'Cash-out options to access equity for major expenses',
      'Consolidation of multiple loans into a single, manageable payment',
    ],
    offerings: [
      { name: 'Rate Reduction Refinance', price: 'From 8.5% interest', description: 'Lower your current interest rate' },
      { name: 'Cash-Out Refinance', price: 'From 9% interest', description: 'Access equity while refinancing your loan' },
      { name: 'Term Adjustment Refinance', price: 'Custom Rates', description: 'Change your loan term to better suit your needs' },
    ]
  },
  'firsttime': {
    title: 'First-Time Buyer Programs',
    description: 'Special financing options and assistance for first-time property buyers in Uganda.',
    longDescription: 'Our First-Time Buyer Programs are specifically designed to help new property owners navigate the complex process of purchasing their first home in Uganda. We offer special financing terms, educational resources, and personalized guidance to make your first property purchase a smooth and successful experience.',
    icon: Home,
    benefits: [
      'Lower down payment requirements for qualified buyers',
      'Competitive interest rates for first-time purchasers',
      'Educational workshops on property ownership and maintenance',
      'Guidance through the entire buying process from offer to closing',
      'Post-purchase support and resources for new homeowners',
    ],
    offerings: [
      { name: 'First Home Advantage', price: 'From 8% interest', description: 'Specialized mortgage for first-time buyers' },
      { name: 'Starter Home Program', price: 'From 7.5% interest', description: 'For affordable starter properties under UGX 100M' },
      { name: 'New Buyer Education Package', price: 'UGX 200,000', description: 'Comprehensive guidance and educational resources' },
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
    // If an invalid service ID is provided, redirect to the services page with a toast notification
    if (serviceId && !services[serviceId as keyof typeof services]) {
      // Instead of showing an error toast, redirect to the "other" service which is our custom request page
      navigate('/services/other');
    }
    
    // Update the form visibility when serviceId changes
    setShowCustomForm(serviceId === 'other');
  }, [serviceId, navigate]);

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
