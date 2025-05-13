
import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ToggleMenuButtonProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

const ToggleMenuButton: React.FC<ToggleMenuButtonProps> = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute left-0 top-4"
      onClick={toggleSidebar}
    >
      {isSidebarOpen ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeftOpen className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ToggleMenuButton;
