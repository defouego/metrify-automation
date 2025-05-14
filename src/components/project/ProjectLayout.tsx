
import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface ProjectLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ProjectLayout = ({ children, className }: ProjectLayoutProps) => {
  return (
    <div className={cn("h-screen w-full flex flex-col bg-white", className)}>
      {/* Metr Logo in top left for quick navigation */}
      <Link 
        to="/dashboard" 
        className="absolute top-3 left-4 z-10 text-2xl font-bold text-blue-600"
      >
        M<span className="text-orange-500">.</span>
      </Link>
      
      {children}
    </div>
  );
};

export default ProjectLayout;
