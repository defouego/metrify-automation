// src/components/Bibliotheque/ImportExcelModal.tsx
import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface ExcelPreviewRow {
  designation: string;
  lot: string;
  type: string;
  unite: string;
  prix_unitaire: number;
  bibliotheque?: string;
  isValid: boolean;
  errorMessage?: string;
}

interface ImportExcelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportConfirm: (rows: ExcelPreviewRow[]) => void;
}

const ImportExcelModal: React.FC<ImportExcelModalProps> = ({
  open,
  onOpenChange,
  onImportConfirm
}) => {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ExcelPreviewRow[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mappingStep, setMappingStep] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const validExtensions = ['.xlsx', '.xls', '.csv'];

  const processFile = (file: File) => {
    setExcelFile(file);
    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);

        const processed: ExcelPreviewRow[] = jsonData.map(row => {
          const rawDesignation = row['Désignation_de_la_Fourniture'];
          const rawLot         = row['Lot'];
          const rawType        = row['Sous-Lot']    || '';
          const rawUnite       = row['Unité'];
          const rawPrix        = row['Prix'];
          const prixNum        = parseFloat(rawPrix);

          const isValid =
            !!rawDesignation &&
            !!rawLot &&
            !!rawUnite &&
            !isNaN(prixNum);

          let errorMessage = '';
          if (!rawDesignation)        errorMessage = 'Désignation manquante';
          else if (!rawLot)           errorMessage = 'Lot manquant';
          else if (!rawUnite)         errorMessage = 'Unité manquante';
          else if (isNaN(prixNum))    errorMessage = 'Prix unitaire invalide';

          return {
            designation: String(rawDesignation || ''),
            lot:         String(rawLot         || ''),
            type:        String(rawType        || ''),
            unite:       String(rawUnite       || ''),
            prix_unitaire: isNaN(prixNum) ? 0 : prixNum,
            bibliotheque: 'default',
            isValid,
            errorMessage: isValid ? undefined : errorMessage
          };
        });

        setPreviewData(processed);
        setMappingStep(true);
      } catch {
        toast({
          title: 'Erreur de lecture',
          description: 'Impossible de lire le fichier Excel.',
          variant: 'destructive'
        });
      } finally {
        setIsUploading(false);
      }
    };

    reader.onerror = () => {
      toast({
        title: 'Erreur de lecture',
        description: 'Impossible de lire le fichier Excel.',
        variant: 'destructive'
      });
      setIsUploading(false);
    };

    reader.readAsBinaryString(file);
  };

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast({
        title: 'Format non supporté',
        description: 'Formats valides : .xlsx, .xls, .csv',
        variant: 'destructive'
      });
      return;
    }
    processFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(ext)) {
      toast({
        title: 'Format non supporté',
        description: 'Formats valides : .xlsx, .xls, .csv',
        variant: 'destructive'
      });
      return;
    }
    processFile(file);
  };

  const handleConfirmImport = () => {
    const validRows = previewData.filter(r => r.isValid);
    if (validRows.length === 0) {
      toast({
        title: 'Import impossible',
        description: 'Aucune ligne valide à importer',
        variant: 'destructive'
      });
      return;
    }
    onImportConfirm(validRows);
    reset();
    onOpenChange(false);
  };

  const handleCancelImport = () => {
    reset();
    onOpenChange(false);
  };

  const reset = () => {
    setExcelFile(null);
    setPreviewData([]);
    setMappingStep(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleContinue = () => {
    if (excelFile && !isUploading) setMappingStep(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Importer Excel</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Importer des articles</DialogTitle>
          <DialogDescription>
            Déposez votre fichier Excel ou CSV contenant votre bibliothèque.
          </DialogDescription>
        </DialogHeader>

        {!mappingStep ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer
                       hover:bg-gray-50 transition-colors"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleExcelUpload}
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-t-metrOrange border-gray-200 rounded-full animate-spin" />
                <p className="mt-4 text-sm text-gray-500">Traitement en cours…</p>
              </div>
            ) : excelFile ? (
              <div className="flex flex-col items-center">
                <div className="bg-green-100 text-green-800 p-2 rounded-full">
                  <Upload className="h-8 w-8" />
                </div>
                <p className="mt-2 font-medium">{excelFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(excelFile.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={e => {
                    e.stopPropagation();
                    reset();
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  Déposez votre fichier ici ou cliquez pour sélectionner
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Formats : .xlsx, .xls, .csv
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-2">
              Aperçu des {Math.min(previewData.length, 5)} premières lignes
            </p>
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Désignation</TableHead>
                    <TableHead>Lot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead>Prix HT</TableHead>
                    <TableHead className="w-[100px]">Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.slice(0, 5).map((row, i) => (
                    <TableRow key={i} className={!row.isValid ? 'bg-red-50' : ''}>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell>{row.lot}</TableCell>
                      <TableCell>{row.type || '-'}</TableCell>
                      <TableCell>{row.unite}</TableCell>
                      <TableCell>{row.prix_unitaire.toFixed(2)}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            Valide
                          </Badge>
                        ) : (
                          <Badge
                            className="bg-red-100 text-red-800 border-red-200"
                            title={row.errorMessage}
                          >
                            Erreur
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="flex justify-between mt-4">
              <div>
                <p className="text-sm font-medium">Informations</p>
                <p className="text-sm text-gray-500">
                  {previewData.filter(r => r.isValid).length} lignes valides sur{' '}
                  {previewData.length}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancelImport}>
                  Annuler
                </Button>
                <Button
                  className="bg-metrOrange hover:bg-metrOrange/90"
                  onClick={handleConfirmImport}
                >
                  Importer ({previewData.filter(r => r.isValid).length})
                </Button>
              </div>
            </div>
          </>
        )}

        {!mappingStep && (
          <DialogFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleCancelImport}>
              Annuler
            </Button>
            <Button
              className="bg-metrOrange hover:bg-metrOrange/90"
              disabled={!excelFile || isUploading}
              onClick={handleContinue}
            >
              Continuer
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ImportExcelModal;
