
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
      className="h-8 w-8 rounded-full bg-white border border-gray-200 shadow-sm"
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
