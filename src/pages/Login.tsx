
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LogIn, FileText, AlertTriangle } from 'lucide-react';
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
    inviteCode: '',
  });

  const [showInviteField, setShowInviteField] = useState(false);

  // Check if user has staff role
  const isStaff = () => {
    if (!user?.user_metadata?.role) return false;
    return ['field_officer', 'manager', 'director', 'ceo'].includes(user.user_metadata.role);
  };

  // If user is already logged in, redirect them
  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to where they were trying to go, or to home page
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showInviteField && formData.inviteCode !== 'GCIL2025') {
      // In a real app, this would validate against a database of valid invite codes
      toast({
        title: "Invalid Invite Code",
        description: "The invite code you entered is not valid.",
        variant: "destructive",
      });
      return;
    }
    
    await login(formData.email, formData.password);
  };

  const handleDataCollectionClick = () => {
    if (isAuthenticated && isStaff()) {
      navigate('/staff/data-collection');
    } else {
      toast({
        title: "Staff Access Only",
        description: "You need to login as a staff member to access this feature.",
        variant: "destructive",
      });
    }
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
              {showInviteField ? 
                "Staff login requires an invitation code" : 
                "Sign in to your Gold Charp Investments account"}
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
              
              {showInviteField && (
                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Staff Invitation Code</Label>
                  <Input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    required
                    value={formData.inviteCode}
                    onChange={handleChange}
                    className="dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <div className="flex items-start text-xs text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0 mt-0.5" />
                    <span>Staff access is by invitation only. Contact administration if you need an invite code.</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-end">
                <button 
                  type="button"
                  onClick={() => setShowInviteField(!showInviteField)}
                  className="text-xs text-purple-700 dark:text-purple-400 hover:underline"
                >
                  {showInviteField ? "Regular user login" : "Staff login"}
                </button>
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
        
        {/* Staff Tools Section - Only show if we're in staff login mode */}
        {showInviteField && (
          <div className="my-8 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-center">Staff Tools</h2>
            <div className="flex justify-center">
              <Button 
                onClick={handleDataCollectionClick}
                variant="outline" 
                className="flex items-center gap-2 border-purple-700 text-purple-700 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-950/50"
              >
                <FileText size={16} />
                Client Data Collection
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Login;
