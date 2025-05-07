
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Topbar = () => {
  // Format the current date in French
  const today = format(new Date(), "EEEE d MMMM yyyy", { locale: fr });
  // Capitalize the first letter
  const formattedToday = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm">
      <div>
        <h1 className="text-xl font-bold text-gray-800">Bienvenue John 👋</h1>
        <p className="text-sm text-gray-500">{formattedToday}</p>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
