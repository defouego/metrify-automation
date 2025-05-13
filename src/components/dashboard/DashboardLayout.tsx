
import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { SidebarProvider } from '@/hooks/useSidebar';
import ToggleMenuButton from '@/components/Bibliotheque/ToggleMenuButton';
import { useSidebar } from '@/hooks/useSidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayoutInner = ({ children }: DashboardLayoutProps) => {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-metrGray flex">
      {/* Sidebar */}
      <div className={`transition-all duration-300 ${isOpen ? 'w-64' : 'w-0'}`}>
        <Sidebar />
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col relative">
        {/* Toggle Sidebar Button */}
        <div className="absolute left-0 top-4 ml-4 z-10">
          <ToggleMenuButton />
        </div>
        
        {/* Top Navigation Bar */}
        <Topbar />
        
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
