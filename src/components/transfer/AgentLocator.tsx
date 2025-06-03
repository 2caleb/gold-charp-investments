
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Search,
  Navigation,
  Star,
  CheckCircle
} from 'lucide-react';

const AgentLocator = () => {
  const [searchLocation, setSearchLocation] = useState('');

  // Fetch transfer agents (should only be Nansana Heights now)
  const { data: agents, isLoading } = useQuery({
    queryKey: ['transfer-agents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transfer_agents')
        .select('*')
        .eq('status', 'active');
      
      if (error) {
        console.error('Error fetching agents:', error);
        return [];
      }
      return data || [];
    },
  });

  const filteredAgents = agents?.filter(agent => 
    agent.agent_name?.toLowerCase().includes(searchLocation.toLowerCase()) ||
    agent.city?.toLowerCase().includes(searchLocation.toLowerCase()) ||
    agent.country?.toLowerCase().includes(searchLocation.toLowerCase())
  ) || [];

  const supportedCountries = ['Uganda', 'USA', 'South Africa'];

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'cash_pickup':
        return '💵';
      case 'bank_transfer':
        return '🏦';
      case 'mobile_money':
        return '📱';
      default:
        return '💳';
    }
  };

  const getServiceLabel = (service: string) => {
    switch (service) {
      case 'cash_pickup':
        return 'Cash Pickup';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'mobile_money':
        return 'Mobile Money';
      default:
        return service;
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <MapPin className="mr-3 h-6 w-6 text-purple-600" />
              Find Our Agent Location
            </CardTitle>
            <p className="text-gray-600">
              Locate our authorized agent for cash pickup and money transfer services
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by location or agent name..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                <Navigation className="mr-2 h-4 w-4" />
                Get Directions
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Supported Countries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Countries We Serve</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {supportedCountries.map((country, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-4 py-2 bg-green-50 text-green-700 border-green-200"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {country}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              We currently serve these three countries with plans to expand to more locations soon.
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Agent Locations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {filteredAgents.length > 0 ? (
          filteredAgents.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full shadow-lg hover:shadow-xl transition-all duration-300 border-purple-100">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <MapPin className="mr-2 h-5 w-5" />
                    {agent.agent_name}
                  </CardTitle>
                  <Badge className="bg-white text-purple-600 w-fit">
                    <Star className="mr-1 h-3 w-3" />
                    Premium Location
                  </Badge>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <MapPin className="mr-3 h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">{agent.address}</p>
                        <p className="text-sm text-gray-600">{agent.city}, {agent.country}</p>
                      </div>
                    </div>

                    {agent.phone_number && (
                      <div className="flex items-center">
                        <Phone className="mr-3 h-5 w-5 text-green-600" />
                        <a 
                          href={`tel:${agent.phone_number}`}
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {agent.phone_number}
                        </a>
                      </div>
                    )}

                    {agent.email && (
                      <div className="flex items-center">
                        <Mail className="mr-3 h-5 w-5 text-blue-600" />
                        <a 
                          href={`mailto:${agent.email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {agent.email}
                        </a>
                      </div>
                    )}

                    {agent.operating_hours && (
                      <div className="flex items-center">
                        <Clock className="mr-3 h-5 w-5 text-orange-600" />
                        <span className="text-gray-700">{agent.operating_hours}</span>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {agent.services && Array.isArray(agent.services) && agent.services.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-gray-900 mb-3">Available Services</h4>
                      <div className="grid grid-cols-1 gap-2">
                        {agent.services.map((service, serviceIndex) => (
                          <div
                            key={serviceIndex}
                            className="flex items-center p-2 bg-gray-50 rounded-lg"
                          >
                            <span className="mr-3 text-lg">{getServiceIcon(service)}</span>
                            <span className="text-sm font-medium text-gray-700">
                              {getServiceLabel(service)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <Button 
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(agent.address + ', ' + agent.city + ', ' + agent.country)}`, '_blank')}
                    >
                      <Navigation className="mr-2 h-4 w-4" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <MapPin className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              {agents && agents.length === 0
                ? 'No agent locations are currently available.'
                : 'No agents match your search criteria. Try searching with different terms.'}
            </p>
          </div>
        )}
      </motion.div>

      {/* Quick Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">1</div>
                <p className="text-gray-700 font-medium">Agent Location</p>
                <p className="text-sm text-gray-600">Nansana Heights</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600 mb-2">3</div>
                <p className="text-gray-700 font-medium">Countries Served</p>
                <p className="text-sm text-gray-600">Uganda, USA, South Africa</p>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <p className="text-gray-700 font-medium">Customer Support</p>
                <p className="text-sm text-gray-600">Always here to help</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AgentLocator;
