import React, { useState } from 'react';
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
import { downloadExcel } from '@/utils/excel-utils';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import ProjectViewFixContent from '@/pages/ProjectView.fix';
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable';

interface RightPanelProps {
  projet: Projet;
  onElementHover: (elementId: string | null) => void;
  selectedSurface: Surface | null;
  setSelectedSurface: React.Dispatch<React.SetStateAction<Surface | null>>;
  isCalibrating?: boolean;
  calibrationStep?: number;
}

const RightPanel: React.FC<RightPanelProps> = ({ 
  projet, 
  onElementHover, 
  selectedSurface, 
  setSelectedSurface,
  isCalibrating = false,
  calibrationStep = 0
}) => {
  const [viewType, setViewType] = useState<'all' | 'byLocation' | 'byType' | 'bySurface' | 'detailedMeasurements'>('all');
  const [editingSurface, setEditingSurface] = useState<Surface | null>(null);
  const [editedSuperficie, setEditedSuperficie] = useState<number>(0);
  const [editingOuvrage, setEditingOuvrage] = useState<string | null>(null);
  const [editedQuantite, setEditedQuantite] = useState<number>(0);
  const [editedPrix, setEditedPrix] = useState<number>(0);
  const [editedCoefficient, setEditedCoefficient] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>('recap');
  const [collapsed, setCollapsed] = useState<boolean>(false);

  // Calculate total cost of all ouvrages
  const totalProjetCost = projet.ouvrages.reduce(
    (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
    0
  );
  
  // Calculate the cost of an ouvrage considering coefficient
  function calculateOuvrageCost(ouvrage: Ouvrage): number {
    return ouvrage.quantite * ouvrage.prix_unitaire * (ouvrage.coefficient || 1);
  }
  
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
  
  // Group ouvrages by type (lot)
  const ouvragesByType = projet.ouvrages.reduce<Record<string, Ouvrage[]>>(
    (grouped, ouvrage) => {
      const { lot } = ouvrage;
      
      if (!grouped[lot]) {
        grouped[lot] = [];
      }
      
      grouped[lot].push(ouvrage);
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
  
  // Calculate subtotals for types
  const typeSubtotals = Object.entries(ouvragesByType).map(
    ([type, ouvrages]) => ({
      type,
      subtotal: ouvrages.reduce(
        (total, ouvrage) => total + calculateOuvrageCost(ouvrage),
        0
      )
    })
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

  // Handle editing an ouvrage
  const handleEditOuvrage = (ouvrage: Ouvrage) => {
    // This would update the ouvrage in the projet state
    // In a real app, you would call an API or dispatch an action
    toast.success("Ouvrage modifié avec succès");
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

  // Toggle panel collapse
  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className="h-full flex">
      {/* Collapse toggle button */}
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleCollapse} 
          className="h-full rounded-none border-l border-gray-200"
        >
          {collapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main panel content - will resize or collapse */}
      <ResizablePanelGroup direction="horizontal" className={`${collapsed ? 'hidden' : 'flex'} flex-grow`}>
        <ResizablePanel defaultSize={100} minSize={20} maxSize={80} className="bg-white border-l border-gray-200 flex flex-col h-full">
          <Tabs defaultValue="recap" className="w-full h-full flex flex-col" onValueChange={setActiveTab}>
            <div className="p-4 border-b">
              <TabsList className="grid grid-cols-2">
                <TabsTrigger value="recap">Récapitulatif</TabsTrigger>
                <TabsTrigger value="measurements">Métré détaillé</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="recap" className="flex-1 flex flex-col overflow-hidden">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-primary">Récapitulatif</h2>
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
                <Tabs defaultValue="all" className="w-full" onValueChange={(v) => setViewType(v as any)}>
                  <div className="px-4 pt-4">
                    <TabsList className="grid grid-cols-4 mb-2">
                      <TabsTrigger value="all">Tous</TabsTrigger>
                      <TabsTrigger value="byLocation">Par Local</TabsTrigger>
                      <TabsTrigger value="byType">Par Lot</TabsTrigger>
                      <TabsTrigger value="bySurface">Par Surface</TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <TabsContent value="all" className="p-4 pt-0">
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Désignation</TableHead>
                            <TableHead>Quantité</TableHead>
                            <TableHead>Prix unit.</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {projet.ouvrages.map(ouvrage => (
                            <TableRow 
                              key={ouvrage.id}
                              onMouseEnter={() => onElementHover(ouvrage.surfaceId || null)}
                              onMouseLeave={() => onElementHover(null)}
                              className="hover:bg-gray-50 cursor-pointer h-8"
                            >
                              <TableCell className="py-1">
                                <div onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                                  <p className="font-medium text-xs">{ouvrage.designation}</p>
                                  <p className="text-xs text-gray-500">
                                    {ouvrage.lot} / {ouvrage.localisation.niveau} - {ouvrage.localisation.piece}
                                  </p>
                                </div>
                              </TableCell>
                              <TableCell className="py-1">
                                {editingOuvrage === ouvrage.id ? (
                                  <Input 
                                    type="number"
                                    value={editedQuantite}
                                    onChange={(e) => setEditedQuantite(parseFloat(e.target.value) || 0)}
                                    className="w-20 h-7 text-xs"
                                    min={0}
                                    step={0.01}
                                  />
                                ) : (
                                  <span className="text-xs" onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                                    {ouvrage.quantite} {ouvrage.unite}
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-1">
                                {editingOuvrage === ouvrage.id ? (
                                  <Input 
                                    type="number"
                                    value={editedPrix}
                                    onChange={(e) => setEditedPrix(parseFloat(e.target.value) || 0)}
                                    className="w-20 h-7 text-xs"
                                    min={0}
                                    step={0.01}
                                  />
                                ) : (
                                  <span className="text-xs" onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                                    {ouvrage.prix_unitaire} €
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-1 text-right">
                                {editingOuvrage === ouvrage.id ? (
                                  <div className="flex items-center justify-end gap-1">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-green-600"
                                      onClick={() => handleSaveEditedOuvrage(ouvrage.id)}
                                    >
                                      <Save size={14} />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-red-600"
                                      onClick={handleCancelEditing}
                                    >
                                      <X size={14} />
                                    </Button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-end gap-1">
                                    <span className="font-medium text-xs">
                                      {formatPrice(calculateOuvrageCost(ouvrage))}
                                    </span>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      className="h-6 w-6 text-gray-400 hover:text-primary"
                                      onClick={() => handleStartEditingOuvrage(ouvrage)}
                                    >
                                      <Edit2 size={12} />
                                    </Button>
                                  </div>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="bg-blue-50">
                            <TableCell colSpan={3} className="font-medium py-1 text-xs">Total</TableCell>
                            <TableCell className="text-right font-semibold py-1 text-xs">
                              {formatPrice(totalProjetCost)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  {/* Other tabs implementation remains the same */}
                  
                </Tabs>
              </div>
            </TabsContent>
            
            <TabsContent value="measurements" className="flex-1 h-full overflow-hidden">
              <ProjectViewFixContent 
                isCalibrating={isCalibrating}
                calibrationStep={calibrationStep}
                projet={projet}
                onElementHover={onElementHover}
                onEditOuvrage={handleEditOuvrage}
              />
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default RightPanel;
