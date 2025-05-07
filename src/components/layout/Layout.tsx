
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar />
      <main className="flex-grow relative">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
