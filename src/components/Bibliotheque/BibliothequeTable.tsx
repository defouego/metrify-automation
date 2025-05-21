
import React from 'react';
import { Edit, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LibraryItem } from '@/types/library';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BibliothequeTableProps {
  filteredItems: LibraryItem[];
  onEditItem: (item: LibraryItem) => void;
  onDeleteItem: (id: string) => void;
  onFavoriteItem: (id: string, isFavorite: boolean) => void;
  selectionMode: boolean;
  selectedItems: string[];
  onSelectItem: (id: string, isSelected: boolean) => void;
  onCellDoubleClick: (item: LibraryItem, field: string) => void;
}

const BibliothequeTable: React.FC<BibliothequeTableProps> = ({
  filteredItems,
  onEditItem,
  onDeleteItem,
  onFavoriteItem,
  selectionMode,
  selectedItems,
  onSelectItem,
  onCellDoubleClick
}) => {
  // Add safety check for filteredItems and selectedItems
  const itemsToRender = filteredItems || [];
  const selected = selectedItems || [];

  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  return (
    <TooltipProvider>
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="h-10">
              <TableHead className="w-[30px]"></TableHead>
              <TableHead className="w-[30px]"></TableHead>
              <TableHead className="min-w-[200px]">Désignation</TableHead>
              <TableHead className="min-w-[150px]">Lot</TableHead>
              <TableHead>Sous-catégorie</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead className="text-right">Prix unitaire</TableHead>
              <TableHead className="text-right w-[200px]">Dernière mise à jour</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itemsToRender.length > 0 ? (
              itemsToRender.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={`group transition-colors hover:bg-gray-50 ${selected.includes(item.id) ? 'bg-blue-50' : ''} h-10`}
                >
                  <TableCell className="p-2 w-[30px]">
                    <Checkbox 
                      checked={selected.includes(item.id)} 
                      onCheckedChange={(checked) => onSelectItem(item.id, !!checked)}
                      className="ml-1"
                    />
                  </TableCell>
                  <TableCell className="p-2 w-[30px]">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className={`h-6 w-6 ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-500`} 
                      onClick={() => onFavoriteItem(item.id, !item.isFavorite)}
                      title={item.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                    >
                      <Star className="h-4 w-4" fill={item.isFavorite ? "currentColor" : "none"} />
                    </Button>
                  </TableCell>
                  <TableCell 
                    className="p-2" 
                    onDoubleClick={() => onCellDoubleClick(item, 'designation')}
                  >
                    <div className="flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="truncate max-w-[200px]">{item.designation}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          {item.designation}
                        </TooltipContent>
                      </Tooltip>
                      {item.isNew && (
                        <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Nouveau</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell 
                    className="p-2" 
                    onDoubleClick={() => onCellDoubleClick(item, 'lot')}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate max-w-[150px]">{item.lot}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.lot}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    className="p-2" 
                    onDoubleClick={() => onCellDoubleClick(item, 'subCategory')}
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="truncate max-w-[150px]">{item.subCategory}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.subCategory}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell 
                    className="p-2" 
                    onDoubleClick={() => onCellDoubleClick(item, 'unite')}
                  >
                    {item.unite}
                  </TableCell>
                  <TableCell 
                    className="p-2 text-right"
                    onDoubleClick={() => onCellDoubleClick(item, 'prix_unitaire')}
                  >
                    {item.prix_unitaire.toFixed(2)} €
                  </TableCell>
                  <TableCell className="p-2 text-right relative">
                    <span className="pr-16">{item.date_derniere_utilisation || '-'}</span>
                    <div className="absolute top-1 right-2 flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => onEditItem(item)} className="h-7 w-7">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 h-7 w-7" onClick={() => onDeleteItem(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  Aucun élément trouvé.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
};

export default BibliothequeTable;
