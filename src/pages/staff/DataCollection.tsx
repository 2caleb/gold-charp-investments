
import React from 'react';
import Layout from '@/components/layout/Layout';
import DataCollectionButton from '@/components/loans/DataCollectionButton';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, FileText, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const DataCollection = () => {
  return (
    <Layout>
      <section className="bg-gray-50 dark:bg-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2 dark:text-white">
                Client Data Collection
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Collect and manage client information for loan processing
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <DataCollectionButton />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">128</div>
                <p className="text-xs text-gray-500 mt-1">+5 new this week</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                <FileText className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Monthly Loans</CardTitle>
                <ChartBar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">UGX 450M</div>
                <p className="text-xs text-gray-500 mt-1">+12% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Scheduled Visits</CardTitle>
                <Calendar className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">18</div>
                <p className="text-xs text-gray-500 mt-1">Next 7 days</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Applications Section */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Latest client applications submitted</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Application items would be dynamically loaded */}
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">John Mukasa</p>
                      <p className="text-sm text-gray-500">Business Loan - UGX 5,000,000</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Submitted
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">Sarah Nambi</p>
                      <p className="text-sm text-gray-500">Mortgage - UGX 25,000,000</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                      In Review
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">David Opio</p>
                      <p className="text-sm text-gray-500">Personal Loan - UGX 2,000,000</p>
                    </div>
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                      Approved
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <Link to="/loan-applications">
                    <Button variant="outline" size="sm" className="w-full">View All Applications</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for client management</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link to="/clients/new">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <Users className="min-w-4 h-4 mr-2" />
                      <span className="truncate">Add New Client</span>
                    </Button>
                  </Link>
                  <Link to="/loan-applications/new">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <FileText className="min-w-4 h-4 mr-2" />
                      <span className="truncate">New Loan Application</span>
                    </Button>
                  </Link>
                  <Link to="/clients">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <Users className="min-w-4 h-4 mr-2" />
                      <span className="truncate">View All Clients</span>
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full justify-start truncate h-auto py-2.5">
                      <ChartBar className="min-w-4 h-4 mr-2" />
                      <span className="truncate">View Dashboard</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default DataCollection;
