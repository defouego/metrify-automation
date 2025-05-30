
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
        className="absolute top-4 left-5 z-20 text-2xl font-bold text-white flex items-center"
      >
        Metr<span className="text-metrOrange ml-1">.</span>
      </Link>
      
      {children}
    </div>
  );
};

export default ProjectLayout;
