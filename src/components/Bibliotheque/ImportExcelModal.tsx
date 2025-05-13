
import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

interface ExcelPreviewRow {
  designation: string;
  lot: string;
  type: string;
  unite: string;
  prix_unitaire: string | number;
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

  // Handle excel file upload
  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check for valid extensions
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez importer un fichier Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      });
      return;
    }
    
    setExcelFile(file);
    setIsUploading(true);
    
    // Read the Excel file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);
        
        // Process and validate data
        const processedData: ExcelPreviewRow[] = jsonData.map((row: any) => {
          const isValid = 
            row.designation && 
            row.lot && 
            row.unite && 
            (!isNaN(parseFloat(row.prix_unitaire)) || typeof row.prix_unitaire === 'number');
          
          let errorMessage = '';
          if (!row.designation) errorMessage = "Désignation manquante";
          else if (!row.lot) errorMessage = "Lot manquant";
          else if (!row.unite) errorMessage = "Unité manquante";
          else if (isNaN(parseFloat(row.prix_unitaire)) && typeof row.prix_unitaire !== 'number') 
            errorMessage = "Prix unitaire invalide";
          
          return {
            designation: row.designation || '',
            lot: row.lot || '',
            type: row.type || '',
            unite: row.unite || '',
            prix_unitaire: row.prix_unitaire || 0,
            bibliotheque: row.bibliotheque || 'default',
            isValid,
            errorMessage: isValid ? undefined : errorMessage
          };
        });
        
        setPreviewData(processedData);
        setIsUploading(false);
        setMappingStep(true);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier Excel. Vérifiez le format du fichier.",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier Excel.",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsBinaryString(file);
  };
  
  // Handle drag over event
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Handle drop event
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check for valid extensions
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Format non supporté",
        description: "Veuillez importer un fichier Excel (.xlsx, .xls) ou CSV (.csv)",
        variant: "destructive",
      });
      return;
    }
    
    setExcelFile(file);
    setIsUploading(true);
    
    // Read the Excel file (same code as above, could be refactored)
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<any>(sheet);
        
        // Process and validate data
        const processedData: ExcelPreviewRow[] = jsonData.map((row: any) => {
          const isValid = 
            row.designation && 
            row.lot && 
            row.unite && 
            (!isNaN(parseFloat(row.prix_unitaire)) || typeof row.prix_unitaire === 'number');
          
          let errorMessage = '';
          if (!row.designation) errorMessage = "Désignation manquante";
          else if (!row.lot) errorMessage = "Lot manquant";
          else if (!row.unite) errorMessage = "Unité manquante";
          else if (isNaN(parseFloat(row.prix_unitaire)) && typeof row.prix_unitaire !== 'number') 
            errorMessage = "Prix unitaire invalide";
          
          return {
            designation: row.designation || '',
            lot: row.lot || '',
            type: row.type || '',
            unite: row.unite || '',
            prix_unitaire: row.prix_unitaire || 0,
            bibliotheque: row.bibliotheque || 'default',
            isValid,
            errorMessage: isValid ? undefined : errorMessage
          };
        });
        
        setPreviewData(processedData);
        setIsUploading(false);
        setMappingStep(true);
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier Excel. Vérifiez le format du fichier.",
          variant: "destructive",
        });
        setIsUploading(false);
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Erreur de lecture",
        description: "Impossible de lire le fichier Excel.",
        variant: "destructive",
      });
      setIsUploading(false);
    };
    
    reader.readAsBinaryString(file);
  };
  
  // Handle import confirmation
  const handleConfirmImport = () => {
    // Filter out invalid rows
    const validRows = previewData.filter(row => row.isValid);
    
    if (validRows.length === 0) {
      toast({
        title: "Import impossible",
        description: "Aucune ligne valide à importer",
        variant: "destructive",
      });
      return;
    }
    
    onImportConfirm(validRows);
    resetImportState();
    onOpenChange(false);
  };
  
  // Handle import cancel
  const handleCancelImport = () => {
    resetImportState();
    onOpenChange(false);
  };
  
  const resetImportState = () => {
    setExcelFile(null);
    setPreviewData([]);
    setMappingStep(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  // Handle continuing to mapping
  const handleContinueToMapping = () => {
    if (!excelFile || isUploading) return;
    setMappingStep(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Importer des articles</DialogTitle>
          <DialogDescription>
            Déposez votre fichier Excel contenant votre bibliothèque d'articles.
          </DialogDescription>
        </DialogHeader>
        
        {!mappingStep ? (
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleExcelUpload} 
              accept=".xlsx,.xls,.csv"
            />
            {isUploading ? (
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-t-metrOrange border-gray-200 rounded-full animate-spin"></div>
                <p className="mt-4 text-sm text-gray-500">Traitement en cours...</p>
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
                  onClick={(e) => {
                    e.stopPropagation();
                    setExcelFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            ) : (
              <>
                <Upload className="mx-auto h-10 w-10 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Déposez votre fichier Excel ici, ou cliquez pour sélectionner</p>
                <p className="text-xs text-gray-400 mt-1">Formats supportés: .xlsx, .xls, .csv</p>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="text-sm text-gray-500 mb-2">
              Aperçu des {Math.min(previewData.length, 5)} premières lignes
            </div>
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
                  {previewData.slice(0, 5).map((row, index) => (
                    <TableRow key={index} className={!row.isValid ? "bg-red-50" : ""}>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell>{row.lot}</TableCell>
                      <TableCell>{row.type || "-"}</TableCell>
                      <TableCell>{row.unite}</TableCell>
                      <TableCell>{typeof row.prix_unitaire === 'number' ? row.prix_unitaire.toFixed(2) : row.prix_unitaire}</TableCell>
                      <TableCell>
                        {row.isValid ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">Valide</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800 border-red-200" title={row.errorMessage}>Erreur</Badge>
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
                  {previewData.filter(r => r.isValid).length} lignes valides sur {previewData.length}
                </p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={handleCancelImport}>Annuler</Button>
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
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelImport}>Annuler</Button>
            <Button 
              className="bg-metrOrange hover:bg-metrOrange/90"
              disabled={!excelFile || isUploading}
              onClick={handleContinueToMapping}
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
