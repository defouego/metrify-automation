
import React, { useState, useEffect, useRef } from 'react';
import { Projet, Surface } from '@/types/metr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Tag, Ruler, ChevronRight } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { LibraryItem, ItemUnit } from '@/types/library';
import { useLibraryDB } from '@/hooks/useLibraryDB';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import BibliothequeFilter from '@/components/Bibliotheque/BibliothequeFilter';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface LeftPanelProps {
  projet: Projet;
  selectedSurface: Surface | null;
  onAddOuvrage: (ouvrage: any) => void;
}

const ITEMS_PER_PAGE = 50;

const LeftPanel: React.FC<LeftPanelProps> = ({ projet, selectedSurface, onAddOuvrage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string>('all');
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [libraries, setLibraries] = useState<{id: string, name: string}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(300); // Default width
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  
  // Use our library database hook
  const {
    isLoading,
    getLibraryItems,
    getLibraries,
    initializeWithSampleData
  } = useLibraryDB();
  
  // Load library items and libraries
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeWithSampleData();
        const fetchedLibraries = await getLibraries();
        setLibraries(fetchedLibraries || []);
        
        const fetchedItems = await getLibraryItems();
        setItems(fetchedItems as unknown as LibraryItem[] || []);
      } catch (err) {
        console.error('Error loading data:', err);
        // Set empty arrays as fallback
        setLibraries([]);
        setItems([]);
      }
    };
    
    loadData();
  }, []);
  
  // Update items when selected library changes
  useEffect(() => {
    const loadLibraryItems = async () => {
      try {
        const fetchedItems = await getLibraryItems(selectedLibrary);
        setItems(fetchedItems as unknown as LibraryItem[] || []);
        setCurrentPage(1); // Reset to first page when changing library
      } catch (err) {
        console.error('Error loading items:', err);
        setItems([]);
      }
    };
    
    loadLibraryItems();
  }, [selectedLibrary]);
  
  // Get unique lots from the library - add safety check for items
  const uniqueLots = [...new Set((items || []).map(o => o.lot))];
  
  // Get unique subCategories from the library - add safety check for items and subCategory
  const uniqueSubCategories = [...new Set((items || [])
    .filter(item => item.subCategory)
    .map(item => item.subCategory))];
  
  // Get unique units from the library - add safety check for items
  const uniqueUnits = [...new Set((items || []).map(item => item.unite))];

  // Setup resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (resizeRef.current && startXRef.current) {
        const dx = e.clientX - startXRef.current;
        const newWidth = Math.max(250, Math.min(600, startWidthRef.current + dx));
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
  
  // Filter items based on search term and selected filters - add safety check for items
  const filteredItems = (items || []).filter(item => {
    const matchesSearch = item.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLot = selectedLot === 'all' ? true : item.lot === selectedLot;
    const matchesSubCategory = selectedSubCategory === 'all' ? true : item.subCategory === selectedSubCategory;
    const matchesUnit = selectedUnit === 'all' ? true : item.unite === selectedUnit;
    return matchesSearch && matchesLot && matchesSubCategory && matchesUnit;
  });

  // Get paginated items
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);

  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If we have 5 or fewer pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always include first page
      pages.push(1);
      
      // Calculate start and end points
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust to show 3 pages when possible
      if (currentPage === 1) {
        end = 3;
      } else if (currentPage === totalPages) {
        start = totalPages - 2;
      }
      
      // Add ellipsis after page 1 if needed
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      // Always include last page if more than 1 page
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Add an item to the project
  const handleAddItem = (item: LibraryItem) => {
    const localisation = selectedSurface 
      ? { niveau: "Actuel", piece: selectedSurface.nom } 
      : { niveau: "RDC", piece: "Salon" };
    
    // Set the quantity based on surface area if applicable
    let quantite = 1;
    if (selectedSurface && item.unite === "M2") {
      quantite = selectedSurface.superficie;
    }
      
    const newOuvrage = {
      id: `ouvrage-${Date.now()}`,
      designation: item.designation,
      lot: item.lot,
      subCategory: item.subCategory,
      quantite: quantite,
      unite: item.unite,
      prix_unitaire: item.prix_unitaire,
      localisation: localisation,
      surfaceId: selectedSurface?.id
    };
    
    onAddOuvrage(newOuvrage);
  };

  // Function to determine what type of measurement is needed based on unit
  const getMeasurementType = (unit: ItemUnit): string => {
    switch (unit) {
      case 'ML':
        return 'linear';
      case 'M2':
        return 'area';
      case 'U':
      case 'PCE':
        return 'count';
      default:
        return 'manual';
    }
  };
  
  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Toggle panel collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  return (
    <TooltipProvider>
      <div 
        className={`sidebar flex flex-col h-full relative transition-all duration-300 border-r bg-white`} 
        style={{ width: isCollapsed ? '50px' : `${panelWidth}px` }}
      >
        {/* Collapse/Expand button and resize handle */}
        <div 
          ref={resizeRef}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-white border border-gray-200 shadow-md rounded-full w-6 h-6 flex items-center justify-center cursor-pointer z-10 transform transition-all"
          onClick={toggleCollapse}
          title={isCollapsed ? "Expand panel" : "Resize panel"}
        >
          <ChevronRight className={`h-4 w-4 transition-transform ${isCollapsed ? '' : 'rotate-180'}`} />
        </div>
        
        {isCollapsed ? (
          <div className="flex flex-col items-center p-2">
            <span className="text-xs font-medium text-gray-500 rotate-90 mt-4">Bibliothèque</span>
          </div>
        ) : (
          <div className="p-2 overflow-hidden">
            <h2 className="w-full text-center text-lg font-semibold mb-4 text-primary">Bibliothèque</h2>
            
            {selectedSurface && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <h3 className="text-sm font-medium text-primary">Surface sélectionnée</h3>
                <p className="text-xs text-gray-600">{selectedSurface.nom} ({selectedSurface.superficie.toFixed(2)} {selectedSurface.unite})</p>
                <p className="text-xs text-gray-500 mt-1">Les ouvrages ajoutés seront associés à cette surface</p>
              </div>
            )}
            
            <div className="space-y-3">
              {/* Library Selection */}
              <Select value={selectedLibrary} onValueChange={setSelectedLibrary}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choisir une bibliothèque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les bibliothèques</SelectItem>
                  {(libraries || []).map(library => (
                    <SelectItem key={library.id} value={library.id}>{library.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher un article..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Library filter + Other filters */}
              <BibliothequeFilter
                categoryFilter={selectedLot}
                setCategoryFilter={setSelectedLot}
                subCategoryFilter={selectedSubCategory}
                setSubCategoryFilter={setSelectedSubCategory}
                unitFilter={selectedUnit}
                setUnitFilter={setSelectedUnit}
                categories={uniqueLots}
                uniqueSubCategories={uniqueSubCategories}
                uniqueUnits={uniqueUnits}
                filteredByLibraryItems={items || []}
                selectedLibrary={selectedLibrary}
                setSelectedLibrary={setSelectedLibrary}
                libraries={libraries || []}
                compact={true}
                customLabels={{lot: "Lot", subCategory: "Cat", unit: "Unit"}}
                customIcons={{
                  lot: <Package className="h-4 w-4" />,
                  subCategory: <Tag className="h-4 w-4" />,
                  unit: <Ruler className="h-4 w-4" />
                }}
              />
              
              {/* Library items list with pagination */}
              <div className="space-y-2 mt-4 h-[calc(100vh-340px)] overflow-y-auto">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700">Articles disponibles</h3>
                  <span className="text-xs text-gray-500">
                    {filteredItems.length > 0 ? 
                      `${(currentPage - 1) * ITEMS_PER_PAGE + 1}-${Math.min(currentPage * ITEMS_PER_PAGE, filteredItems.length)} sur ${filteredItems.length}` : 
                      '0 articles'}
                  </span>
                </div>
                
                {isLoading ? (
                  <p className="text-sm text-center py-8 text-gray-500">Chargement des articles...</p>
                ) : paginatedItems.length > 0 ? (
                  <ul className="space-y-1">
                    {paginatedItems.map((item) => (
                      <li key={item.id} className="bg-white border rounded-md p-1 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="w-[85%]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="font-medium text-xs truncate">{truncateText(item.designation, 25)}</p>
                              </TooltipTrigger>
                              <TooltipContent>
                                {item.designation}
                              </TooltipContent>
                            </Tooltip>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate max-w-[120px]">
                                    {truncateText(item.lot || '', 15)} - {truncateText(item.subCategory || '', 10)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {item.lot} - {item.subCategory}
                                </TooltipContent>
                              </Tooltip>
                              <span className="text-xs ml-1">{item.prix_unitaire.toFixed(2)} €/{item.unite}</span>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 rounded-full bg-metrBlue text-white hover:bg-blue-800"
                            onClick={() => handleAddItem(item)}
                            title={`Ajouter et mesurer (${getMeasurementType(item.unite)})`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                            <span className="sr-only">Ajouter</span>
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-center py-8 text-gray-500">Aucun article trouvé avec ces critères de recherche.</p>
                )}
                
                {/* Pagination */}
                {filteredItems.length > ITEMS_PER_PAGE && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                      
                      {getPageNumbers().map((page, i) => (
                        <PaginationItem key={i}>
                          {page === 'ellipsis' ? (
                            <span className="px-2">...</span>
                          ) : (
                            <PaginationLink
                              isActive={currentPage === page}
                              onClick={() => typeof page === 'number' && setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default LeftPanel;
