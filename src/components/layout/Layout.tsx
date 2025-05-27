
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import DesktopNav from './DesktopNav';

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex flex-col min-h-screen max-w-full overflow-x-hidden transition-all duration-500">
      <Navbar />
      <div className="flex flex-1">
        <DesktopNav />
        <main className="flex-grow relative w-full pt-16 md:ml-64 z-10">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
