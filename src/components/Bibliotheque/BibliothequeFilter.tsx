
import React, { useEffect, useState } from 'react';
import { Filter, Tag, Package, Ruler } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FormLabel } from '@/components/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BibliothequeFilterProps {
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  subCategoryFilter: string;
  setSubCategoryFilter: (subCategory: string) => void;
  unitFilter: string;
  setUnitFilter: (unit: string) => void;
  categories: string[];
  uniqueSubCategories: string[];
  uniqueUnits: string[];
  // Items to filter dynamic options
  filteredByLibraryItems?: any[];
  // For project view
  selectedLibrary?: string;
  setSelectedLibrary?: (library: string) => void;
  libraries?: {id: string, name: string}[];
  compact?: boolean;
  // New props for customization
  customLabels?: {
    lot?: string;
    subCategory?: string;
    unit?: string;
  };
  customIcons?: {
    lot?: React.ReactNode;
    subCategory?: React.ReactNode;
    unit?: React.ReactNode;
  };
}

const BibliothequeFilter: React.FC<BibliothequeFilterProps> = ({
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
  unitFilter,
  setUnitFilter,
  categories,
  uniqueSubCategories,
  uniqueUnits,
  filteredByLibraryItems,
  selectedLibrary,
  setSelectedLibrary,
  libraries,
  compact = false,
  customLabels = {},
  customIcons = {}
}) => {
  // Dynamic filtered options based on selections
  const [availableCategories, setAvailableCategories] = useState<string[]>(categories);
  const [availableSubCategories, setAvailableSubCategories] = useState<string[]>(uniqueSubCategories);
  const [availableUnits, setAvailableUnits] = useState<string[]>(uniqueUnits);

  // Default icons if not provided
  const lotIcon = customIcons.lot || <Package className="h-4 w-4 mr-2" />;
  const subCategoryIcon = customIcons.subCategory || <Tag className="h-4 w-4 mr-2" />;
  const unitIcon = customIcons.unit || <Ruler className="h-4 w-4 mr-2" />;

  // Default labels if not provided
  const lotLabel = customLabels.lot || (compact ? "Lot" : "Lot");
  const subCategoryLabel = customLabels.subCategory || (compact ? "Cat." : "Sous-catégorie");
  const unitLabel = customLabels.unit || (compact ? "Unit." : "Unité");

  // Update available sub-categories when category changes
  useEffect(() => {
    if (!filteredByLibraryItems) return;

    if (categoryFilter !== 'all') {
      // Filter subcategories based on selected category
      const filteredSubCategories = Array.from(new Set(
        filteredByLibraryItems
          .filter(item => item.lot === categoryFilter)
          .map(item => item.subCategory)
      ));
      setAvailableSubCategories(filteredSubCategories);

      // Filter units based on selected category
      const filteredUnits = Array.from(new Set(
        filteredByLibraryItems
          .filter(item => item.lot === categoryFilter)
          .map(item => item.unite)
      ));
      setAvailableUnits(filteredUnits);
    } else {
      // When no category is selected, show all subcategories and units
      setAvailableSubCategories(uniqueSubCategories);
      setAvailableUnits(uniqueUnits);
    }
  }, [categoryFilter, filteredByLibraryItems, uniqueSubCategories, uniqueUnits]);

  // Update available units when subcategory changes
  useEffect(() => {
    if (!filteredByLibraryItems) return;
    
    if (subCategoryFilter !== 'all') {
      // Filter units based on selected subcategory
      const filteredUnits = Array.from(new Set(
        filteredByLibraryItems
          .filter(item => item.subCategory === subCategoryFilter)
          .map(item => item.unite)
      ));
      setAvailableUnits(filteredUnits);
    } else {
      // When no subcategory is selected, show all units for the selected category
      if (categoryFilter !== 'all') {
        const filteredUnits = Array.from(new Set(
          filteredByLibraryItems
            .filter(item => item.lot === categoryFilter)
            .map(item => item.unite)
        ));
        setAvailableUnits(filteredUnits);
      } else {
        // If no category and subcategory are selected, show all units
        setAvailableUnits(uniqueUnits);
      }
    }
  }, [subCategoryFilter, filteredByLibraryItems, categoryFilter, uniqueUnits]);

  return (
    <TooltipProvider>
      <>
        {/* Mobile filters */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="lg:hidden">
              <Filter className="mr-2 h-4 w-4" />
              Filtres
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Filtres</SheetTitle>
            </SheetHeader>
            <div className="space-y-4 mt-4">
              {libraries && setSelectedLibrary && (
                <div>
                  <FormLabel>Bibliothèque</FormLabel>
                  <Select value={selectedLibrary || 'all'} onValueChange={setSelectedLibrary}>
                    <SelectTrigger>
                      <SelectValue placeholder="Toutes les bibliothèques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les bibliothèques</SelectItem>
                      {(libraries || []).map(library => (
                        <SelectItem key={library.id} value={library.id}>{library.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <FormLabel>{lotLabel}</FormLabel>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Tous les ${lotLabel.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les {lotLabel.toLowerCase()}</SelectItem>
                    {availableCategories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <FormLabel>{subCategoryLabel}</FormLabel>
                <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Toutes les ${subCategoryLabel.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les {subCategoryLabel.toLowerCase()}</SelectItem>
                    {availableSubCategories.map(subCategory => (
                      <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <FormLabel>{unitLabel}</FormLabel>
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder={`Toutes les ${unitLabel.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les {unitLabel.toLowerCase()}</SelectItem>
                    {availableUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Desktop filters */}
        <div className="hidden lg:flex lg:flex-row gap-2">
          {libraries && setSelectedLibrary && !compact && (
            <Select value={selectedLibrary || 'all'} onValueChange={setSelectedLibrary}>
              <SelectTrigger className={compact ? "w-[120px]" : "w-[180px]"}>
                <SelectValue placeholder="Bibliothèque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les bibliothèques</SelectItem>
                {(libraries || []).map(library => (
                  <SelectItem key={library.id} value={library.id}>{library.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className={compact ? "w-[90px]" : "w-[180px]"}>
              <div className="flex items-center">
                {lotIcon}
                <SelectValue placeholder={lotLabel} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les {lotLabel.toLowerCase()}</SelectItem>
              {availableCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
            <SelectTrigger className={compact ? "w-[90px]" : "w-[150px]"}>
              <div className="flex items-center">
                {subCategoryIcon}
                <SelectValue placeholder={subCategoryLabel} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les {subCategoryLabel.toLowerCase()}</SelectItem>
              {availableSubCategories.map(subCategory => (
                <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className={compact ? "w-[90px]" : "w-[150px]"}>
              <div className="flex items-center">
                {unitIcon}
                <SelectValue placeholder={unitLabel} />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les {unitLabel.toLowerCase()}</SelectItem>
              {availableUnits.map(unit => (
                <SelectItem key={unit} value={unit}>{unit}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </>
    </TooltipProvider>
  );
};

export default BibliothequeFilter;
