
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LoadBibliothequeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadLibrary: (name: string) => void;
}

const LoadBibliothequeModal: React.FC<LoadBibliothequeModalProps> = ({
  open,
  onOpenChange,
  onLoadLibrary
}) => {
  const [libraryName, setLibraryName] = useState("");
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!libraryName.trim()) {
      toast({
        title: "Nom requis",
        description: "Veuillez entrer un nom pour la bibliothèque",
        variant: "destructive",
      });
      return;
    }
    
    onLoadLibrary(libraryName);
    setLibraryName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Charger une bibliothèque</DialogTitle>
          <DialogDescription>
            Entrez un nom pour votre nouvelle bibliothèque
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Input
            placeholder="Nom de la bibliothèque"
            value={libraryName}
            onChange={(e) => setLibraryName(e.target.value)}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            className="bg-metrOrange hover:bg-metrOrange/90"
            onClick={handleConfirm}
          >
            Confirmer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LoadBibliothequeModal;
