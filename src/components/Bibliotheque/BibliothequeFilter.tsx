
import React from 'react';
import { Filter, Plus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FormLabel } from '@/components/ui/form';

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
  uniqueUnits
}) => {
  return (
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
            <div>
              <FormLabel>Lot</FormLabel>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les lots" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les lots</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <FormLabel>Sous-catégorie</FormLabel>
              <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les sous-catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les sous-catégories</SelectItem>
                  {uniqueSubCategories.map(subCategory => (
                    <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <FormLabel>Unité</FormLabel>
              <Select value={unitFilter} onValueChange={setUnitFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les unités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les unités</SelectItem>
                  {uniqueUnits.map(unit => (
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Lot" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les lots</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={subCategoryFilter} onValueChange={setSubCategoryFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sous-catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les sous-catégories</SelectItem>
            {uniqueSubCategories.map(subCategory => (
              <SelectItem key={subCategory} value={subCategory}>{subCategory}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={unitFilter} onValueChange={setUnitFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Unité" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les unités</SelectItem>
            {uniqueUnits.map(unit => (
              <SelectItem key={unit} value={unit}>{unit}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};

export default BibliothequeFilter;
