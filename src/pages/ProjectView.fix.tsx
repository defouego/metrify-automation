
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import CalibrationGuide from '@/components/project/CalibrationGuide';
import { Element, Ouvrage, Projet } from '@/types/metr';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { downloadExcel } from '@/utils/excel-utils';

interface DetailedMeasurementsProps {
  projet: Projet;
  onElementHover?: (elementId: string | null) => void;
  onEditOuvrage?: (ouvrage: Ouvrage) => void;
}

const ProjectViewFixContent = ({ 
  isCalibrating, 
  calibrationStep,
  projet,
  onElementHover,
  onEditOuvrage
}: { 
  isCalibrating: boolean;
  calibrationStep: number;
  projet: any;
  onElementHover?: (elementId: string | null) => void;
  onEditOuvrage?: (ouvrage: Ouvrage) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingOuvrage, setEditingOuvrage] = useState<string | null>(null);
  const [editedDesignation, setEditedDesignation] = useState<string>('');
  const [editedQuantite, setEditedQuantite] = useState<number>(0);
  const [editedPrix, setEditedPrix] = useState<number>(0);

  // Calculate total cost and quantity
  const totalCost = projet.ouvrages.reduce(
    (total: number, ouvrage: Ouvrage) => total + calculateOuvrageCost(ouvrage),
    0
  );

  // Calculate the cost of an ouvrage considering coefficient
  function calculateOuvrageCost(ouvrage: Ouvrage): number {
    return ouvrage.quantite * ouvrage.prix_unitaire * (ouvrage.coefficient || 1);
  }

  // Filter ouvrages based on search query
  const filteredOuvrages = projet.ouvrages.filter((ouvrage: Ouvrage) => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      ouvrage.designation.toLowerCase().includes(query) ||
      ouvrage.lot.toLowerCase().includes(query) ||
      ouvrage.localisation.niveau.toLowerCase().includes(query) ||
      ouvrage.localisation.piece.toLowerCase().includes(query) ||
      ouvrage.unite.toLowerCase().includes(query)
    );
  });

  // Handle start editing an ouvrage
  const handleStartEditingOuvrage = (ouvrage: Ouvrage) => {
    setEditingOuvrage(ouvrage.id);
    setEditedDesignation(ouvrage.designation);
    setEditedQuantite(ouvrage.quantite);
    setEditedPrix(ouvrage.prix_unitaire);
  };

  // Handle save edited ouvrage
  const handleSaveEditedOuvrage = () => {
    if (!editingOuvrage || !onEditOuvrage) return;
    
    const ouvrageToUpdate = projet.ouvrages.find((o: Ouvrage) => o.id === editingOuvrage);
    if (!ouvrageToUpdate) return;
    
    const updatedOuvrage = {
      ...ouvrageToUpdate,
      designation: editedDesignation,
      quantite: editedQuantite,
      prix_unitaire: editedPrix,
    };
    
    onEditOuvrage(updatedOuvrage);
    setEditingOuvrage(null);
  };

  // Format numbers with 2 decimal places and euro symbol
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(price);
  };

  // Handle ouvrage hover to highlight element on plan
  const handleOuvrageHover = (ouvrage: Ouvrage | null) => {
    if (!onElementHover) return;
    
    if (ouvrage && ouvrage.surfaceId) {
      // Find the surface to get the pieceId to highlight
      const surface = projet.surfaces?.find((s: any) => s.id === ouvrage.surfaceId);
      if (surface) {
        onElementHover(surface.pieceId);
      }
    } else {
      onElementHover(null);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const csvContent = [
      // Header row
      ['Désignation', 'Lot', 'Type', 'Localisation', 'Quantité', 'Unité', 'Prix unitaire', 'Total'].join(','),
      // Data rows
      ...filteredOuvrages.map((ouvrage: Ouvrage) => [
        `"${ouvrage.designation}"`,
        `"${ouvrage.lot}"`,
        `"${ouvrage.type || ''}"`,
        `"${ouvrage.localisation.niveau} - ${ouvrage.localisation.piece}"`,
        ouvrage.quantite,
        ouvrage.unite,
        ouvrage.prix_unitaire,
        calculateOuvrageCost(ouvrage)
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${projet.nom}_metré_détaillé.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      {/* Calibration Dialog - Show for introduction and between steps */}
      <Dialog open={isCalibrating && (calibrationStep === 0 || calibrationStep === 1)} onOpenChange={() => {}}>
        <DialogContent className="p-0 border-0 max-w-xl">
          <DialogTitle className="sr-only">Calibration Guide</DialogTitle>
          <CalibrationGuide onClose={() => console.log('Close calibration guide')} />
        </DialogContent>
      </Dialog>
      
      {/* Detailed Measurements View */}
      {projet && !isCalibrating && (
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center flex-1 gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher un ouvrage..."
                className="h-8 w-full bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              size="sm"
              onClick={handleExportCSV}
              className="bg-orange-500 hover:bg-orange-600 text-white h-8 ml-2 text-xs"
            >
              Exporter CSV
            </Button>
            <Button
              size="sm"
              onClick={() => downloadExcel(projet)}
              className="bg-green-600 hover:bg-green-700 text-white h-8 ml-2 text-xs"
            >
              Exporter Excel
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="sticky top-0 bg-white z-10">
                <TableRow>
                  <TableHead className="w-[40%]">Désignation</TableHead>
                  <TableHead className="w-[20%]">Localisation</TableHead>
                  <TableHead className="w-[10%]">Quantité</TableHead>
                  <TableHead className="w-[10%]">Prix unit.</TableHead>
                  <TableHead className="w-[15%] text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOuvrages.map((ouvrage: Ouvrage) => (
                  <TableRow 
                    key={ouvrage.id}
                    onMouseEnter={() => handleOuvrageHover(ouvrage)}
                    onMouseLeave={() => handleOuvrageHover(null)}
                    className="hover:bg-gray-50 cursor-pointer h-8"
                  >
                    <TableCell className="py-1">
                      {editingOuvrage === ouvrage.id ? (
                        <Input 
                          value={editedDesignation}
                          onChange={(e) => setEditedDesignation(e.target.value)}
                          className="h-6 text-xs py-0"
                          onBlur={handleSaveEditedOuvrage}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEditedOuvrage()}
                          autoFocus
                        />
                      ) : (
                        <div className="flex items-center gap-1" onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                          <span className="font-medium text-xs truncate">{ouvrage.designation}</span>
                          <span className="text-xs text-gray-500">({ouvrage.lot})</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="py-1 text-xs">
                      {ouvrage.localisation.niveau} - {ouvrage.localisation.piece}
                    </TableCell>
                    <TableCell className="py-1">
                      {editingOuvrage === ouvrage.id ? (
                        <Input 
                          type="number"
                          value={editedQuantite}
                          onChange={(e) => setEditedQuantite(parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs py-0 w-16"
                          min={0}
                          step={0.01}
                          onBlur={handleSaveEditedOuvrage}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEditedOuvrage()}
                        />
                      ) : (
                        <span className="text-xs" onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                          {ouvrage.quantite} {ouvrage.unite}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-1">
                      {editingOuvrage === ouvrage.id ? (
                        <Input 
                          type="number"
                          value={editedPrix}
                          onChange={(e) => setEditedPrix(parseFloat(e.target.value) || 0)}
                          className="h-6 text-xs py-0 w-20"
                          min={0}
                          step={0.01}
                          onBlur={handleSaveEditedOuvrage}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEditedOuvrage()}
                        />
                      ) : (
                        <span className="text-xs" onDoubleClick={() => handleStartEditingOuvrage(ouvrage)}>
                          {ouvrage.prix_unitaire} €
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="py-1 text-right">
                      <span className="text-xs font-medium">
                        {formatPrice(calculateOuvrageCost(ouvrage))}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-blue-50">
                  <TableCell colSpan={4} className="py-1 font-medium text-xs">Total</TableCell>
                  <TableCell className="py-1 text-right font-semibold text-xs">
                    {formatPrice(totalCost)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectViewFixContent;
