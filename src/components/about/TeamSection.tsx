
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const TeamSection = () => {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Leadership Team</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Meet the experienced professionals who guide our company's vision and operations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
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

          <div className="text-center">
            <div className="mb-4">
              <Avatar className="w-40 h-40 mx-auto">
                <AvatarImage src="/lovable-uploads/c656d13a-aa85-490b-90d0-99af1b33c945.png" alt="Ronald Mutebi" className="object-cover" />
                <AvatarFallback className="bg-purple-100 text-purple-700 text-4xl">RM</AvatarFallback>
              </Avatar>
            </div>
            <h3 className="text-xl font-bold">Ronald Mutebi</h3>
            <p className="text-purple-700 font-medium mb-2">Chairman of the Board</p>
            <p className="text-gray-600 max-w-xs mx-auto">
              Ronald provides strategic leadership and governance oversight, bringing decades of business expertise to guide our long-term vision.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
