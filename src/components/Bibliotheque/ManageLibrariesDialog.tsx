
import React, { useState, useEffect } from 'react';
import { Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Library } from '@/types/library';

interface ManageLibrariesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  libraries: Library[];
  onDeleteLibrary: (id: string, deleteItems: boolean) => Promise<void>;
  onRefresh: () => Promise<void>;
}

const ManageLibrariesDialog: React.FC<ManageLibrariesDialogProps> = ({
  open,
  onOpenChange,
  libraries,
  onDeleteLibrary,
  onRefresh
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [libraryToDelete, setLibraryToDelete] = useState<Library | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [deleteWithItems, setDeleteWithItems] = useState(false);
  const { toast } = useToast();

  const handleDeleteClick = (library: Library) => {
    if (library.id === 'all') {
      toast({
        title: "Action impossible",
        description: "La bibliothèque \"Tous les articles\" ne peut pas être supprimée.",
        variant: "destructive"
      });
      return;
    }
    setLibraryToDelete(library);
    setConfirmDialogOpen(true);
  };

  const handleDeleteConfirm = async (deleteItems: boolean) => {
    if (!libraryToDelete) return;
    
    setIsDeleting(true);
    setDeleteWithItems(deleteItems);
    
    try {
      await onDeleteLibrary(libraryToDelete.id, deleteItems);
      toast({
        title: "Bibliothèque supprimée",
        description: deleteItems 
          ? `La bibliothèque "${libraryToDelete.name}" et ses ${libraryToDelete.itemCount} articles ont été supprimés.`
          : `La bibliothèque "${libraryToDelete.name}" a été supprimée. Ses articles ont été déplacés vers la bibliothèque par défaut.`
      });
      
      await onRefresh();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la bibliothèque.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
      setConfirmDialogOpen(false);
      setLibraryToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Gérer les bibliothèques</DialogTitle>
            <DialogDescription>
              Vous pouvez supprimer les bibliothèques dont vous n'avez plus besoin.
            </DialogDescription>
          </DialogHeader>
          
          <div className="my-4 rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Articles</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {libraries.map(library => (
                  <TableRow key={library.id}>
                    <TableCell className="font-medium">{library.name}</TableCell>
                    <TableCell>{library.createdAt}</TableCell>
                    <TableCell className="text-right">{library.itemCount}</TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={`text-red-500 ${library.id === 'all' ? 'opacity-30 cursor-not-allowed' : ''}`}
                        onClick={() => handleDeleteClick(library)}
                        disabled={library.id === 'all'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                
                {libraries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Aucune bibliothèque trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Supprimer {libraryToDelete?.name}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette bibliothèque contient {libraryToDelete?.itemCount} articles.
              <br /><br />
              Que souhaitez-vous faire avec ces articles ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteConfirm(false)}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isDeleting}
            >
              {isDeleting && !deleteWithItems ? "En cours..." : "Transférer vers la bibliothèque par défaut"}
            </AlertDialogAction>
            <AlertDialogAction
              onClick={() => handleDeleteConfirm(true)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting && deleteWithItems ? "En cours..." : "Supprimer les articles"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ManageLibrariesDialog;
