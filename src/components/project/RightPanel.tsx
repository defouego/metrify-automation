import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Trash2, Edit, Plus, Download } from 'lucide-react';
import { Projet, Surface, Ouvrage as OuvrageType } from '@/types/metr';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import InlineEdit from './InlineEdit';
import ColorPicker from './ColorPicker';
import PanelToggle from '@/components/ui/panel-toggle';
import { toast } from 'sonner';

interface RightPanelProps {
  projet: Projet;
  onElementHover: (elementId: string | null) => void;
  selectedSurface: Surface | null;
  setSelectedSurface: (surface: Surface | null) => void;
}

type ViewMode = 'lot' | 'localisation';

interface GroupedOuvrage extends OuvrageType {
  color?: string;
  measurements?: (OuvrageType & { color?: string })[];
  isExpanded?: boolean;
}

const RightPanel: React.FC<RightPanelProps> = ({
  projet,
  onElementHover,
  selectedSurface,
  setSelectedSurface,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('lot');
  const [ouvragesGrouped, setOuvragesGrouped] = useState<{[key: string]: {
    [key: string]: GroupedOuvrage[]
  }}>({});
  const [expandedLots, setExpandedLots] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);
  const [expandedOuvrages, setExpandedOuvrages] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [hoveredOuvrageId, setHoveredOuvrageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Group ouvrages by designation first, then by lot and subcategory
    const grouped: {[key: string]: {[key: string]: GroupedOuvrage[]}} = {};
    
    const ouvrages = projet?.ouvrages || [];
    
    // First, group by designation to combine measurements
    const ouvragesByDesignation: {[key: string]: (OuvrageType & { color?: string })[]} = {};
    
    ouvrages.forEach(ouvrage => {
      const ouvrageWithColor = {
        ...ouvrage,
        color: ouvrage.color || '#4ECDC4'
      };
      
      if (!ouvragesByDesignation[ouvrage.designation]) {
        ouvragesByDesignation[ouvrage.designation] = [];
      }
      ouvragesByDesignation[ouvrage.designation].push(ouvrageWithColor);
    });
    
    // Then group by view mode
    Object.keys(ouvragesByDesignation).forEach(designation => {
      const measures = ouvragesByDesignation[designation];
      const mainOuvrage = measures[0]; // Use first as main
      
      const groupKey = viewMode === 'lot' 
        ? mainOuvrage.lot
        : mainOuvrage.localisation 
          ? `${mainOuvrage.localisation.niveau} - ${mainOuvrage.localisation.piece}` 
          : 'Non localisé';
      
      const subCat = mainOuvrage.subCategory || 'Non classé';
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = {};
      }
      
      if (!grouped[groupKey][subCat]) {
        grouped[groupKey][subCat] = [];
      }
      
      // Create grouped ouvrage with measurements
      const groupedOuvrage: GroupedOuvrage = {
        ...mainOuvrage,
        measurements: measures.length > 1 ? measures.slice(1) : [],
        isExpanded: expandedOuvrages.includes(designation),
        quantite: measures.reduce((sum, m) => sum + m.quantite, 0) // Sum all quantities
      };
      
      grouped[groupKey][subCat].push(groupedOuvrage);
    });
    
    setOuvragesGrouped(grouped);
    
    // Expand first group by default if none expanded
    if (expandedLots.length === 0 && Object.keys(grouped).length > 0) {
      setExpandedLots([Object.keys(grouped)[0]]);
    }
  }, [projet?.ouvrages, viewMode, expandedOuvrages]);
  
  const toggleLot = (lot: string) => {
    if (expandedLots.includes(lot)) {
      setExpandedLots(expandedLots.filter(l => l !== lot));
    } else {
      setExpandedLots([...expandedLots, lot]);
    }
  };
  
  const toggleSubCategory = (subCategory: string) => {
    if (expandedSubCategories.includes(subCategory)) {
      setExpandedSubCategories(expandedSubCategories.filter(sc => sc !== subCategory));
    } else {
      setExpandedSubCategories([...expandedSubCategories, subCategory]);
    }
  };

  const toggleOuvrage = (designation: string) => {
    if (expandedOuvrages.includes(designation)) {
      setExpandedOuvrages(expandedOuvrages.filter(d => d !== designation));
    } else {
      setExpandedOuvrages([...expandedOuvrages, designation]);
    }
  };

  // Calculate totals for group
  const getGroupTotal = (group: string) => {
    let total = 0;
    Object.keys(ouvragesGrouped[group] || {}).forEach(subCat => {
      (ouvragesGrouped[group][subCat] || []).forEach(ouvrage => {
        total += ouvrage.quantite * ouvrage.prix_unitaire;
      });
    });
    return total;
  };

  // Calculate totals for subcategory
  const getSubCategoryTotal = (group: string, subCategory: string) => {
    let total = 0;
    (ouvragesGrouped[group]?.[subCategory] || []).forEach(ouvrage => {
      total += ouvrage.quantite * ouvrage.prix_unitaire;
    });
    return total;
  };

  // Calculate total for all items
  const getTotalAmount = () => {
    let total = 0;
    Object.keys(ouvragesGrouped).forEach(group => {
      total += getGroupTotal(group);
    });
    return total;
  };

  // Handle inline edit save
  const handleInlineEditSave = async (ouvrageId: string, field: string, value: string | number) => {
    try {
      // Implement actual save logic here
      await saveOuvrage(ouvrageId, field, value);
      toast.success('Modification enregistrée');
    } catch (error) {
      toast.error('Erreur lors de la modification');
      console.error('Error saving ouvrage:', error);
    }
  };

  // Handle color change
  const handleColorChange = (designation: string, color: string) => {
    console.log(`Updating ouvrage ${designation} color to ${color}`);
    toast.success('Couleur modifiée');
  };

  // Handle delete ouvrage
  const handleDeleteOuvrage = (ouvrageId: string, designation?: string) => {
    if (designation) {
      console.log(`Deleting all measurements for ${designation}`);
      toast.success('Tous les articles supprimés');
    } else {
      console.log(`Deleting measurement ${ouvrageId}`);
      toast.success('Mesure supprimée');
    }
  };

  // Handle re-measure
  const handleReMeasure = (ouvrageId: string) => {
    console.log(`Re-measuring ouvrage ${ouvrageId}`);
    toast.info('Mode re-mesure activé');
  };

  // Handle add same article
  const handleAddSameArticle = (ouvrage: GroupedOuvrage) => {
    console.log(`Adding same article as ${ouvrage.designation}`);
    toast.info('Nouvelle mesure du même article activée');
  };

  // Handle export
  const handleExportDevis = async () => {
    setIsLoading(true);
    try {
      await exportDevis(projet);
      toast.success('Export du devis terminé');
    } catch (error) {
      toast.error('Erreur lors de l\'export');
      console.error('Error exporting devis:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle panel collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Format price with 2 decimal places
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  const isGroupedOuvrage = (ouvrage: any): ouvrage is GroupedOuvrage => {
    return ouvrage && 'measurements' in ouvrage;
  };

  return (
    <TooltipProvider>
      <div 
        className={`relative h-full flex flex-col overflow-hidden transition-all duration-300 border-l bg-white`} 
        style={{ width: isCollapsed ? '50px' : '320px' }}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center p-2">
            <span className="text-xs font-medium text-gray-500 rotate-90 mt-4">Devis</span>
            <div className="mt-8">
              <PanelToggle
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
                position="right"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="p-3 border-b">
              <div className="flex items-center justify-between mb-2">
                <PanelToggle
                  isCollapsed={isCollapsed}
                  onToggle={toggleCollapse}
                  position="right"
                />
                
                <h2 className="text-lg font-semibold text-center flex-1">Devis</h2>
                
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportDevis}
                  title="Exporter le devis"
                  className="px-2"
                  aria-label="Exporter le devis"
                  disabled={isLoading}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
              
              {/* View mode buttons */}
              <div className="flex gap-1 mb-2">
                <Button
                  size="sm"
                  variant={viewMode === 'lot' ? 'default' : 'outline'}
                  onClick={() => setViewMode('lot')}
                  className="flex-1 text-xs"
                >
                  Lot
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'localisation' ? 'default' : 'outline'}
                  onClick={() => setViewMode('localisation')}
                  className="flex-1 text-xs"
                >
                  Localisation
                </Button>
              </div>
              
              <div className="text-sm text-gray-500 text-center">
                Total: <span className="font-medium text-gray-800">{formatPrice(getTotalAmount())} €</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.keys(ouvragesGrouped).length > 0 ? (
                <div className="space-y-2">
                  {Object.keys(ouvragesGrouped).map(group => (
                    <div key={group} className="border rounded-md overflow-hidden">
                      <div 
                        className="bg-gray-50 p-2 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleLot(group)}
                      >
                        <div className="font-medium flex items-center text-sm">
                          {expandedLots.includes(group) ? 
                            <ChevronUp className="h-3 w-3 mr-1" /> : 
                            <ChevronDown className="h-3 w-3 mr-1" />
                          }
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[200px]">{group}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {group}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="font-medium text-xs">{formatPrice(getGroupTotal(group))} €</div>
                      </div>
                      
                      {expandedLots.includes(group) && (
                        <div className="p-1 space-y-1">
                          {Object.keys(ouvragesGrouped[group] || {}).map(subCategory => (
                            <div key={`${group}-${subCategory}`} className="border rounded-md overflow-hidden">
                              <div 
                                className="bg-gray-50 p-1 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleSubCategory(`${group}-${subCategory}`)}
                              >
                                <div className="text-xs flex items-center">
                                  {expandedSubCategories.includes(`${group}-${subCategory}`) ? 
                                    <ChevronUp className="h-3 w-3 mr-1" /> : 
                                    <ChevronDown className="h-3 w-3 mr-1" />
                                  }
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <span className="truncate max-w-[180px]">{subCategory}</span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      {subCategory}
                                    </TooltipContent>
                                  </Tooltip>
                                </div>
                                <div className="text-xs">{formatPrice(getSubCategoryTotal(group, subCategory))} €</div>
                              </div>
                              
                              {expandedSubCategories.includes(`${group}-${subCategory}`) && (
                                <div className="space-y-1">
                                  {(ouvragesGrouped[group][subCategory] || []).map((ouvrage, idx) => (
                                    <div key={`${ouvrage.designation}-${idx}`} className="bg-white">
                                      {/* Main article header */}
                                      <div 
                                        className="p-2 hover:bg-gray-50 group cursor-pointer"
                                        onMouseEnter={() => setHoveredOuvrageId(ouvrage.id)}
                                        onMouseLeave={() => setHoveredOuvrageId(null)}
                                        onClick={() => ouvrage.measurements && ouvrage.measurements.length > 0 && toggleOuvrage(ouvrage.designation)}
                                      >
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-1 flex-1">
                                            {/* Expand/collapse for measurements */}
                                            {ouvrage.measurements && ouvrage.measurements.length > 0 && (
                                              <div className="w-3 h-3 flex items-center justify-center">
                                                {expandedOuvrages.includes(ouvrage.designation) ? 
                                                  <ChevronUp className="h-2 w-2" /> : 
                                                  <ChevronDown className="h-2 w-2" />
                                                }
                                              </div>
                                            )}
                                            
                                            {/* Add same article button */}
                                            <Button
                                              size="sm"
                                              variant="ghost"
                                              className="w-4 h-4 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleAddSameArticle(ouvrage);
                                              }}
                                              title="Ajouter une nouvelle mesure de cet article"
                                            >
                                              <Plus className="h-3 w-3" />
                                            </Button>
                                            
                                            {/* Color picker */}
                                            <div className={`transition-opacity ${hoveredOuvrageId === ouvrage.id ? 'opacity-100' : 'opacity-0'}`}>
                                              <ColorPicker
                                                currentColor={ouvrage.color || '#4ECDC4'}
                                                onColorChange={(color) => handleColorChange(ouvrage.designation, color)}
                                              />
                                            </div>
                                            
                                            {/* Designation with inline edit */}
                                            <div className={`flex-1 transition-all ${hoveredOuvrageId === ouvrage.id ? 'mr-2' : ''}`}>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <div className="truncate max-w-[120px]">
                                                    <InlineEdit
                                                      value={ouvrage.designation || ''}
                                                      onSave={(value) => handleInlineEditSave(ouvrage.id, 'designation', value)}
                                                      className="text-xs font-medium"
                                                    />
                                                  </div>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  {ouvrage.designation}
                                                </TooltipContent>
                                              </Tooltip>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-center gap-2 text-xs">
                                            <span>{ouvrage.quantite} {ouvrage.unite}</span>
                                            <span className="relative">
                                              <InlineEdit
                                                value={ouvrage.prix_unitaire}
                                                onSave={(value) => handleInlineEditSave(ouvrage.id, 'prix_unitaire', value)}
                                                type="number"
                                                className="text-xs text-right w-12"
                                              /> €
                                            </span>
                                            <span className="font-medium relative">
                                              {(ouvrage.quantite * ouvrage.prix_unitaire).toFixed(2)} €
                                              
                                              {/* Action buttons with white background */}
                                              <div className={`absolute right-0 top-0 flex gap-1 transition-opacity ${hoveredOuvrageId === ouvrage.id ? 'opacity-100' : 'opacity-0'}`}>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="w-4 h-4 p-0 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleReMeasure(ouvrage.id);
                                                  }}
                                                  title="Re-mesurer cet élément"
                                                >
                                                  <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  className="w-4 h-4 p-0 text-gray-500 hover:text-red-600 bg-white border border-gray-200 rounded"
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteOuvrage(ouvrage.id, ouvrage.designation);
                                                  }}
                                                  title="Supprimer cet article"
                                                >
                                                  <Trash2 className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </span>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Individual measurements */}
                                      {expandedOuvrages.includes(ouvrage.designation) && ouvrage.measurements && ouvrage.measurements.length > 0 && (
                                        <div className="pl-4 space-y-1 bg-gray-50">
                                          {ouvrage.measurements.map((measurement, measIdx) => (
                                            <div 
                                              key={`${measurement.id}-${measIdx}`}
                                              className="p-1 hover:bg-gray-100 group text-xs flex items-center justify-between"
                                              onMouseEnter={() => setHoveredOuvrageId(measurement.id)}
                                              onMouseLeave={() => setHoveredOuvrageId(null)}
                                            >
                                              <div className="flex items-center gap-1">
                                                <div 
                                                  className="w-3 h-3 rounded border"
                                                  style={{ backgroundColor: ouvrage.color || '#4ECDC4' }}
                                                />
                                                <span className="text-gray-600">Mesure {measIdx + 2}</span>
                                              </div>
                                              
                                              <div className="flex items-center gap-2">
                                                <span>{measurement.quantite} {measurement.unite}</span>
                                                <span className="relative">
                                                  {(measurement.quantite * measurement.prix_unitaire).toFixed(2)} €
                                                  
                                                  {/* Action buttons for individual measurements */}
                                                  <div className={`absolute right-0 top-0 flex gap-1 transition-opacity ${hoveredOuvrageId === measurement.id ? 'opacity-100' : 'opacity-0'}`}>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="w-3 h-3 p-0 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded"
                                                      onClick={() => handleReMeasure(measurement.id)}
                                                      title="Re-mesurer cet élément"
                                                    >
                                                      <Edit className="h-2 w-2" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="ghost"
                                                      className="w-3 h-3 p-0 text-gray-500 hover:text-red-600 bg-white border border-gray-200 rounded"
                                                      onClick={() => handleDeleteOuvrage(measurement.id)}
                                                      title="Supprimer cette mesure"
                                                    >
                                                      <Trash2 className="h-2 w-2" />
                                                    </Button>
                                                  </div>
                                                </span>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-sm">Aucun ouvrage ajouté</p>
                  <p className="text-xs mt-2">Ajoutez des ouvrages depuis la bibliothèque</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};

export default RightPanel;
