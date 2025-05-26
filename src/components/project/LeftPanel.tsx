
import React, { useState, useEffect, useRef } from 'react';
import { Projet, Surface } from '@/types/metr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Tag, Ruler, Plus } from 'lucide-react';
import { LibraryItem, ItemUnit } from '@/types/library';
import { useLibraryDB } from '@/hooks/useLibraryDB';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import BibliothequeFilter from '@/components/Bibliotheque/BibliothequeFilter';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import CreateArticleDialog, { ItemFormValues } from '@/components/Bibliotheque/CreateArticleDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemFormSchema } from '@/components/Bibliotheque/CreateArticleDialog';
import { toast } from 'sonner';
import SearchableSelect from '@/components/ui/searchable-select';
import PanelToggle from '@/components/ui/panel-toggle';

interface LeftPanelProps {
  projet: Projet;
  selectedSurface: Surface | null;
  onAddOuvrage: (ouvrage: any) => void;
}

const ITEMS_PER_PAGE = 50;

const UNITS = [
  { code: 'M2' as ItemUnit, name: 'Mètre carré' },
  { code: 'ML' as ItemUnit, name: 'Mètre linéaire' },
  { code: 'M3' as ItemUnit, name: 'Mètre cube' },
  { code: 'U' as ItemUnit, name: 'Unité' },
  { code: 'PCE' as ItemUnit, name: 'Pièce' },
  { code: 'KG' as ItemUnit, name: 'Kilogramme' },
  { code: 'T' as ItemUnit, name: 'Tonne' },
];

const CATEGORIES = [
  'Gros œuvre',
  'Second œuvre',
  'Électricité',
  'Plomberie',
  'Chauffage',
  'Menuiserie',
  'Revêtements',
  'Peinture',
];

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
  const [panelWidth, setPanelWidth] = useState(300);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  
  const {
    isLoading,
    getLibraryItems,
    getLibraries,
    initializeWithSampleData,
    createLibraryItem
  } = useLibraryDB();
  
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      designation: '',
      lot: '',
      subCategory: '',
      unite: 'U',
      prix_unitaire: 0,
      description: '',
      bibliotheque_id: projet.id,
    },
  });

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
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading items:', err);
        setItems([]);
      }
    };
    
    loadLibraryItems();
  }, [selectedLibrary]);
  
  const uniqueLots = [...new Set((items || []).map(o => o.lot))];
  const uniqueSubCategories = [...new Set((items || [])
    .filter(item => item.subCategory)
    .map(item => item.subCategory))];
  const uniqueUnits = [...new Set((items || []).map(item => item.unite))];

  // Setup resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && startXRef.current) {
        const dx = e.clientX - startXRef.current;
        const newWidth = Math.max(250, Math.min(600, startWidthRef.current + dx));
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      startXRef.current = 0;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
  };
  
  // Filter items based on search term and selected filters
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
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage === 1) {
        end = 3;
      } else if (currentPage === totalPages) {
        start = totalPages - 2;
      }
      
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle create article
  const handleCreateArticle = async (values: ItemFormValues) => {
    try {
      await createLibraryItem(
        values.designation,
        values.lot,
        values.unite as ItemUnit,
        values.prix_unitaire,
        values.bibliotheque_id || projet.id,
        values.description,
        values.subCategory,
        values.tags
      );
      
      // Refresh items
      const fetchedItems = await getLibraryItems(selectedLibrary);
      setItems(fetchedItems as unknown as LibraryItem[] || []);
      
      setIsCreateArticleOpen(false);
      form.reset();
      toast.success('Article créé avec succès');
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Erreur lors de la création de l\'article');
    }
  };

  // Add an item to the project
  const handleAddItem = (item: LibraryItem) => {
    const localisation = selectedSurface 
      ? { niveau: "Actuel", piece: selectedSurface.nom } 
      : { niveau: "RDC", piece: "Salon" };
    
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
      surfaceId: selectedSurface?.id,
      color: '#4ECDC4'
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
        {/* Resize handle */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-300 transition-colors z-20"
          onMouseDown={handleResizeStart}
        />
        <div 
          className="absolute right-0.5 top-0 bottom-0 w-0.5 bg-gray-200"
        />
        
        {isCollapsed ? (
          <div className="flex flex-col items-center p-2">
            <span className="text-xs font-medium text-gray-500 rotate-90 mt-4">Bibliothèque</span>
            <div className="mt-8">
              <PanelToggle
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
                position="left"
              />
            </div>
          </div>
        ) : (
          <div className="p-2 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-primary">Bibliothèque</h2>
              <PanelToggle
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
                position="left"
              />
            </div>
            
            {selectedSurface && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                <h3 className="text-sm font-medium text-primary">Surface sélectionnée</h3>
                <p className="text-xs text-gray-600">{selectedSurface.nom} ({selectedSurface.superficie.toFixed(2)} {selectedSurface.unite})</p>
                <p className="text-xs text-gray-500 mt-1">Les ouvrages ajoutés seront associés à cette surface</p>
              </div>
            )}
            
            <div className="space-y-3">
              {/* Library Selection with Search */}
              <SearchableSelect
                value={selectedLibrary}
                onChange={setSelectedLibrary}
                options={libraries.map(lib => lib.name)}
                placeholder="Choisir une bibliothèque"
              />
              
              {/* Search input with create button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher un article..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateArticleOpen(true)}
                  title="Créer un nouvel article"
                  className="px-3"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Filters with search functionality */}
              <div className="space-y-2">
                <SearchableSelect
                  value={selectedLot}
                  onChange={setSelectedLot}
                  options={uniqueLots}
                  placeholder="Tous les lots"
                />
                
                <SearchableSelect
                  value={selectedSubCategory}
                  onChange={setSelectedSubCategory}
                  options={uniqueSubCategories}
                  placeholder="Toutes les catégories"
                />
                
                <SearchableSelect
                  value={selectedUnit}
                  onChange={setSelectedUnit}
                  options={uniqueUnits}
                  placeholder="Toutes les unités"
                />
              </div>
              
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
                          <div style={{ width: `${Math.max(85, (panelWidth - 100) / panelWidth * 100)}%` }}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="font-medium text-xs truncate">
                                  {truncateText(item.designation, Math.floor(panelWidth / 12))}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent>
                                {item.designation}
                              </TooltipContent>
                            </Tooltip>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate" style={{ maxWidth: `${Math.floor(panelWidth / 3)}px` }}>
                                    {truncateText(item.lot || '', Math.floor(panelWidth / 20))} - {truncateText(item.subCategory || '', Math.floor(panelWidth / 30))}
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
                            className="h-7 w-7 p-0 rounded-full bg-metrBlue text-white hover:bg-blue-800 flex-shrink-0"
                            onClick={() => handleAddItem(item)}
                            title={`Ajouter et mesurer (${getMeasurementType(item.unite)})`}
                          >
                            <Plus className="h-4 w-4" />
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

      {/* Create Article Dialog */}
      <CreateArticleDialog
        open={isCreateArticleOpen}
        onOpenChange={setIsCreateArticleOpen}
        isEditMode={false}
        categories={CATEGORIES}
        units={UNITS}
        libraries={libraries.map(lib => lib.name)}
        form={form}
        onSubmit={handleCreateArticle}
      />
    </TooltipProvider>
  );
};

export default LeftPanel;
