
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

interface LeftPanelProps {
  projet: Projet;
  selectedSurface: Surface | null;
  onAddOuvrage: (ouvrage: any) => void;
}

const LeftPanel: React.FC<LeftPanelProps> = ({ projet, selectedSurface, onAddOuvrage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLot, setSelectedLot] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [items, setItems] = useState<LibraryItem[]>([]);
  
  // Use our library database hook
  const {
    isLoading,
    getLibraryItems,
    initializeWithSampleData
  } = useLibraryDB();
  
  // Load library items
  useEffect(() => {
    const loadItems = async () => {
      try {
        await initializeWithSampleData();
        const fetchedItems = await getLibraryItems();
        setItems(fetchedItems as unknown as LibraryItem[]);
      } catch (err) {
        console.error('Error loading library items:', err);
      }
    };
    
    loadItems();
  }, []);

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
    const matchesLot = selectedLot ? item.lot === selectedLot : true;
    const matchesSubCategory = selectedSubCategory ? item.subCategory === selectedSubCategory : true;
    const matchesUnit = selectedUnit ? item.unite === selectedUnit : true;
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
  
  return (
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
          
          {/* Filter buttons with icons */}
          <div className="flex items-center space-x-2">
            {/* Lot filter */}
            <Select 
              value={selectedLot || 'all'} 
              onValueChange={(value) => setSelectedLot(value === 'all' ? null : value)}
            >
              <SelectTrigger className="h-8 w-28">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 mr-1" />
                  <span>Lot</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les lots</SelectItem>
                {uniqueLots.map(lot => (
                  <SelectItem key={lot} value={lot}>{lot}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* SubCategory filter */}
            <Select 
              value={selectedSubCategory || 'all'} 
              onValueChange={(value) => setSelectedSubCategory(value === 'all' ? null : value)}
            >
              <SelectTrigger className="h-8 w-28">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>Sous-cat.</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {uniqueSubCategories.map(subCategory => (
                  <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Unit filter */}
            <Select 
              value={selectedUnit || 'all'} 
              onValueChange={(value) => setSelectedUnit(value === 'all' ? null : value)}
            >
              <SelectTrigger className="h-8 w-28">
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  <span>Unité</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                {uniqueUnits.map(unit => (
                  <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Library items list */}
          <div className="space-y-2 mt-4 h-[calc(100vh-260px)] overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700">Articles disponibles</h3>
            
            {isLoading ? (
              <p className="text-sm text-center py-8 text-gray-500">Chargement des articles...</p>
            ) : filteredItems.length > 0 ? (
              <ul className="space-y-1">
                {filteredItems.map((item) => (
                  <li key={item.id} className="bg-white border rounded-md p-2 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-sm">{item.designation}</p>
                        <p className="text-xs text-gray-500">{item.lot} - {item.subCategory}</p>
                        <p className="text-xs mt-1">{item.prix_unitaire.toFixed(2)} €/{item.unite}</p>
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
  );
};

export default LeftPanel;
