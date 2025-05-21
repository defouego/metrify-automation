
import React, { useState, useEffect } from 'react';
import { Projet, Surface } from '@/types/metr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Tag } from 'lucide-react';
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

interface LeftPanelProps {
  projet: Projet;
  selectedSurface: Surface | null;
  onAddOuvrage: (ouvrage: any) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ projet, selectedSurface, onAddOuvrage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string>('all');
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [libraries, setLibraries] = useState<{id: string, name: string}[]>([]);
  
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
        setLibraries(fetchedLibraries);
        
        const fetchedItems = await getLibraryItems();
        setItems(fetchedItems as unknown as LibraryItem[]);
      } catch (err) {
        console.error('Error loading data:', err);
      }
    };
    
    loadData();
  }, []);
  
  // Update items when selected library changes
  useEffect(() => {
    const loadLibraryItems = async () => {
      try {
        const fetchedItems = await getLibraryItems(selectedLibrary);
        setItems(fetchedItems as unknown as LibraryItem[]);
      } catch (err) {
        console.error('Error loading items:', err);
      }
    };
    
    loadLibraryItems();
  }, [selectedLibrary]);

  // Get unique lots from the library
  const uniqueLots = [...new Set(items.map(o => o.lot))];
  
  // Get unique subCategories from the library
  const uniqueSubCategories = [...new Set(items
    .filter(item => item.subCategory)
    .map(item => item.subCategory))];
  
  // Get unique units from the library
  const uniqueUnits = [...new Set(items.map(item => item.unite))];
  
  // Filter items based on search term and selected filters
  const filteredItems = items.filter(item => {
    const matchesSearch = item.designation.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLot = selectedLot === 'all' ? true : item.lot === selectedLot;
    const matchesSubCategory = selectedSubCategory === 'all' ? true : item.subCategory === selectedSubCategory;
    const matchesUnit = selectedUnit === 'all' ? true : item.unite === selectedUnit;
    return matchesSearch && matchesLot && matchesSubCategory && matchesUnit;
  });

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
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  
  return (
    <TooltipProvider>
      <div className="sidebar w-full flex flex-col h-full">
        <div className="p-2">
          <h2 className="w-full text-center text-lg font-semibold mb-4 text-primary">Bibliothèque</h2>
          
          {selectedSurface && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
              <h3 className="text-sm font-medium text-primary">Surface sélectionnée</h3>
              <p className="text-xs text-gray-600">{selectedSurface.nom} ({selectedSurface.superficie.toFixed(2)} {selectedSurface.unite})</p>
              <p className="text-xs text-gray-500 mt-1">Les ouvrages ajoutés seront associés à cette surface</p>
            </div>
          )}
          
          <div className="space-y-3">
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
              filteredByLibraryItems={items}
              selectedLibrary={selectedLibrary}
              setSelectedLibrary={setSelectedLibrary}
              libraries={libraries}
              compact={true}
            />
            
            {/* Library items list */}
            <div className="space-y-2 mt-4 h-[calc(100vh-260px)] overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-700">Articles disponibles</h3>
              
              {isLoading ? (
                <p className="text-sm text-center py-8 text-gray-500">Chargement des articles...</p>
              ) : filteredItems.length > 0 ? (
                <ul className="space-y-1">
                  {filteredItems.map((item) => (
                    <li key={item.id} className="bg-white border rounded-md p-1 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="w-[85%]">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="font-medium text-sm truncate">{truncateText(item.designation, 25)}</p>
                            </TooltipTrigger>
                            <TooltipContent>
                              {item.designation}
                            </TooltipContent>
                          </Tooltip>
                          
                          <div className="flex justify-between text-xs text-gray-500">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="truncate max-w-[120px]">{truncateText(item.lot, 15)} - {truncateText(item.subCategory, 10)}</span>
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
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default LeftPanel;
