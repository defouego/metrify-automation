
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Square, CheckSquare, FolderOutput, X } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Library } from '@/models/Library';

interface LibrarySelectionToolbarProps {
  selectedItemsCount: number;
  allItemsCount: number;
  currentLibraryId: string;
  libraries: Library[];
  onSelectAll: () => void;
  onSelectNone: () => void;
  onDeleteSelected: () => void;
  onMoveToLibrary: (targetLibraryId: string) => void;
  onExitSelectionMode: () => void;
}

const LibrarySelectionToolbar: React.FC<LibrarySelectionToolbarProps> = ({
  selectedItemsCount,
  allItemsCount,
  currentLibraryId,
  libraries,
  onSelectAll,
  onSelectNone,
  onDeleteSelected,
  onMoveToLibrary,
  onExitSelectionMode
}) => {
  const [isSelectMenuOpen, setIsSelectMenuOpen] = useState(false);

  return (
    <div className="bg-white border rounded-md p-2 mb-2 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Popover open={isSelectMenuOpen} onOpenChange={setIsSelectMenuOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              {selectedItemsCount > 0 ? <CheckSquare className="h-4 w-4 mr-1" /> : <Square className="h-4 w-4 mr-1" />}
              {selectedItemsCount > 0 ? (
                <span>{selectedItemsCount} sélectionné{selectedItemsCount > 1 ? 's' : ''}</span>
              ) : (
                <span>Sélectionner</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="flex flex-col space-y-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start"
                onClick={() => {
                  onSelectAll();
                  setIsSelectMenuOpen(false);
                }}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Tous ({allItemsCount})
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start"
                onClick={() => {
                  onSelectNone();
                  setIsSelectMenuOpen(false);
                }}
              >
                <Square className="h-4 w-4 mr-2" />
                Aucun
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-6 border-l border-gray-300 mx-1"></div>

        {selectedItemsCount > 0 && (
          <>
            <Select 
              onValueChange={onMoveToLibrary}
              disabled={selectedItemsCount === 0}
            >
              <SelectTrigger className="h-8 w-[200px]">
                <div className="flex items-center">
                  <FolderOutput className="h-4 w-4 mr-2" />
                  <span>Déplacer vers</span>
                </div>
              </SelectTrigger>
              <SelectContent>
                {libraries
                  .filter(lib => lib.id !== 'all' && lib.id !== currentLibraryId)
                  .map(library => (
                    <SelectItem key={library.id} value={library.id}>
                      {library.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-red-600 hover:bg-red-50"
              onClick={onDeleteSelected}
              disabled={selectedItemsCount === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </>
        )}
      </div>
      
      <Button variant="ghost" size="sm" onClick={onExitSelectionMode}>
        <X className="h-4 w-4 mr-2" />
        Fermer
      </Button>
    </div>
  );
};

export default LibrarySelectionToolbar;
