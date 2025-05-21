
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ImportBibliothequeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportConfirm: (data: { items?: any[], library?: string, format?: string }) => void;
}

const ImportBibliothequeModal: React.FC<ImportBibliothequeModalProps> = ({
  open,
  onOpenChange,
  onImportConfirm
}) => {
  const [libraryName, setLibraryName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [importTab, setImportTab] = useState<string>("excel");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ['.xlsx', '.xls', '.csv'];
      const ext = droppedFile.name.substring(droppedFile.name.lastIndexOf('.')).toLowerCase();
      
      if (validExtensions.includes(ext)) {
        setFile(droppedFile);
      } else {
        toast({
          title: "Format non supporté",
          description: "Veuillez déposer un fichier Excel (.xlsx, .xls, .csv)",
          variant: "destructive",
        });
      }
    }
  };

  const validateExcelData = (data: any[]): boolean => {
    // Basic validation - check for required fields
    const requiredFields = ['designation', 'lot', 'subCategory', 'unite', 'prix_unitaire'];
    
    // Check if array is not empty
    if (data.length === 0) {
      toast({
        title: "Fichier vide",
        description: "Le fichier ne contient aucune donnée",
        variant: "destructive",
      });
      return false;
    }
    
    // Check if first row has the required fields
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => !Object.keys(firstRow).includes(field));
    
    if (missingFields.length > 0) {
      toast({
        title: "Format incorrect",
        description: `Champs requis manquants: ${missingFields.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };
  
  const processExcelFile = async () => {
    if (!file) {
      toast({
        title: "Fichier requis",
        description: "Veuillez sélectionner un fichier",
        variant: "destructive",
      });
      return;
    }
    
    if (!libraryName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour la bibliothèque",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          
          if (validateExcelData(json as any[])) {
            onImportConfirm({
              items: json as any[],
              library: libraryName,
              format: 'excel'
            });
            
            resetForm();
            onOpenChange(false);
          }
        } catch (error) {
          toast({
            title: "Erreur de traitement",
            description: "Impossible de traiter le fichier Excel",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      reader.onerror = () => {
        toast({
          title: "Erreur de lecture",
          description: "Impossible de lire le fichier",
          variant: "destructive",
        });
        setIsLoading(false);
      };
      
      reader.readAsBinaryString(file);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du traitement du fichier",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const processOtherFormat = () => {
    if (!libraryName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour la bibliothèque",
        variant: "destructive",
      });
      return;
    }
    
    // For other formats, just create the library
    onImportConfirm({
      library: libraryName,
      format: 'autre'
    });
    
    resetForm();
    onOpenChange(false);
  };

  const handleConfirm = async () => {
    if (importTab === "excel") {
      await processExcelFile();
    } else {
      processOtherFormat();
    }
  };
  
  const resetForm = () => {
    setLibraryName("");
    setFile(null);
    setImportTab("excel");
  };
  
  const handleDialogChange = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importer une bibliothèque</DialogTitle>
          <DialogDescription>
            Sélectionnez un format d'import et entrez un nom pour votre bibliothèque
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="excel" value={importTab} onValueChange={setImportTab} className="w-full mt-4">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="excel">Fichier Excel</TabsTrigger>
            <TabsTrigger value="autre">Autre format</TabsTrigger>
          </TabsList>
          
          <TabsContent value="excel" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="library-name">Nom de la bibliothèque</Label>
                <Input
                  id="library-name"
                  placeholder="Ex: ATTIC+ 2025"
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="excel-file">Fichier Excel (.xlsx, .xls, .csv)</Label>
                <div
                  className={`border-2 border-dashed rounded-md p-6 text-center cursor-pointer transition-colors ${
                    isDragging ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/70'
                  }`}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    id="excel-file"
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  {file ? (
                    <div className="flex flex-col items-center">
                      <div className="bg-green-100 rounded-full p-2 mb-2">
                        <Upload className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {(file.size / 1024).toFixed(1)} KB
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto text-gray-400" />
                      <p className="mt-2 text-sm font-medium">
                        Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Supports: .xlsx, .xls, .csv
                      </p>
                    </>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  Le fichier doit contenir les colonnes: designation, lot, subCategory, unite, prix_unitaire
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="autre" className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="library-name-other">Nom de la bibliothèque</Label>
                <Input
                  id="library-name-other"
                  placeholder="Ex: BatiMat 2025"
                  value={libraryName}
                  onChange={(e) => setLibraryName(e.target.value)}
                />
              </div>
              
              <p className="text-sm">
                Cette option créera une bibliothèque vide que vous pourrez remplir manuellement.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            className="bg-metrOrange hover:bg-metrOrange/90"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Importation..." : "Confirmer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportBibliothequeModal;
