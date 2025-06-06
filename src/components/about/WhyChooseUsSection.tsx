
import React from 'react';
import { CheckCircle } from 'lucide-react';

const WhyChooseUsSection = () => {
  return (
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
  );
};

export default WhyChooseUsSection;
