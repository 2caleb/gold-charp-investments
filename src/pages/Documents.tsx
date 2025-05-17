
import React from 'react';
import Layout from '@/components/layout/Layout';
import { FileText, FileSearch, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const Documents = () => {
  const { toast } = useToast();
  
  const showToast = () => {
    toast({
      title: "Document Feature",
      description: "This feature is coming soon. Check back later!",
    });
  };

  return (
    <Layout>
      <section className="bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 md:py-16 transition-all duration-500">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-10">
            <h1 className="text-3xl md:text-5xl font-serif font-bold mb-4 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-900 to-blue-700 dark:from-blue-400 dark:to-blue-200">
              Document Management
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl">
              View, upload and manage your loan-related documents in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>ID Documents</CardTitle>
                <CardDescription>National ID, passport, and other identification</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={showToast} className="w-full">View Documents</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <FileSearch className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Property Documents</CardTitle>
                <CardDescription>Land titles, property valuations, and related documents</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={showToast} className="w-full">View Documents</Button>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-all">
              <CardHeader>
                <FilePlus className="h-8 w-8 text-blue-600 mb-2" />
                <CardTitle>Upload New Documents</CardTitle>
                <CardDescription>Add new documents to your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={showToast} className="w-full">Upload Now</Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-gray-500">
              For assistance with documents, please contact support at 
              <a href="mailto:support@goldcharp.com" className="text-blue-600 ml-1 hover:underline">
                support@goldcharp.com
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Documents;
