import React, { useState } from 'react';
import { Ouvrage, Plan, Projet, Surface } from '@/types/metr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";
import { Search, Filter, Plus } from 'lucide-react';

interface LeftPanelProps {
  projet: Projet;
  selectedSurface: Surface | null;
  onAddOuvrage: (ouvrage: Ouvrage) => void;
  onRemoveOuvrage: (ouvrageId: string) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ projet, selectedSurface, onAddOuvrage, onRemoveOuvrage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  
  // Sample ouvrages library for demonstration
  const ouvragesLibrary: Omit<Ouvrage, 'id' | 'localisation'>[] = [
    { designation: "Carrelage grès cérame 60x60", lot: "Revêtements de sol", quantite: 0, unite: "m²", prix_unitaire: 45 },
    { designation: "Peinture acrylique mate", lot: "Peinture", quantite: 0, unite: "m²", prix_unitaire: 12 },
    { designation: "Doublage placoplâtre BA13", lot: "Plâtrerie", quantite: 0, unite: "m²", prix_unitaire: 28 },
    { designation: "Isolant laine de verre 100mm", lot: "Isolation", quantite: 0, unite: "m²", prix_unitaire: 18 },
    { designation: "Pose porte intérieure", lot: "Menuiseries", quantite: 0, unite: "u", prix_unitaire: 180 },
    { designation: "Pose fenêtre double vitrage", lot: "Menuiseries", quantite: 0, unite: "u", prix_unitaire: 350 }
  ];
  
  // Get unique lots from the library
  const uniqueLots = [...new Set(ouvragesLibrary.map(o => o.lot))];
  
  // Filter ouvrages based on search term and selected lot
  const filteredOuvrages = ouvragesLibrary.filter(ouvrage => {
    const matchesSearch = ouvrage.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLot = selectedLot ? ouvrage.lot === selectedLot : true;
    return matchesSearch && matchesLot;
  });
  
  // Add an ouvrage to the project
  const handleAddOuvrage = (ouvrageTemplate: Omit<Ouvrage, 'id' | 'localisation'>) => {
    const localisation = selectedSurface 
      ? { niveau: "Actuel", piece: selectedSurface.nom } 
      : { niveau: "RDC", piece: "Salon" };
    
    // Set the quantity based on surface area if applicable
    const quantite = selectedSurface && ouvrageTemplate.unite === "m²" 
      ? selectedSurface.superficie 
      : ouvrageTemplate.quantite || 1;
      
    const newOuvrage: Ouvrage = {
      ...ouvrageTemplate,
      id: `ouvrage-${Date.now()}`,
      quantite: quantite,
      localisation: localisation
    };
    
    onAddOuvrage(newOuvrage);
  };
  
  // Group project ouvrages by niveau and piece
  const groupedOuvrages: Record<string, Record<string, Ouvrage[]>> = {};
  
  projet.ouvrages.forEach(ouvrage => {
    const { niveau, piece } = ouvrage.localisation;
    
    if (!groupedOuvrages[niveau]) {
      groupedOuvrages[niveau] = {};
    }
    
    if (!groupedOuvrages[niveau][piece]) {
      groupedOuvrages[niveau][piece] = [];
    }
    
    groupedOuvrages[niveau][piece].push(ouvrage);
  });
  
  return (
    <div className="sidebar w-full flex flex-col h-full">
      <Tabs defaultValue="ouvrages" className="w-full">
        <TabsList className="grid grid-cols-2 mb-2">
          <TabsTrigger value="ouvrages">Ouvrages</TabsTrigger>
          <TabsTrigger value="bibliotheque">Bibliothèque</TabsTrigger>
        </TabsList>
        
        {/* Project Ouvrages Tab */}
        <TabsContent value="ouvrages" className="h-[calc(100vh-120px)] overflow-auto">
          <div className="p-2">
            <h2 className="text-lg font-semibold mb-2 text-blue-600">Ouvrages du projet</h2>
            
            {selectedSurface && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <h3 className="text-sm font-medium text-blue-600">Surface sélectionnée</h3>
                <p className="text-xs text-gray-600">{selectedSurface.nom} ({selectedSurface.superficie.toFixed(2)} {selectedSurface.unite})</p>
                <p className="text-xs text-gray-500 mt-1">Les ouvrages ajoutés seront associés à cette surface</p>
              </div>
            )}
            
            {Object.keys(groupedOuvrages).length > 0 ? (
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedOuvrages).map(([niveau, pieces]) => (
                  <AccordionItem key={niveau} value={niveau}>
                    <AccordionTrigger className="font-medium text-sm">
                      {niveau}
                    </AccordionTrigger>
                    <AccordionContent>
                      <Accordion type="multiple" className="pl-2">
                        {Object.entries(pieces).map(([piece, ouvrages]) => (
                          <AccordionItem key={piece} value={`${niveau}-${piece}`}>
                            <AccordionTrigger className="text-sm">{piece}</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {ouvrages.map(ouvrage => (
                                  <li key={ouvrage.id} className="bg-gray-50 p-2 rounded-md text-sm">
                                    <div className="flex justify-between items-start">
                                      <div>
                                        <p className="font-medium">{ouvrage.designation}</p>
                                        <p className="text-xs text-gray-500">{ouvrage.lot}</p>
                                        <div className="flex space-x-4 mt-1 text-xs">
                                          <span>{ouvrage.quantite} {ouvrage.unite}</span>
                                          <span>{ouvrage.prix_unitaire} €/{ouvrage.unite}</span>
                                          <span className="font-medium">{ouvrage.quantite * ouvrage.prix_unitaire} €</span>
                                        </div>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        className="h-6 w-6 p-0 text-red-500"
                                        onClick={() => onRemoveOuvrage(ouvrage.id)}
                                      >
                                        <span className="sr-only">Supprimer</span>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-gray-500 p-4 text-center">
                Aucun ouvrage ajouté. Sélectionnez une zone sur le plan et ajoutez des ouvrages depuis la bibliothèque.
              </p>
            )}
          </div>
        </TabsContent>
        
        {/* Library Tab */}
        <TabsContent value="bibliotheque" className="h-[calc(100vh-120px)] overflow-auto">
          <div className="p-2 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un ouvrage..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Filtrer par lot:</span>
              <select 
                className="text-sm border rounded p-1"
                value={selectedLot || ''}
                onChange={(e) => setSelectedLot(e.target.value || null)}
              >
                <option value="">Tous</option>
                {uniqueLots.map(lot => (
                  <option key={lot} value={lot}>{lot}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Ouvrages disponibles</h3>
              <ul className="space-y-2">
                {filteredOuvrages.map((ouvrage, index) => (
                  <li key={index} className="bg-white border rounded-md p-2 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{ouvrage.designation}</p>
                        <p className="text-xs text-gray-500">{ouvrage.lot}</p>
                        <p className="text-xs mt-1">{ouvrage.prix_unitaire} €/{ouvrage.unite}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 rounded-full bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => handleAddOuvrage(ouvrage)}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="sr-only">Ajouter</span>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeftPanel; 