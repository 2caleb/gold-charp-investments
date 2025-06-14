
import React from 'react';
import PremiumNavBar from './PremiumNavBar';
import Footer from './Footer';
import ChatWidget from '@/components/chat/ChatWidget';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <PremiumNavBar />
      
      {/* Main Content - Add top padding to account for fixed navbar */}
      <main className="flex-1 pt-16">
        {children}
      </main>
      
      <Footer />
      
      {/* AI Chatbot Widget */}
      <ChatWidget />
    </div>
  );
};

export default Layout;
