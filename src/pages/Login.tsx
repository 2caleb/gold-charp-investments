
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const { login, isLoading, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // If user is already logged in, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to where they were trying to go, or to home page
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
      
      // Show welcome toast
      toast({
        title: `Welcome back, ${user?.user_metadata?.full_name || 'User'}!`,
        description: "You're now logged in",
      });
    }
  }, [isAuthenticated, navigate, location, user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(formData.email, formData.password);
  };

  return (
    <Layout>
      <div className="container max-w-md mx-auto px-4 py-10">
        <Card className="dark:border-gray-800 mb-6 transition-all duration-300 hover:shadow-lg animate-fade-in">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              <div className="flex justify-center items-center">
                <span className="text-3xl font-serif font-bold text-purple-700 dark:text-purple-400 transition-all duration-300 hover:scale-105">Gold<span className="text-amber-500">Charp</span></span>
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
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-purple-700 dark:text-purple-400 hover:underline transition-all duration-300 hover:text-purple-800 dark:hover:text-purple-300">
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
                  className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 transition-all duration-300 hover:shadow-md" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn size={16} />
                    Sign In
                  </span>
                )}
              </Button>
              <p className="text-sm text-center text-gray-600 dark:text-gray-400">
                Don't have an account?{" "}
                <Link to="/register" className="text-purple-700 dark:text-purple-400 hover:underline transition-all duration-300 hover:text-purple-800 dark:hover:text-purple-300">
                  Create account
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
