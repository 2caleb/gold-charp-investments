
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const PremiumNavBar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <div className="text-2xl font-bold text-blue-600">
            Gold Charp
          </div>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <button 
            onClick={() => navigate('/dashboard')}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/loan-applications')}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Applications
          </button>
          <button 
            onClick={() => navigate('/clients')}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Clients
          </button>
          <button 
            onClick={() => navigate('/workflow')}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Workflow
          </button>
          <button 
            onClick={() => navigate('/reports')}
            className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
          >
            Reports
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-gray-700 text-sm">
                Welcome, {user.email}
              </span>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="text-sm"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => navigate('/login')}
                className="text-sm"
              >
                Log in
              </Button>
              <Button
                onClick={() => navigate('/signup')}
                className="text-sm bg-blue-600 hover:bg-blue-700"
              >
                Sign up
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default PremiumNavBar;
