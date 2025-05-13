
import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider } from '@/hooks/useSidebar';
import ToggleMenuButton from '@/components/Bibliotheque/ToggleMenuButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutInner = ({ children }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen bg-metrGray flex">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Top Navigation Bar */}
        <Topbar />
        
        {/* Toggle Sidebar Button - Positioned under the top bar */}
        <div className="absolute left-0 top-16 ml-4 z-10">
          <ToggleMenuButton />
        </div>
        
        {/* Main Content Area */}
        <main className="flex-1 px-6 py-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <DashboardLayoutInner>{children}</DashboardLayoutInner>
    </SidebarProvider>
  );
};

export default DashboardLayout;
