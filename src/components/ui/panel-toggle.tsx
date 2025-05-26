
import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PanelToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
  position?: 'left' | 'right';
  className?: string;
}

const PanelToggle: React.FC<PanelToggleProps> = ({
  isCollapsed,
  onToggle,
  position = 'left',
  className
}) => {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={cn(
        "w-8 h-8 p-0 bg-white border border-gray-200 shadow-sm hover:bg-gray-50",
        className
      )}
      title={isCollapsed ? "Ouvrir le panneau" : "Fermer le panneau"}
    >
      <div className="w-4 h-4 flex">
        <div className={cn(
          "w-2 h-4 border border-gray-400",
          position === 'left' ? (isCollapsed ? "bg-gray-400" : "bg-transparent") : "bg-transparent"
        )} />
        <div className={cn(
          "w-2 h-4 border-l-0 border border-gray-400",
          position === 'right' ? (isCollapsed ? "bg-gray-400" : "bg-transparent") : "bg-gray-400"
        )} />
      </div>
    </Button>
  );
};

export default PanelToggle;