
import React from 'react';
import { CheckSquare, Trash2, FolderPlus, Square, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Library } from '@/types/library';

interface LibrarySelectionToolbarProps {
  selectedItemsCount: number;
  allItemsCount: number;
  onSelectAll: () => void;
  onSelectNone: () => void;
  onDeleteSelected: () => void;
  onMoveToLibrary: (targetLibraryId: string) => void;
  onExitSelectionMode: () => void;
  libraries: Library[];
  currentLibraryId: string;
}

const LibrarySelectionToolbar: React.FC<LibrarySelectionToolbarProps> = ({
  selectedItemsCount,
  allItemsCount,
  onSelectAll,
  onSelectNone,
  onDeleteSelected,
  onMoveToLibrary,
  onExitSelectionMode,
  libraries,
  currentLibraryId
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-2 px-4 bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 w-9 p-0 flex items-center justify-center">
              <Square className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onClick={onSelectAll}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Tout sélectionner
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSelectNone}>
              <Square className="h-4 w-4 mr-2" />
              Aucune sélection
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Badge variant="outline" className="text-sm font-normal">
          {selectedItemsCount} {selectedItemsCount > 1 ? 'articles sélectionnés' : 'article sélectionné'} sur {allItemsCount}
        </Badge>
      </div>
      
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {selectedItemsCount > 0 && (
          <>
            <Button 
              variant="outline" 
              size="sm"
              className="text-red-500 hover:text-red-600 border-red-200 hover:border-red-300"
              onClick={onDeleteSelected}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
            
            <Separator orientation="vertical" className="h-6" />
            
            <Select
              onValueChange={(value) => onMoveToLibrary(value)}
              disabled={currentLibraryId !== 'all' && libraries.filter(lib => lib.id !== currentLibraryId && lib.id !== 'all').length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <div className="flex items-center">
                  <FolderPlus className="h-4 w-4 mr-2" />
                  <span>Déplacer vers...</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {libraries
                  .filter(lib => lib.id !== currentLibraryId && lib.id !== 'all')
                  .map(lib => (
                    <SelectItem key={lib.id} value={lib.id}>
                      {lib.name}
                    </SelectItem>
                  ))}
                {(currentLibraryId !== 'all' && libraries.filter(lib => lib.id !== currentLibraryId && lib.id !== 'all').length === 0) && (
                  <SelectItem value="" disabled>
                    Aucune bibliothèque disponible
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </>
        )}
        
        <Button variant="outline" size="sm" onClick={onExitSelectionMode}>
          Annuler
        </Button>
      </div>
    </div>
  );
};

export default LibrarySelectionToolbar;
