
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

// Mock data for associated ouvrages
const mockAssociations = [
  { 
    id: '1', 
    elementType: 'Mur', 
    elementId: 'mur-123',
    ouvrage: { 
      designation: 'Peinture murs', 
      unite: 'M2', 
      prix: 18 
    },
    quantite: 25.6,
    dimension: 'L: 8.00m x H: 3.20m'
  },
  { 
    id: '2', 
    elementType: 'Fenêtre', 
    elementId: 'fenetre-456',
    ouvrage: { 
      designation: 'Fenêtre standard', 
      unite: 'U', 
      prix: 450 
    },
    quantite: 2,
    dimension: '120cm x 90cm'
  },
  { 
    id: '3', 
    elementType: 'Sol', 
    elementId: 'sol-789',
    ouvrage: { 
      designation: 'Carrelage sol', 
      unite: 'M2', 
      prix: 65 
    },
    quantite: 32.5,
    dimension: 'Surface: 32.5m²'
  }
];

const groupByOuvrage = (associations: typeof mockAssociations) => {
  return associations.reduce((groups, item) => {
    const key = item.ouvrage.designation;
    if (!groups[key]) {
      groups[key] = {
        designation: item.ouvrage.designation,
        unite: item.ouvrage.unite,
        prix: item.ouvrage.prix,
        elements: [],
        total: 0
      };
    }
    groups[key].elements.push(item);
    groups[key].total += item.quantite;
    return groups;
  }, {} as Record<string, { 
    designation: string; 
    unite: string; 
    prix: number; 
    elements: typeof mockAssociations; 
    total: number 
  }>);
};

const AssociationsPanel = () => {
  const groupedAssociations = groupByOuvrage(mockAssociations);

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold">Ouvrages associés</h2>
        <p className="text-sm text-gray-500">Éléments mesurés et quantifiés</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4">
          {Object.values(groupedAssociations).map((group, index) => (
            <div key={index} className="mb-6">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-medium">{group.designation}</h3>
                  <p className="text-sm text-gray-500">Total: {group.total} {group.unite}</p>
                  <p className="text-xs text-metrOrange font-medium">
                    {(group.total * group.prix).toLocaleString('fr-FR')} €
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mt-2">
                {group.elements.map(item => (
                  <div 
                    key={item.id} 
                    className="bg-gray-50 p-2 rounded-md border border-gray-100"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">{item.elementType}</p>
                        <p className="text-xs text-gray-500">{item.dimension}</p>
                        <p className="text-xs font-medium">{item.quantite} {group.unite}</p>
                      </div>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {index < Object.values(groupedAssociations).length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default AssociationsPanel;
