import React, { useState } from 'react';
import { Plus, Upload, Search } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { LibraryItem, ItemUnit, type Library as LibraryType } from '@/types/library';
import BibliothequeFilter from '@/components/Bibliotheque/BibliothequeFilter';
import BibliothequeTable from '@/components/Bibliotheque/BibliothequeTable';
import CreateArticleDialog, { ItemFormValues, itemFormSchema } from '@/components/Bibliotheque/CreateArticleDialog';
import ImportBibliothequeModal from '@/components/Bibliotheque/ImportBibliothequeModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';

// Sample data
const sampleItems: LibraryItem[] = [
  { 
    id: '1', 
    designation: 'Béton de fondation', 
    lot: '2- GROS ŒUVRE - MAÇONNERIE', 
    type: 'Fondation', 
    unite: 'M3', 
    prix_unitaire: 120.50, 
    date_derniere_utilisation: '15/04/2025',
    date_creation: '10/04/2025',
    actif: true
  },
  { 
    id: '2', 
    designation: 'Fenêtre PVC double vitrage', 
    lot: '10- MENUISERIES EXTÉRIEURES', 
    type: 'Menuiserie', 
    unite: 'U', 
    prix_unitaire: 425.00, 
    date_derniere_utilisation: '17/04/2025', 
    date_creation: '16/04/2025',
    actif: true,
    isNew: true,
    bibliotheque_id: 'ATTIC+'
  },
  { 
    id: '3', 
    designation: 'Peinture mate blanche', 
    lot: '8- PEINTURES', 
    type: 'Finition', 
    unite: 'L', 
    prix_unitaire: 28.75, 
    date_derniere_utilisation: '10/04/2025',
    date_creation: '05/04/2025',
    actif: true,
    bibliotheque_id: 'BatiMat 2023'
  },
  { 
    id: '4', 
    designation: 'Radiateur électrique', 
    lot: '11- ÉLECTRICITÉ COURANTS FORTS', 
    type: 'Équipement', 
    unite: 'U', 
    prix_unitaire: 199.90,
    date_creation: '01/04/2025',
    actif: true
  },
  { 
    id: '5', 
    designation: 'Carrelage grès cérame', 
    lot: '6- CARRELAGES, REVÊTEMENTS', 
    type: 'Revêtement', 
    unite: 'M2', 
    prix_unitaire: 45.20, 
    date_derniere_utilisation: '20/03/2025',
    date_creation: '15/03/2025',
    actif: true
  },
  { 
    id: '6', 
    designation: 'Porte intérieure', 
    lot: '9- MENUISERIES INTÉRIEURES', 
    type: 'Menuiserie', 
    unite: 'U', 
    prix_unitaire: 235.00, 
    date_derniere_utilisation: '05/04/2025',
    date_creation: '01/03/2025',
    actif: true
  }
];

// Sample libraries
const sampleLibraries: LibraryType[] = [
  {
    id: 'all',
    name: 'Tous les articles',
    createdAt: '01/01/2025',
    itemCount: 6
  },
  {
    id: 'default',
    name: 'Bibliothèque par défaut',
    createdAt: '01/01/2025',
    itemCount: 3
  },
  {
    id: 'ATTIC+',
    name: 'ATTIC+',
    createdAt: '15/03/2025',
    itemCount: 1
  },
  {
    id: 'BatiMat 2023',
    name: 'BatiMat 2023',
    createdAt: '10/02/2025',
    itemCount: 1
  }
];

// Categories list
const categories = [
  '1- TERRASSEMENTS GÉNÉRAUX',
  '2- GROS ŒUVRE - MAÇONNERIE',
  '3- MÉTALLERIE, FERRONNERIE',
  '4- PLÂTRERIE',
  '5- ISOLATION',
  '6- CARRELAGES, REVÊTEMENTS',
  '7-SOLS SOUPLES',
  '8- PEINTURES',
  '9- MENUISERIES INTÉRIEURES',
  '10- MENUISERIES EXTÉRIEURES',
  '11- ÉLECTRICITÉ COURANTS FORTS',
  '12- PLOMBERIES SANITAIRES',
  '13- COUVERTURE, ZINGUERIE',
  '14- ÉTANCHÉITÉ',
  '15- STORES ET FERMETURES',
  '16- VRD, ESPACES EXTÉRIEURS'
];

// Units list
const units = [
  { code: 'CM' as ItemUnit, name: 'Centimètre' },
  { code: 'ENS' as ItemUnit, name: 'Ensemble' },
  { code: 'Forf' as ItemUnit, name: 'Forfait' },
  { code: 'GR' as ItemUnit, name: 'Gramme' },
  { code: 'HA' as ItemUnit, name: 'Hectare' },
  { code: 'H' as ItemUnit, name: 'Heure' },
  { code: 'J' as ItemUnit, name: 'Jour' },
  { code: 'KG' as ItemUnit, name: 'Kilogramme' },
  { code: 'KM' as ItemUnit, name: 'Kilomètre' },
  { code: 'L' as ItemUnit, name: 'Litre' },
  { code: 'M2' as ItemUnit, name: 'Mètre Carré' },
  { code: 'M3' as ItemUnit, name: 'Mètre cube' },
  { code: 'ML' as ItemUnit, name: 'Mètre linéaire' },
  { code: 'MOIS' as ItemUnit, name: 'Mois' },
  { code: 'PAIRE' as ItemUnit, name: 'Paire' },
  { code: 'PCE' as ItemUnit, name: 'Pièce' },
  { code: 'SEM' as ItemUnit, name: 'Semaine' },
  { code: 'T' as ItemUnit, name: 'Tonne' },
  { code: 'U' as ItemUnit, name: 'Unité' }
];

const ITEMS_PER_PAGE = 100;

const Library = () => {
  const [items, setItems] = useState<LibraryItem[]>(sampleItems);
  const [libraries, setLibraries] = useState<LibraryType[]>(sampleLibraries);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [selectedLibrary, setSelectedLibrary] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewLibraryDialogOpen, setIsNewLibraryDialogOpen] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      designation: '',
      lot: '',
      subCategory: '',
      type: '',
      unite: '',
      prix_unitaire: 0,
      description: '',
      bibliotheque_id: selectedLibrary !== 'all' ? selectedLibrary : 'default',
      tags: []
    }
  });

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      form.reset();
      setIsEditMode(false);
      setCurrentItemId(null);
    }
    setIsDialogOpen(open);
  };

  // Handle item edit
  const handleEditItem = (item: LibraryItem) => {
    form.reset({
      designation: item.designation,
      lot: item.lot,
      subCategory: item.subCategory || '',
      type: item.type,
      unite: item.unite,
      prix_unitaire: item.prix_unitaire,
      description: item.description || '',
      bibliotheque_id: item.bibliotheque_id || 'default'
    });
    setCurrentItemId(item.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: ItemFormValues) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    if (isEditMode && currentItemId) {
      setItems(items.map(item => 
        item.id === currentItemId ? {
          ...item,
          designation: values.designation,
          lot: values.lot,
          subCategory: values.subCategory,
          type: values.type,
          unite: values.unite as ItemUnit,
          prix_unitaire: values.prix_unitaire,
          description: values.description,
          bibliotheque_id: values.bibliotheque_id,
          date_derniere_utilisation: formattedDate
        } : item
      ));
      
      toast({
        title: "Article mis à jour",
        description: "L'article a été modifié avec succès",
      });
    } else {
      const newItem: LibraryItem = {
        id: Date.now().toString(),
        designation: values.designation,
        lot: values.lot,
        subCategory: values.subCategory,
        type: values.type,
        unite: values.unite as ItemUnit,
        prix_unitaire: values.prix_unitaire,
        description: values.description,
        bibliotheque_id: values.bibliotheque_id,
        date_creation: formattedDate,
        actif: true,
        isNew: true
      };
      setItems([newItem, ...items]);
      
      toast({
        title: "Article créé",
        description: "L'article a été ajouté avec succès à votre bibliothèque",
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  // Handle item delete
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    
    toast({
      title: "Article supprimé",
      description: "L'article a été supprimé de votre bibliothèque",
      variant: "destructive",
    });
  };
  
  // Handle import confirmation
  const handleImportConfirm = (data: { items?: any[], library?: string, format?: string }) => {
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    // Create a new library if needed
    if (data.library && !libraries.some(lib => lib.id === data.library)) {
      const libraryId = data.library.replace(/\s+/g, '_').toLowerCase();
      const newLibrary: LibraryType = {
        id: libraryId,
        name: data.library,
        createdAt: formattedDate,
        itemCount: data.items?.length || 0
      };
      
      setLibraries([...libraries, newLibrary]);
    }
    
    // Create new items from valid rows
    if (data.items && data.items.length > 0) {
      const newItems: LibraryItem[] = data.items.map(row => ({
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        designation: row.designation,
        lot: row.lot,
        type: row.type,
        unite: row.unite as ItemUnit,
        prix_unitaire: typeof row.prix_unitaire === 'string' ? parseFloat(row.prix_unitaire) : row.prix_unitaire,
        date_creation: formattedDate,
        date_derniere_utilisation: formattedDate,
        bibliotheque_id: data.library || 'default',
        actif: true,
        isNew: true
      }));
      
      setItems([...newItems, ...items]);
      
      toast({
        title: "Import réussi",
        description: `${data.items.length} articles importés avec succès`,
      });
    }
  };
  
  // Handle creating a new library
  const handleCreateNewLibrary = () => {
    if (!newLibraryName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la bibliothèque ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    const libraryId = newLibraryName.replace(/\s+/g, '_').toLowerCase();
    const newLibrary: LibraryType = {
      id: libraryId,
      name: newLibraryName,
      createdAt: formattedDate,
      itemCount: 0
    };
    
    setLibraries([...libraries, newLibrary]);
    setSelectedLibrary(libraryId);
    setIsNewLibraryDialogOpen(false);
    setNewLibraryName('');
    
    toast({
      title: "Bibliothèque créée",
      description: `La bibliothèque "${newLibraryName}" a été créée avec succès`
    });
  };
  
  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    // Library filter
    if (selectedLibrary !== 'all' && item.bibliotheque_id !== selectedLibrary) {
      return false;
    }
    
    // Search query filter
    if (searchQuery && 
        !item.designation.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.lot.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.type.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && item.lot !== categoryFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter !== 'all' && item.type !== typeFilter) {
      return false;
    }
    
    // Unit filter
    if (unitFilter !== 'all' && item.unite !== unitFilter) {
      return false;
    }
    
    return true;
  });

  // Extract unique types from items for filter
  const uniqueTypes = Array.from(new Set(items.map(item => item.type)));
  
  // Get unique units from items for filter
  const uniqueUnits = Array.from(new Set(items.map(item => item.unite)));
  
  // Calculate pagination
  const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLibrary, searchQuery, categoryFilter, typeFilter, unitFilter]);

  const handleChangeLibrary = (value: string) => {
    setSelectedLibrary(value);
    // Update form default library
    form.setValue('bibliotheque_id', value !== 'all' ? value : 'default');
  };

  const handleAddArticle = () => {
    // Pre-select the current library in the form
    form.setValue('bibliotheque_id', selectedLibrary !== 'all' ? selectedLibrary : 'default');
    setIsDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="container pb-10 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Ma bibliothèque</h1>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="h-4 w-4" />
              Importer une bibliothèque
            </Button>
          </div>
        </div>
        
        {/* Library super-filter */}
        <div className="mb-6 flex items-center gap-2">
          <div className="flex-1 md:flex-initial md:w-[300px]">
            <Select value={selectedLibrary} onValueChange={handleChangeLibrary}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une bibliothèque" />
              </SelectTrigger>
              <SelectContent>
                {libraries.map(library => (
                  <SelectItem key={library.id} value={library.id}>
                    {library.name} ({library.itemCount} articles)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            className="flex-shrink-0"
            onClick={() => setIsNewLibraryDialogOpen(true)}
            title="Créer une nouvelle bibliothèque"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Créer une bibliothèque</span>
          </Button>
        </div>
        
        {/* Search and filters row */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              placeholder="Rechercher un article..."
              className="pl-10 h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <BibliothequeFilter
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            unitFilter={unitFilter}
            setUnitFilter={setUnitFilter}
            categories={categories}
            uniqueTypes={uniqueTypes}
            uniqueUnits={uniqueUnits}
          />
          
          <Button 
            className="bg-metrOrange hover:bg-metrOrange/90"
            onClick={handleAddArticle}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un article
          </Button>
        </div>
        
        {/* Table with count */}
        <div className="mb-2 text-sm text-gray-500">
          {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''} 
          {selectedLibrary !== 'all' && (
            <span> dans {libraries.find(lib => lib.id === selectedLibrary)?.name}</span>
          )}
        </div>
        
        {/* Table */}
        <BibliothequeTable
          filteredItems={paginatedItems}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
        />
        
        {/* Pagination */}
        {pageCount > 1 && (
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              
              {Array.from({ length: Math.min(5, pageCount) }).map((_, i) => {
                // Simple pagination logic for now
                let pageNumber: number;
                
                if (pageCount <= 5) {
                  pageNumber = i + 1;
                } else if (currentPage <= 3) {
                  pageNumber = i + 1;
                } else if (currentPage >= pageCount - 2) {
                  pageNumber = pageCount - 4 + i;
                } else {
                  pageNumber = currentPage - 2 + i;
                }
                
                return (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                      isActive={currentPage === pageNumber}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}
              
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < pageCount) setCurrentPage(currentPage + 1);
                  }}
                  className={currentPage === pageCount ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
        
        {/* Article Creation/Edit Dialog */}
        <CreateArticleDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          isEditMode={isEditMode}
          categories={categories}
          units={units}
          libraries={libraries.filter(lib => lib.id !== 'all').map(lib => lib.id)}
          form={form}
          onSubmit={onSubmit}
        />
        
        {/* Import Dialog */}
        <ImportBibliothequeModal
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onImportConfirm={handleImportConfirm}
        />

        {/* New Library Dialog */}
        <Dialog open={isNewLibraryDialogOpen} onOpenChange={setIsNewLibraryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle bibliothèque</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <label htmlFor="library-name" className="block text-sm font-medium mb-2">
                Nom de la bibliothèque
              </label>
              <Input
                id="library-name"
                value={newLibraryName}
                onChange={(e) => setNewLibraryName(e.target.value)}
                placeholder="Ex: Batiment Standard 2025"
                className="w-full"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewLibraryDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateNewLibrary}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Library;
