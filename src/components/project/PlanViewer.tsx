
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface PlanViewerProps {
  projectId?: string;
}

const PlanViewer = ({ projectId }: PlanViewerProps) => {
  const [scale, setScale] = useState(1);
  
  // Mock function to represent what would be done by the external plan rendering service
  const renderPlan = () => {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Visualisation du Plan</h3>
          <p className="text-gray-500 mb-4">
            {projectId ? `Projet ID: ${projectId}` : 'Aucun projet sélectionné'}
          </p>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 bg-gray-50">
            <p className="text-gray-400">
              Le rendu graphique du plan sera intégré ici.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              (Composant externe à intégrer)
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={cn(
      "flex-1 relative overflow-hidden", 
      "bg-gray-100"
    )}>
      {renderPlan()}
      
      {/* Tooltip de démonstration */}
      <div 
        className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 
                  bg-white p-2 rounded-md shadow-md border border-gray-200 opacity-0 hover:opacity-100
                  transition-opacity duration-200 pointer-events-none"
      >
        <p className="text-sm font-medium">Mur Nord</p>
        <p className="text-xs text-gray-500">L: 4.50m - H: 2.80m</p>
      </div>
      
      {/* Éléments de sélection de démonstration */}
      <div 
        className="absolute left-1/3 top-1/2 w-24 h-24 border-2 border-blue-500 bg-blue-100/20 
                  rounded-sm pointer-events-none"
      ></div>
      
      <div 
        className="absolute right-1/3 top-2/3 w-16 h-32 border-2 border-yellow-500 bg-yellow-100/20 
                  rounded-sm pointer-events-none"
      ></div>
    </div>
  );
};

export default PlanViewer;
