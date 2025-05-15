// src/components/project/Header.tsx
import React, { useState } from 'react';
import { Projet } from '@/types/metr';
import { downloadExcel } from '@/utils/excel-utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

interface HeaderProps {
  projet: Projet | null;
  onNewProject: () => void;
}

const Header: React.FC<HeaderProps> = ({ projet, onNewProject }) => {
  // Pour appliquer la classe active quand le menu est ouvert
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-metrBlue text-white h-16 px-6 flex items-center justify-between shadow-md">
      {/* Logo + titre */}
      <div className="flex items-center space-x-4">
        <span className="text-2xl font-bold">
          <span className="text-metrOrange ml-1"></span>
        </span>
        {projet && (
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-xl font-semibold ml-4">{projet.nom}</h1>
        </div>
        )}
      </div>

      {/* Roue de paramètres sans cadre, avec overlay */}
      <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={
              menuOpen
                ? "bg-white/10 text-white p-2 rounded"
                : "text-white/70 hover:bg-white/5 hover:text-white p-2 rounded"
            }
          >
            <Settings className="h-5 w-5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onNewProject}>
            Nouveau projet
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {projet && (
            <DropdownMenuItem onClick={() => downloadExcel(projet)}>
              Exporter Excel
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
};

export default Header;
