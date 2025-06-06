
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Award, Clock, Users } from 'lucide-react';

const CoreValuesSection = () => {
  return (
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
  );
};

export default CoreValuesSection;
