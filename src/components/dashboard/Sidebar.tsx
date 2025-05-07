
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, BookOpen, HelpCircle, Settings, ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const Sidebar = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  
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
      "h-screen bg-metrBlue text-white flex flex-col transition-all duration-300",
      collapsed ? "w-20" : "w-64"
    )}>
      {/* Logo */}
      <div className={cn(
        "flex items-center justify-center h-20 border-b border-white/10",
        collapsed ? "px-2" : "px-4"
      )}>
        {collapsed ? (
          <div className="text-2xl font-bold">M.</div>
        ) : (
          <div className="text-2xl font-bold">Metr<span className="text-metrOrange">.</span></div>
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
                collapsed ? "justify-center" : ""
              )}
            >
              <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-3")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className={cn(
        "p-4 border-t border-white/10",
        collapsed ? "items-center justify-center" : ""
      )}>
        <div className={cn(
          "flex items-center",
          collapsed ? "justify-center" : "justify-between"
        )}>
          <div className={cn(
            "flex items-center",
            collapsed ? "justify-center" : ""
          )}>
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="ml-3">
                <div className="text-sm font-medium">John Doe</div>
                <div className="text-xs text-white/60">Admin</div>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <button className="rounded-full p-1 hover:bg-white/10">
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
      
      {/* Collapse button */}
      <button 
        className="absolute top-[calc(50%-20px)] -right-4 h-8 w-8 bg-metrBlue text-white rounded-full flex items-center justify-center shadow-md border border-white/10"
        onClick={() => setCollapsed(!collapsed)}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </button>
    </aside>
  );
};

export default Sidebar;
