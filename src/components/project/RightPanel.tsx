
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeftCircle, ChevronDown, ChevronUp, ChevronLeft } from 'lucide-react';
import { Projet, Surface, Ouvrage as OuvrageType } from '@/types/metr';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RightPanelProps {
  projet: Projet;
  onElementHover: (elementId: string | null) => void;
  selectedSurface: Surface | null;
  setSelectedSurface: (surface: Surface | null) => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  projet,
  onElementHover,
  selectedSurface,
  setSelectedSurface,
}) => {
  const [ouvragesGrouped, setOuvragesGrouped] = useState<{[key: string]: {
    [key: string]: OuvrageType[]
  }}>({});
  const [expandedLots, setExpandedLots] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]);
  const [panelWidth, setPanelWidth] = useState<number>(320);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  useEffect(() => {
    // Group ouvrages by lot and subcategory
    const grouped: {[key: string]: {[key: string]: OuvrageType[]}} = {};
    
    // Add safety check for projet.ouvrages
    const ouvrages = projet?.ouvrages || [];
    
    ouvrages.forEach(ouvrage => {
      if (!grouped[ouvrage.lot]) {
        grouped[ouvrage.lot] = {};
      }
      
      // Use empty string as default subcategory if not present
      const subCat = ouvrage.subCategory || 'Non classé';
      
      if (!grouped[ouvrage.lot][subCat]) {
        grouped[ouvrage.lot][subCat] = [];
      }
      
      grouped[ouvrage.lot][subCat].push(ouvrage);
    });
    
    setOuvragesGrouped(grouped);
    
    // Expand first lot by default if none expanded
    if (expandedLots.length === 0 && Object.keys(grouped).length > 0) {
      setExpandedLots([Object.keys(grouped)[0]]);
    }
  }, [projet?.ouvrages]); // Add ? to prevent accessing ouvrages if projet is undefined
  
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

  // Calculate totals for lot
  const getLotTotal = (lot: string) => {
    let total = 0;
    Object.keys(ouvragesGrouped[lot] || {}).forEach(subCat => {
      (ouvragesGrouped[lot][subCat] || []).forEach(ouvrage => {
        total += ouvrage.quantite * ouvrage.prix_unitaire;
      });
    });
    return total;
  };

  // Calculate totals for subcategory
  const getSubCategoryTotal = (lot: string, subCategory: string) => {
    let total = 0;
    (ouvragesGrouped[lot]?.[subCategory] || []).forEach(ouvrage => {
      total += ouvrage.quantite * ouvrage.prix_unitaire;
    });
    return total;
  };

  // Calculate total for all items
  const getTotalAmount = () => {
    let total = 0;
    Object.keys(ouvragesGrouped).forEach(lot => {
      total += getLotTotal(lot);
    });
    return total;
  };

  // Toggle panel collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Setup resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizeRef.current && startXRef.current) {
        const dx = e.clientX - startXRef.current;
        // For right panel, subtract dx to resize from right to left
        const newWidth = Math.max(250, Math.min(600, startWidthRef.current - dx));
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      startXRef.current = 0;
      document.body.style.cursor = 'default';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    const handleMouseDown = (e: MouseEvent) => {
      startXRef.current = e.clientX;
      startWidthRef.current = panelWidth;
      document.body.style.cursor = 'ew-resize';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    };

    const resizeHandle = resizeRef.current;
    if (resizeHandle) {
      resizeHandle.addEventListener('mousedown', handleMouseDown);
    }

    return () => {
      if (resizeHandle) {
        resizeHandle.removeEventListener('mousedown', handleMouseDown);
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [panelWidth]);

  // Format price with 2 decimal places
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <TooltipProvider>
      <div 
        className={`relative h-full flex flex-col overflow-hidden transition-all duration-300 border-l bg-white`} 
        style={{ width: isCollapsed ? '50px' : `${panelWidth}px` }}
      >
        {/* Resize handle and collapse button - positioned on the left side */}
        <div 
          ref={resizeRef}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full w-6 h-6 flex items-center justify-center cursor-pointer z-10"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand panel" : "Resize panel"}
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
        </div>
        
        {isCollapsed ? (
          <div className="flex flex-col items-center p-2">
            <span className="text-xs font-medium text-gray-500 rotate-90 mt-4">Devis</span>
          </div>
        ) : (
          <>
            <div className="p-3 border-b">
              <h2 className="text-lg font-semibold">Devis</h2>
              <div className="mt-1 text-sm text-gray-500">
                Total: <span className="font-medium text-gray-800">{formatPrice(getTotalAmount())} €</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
              {Object.keys(ouvragesGrouped).length > 0 ? (
                <div className="space-y-2">
                  {Object.keys(ouvragesGrouped).map(lot => (
                    <div key={lot} className="border rounded-md overflow-hidden">
                      <div 
                        className="bg-gray-50 p-2 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                        onClick={() => toggleLot(lot)}
                      >
                        <div className="font-medium flex items-center text-sm">
                          {expandedLots.includes(lot) ? 
                            <ChevronUp className="h-3 w-3 mr-1" /> : 
                            <ChevronDown className="h-3 w-3 mr-1" />
                          }
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="truncate max-w-[200px]">{lot}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                              {lot}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="font-medium text-xs">{formatPrice(getLotTotal(lot))} €</div>
                      </div>
                      
                      {expandedLots.includes(lot) && (
                        <div className="p-1 space-y-1">
                          {Object.keys(ouvragesGrouped[lot] || {}).map(subCategory => (
                            <div key={`${lot}-${subCategory}`} className="border rounded-md overflow-hidden">
                              <div 
                                className="bg-gray-50 p-1 flex justify-between items-center cursor-pointer hover:bg-gray-100"
                                onClick={() => toggleSubCategory(`${lot}-${subCategory}`)}
                              >
                                <div className="text-xs flex items-center">
                                  {expandedSubCategories.includes(`${lot}-${subCategory}`) ? 
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
                                <div className="text-xs">{formatPrice(getSubCategoryTotal(lot, subCategory))} €</div>
                              </div>
                              
                              {expandedSubCategories.includes(`${lot}-${subCategory}`) && (
                                <table className="w-full text-xs">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="text-left p-1 text-xs font-medium text-gray-500">Désignation</th>
                                      <th className="text-right p-1 text-xs font-medium text-gray-500">Qté</th>
                                      <th className="text-right p-1 text-xs font-medium text-gray-500">P.U</th>
                                      <th className="text-right p-1 text-xs font-medium text-gray-500">Total</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {(ouvragesGrouped[lot][subCategory] || []).map((ouvrage, idx) => (
                                      <tr key={ouvrage.id} className="border-t hover:bg-gray-50">
                                        <td className="p-1">
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="truncate max-w-[100px] inline-block">
                                                {truncateText(ouvrage.designation || '', 20)}
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              {ouvrage.designation}
                                            </TooltipContent>
                                          </Tooltip>
                                        </td>
                                        <td className="p-1 text-right whitespace-nowrap">{ouvrage.quantite} {ouvrage.unite}</td>
                                        <td className="p-1 text-right whitespace-nowrap">{ouvrage.prix_unitaire.toFixed(2)} €</td>
                                        <td className="p-1 text-right whitespace-nowrap">{(ouvrage.quantite * ouvrage.prix_unitaire).toFixed(2)} €</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
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
