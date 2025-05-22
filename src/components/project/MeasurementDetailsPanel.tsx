
import React from 'react';
import { Measurement } from '@/models/Measurement';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Save } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface MeasurementDetailsPanelProps {
  measurements: Measurement[];
  onEditMeasurement?: (measurement: Measurement) => void;
  onDeleteMeasurement?: (measurementId: string) => void;
}

const MeasurementDetailsPanel: React.FC<MeasurementDetailsPanelProps> = ({
  measurements,
  onEditMeasurement,
  onDeleteMeasurement
}) => {
  // Group measurements by type
  const surfaceMeasurements = measurements.filter(m => m.type === 'area');
  const linearMeasurements = measurements.filter(m => m.type === 'linear');
  const countMeasurements = measurements.filter(m => m.type === 'count');
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const renderMeasurementTable = (title: string, measurementsList: Measurement[]) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {measurementsList.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Unité</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {measurementsList.map((measurement) => (
              <TableRow key={measurement.id}>
                <TableCell className="font-mono text-xs">{measurement.id.substring(0, 8)}...</TableCell>
                <TableCell>{measurement.value.toFixed(2)}</TableCell>
                <TableCell>{measurement.unit}</TableCell>
                <TableCell>{formatDate(measurement.date)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={() => onEditMeasurement?.(measurement)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Modifier</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-red-500"
                          onClick={() => onDeleteMeasurement?.(measurement.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Supprimer</TooltipContent>
                    </Tooltip>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <p className="text-sm text-gray-500 italic">Aucune mesure</p>
      )}
    </div>
  );
  
  return (
    <div className="p-4 space-y-4 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Détails des mesures</h2>
        <Button size="sm" className="bg-metrBlue hover:bg-blue-700 text-white">
          <Save className="h-4 w-4 mr-1" />
          Exporter
        </Button>
      </div>
      
      {renderMeasurementTable('Surfaces', surfaceMeasurements)}
      {renderMeasurementTable('Longueurs', linearMeasurements)}
      {renderMeasurementTable('Comptages', countMeasurements)}
      
      {measurements.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune mesure effectuée</p>
          <p className="text-sm text-gray-400 mt-2">
            Utilisez les outils de mesure pour ajouter des mesures au projet
          </p>
        </div>
      )}
    </div>
  );
};

export default MeasurementDetailsPanel;
