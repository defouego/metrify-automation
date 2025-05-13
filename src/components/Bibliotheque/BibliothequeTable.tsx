
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LibraryItem } from '@/types/library';

interface BibliothequeTableProps {
  filteredItems: LibraryItem[];
  onEditItem: (item: LibraryItem) => void;
  onDeleteItem: (id: string) => void;
}

const BibliothequeTable: React.FC<BibliothequeTableProps> = ({
  filteredItems,
  onEditItem,
  onDeleteItem
}) => {
  return (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[300px]">Désignation</TableHead>
            <TableHead className="min-w-[200px]">Lot</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Unité</TableHead>
            <TableHead className="text-right">Prix unitaire</TableHead>
            <TableHead className="text-right">Dernière mise à jour</TableHead>
            <TableHead className="w-[100px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <TableRow key={item.id} className="group transition-colors hover:bg-gray-50">
                <TableCell>
                  <div className="flex items-center">
                    {item.designation}
                    {item.isNew && (
                      <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Nouveau</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{item.lot}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.unite}</TableCell>
                <TableCell className="text-right">{item.prix_unitaire.toFixed(2)} €</TableCell>
                <TableCell className="text-right">{item.date_derniere_utilisation || '-'}</TableCell>
                <TableCell>
                  <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" onClick={() => onEditItem(item)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => onDeleteItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Aucun élément trouvé.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default BibliothequeTable;
