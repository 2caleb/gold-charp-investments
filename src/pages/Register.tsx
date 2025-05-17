
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Register = () => {
  const { register, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // If user is already logged in, redirect to home
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Error",
        description: "Passwords don't match",
        variant: "destructive"
      });
      return;
    }
    
    await register({
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      phone: formData.phone
    });
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-16">
        <Card className="dark:border-gray-800 transition-all duration-300 hover:shadow-lg animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
              <UserPlus className="h-6 w-6 text-purple-700" />
            </div>
            <CardTitle className="text-2xl">Create an Account</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Join Gold Charp Investments to access our services
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  placeholder="John Mukasa"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300"
                />
              </div>
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
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+256 700 123456"
                  value={formData.phone}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={16} />
                    Create Account
                  </span>
                )}
              </Button>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Already have an account?{" "}
                <Link to="/login" className="text-purple-700 dark:text-purple-400 hover:underline transition-all duration-300">
                  Sign in
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
