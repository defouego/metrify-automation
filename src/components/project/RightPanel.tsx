import React, { useState, useRef } from 'react';
import { Ouvrage, Projet, Surface } from '@/types/metr';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { 
  Tabs, 
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { downloadExcel } from '@/utils/excel-utils';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface RightPanelProps {
  projet: Projet;
  onElementHover: (elementId: string | null) => void;
  selectedSurface: Surface | null;
  setSelectedSurface: React.Dispatch<React.SetStateAction<Surface | null>>;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  projet, 
  onElementHover, 
  selectedSurface, 
  setSelectedSurface 
}) => {
  const [viewType, setViewType] = useState<'byLot' | 'byLocation' | 'bySurface'>('byLot');
  const [editingSurface, setEditingSurface] = useState<Surface | null>(null);
  const [editedSuperficie, setEditedSuperficie] = useState<number>(0);
  const [editingOuvrage, setEditingOuvrage] = useState<string | null>(null);
  const [editedQuantite, setEditedQuantite] = useState<number>(0);
  const [editedPrix, setEditedPrix] = useState<number>(0);
  const [editedCoefficient, setEditedCoefficient] = useState<number>(1);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  // Calculate total cost of all ouvrages
  const totalProjetCost = projet.ouvrages.reduce(
    (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
    0
  );
  
  // Calculate the cost of an ouvrage considering coefficient
  function calculateOuvrageCost(ouvrage: Ouvrage): number {
    return ouvrage.quantite * ouvrage.prix_unitaire * (ouvrage.coefficient || 1);
  }
  
  // Group ouvrages by lot and subCategory
  const ouvragesByLot = projet.ouvrages.reduce<Record<string, Record<string, Ouvrage[]>>>(
    (grouped, ouvrage) => {
      const { lot, subCategory } = ouvrage;
      
      if (!grouped[lot]) {
        grouped[lot] = {};
      }
      
      if (!grouped[lot][subCategory]) {
        grouped[lot][subCategory] = [];
      }
      
      grouped[lot][subCategory].push(ouvrage);
      return grouped;
    },
    {}
  );
  
  // Group ouvrages by location (niveau + piece)
  const ouvragesByLocation = projet.ouvrages.reduce<Record<string, Ouvrage[]>>(
    (grouped, ouvrage) => {
      const location = `${ouvrage.localisation.niveau} - ${ouvrage.localisation.piece}`;
      
      if (!grouped[location]) {
        grouped[location] = [];
      }
      
      grouped[location].push(ouvrage);
      return grouped;
    },
    {}
  );

  // Group ouvrages by surface
  const ouvragesBySurface: Record<string, { surface: Surface, ouvrages: Ouvrage[] }> = {};
  
  if (projet.surfaces) {
    projet.surfaces.forEach(surface => {
      const surfaceOuvrages = projet.ouvrages.filter(ouvrage => 
        surface.ouvragesIds.includes(ouvrage.id)
      );
      
      if (surfaceOuvrages.length > 0) {
        ouvragesBySurface[surface.id] = {
          surface,
          ouvrages: surfaceOuvrages
        };
      }
    });
  }
  
  // Calculate subtotals for locations
  const locationSubtotals = Object.entries(ouvragesByLocation).map(
    ([location, ouvrages]) => ({
      location,
      subtotal: ouvrages.reduce(
        (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
        0
      )
    })
  );
  
  // Calculate subtotals for lots and subcategories
  const lotSubtotals = Object.entries(ouvragesByLot).map(
    ([lot, subCategories]) => {
      const lotTotal = Object.values(subCategories).reduce(
        (total, ouvrages) => total + ouvrages.reduce(
          (subTotal, ouvrage) => subTotal + calculateOuvrageCost(ouvrage),
          0
        ),
        0
      );
      
      return {
        lot,
        subtotal: lotTotal,
        subCategoryTotals: Object.entries(subCategories).map(
          ([subCategory, ouvrages]) => ({
            subCategory,
            subtotal: ouvrages.reduce(
              (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
              0
            )
          })
        )
      };
    }
  );

  // Calculate subtotals for surfaces
  const surfaceSubtotals = Object.entries(ouvragesBySurface).map(
    ([id, { surface, ouvrages }]) => ({
      id,
      surface,
      subtotal: ouvrages.reduce(
        (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
        0
      )
    })
  );
  
  // Format numbers with 2 decimal places and euro symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  // Handle hovering over an ouvrage
  const handleOuvrageHover = (ouvrage: Ouvrage | null) => {
    if (ouvrage && ouvrage.surfaceId) {
      // Find the surface to get the pieceId to highlight
      const surface = projet.surfaces?.find(s => s.id === ouvrage.surfaceId);
      if (surface) {
        onElementHover(surface.pieceId);
      }
    } else {
      onElementHover(null);
    }
  };

  // Start editing a surface
  const handleStartEditingSurface = (surface: Surface) => {
    setEditingSurface(surface);
    setEditedSuperficie(surface.superficie);
  };

  // Save edited surface
  const handleSaveEditedSurface = () => {
    if (!editingSurface || !projet.surfaces) return;
    
    const updatedSurfaces = projet.surfaces.map(s => 
      s.id === editingSurface.id 
        ? { ...s, superficie: editedSuperficie, modified: true } 
        : s
    );
    
    // Not implemented in this demo: update the projet with new surfaces
    // In a real app, you would call an API or update state here
    
    toast.success(`Surface modifiée : ${editedSuperficie.toFixed(2)} ${editingSurface.unite}`);
    
    // If the selected surface is being edited, update it
    if (selectedSurface?.id === editingSurface.id) {
      setSelectedSurface({
        ...selectedSurface,
        superficie: editedSuperficie,
        modified: true
      });
    }
    
    // Close editing
    setEditingSurface(null);
  };

  // Start editing an ouvrage
  const handleStartEditingOuvrage = (ouvrage: Ouvrage) => {
    setEditingOuvrage(ouvrage.id);
    setEditedQuantite(ouvrage.quantite);
    setEditedPrix(ouvrage.prix_unitaire);
    setEditedCoefficient(ouvrage.coefficient || 1);
  };

  // Save edited ouvrage
  const handleSaveEditedOuvrage = (ouvrageId: string) => {
    if (!editingOuvrage) return;
    
    // Not implemented in this demo: update the projet with new ouvrage values
    // In a real app, you would call an API or update state here
    
    toast.success("Ouvrage modifié avec succès");
    
    // Close editing
    setEditingOuvrage(null);
  };

  // Cancel editing
  const handleCancelEditing = () => {
    setEditingSurface(null);
    setEditingOuvrage(null);
  };

  // Handle resizing the right panel
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (rightPanelRef.current) {
      const newWidth = window.innerWidth - e.clientX;
      rightPanelRef.current.style.width = `${Math.max(300, Math.min(600, newWidth))}px`;
    }
  };

  const handleMouseUp = () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };
  
  return (
    <div ref={rightPanelRef} className="bg-white border-l border-gray-200 flex flex-col h-full relative">
      {/* Resize handle */}
      <div 
        className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-blue-400 z-10"
        onMouseDown={handleMouseDown}
      ></div>

      <div className="p-4 border-b">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-semibold text-primary">Métré</h2>
          <Button
            size="sm"
            onClick={() => downloadExcel(projet)}
            className="bg-orange-500 hover:bg-orange-600 text-white h-8 text-xs"
          >
            Exporter Excel
          </Button>
        </div>
        <div className="bg-gray-50 p-3 rounded-md">
          <p className="text-sm text-gray-600">Total projet</p>
          <p className="text-xl font-semibold">{formatPrice(totalProjetCost)}</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="byLot" className="w-full" onValueChange={(v) => setViewType(v as any)}>
          <div className="px-4 pt-4">
            <TabsList className="grid grid-cols-3 mb-2">
              <TabsTrigger value="byLot">Par Lot</TabsTrigger>
              <TabsTrigger value="byLocation">Par Local</TabsTrigger>
              <TabsTrigger value="bySurface">Par Surface</TabsTrigger>
            </TabsList>
          </div>
          
          {/* By Lot View with Accordion */}
          <TabsContent value="byLot" className="p-4 pt-0">
            <div className="overflow-auto">
              <Accordion type="multiple" className="w-full">
                {Object.entries(ouvragesByLot).map(([lot, subCategories]) => {
                  const lotTotal = lotSubtotals.find(l => l.lot === lot)?.subtotal || 0;
                  
                  return (
                    <AccordionItem key={lot} value={lot} className="border px-2 rounded-md mb-2">
                      <AccordionTrigger className="py-2 hover:bg-gray-50 rounded-t-md">
                        <div className="flex justify-between w-full items-center">
                          <span className="font-medium text-left">{lot}</span>
                          <span className="text-sm font-medium text-right">{formatPrice(lotTotal)}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <Accordion type="multiple" className="w-full">
                          {Object.entries(subCategories).map(([subCategory, ouvrages]) => {
                            const subCategoryTotal = ouvrages.reduce(
                              (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
                              0
                            );
                            
                            return (
                              <AccordionItem key={`${lot}-${subCategory}`} value={`${lot}-${subCategory}`} className="border-t-0 border-x-0 last:border-b-0">
                                <AccordionTrigger className="py-1 px-2 hover:bg-gray-50">
                                  <div className="flex justify-between w-full items-center">
                                    <span className="font-normal text-sm text-left">{subCategory}</span>
                                    <span className="text-sm text-right">{formatPrice(subCategoryTotal)}</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <Table>
                                    <TableHeader>
                                      <TableRow className="hover:bg-transparent h-7">
                                        <TableHead className="text-xs font-medium">Désignation</TableHead>
                                        <TableHead className="text-xs font-medium w-20">Quantité</TableHead>
                                        <TableHead className="text-xs font-medium text-right w-20">Prix</TableHead>
                                        <TableHead className="text-xs font-medium text-right w-20">Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {ouvrages.map(ouvrage => (
                                        <TableRow 
                                          key={ouvrage.id}
                                          onMouseEnter={() => handleOuvrageHover(ouvrage)}
                                          onMouseLeave={() => handleOuvrageHover(null)}
                                          className="hover:bg-gray-50 cursor-pointer h-7"
                                        >
                                          <TableCell className="py-1 text-xs">
                                            {ouvrage.designation}
                                          </TableCell>
                                          <TableCell className="py-1 text-xs">
                                            {editingOuvrage === ouvrage.id ? (
                                              <Input 
                                                type="number"
                                                value={editedQuantite}
                                                onChange={(e) => setEditedQuantite(parseFloat(e.target.value) || 0)}
                                                className="w-14 h-6 text-xs"
                                                min={0}
                                                step={0.01}
                                              />
                                            ) : (
                                              <span onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                                                {ouvrage.quantite} {ouvrage.unite}
                                              </span>
                                            )}
                                          </TableCell>
                                          <TableCell className="py-1 text-xs text-right">
                                            {editingOuvrage === ouvrage.id ? (
                                              <Input 
                                                type="number"
                                                value={editedPrix}
                                                onChange={(e) => setEditedPrix(parseFloat(e.target.value) || 0)}
                                                className="w-14 h-6 text-xs ml-auto"
                                                min={0}
                                                step={0.01}
                                              />
                                            ) : (
                                              <span onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                                                {ouvrage.prix_unitaire} €
                                              </span>
                                            )}
                                          </TableCell>
                                          <TableCell className="py-1 text-xs text-right">
                                            {editingOuvrage === ouvrage.id ? (
                                              <div className="flex items-center justify-end gap-1">
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-5 w-5 text-green-600"
                                                  onClick={() => handleSaveEditedOuvrage(ouvrage.id)}
                                                >
                                                  <Save size={12} />
                                                </Button>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-5 w-5 text-red-600"
                                                  onClick={handleCancelEditing}
                                                >
                                                  <X size={12} />
                                                </Button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-end gap-1">
                                                <span className="font-medium">
                                                  {formatPrice(calculateOuvrageCost(ouvrage))}
                                                </span>
                                                <Button
                                                  size="icon"
                                                  variant="ghost"
                                                  className="h-5 w-5 text-gray-400 hover:text-primary opacity-0 group-hover:opacity-100"
                                                  onClick={() => handleStartEditingOuvrage(ouvrage)}
                                                >
                                                  <Edit2 size={10} />
                                                </Button>
                                              </div>
                                            )}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                      <TableRow className="bg-gray-50 h-7">
                                        <TableCell colSpan={3} className="py-1 text-xs font-medium">Sous-total {subCategory}</TableCell>
                                        <TableCell className="py-1 text-xs font-semibold text-right">
                                          {formatPrice(subCategoryTotal)}
                                        </TableCell>
                                      </TableRow>
                                    </TableBody>
                                  </Table>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                          <TableRow className="bg-blue-50 h-8">
                            <TableCell colSpan={3} className="py-1 text-sm font-medium">Total {lot}</TableCell>
                            <TableCell className="py-1 text-sm font-semibold text-right">
                              {formatPrice(lotTotal)}
                            </TableCell>
                          </TableRow>
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
              
              <div className="mt-4 p-3 bg-blue-100 rounded-md flex justify-between items-center">
                <span className="font-semibold">TOTAL PROJET</span>
                <span className="font-semibold text-lg">{formatPrice(totalProjetCost)}</span>
              </div>
            </div>
          </TabsContent>

          {/* Other tabs could be implemented similarly */}
          <TabsContent value="byLocation" className="p-4 pt-0">
            <div className="overflow-auto">
              {/* Similar structure to byLot but organized by location */}
              <p className="text-sm text-gray-500 italic">Affichage par local à implémenter</p>
            </div>
          </TabsContent>
          
          <TabsContent value="bySurface" className="p-4 pt-0">
            <div className="overflow-auto">
              {/* Similar structure to byLot but organized by surface */}
              <p className="text-sm text-gray-500 italic">Affichage par surface à implémenter</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RightPanel;
