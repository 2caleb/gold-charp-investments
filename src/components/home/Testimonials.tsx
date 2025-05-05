
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "First-time Homebuyer",
    content: "PropelWealth made buying my first home so much easier than I expected. Their team guided me through every step and helped me secure a mortgage that fit my budget perfectly.",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"
  },
  {
    id: 2,
    name: "Michael Rodriguez",
    role: "Property Investor",
    content: "I've worked with many real estate companies, but none have matched the expertise and service level of PropelWealth. Their investment property recommendations have consistently exceeded my ROI expectations.",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"
  },
  {
    id: 3,
    name: "Emily Chang",
    role: "Homeowner",
    content: "Refinancing our home through PropelWealth saved us hundreds of dollars every month. Their team found us a much better rate than we thought possible, and the process was surprisingly quick.",
    image: "https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=500&h=500&q=80"
  }
];

const Testimonials = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Don't just take our word for it. Hear from our satisfied clients who have achieved their real estate dreams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <blockquote className="mb-4">
                    <p className="text-gray-700 italic">"{testimonial.content}"</p>
                  </blockquote>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
