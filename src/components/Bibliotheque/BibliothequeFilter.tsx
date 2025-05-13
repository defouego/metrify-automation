
import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { FormLabel } from '@/components/ui/form';

interface BibliothequeFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  unitFilter: string;
  setUnitFilter: (unit: string) => void;
  libraryFilter: string;
  setLibraryFilter: (library: string) => void;
  categories: string[];
  uniqueTypes: string[];
  uniqueUnits: string[];
  libraries: string[];
}

const BibliothequeFilter: React.FC<BibliothequeFilterProps> = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  typeFilter,
  setTypeFilter,
  unitFilter,
  setUnitFilter,
  libraryFilter,
  setLibraryFilter,
  categories,
  uniqueTypes,
  uniqueUnits,
  libraries
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
        <Input 
          placeholder="Rechercher un article..." 
          className="pl-10" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
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
            {/* Mobile filters */}
            <div>
              <FormLabel>Bibliothèque</FormLabel>
              <Select value={libraryFilter} onValueChange={setLibraryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Toutes les bibliothèques" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les bibliothèques</SelectItem>
                  {libraries.map(library => (
                    <SelectItem key={library} value={library}>{library}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
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
              <FormLabel>Type</FormLabel>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {uniqueTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
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
        <Select value={libraryFilter} onValueChange={setLibraryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Bibliothèque" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les bibliothèques</SelectItem>
            {libraries.map(library => (
              <SelectItem key={library} value={library}>{library}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        
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
        
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            {uniqueTypes.map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
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
    </div>
  );
};

export default BibliothequeFilter;
