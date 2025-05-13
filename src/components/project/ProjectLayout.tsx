
import React from 'react';
import { cn } from '@/lib/utils';

interface ProjectLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const ProjectLayout = ({ children, className }: ProjectLayoutProps) => {
  return (
    <div className={cn("h-screen w-full flex flex-col bg-metrGray", className)}>
      {children}
    </div>
  );
};

export default ProjectLayout;
