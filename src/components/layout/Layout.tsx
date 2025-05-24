
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden transition-all duration-500">
      {/* Premium background overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 dark:from-gray-900/50 dark:via-indigo-900/50 dark:to-purple-900/50 pointer-events-none"></div>
      
      <Navbar />
      <main className="flex-grow relative w-full pt-16 z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
