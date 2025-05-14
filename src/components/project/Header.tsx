import React from 'react';
import { Button } from "@/components/ui/button";
import { Projet } from '@/types/metr';
import { downloadExcel } from '@/utils/excel-utils';

interface HeaderProps {
  projet: Projet | null;
  onNewProject: () => void;
}

const Header: React.FC<HeaderProps> = ({ projet, onNewProject }) => {
  return (
    <header className="bg-blue-600 text-white py-3 px-6 flex justify-between items-center shadow-md">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold">Metr</h1>
        {projet && (
          <span className="text-lg opacity-80">
            {projet.nom}
          </span>
        )}
      </div>
      <div className="flex space-x-3">
        <Button
          onClick={onNewProject}
          variant="outline"
          className="text-white border-white hover:bg-white hover:text-blue-600"
        >
          Nouveau projet
        </Button>
        {projet && (
          <Button 
            onClick={() => downloadExcel(projet)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Exporter Excel
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header; 