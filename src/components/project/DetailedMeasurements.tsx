
import React, { useState, useMemo } from 'react';
import { Element, Projet, Surface } from '@/types/metr';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Check, 
  AlertTriangle 
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Helper function to map element types to French labels
const getElementTypeLabel = (type: string): string => {
  const typeMap: Record<string, string> = {
    'porte': 'Porte',
    'fenetre': 'Fenêtre',
    'mur': 'Mur',
    'piece': 'Pièce'
  };
  return typeMap[type] || type;
};

// Helper function to get element unit based on type
const getElementUnit = (type: string): string => {
  const unitMap: Record<string, string> = {
    'porte': 'unité',
    'fenetre': 'unité',
    'mur': 'm²',
    'piece': 'm²'
  };
  return unitMap[type] || 'unité';
};

// Helper function to calculate element quantity
const calculateElementQuantity = (element: Element): number => {
  if (element.type === 'mur') {
    return ((element.longueur || 0) * (element.hauteur || 0)) / 10000; // Convert to m²
  } else if (element.type === 'piece') {
    return ((element.width || 0) * (element.height || 0)) / 10000; // Convert to m²
  } else {
    return element.quantite || 1;
  }
};

interface MeasurementItem {
  id: string;
  type: string;
  piece: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalCost: number;
  isValid: boolean;
  errorMessage?: string;
}

interface DetailedMeasurementsProps {
  projet: Projet;
}

const DetailedMeasurements: React.FC<DetailedMeasurementsProps> = ({ projet }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [editingCell, setEditingCell] = useState<{ id: string, field: 'quantity' | 'unitCost' } | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  // Extract and normalize all measurement items from the project
  const allMeasurementItems = useMemo(() => {
    const items: MeasurementItem[] = [];
    
    // Function to extract room name from piece ID
    const getRoomName = (pieceId: string): string => {
      const surface = projet.surfaces?.find(s => s.pieceId === pieceId);
      if (surface) return surface.nom;
      return "Pièce non identifiée";
    };

    // Process all plan elements
    projet.plans.forEach(plan => {
      if (!plan.elements) return;

      // Process doors
      plan.elements.portes?.forEach(porte => {
        const quantity = calculateElementQuantity(porte);
        const unitCost = 150; // Default unit cost for doors
        items.push({
          id: porte.id,
          type: 'porte',
          piece: porte.properties?.piece || "Non défini",
          quantity,
          unit: getElementUnit('porte'),
          unitCost,
          totalCost: quantity * unitCost,
          isValid: quantity > 0 && unitCost > 0
        });
      });

      // Process windows
      plan.elements.fenetres?.forEach(fenetre => {
        const quantity = calculateElementQuantity(fenetre);
        const unitCost = 250; // Default unit cost for windows
        items.push({
          id: fenetre.id,
          type: 'fenetre',
          piece: fenetre.properties?.piece || "Non défini",
          quantity,
          unit: getElementUnit('fenetre'),
          unitCost,
          totalCost: quantity * unitCost,
          isValid: quantity > 0 && unitCost > 0
        });
      });

      // Process walls
      plan.elements.murs?.forEach(mur => {
        const quantity = calculateElementQuantity(mur);
        const unitCost = 45; // Default unit cost for walls (per m²)
        items.push({
          id: mur.id,
          type: 'mur',
          piece: mur.properties?.piece || "Non défini",
          quantity,
          unit: getElementUnit('mur'),
          unitCost,
          totalCost: quantity * unitCost,
          isValid: quantity > 0 && unitCost > 0
        });
      });

      // Process rooms
      plan.elements.pieces?.forEach(piece => {
        const quantity = calculateElementQuantity(piece);
        const unitCost = 35; // Default unit cost for rooms (per m²)
        items.push({
          id: piece.id,
          type: 'piece',
          piece: getRoomName(piece.id),
          quantity,
          unit: getElementUnit('piece'),
          unitCost,
          totalCost: quantity * unitCost,
          isValid: quantity > 0 && unitCost > 0
        });
      });
    });

    return items;
  }, [projet]);

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return allMeasurementItems;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return allMeasurementItems.filter(item => 
      getElementTypeLabel(item.type).toLowerCase().includes(lowerSearchTerm) ||
      item.piece.toLowerCase().includes(lowerSearchTerm) ||
      item.quantity.toString().includes(lowerSearchTerm) ||
      item.unit.toLowerCase().includes(lowerSearchTerm) ||
      item.unitCost.toString().includes(lowerSearchTerm) ||
      item.totalCost.toString().includes(lowerSearchTerm)
    );
  }, [allMeasurementItems, searchTerm]);

  // Sort items based on column and direction
  const sortedItems = useMemo(() => {
    if (!sortColumn) return filteredItems;
    
    return [...filteredItems].sort((a, b) => {
      let valueA: any, valueB: any;
      
      switch (sortColumn) {
        case 'type':
          valueA = getElementTypeLabel(a.type);
          valueB = getElementTypeLabel(b.type);
          break;
        case 'piece':
          valueA = a.piece;
          valueB = b.piece;
          break;
        case 'quantity':
          valueA = a.quantity;
          valueB = b.quantity;
          break;
        case 'unitCost':
          valueA = a.unitCost;
          valueB = b.unitCost;
          break;
        case 'totalCost':
          valueA = a.totalCost;
          valueB = b.totalCost;
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredItems, sortColumn, sortDirection]);

  // Calculate totals
  const totals = useMemo(() => {
    return sortedItems.reduce((acc, item) => {
      acc.quantity += item.quantity;
      acc.totalCost += item.totalCost;
      return acc;
    }, { quantity: 0, totalCost: 0 });
  }, [sortedItems]);

  // Handle sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Start editing a cell
  const handleStartEditing = (id: string, field: 'quantity' | 'unitCost', value: number) => {
    setEditingCell({ id, field });
    setEditValue(value.toString());
  };

  // Save edited value
  const handleSaveEdit = (id: string, field: 'quantity' | 'unitCost') => {
    // In a real application, this would update the project data
    // For this demo, we just stop editing
    setEditingCell(null);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingCell(null);
  };

  // Handle key press in editing input
  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (editingCell) {
        handleSaveEdit(editingCell.id, editingCell.field);
      }
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  // Export data as CSV
  const handleExportCSV = () => {
    // Create CSV content
    const headers = ['Type', 'Pièce', 'Quantité', 'Unité', 'Coût unitaire', 'Coût total', 'Statut'];
    const rows = sortedItems.map(item => [
      getElementTypeLabel(item.type),
      item.piece,
      item.quantity.toString(),
      item.unit,
      item.unitCost.toString(),
      item.totalCost.toFixed(2),
      item.isValid ? 'Valide' : 'Erreur'
    ]);
    
    // Add total row
    rows.push([
      'TOTAL',
      '',
      totals.quantity.toString(),
      '',
      '',
      totals.totalCost.toFixed(2),
      ''
    ]);
    
    const csvContent = 
      headers.join(';') + '\n' + 
      rows.map(row => row.join(';')).join('\n');
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Métré_${projet.nom}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format price as Euro
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  // Format quantity with 2 decimal places
  const formatQuantity = (qty: number): string => {
    return qty.toFixed(2);
  };

  return (
    <div className="w-full flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-primary">Métré détaillé</h2>
        <Button
          size="sm"
          onClick={handleExportCSV}
          className="bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2"
        >
          <Download size={16} />
          Exporter CSV
        </Button>
      </div>
      
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher dans le métré..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('type')}
              >
                Type {sortColumn === 'type' && (
                  sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50" 
                onClick={() => handleSort('piece')}
              >
                Pièce {sortColumn === 'piece' && (
                  sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 text-right" 
                onClick={() => handleSort('quantity')}
              >
                Quantité {sortColumn === 'quantity' && (
                  sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead>Unité</TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 text-right" 
                onClick={() => handleSort('unitCost')}
              >
                Coût unitaire {sortColumn === 'unitCost' && (
                  sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 text-right" 
                onClick={() => handleSort('totalCost')}
              >
                Coût total {sortColumn === 'totalCost' && (
                  sortDirection === 'asc' ? <ArrowUp className="inline h-4 w-4" /> : <ArrowDown className="inline h-4 w-4" />
                )}
              </TableHead>
              <TableHead className="text-center">Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  {getElementTypeLabel(item.type)}
                </TableCell>
                <TableCell>{item.piece}</TableCell>
                <TableCell className="text-right">
                  {editingCell?.id === item.id && editingCell?.field === 'quantity' ? (
                    <Input
                      className="w-20 h-7 text-sm text-right p-1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      onBlur={handleSaveEdit.bind(null, item.id, 'quantity')}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                      onDoubleClick={() => handleStartEditing(item.id, 'quantity', item.quantity)}
                    >
                      {formatQuantity(item.quantity)}
                    </span>
                  )}
                </TableCell>
                <TableCell>{item.unit}</TableCell>
                <TableCell className="text-right">
                  {editingCell?.id === item.id && editingCell?.field === 'unitCost' ? (
                    <Input
                      className="w-20 h-7 text-sm text-right p-1"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={handleEditKeyPress}
                      onBlur={handleSaveEdit.bind(null, item.id, 'unitCost')}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="cursor-pointer hover:bg-gray-50 px-1 py-0.5 rounded"
                      onDoubleClick={() => handleStartEditing(item.id, 'unitCost', item.unitCost)}
                    >
                      {formatPrice(item.unitCost)}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatPrice(item.totalCost)}
                </TableCell>
                <TableCell className="text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span>
                          {item.isValid ? (
                            <Check className="inline h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="inline h-5 w-5 text-red-500" />
                          )}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {item.isValid 
                          ? "Valide" 
                          : "Erreur : La quantité ou le coût unitaire est invalide (≤ 0)"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))}
            
            {/* Totals row */}
            <TableRow className="bg-blue-50">
              <TableCell colSpan={2} className="font-medium">Total</TableCell>
              <TableCell className="text-right font-medium">{formatQuantity(totals.quantity)}</TableCell>
              <TableCell></TableCell>
              <TableCell></TableCell>
              <TableCell className="text-right font-semibold">{formatPrice(totals.totalCost)}</TableCell>
              <TableCell></TableCell>
            </TableRow>
            
            {/* Empty state */}
            {sortedItems.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <p className="text-sm text-gray-500">
                      Aucun élément trouvé
                    </p>
                    {searchTerm && (
                      <p className="text-xs text-gray-400 mt-1">
                        Essayez de modifier votre recherche
                      </p>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DetailedMeasurements;
