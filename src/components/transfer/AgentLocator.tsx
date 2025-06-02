
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Phone, Clock, Search, Navigation } from 'lucide-react';

interface AgentLocatorProps {
  agents: any[];
}

const AgentLocator: React.FC<AgentLocatorProps> = ({ agents }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const countries = [...new Set(agents.map(agent => agent.country))];

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         agent.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = selectedCountry === 'all' || agent.country === selectedCountry;
    return matchesSearch && matchesCountry;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Find Agent Locations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by location, agent name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agent List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAgents.map((agent) => (
          <Card key={agent.id} className="hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-start justify-between">
                <span className="flex-1">{agent.agent_name}</span>
                <Badge 
                  variant={agent.status === 'active' ? 'default' : 'secondary'}
                  className={agent.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                >
                  {agent.status}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{agent.city}, {agent.country}</p>
                    <p className="text-gray-600">{agent.address}</p>
                  </div>
                </div>

                {agent.phone_number && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{agent.phone_number}</span>
                  </div>
                )}

                {agent.operating_hours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{agent.operating_hours}</span>
                  </div>
                )}
              </div>

              {agent.services && agent.services.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Services:</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.services.map((service: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service.replace('_', ' ').toLowerCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Navigation className="h-4 w-4 mr-1" />
                  Directions
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAgents.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents found</h3>
            <p className="text-gray-600">
              Try adjusting your search criteria or check back later for new locations.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Agent Network Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{agents.length}+</div>
              <p className="text-gray-600">Agent Locations</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{countries.length}+</div>
              <p className="text-gray-600">Countries Served</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <p className="text-gray-600">Customer Support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AgentLocator;
