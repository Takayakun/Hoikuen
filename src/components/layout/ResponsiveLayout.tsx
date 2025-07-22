'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from './Header';
import MobileNav from './MobileNav';

interface ResponsiveLayoutProps {
  children: ReactNode;
  showMobileNav?: boolean;
}

export default function ResponsiveLayout({ 
  children, 
  showMobileNav = true 
}: ResponsiveLayoutProps) {
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 px-6 py-8 md:px-12 md:py-12 lg:px-16 lg:py-16 ${
        currentUser && showMobileNav ? 'pb-28 md:pb-12 lg:pb-16' : ''
      }`}>
        {children}
      </main>
      
      {currentUser && showMobileNav && <MobileNav />}
    </div>
  );
}