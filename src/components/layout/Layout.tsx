
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden transition-all duration-500">
      <Navbar />
      <main className="flex-grow relative w-full pt-16 z-10">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
