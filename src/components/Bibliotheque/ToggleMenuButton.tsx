
import React from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/hooks/useSidebar';

const ToggleMenuButton: React.FC = () => {
  const { isOpen, toggle } = useSidebar();
  
  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute top-1/2 -right-4 h-8 w-8 rounded-full transform -translate-y-1/2 bg-white border border-gray-200 shadow-sm"
      onClick={toggle}
      aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
    >
      {isOpen ? (
        <PanelLeftClose className="h-4 w-4" />
      ) : (
        <PanelLeftOpen className="h-4 w-4" />
      )}
    </Button>
  );
};

export default ToggleMenuButton;
