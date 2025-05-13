
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BookOpen, HelpCircle, Settings, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/useSidebar';

const Sidebar = () => {
  const location = useLocation();
  const { isOpen } = useSidebar();
  
  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Tableau de bord', 
      path: '/dashboard',
      active: location.pathname === '/dashboard'
    },
    { 
      icon: FolderKanban, 
      label: 'Projets', 
      path: '/projects',
      active: location.pathname === '/projects'
    },
    { 
      icon: BookOpen, 
      label: 'Bibliothèque', 
      path: '/library',
      active: location.pathname === '/library'
    },
    { 
      icon: HelpCircle, 
      label: 'Aide', 
      path: '/help',
      active: location.pathname === '/help'
    },
    { 
      icon: Settings, 
      label: 'Paramètres', 
      path: '/settings',
      active: location.pathname === '/settings'
    }
  ];

  return (
    <aside className={cn(
      "h-screen bg-metrBlue text-white flex flex-col transition-all duration-300 relative",
      isOpen ? "w-64" : "w-20"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center justify-center h-20 border-b border-white/10",
        isOpen ? "px-4" : "px-2"
      )}>
        {isOpen ? (
          <div className="text-2xl font-bold">Metr<span className="text-metrOrange">.</span></div>
        ) : (
          <div className="text-2xl font-bold">M<span className="text-metrOrange">.</span></div>
        )}
      </div>
      
      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="px-3 space-y-1">
          {menuItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center py-3 px-4 rounded-lg transition-all",
                item.active 
                  ? "bg-white/10 text-white" 
                  : "text-white/70 hover:bg-white/5 hover:text-white",
                !isOpen ? "justify-center" : ""
              )}
            >
              <item.icon className={cn("h-5 w-5", !isOpen ? "" : "mr-3")} />
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className={cn(
        "p-4 border-t border-white/10",
        !isOpen ? "items-center justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center",
          !isOpen ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center",
            !isOpen ? "justify-center" : ""
          )}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            {isOpen && (
              <div className="ml-3">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-white/60">Admin</div>
              </div>
            )}
          </div>
          
          {isOpen && (
            <button className="rounded-full p-1 hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
