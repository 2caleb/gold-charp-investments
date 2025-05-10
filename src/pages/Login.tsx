
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import DataCollectionButton from '@/components/loans/DataCollectionButton';

const Login = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: 'mwesigwacaleb001@gmail.com',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate login attempt
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Login Successful",
        description: "Welcome back to Gold Charp Investments Limited.",
      });
    }, 1500);
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-10">
        <Card className="dark:border-gray-800 mb-6">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="flex justify-center items-center">
                <span className="text-3xl font-serif font-bold text-purple-700 dark:text-purple-400">Gold<span className="text-amber-500">Charp</span></span>
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Sign in to your Gold Charp Investments account
            </CardDescription>
            <div className="text-xs text-center mt-2 text-gray-500 dark:text-gray-400">
              Our story started in 2025
            </div>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-purple-700 dark:text-purple-400 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:border-gray-700"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700" 
                disabled={isLoading}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-purple-700 dark:text-purple-400 hover:underline">
                  Create account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
        
        {/* Data Collection Section */}
        <div className="my-8">
          <h2 className="text-xl font-bold mb-4 text-center">Field Staff Tools</h2>
          <div className="flex justify-center">
            <DataCollectionButton />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
