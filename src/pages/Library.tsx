import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Upload, Search, Settings, CheckSquare, Square, Star } from 'lucide-react';
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
import ManageLibrariesDialog from '@/components/Bibliotheque/ManageLibrariesDialog';
import LibrarySelectionToolbar from '@/components/Bibliotheque/LibrarySelectionToolbar';
import InlineEdit from '@/components/Bibliotheque/InlineEdit';
import { useLibraryDB } from '@/hooks/useLibraryDB';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
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

const ITEMS_PER_PAGE = 50; // Increased from 10 to 50 per page

const Library = () => {
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [libraries, setLibraries] = useState<LibraryType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [subCategoryFilter, setSubCategoryFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [selectedLibrary, setSelectedLibrary] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDialogSubmitted, setIsDialogSubmitted] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isManageLibrariesDialogOpen, setIsManageLibrariesDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isNewLibraryDialogOpen, setIsNewLibraryDialogOpen] = useState(false);
  const [newLibraryName, setNewLibraryName] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [inlineEditItem, setInlineEditItem] = useState<{ id: string, field: string } | null>(null);
  const { toast } = useToast();
  
  // Use our library database hook
  const {
    isLoading,
    error,
    createLibrary,
    updateLibrary,
    deleteLibrary,
    getLibraries,
    createLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    deleteLibraryItems,
    moveItemsToLibrary,
    getLibraryItems,
    initializeWithSampleData
  } = useLibraryDB();
  
  // Initialize form
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      designation: '',
      lot: '',
      subCategory: '',
      unite: '',
      prix_unitaire: 0,
      description: '',
      bibliotheque_id: selectedLibrary !== 'all' ? selectedLibrary : 'default',
      tags: []
    }
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await initializeWithSampleData();
        const fetchedLibraries = await getLibraries();
        setLibraries(fetchedLibraries);
        
        const fetchedItems = await getLibraryItems();
        setItems(fetchedItems as unknown as LibraryItem[]);
      } catch (err) {
        console.error('Error loading data:', err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive"
        });
      }
    };
    
    loadData();

    // Setup keyboard shortcut for undo (Ctrl+Z)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        // Implementation depends on your undo mechanism
        toast({
          title: "Action annulée",
          description: "La dernière action a été annulée",
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter items based on search and filters
  const filteredByLibraryItems = items.filter(item => {
    // Filter by library
    if (selectedLibrary !== 'all' && item.bibliotheque_id !== selectedLibrary) {
      return false;
    }
    return true;
  });
  
  const filteredItems = filteredByLibraryItems.filter(item => {
    // Search query filter
    if (searchQuery && 
        !item.designation.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.lot.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !item.subCategory.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && item.lot !== categoryFilter) {
      return false;
    }
    
    // SubCategory filter
    if (subCategoryFilter !== 'all' && item.subCategory !== subCategoryFilter) {
      return false;
    }
    
    // Unit filter
    if (unitFilter !== 'all' && item.unite !== unitFilter) {
      return false;
    }
    
    return true;
  });

  // Extract unique subCategories from items for filter
  const uniqueSubCategories = Array.from(new Set(filteredByLibraryItems
    .filter(item => item.subCategory)
    .map(item => item.subCategory)));
  
  // Get unique units from items for filter
  const uniqueUnits = Array.from(new Set(filteredByLibraryItems.map(item => item.unite)));
  
  // Calculate pagination
  const pageCount = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedLibrary, searchQuery, categoryFilter, subCategoryFilter, unitFilter]);

  const handleChangeLibrary = (value: string) => {
    setSelectedLibrary(value);
    // Update form default library
    form.setValue('bibliotheque_id', value !== 'all' ? value : 'default');
  };

  const handleAddArticle = () => {
    // Always reset the form when adding a new article
    form.reset({
      designation: '',
      lot: '',
      subCategory: '',
      unite: '',
      prix_unitaire: 0,
      description: '',
      bibliotheque_id: selectedLibrary !== 'all' ? selectedLibrary : 'default',
      tags: []
    });
    setIsEditMode(false);
    setCurrentItemId(null);
    setIsDialogOpen(true);
  };
  
  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when dialog is closed through X or clicking outside
      setIsDialogSubmitted(false);
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
      subCategory: item.subCategory,
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
  const onSubmit = async (values: ItemFormValues) => {
    try {
      if (isEditMode && currentItemId) {
        // Update existing item
        const existingItem = items.find(item => item.id === currentItemId);
        if (existingItem) {
          const updatedItem = await updateLibraryItem({
            ...existingItem,
            designation: values.designation,
            lot: values.lot,
            subCategory: values.subCategory,
            unite: values.unite as ItemUnit,
            prix_unitaire: values.prix_unitaire,
            description: values.description,
            bibliotheque_id: values.bibliotheque_id
          });
          
          setItems(items.map(item => item.id === currentItemId ? updatedItem as unknown as LibraryItem : item));
          
          toast({
            title: "Article mis à jour",
            description: "L'article a été modifié avec succès",
          });
        }
      } else {
        // Create new item
        const newItem = await createLibraryItem(
          values.designation,
          values.lot,
          values.unite as ItemUnit,
          values.prix_unitaire,
          values.bibliotheque_id,
          values.description,
          values.subCategory,
          values.tags
        );
        
        setItems([newItem as unknown as LibraryItem, ...items]);
        
        // Update library list to refresh item counts
        const updatedLibraries = await getLibraries();
        setLibraries(updatedLibraries);
        
        toast({
          title: "Article créé",
          description: "L'article a été ajouté avec succès à votre bibliothèque",
        });
      }
      setIsDialogSubmitted(true);
      setIsDialogOpen(false);
      form.reset(); // Reset the form after successful submission
    } catch (err) {
      console.error('Error saving item:', err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de l'enregistrement",
        variant: "destructive"
      });
    }
  };

  // Handle item delete
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteLibraryItem(id);
      setItems(items.filter(item => item.id !== id));
      
      // Update library list to refresh item counts
      const updatedLibraries = await getLibraries();
      setLibraries(updatedLibraries);
      
      toast({
        title: "Article supprimé",
        description: "L'article a été supprimé de votre bibliothèque",
      });
    } catch (err) {
      console.error('Error deleting item:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive"
      });
    }
  };
  
  // Handle favorite toggle
  const handleFavoriteItem = async (id: string, isFavorite: boolean) => {
    try {
      const existingItem = items.find(item => item.id === id);
      if (!existingItem) return;

      const updatedItem = await updateLibraryItem({
        ...existingItem,
        isFavorite
      });

      setItems(items.map(item => 
        item.id === id ? { ...item, isFavorite } as LibraryItem : item
      ));

      if (isFavorite) {
        // Optionally move to Favorites library
        const favoritesLib = libraries.find(lib => lib.id === 'favorites');
        if (!favoritesLib) {
          // Create favorites library if it doesn't exist
          await createLibrary("Favoris");
          const updatedLibraries = await getLibraries();
          setLibraries(updatedLibraries);
        }
        
        toast({
          title: "Ajouté aux favoris",
          description: "L'article a été ajouté à vos favoris",
        });
      } else {
        toast({
          title: "Retiré des favoris",
          description: "L'article a été retiré de vos favoris",
        });
      }
    } catch (err) {
      console.error('Error toggling favorite status:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut favori",
        variant: "destructive"
      });
    }
  };
  
  // Handle import confirmation
  const handleImportConfirm = async (data: { items?: any[], library?: string, format?: string }) => {
    try {
      // Create a new library if needed
      let libraryId = '';
      
      if (data.library) {
        const safeLibraryId = data.library.replace(/\s+/g, '_').toLowerCase();
        
        // Check if library exists
        const existingLibrary = libraries.find(lib => lib.id === safeLibraryId);
        
        if (!existingLibrary) {
          const newLibrary = await createLibrary(data.library);
          libraryId = newLibrary.id;
        } else {
          libraryId = existingLibrary.id;
        }
        
        // Refresh libraries
        const updatedLibraries = await getLibraries();
        setLibraries(updatedLibraries);
      }
      
      // Create new items from valid rows
      if (data.items && data.items.length > 0) {
        // Use the libraryId created or existing for all articles
        const targetLibraryId = libraryId || 'default';
        const newItems: LibraryItem[] = [];
        
        for (const row of data.items) {
          const newItem = await createLibraryItem(
            row.designation,
            row.lot,
            row.unite as ItemUnit,
            typeof row.prix_unitaire === 'string' ? parseFloat(row.prix_unitaire) : row.prix_unitaire,
            targetLibraryId, // Use the target library instead of default
            row.description,
            row.subCategory,
            row.tags
          );
          
          newItems.push(newItem as unknown as LibraryItem);
        }
        
        setItems([...newItems, ...items]);
        
        // Update library list to refresh item counts
        const updatedLibraries = await getLibraries();
        setLibraries(updatedLibraries);
        
        // If a new library was created, select it
        if (libraryId) {
          setSelectedLibrary(libraryId);
        }
        
        toast({
          title: "Import réussi",
          description: `${data.items.length} articles importés avec succès dans ${data.library}`,
        });
      }
    } catch (err) {
      console.error('Error importing items:', err);
      toast({
        title: "Erreur d'importation",
        description: "Une erreur s'est produite lors de l'importation des données",
        variant: "destructive"
      });
    }
  };
  
  // Handle creating a new library
  const handleCreateNewLibrary = async () => {
    if (!newLibraryName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la bibliothèque ne peut pas être vide",
        variant: "destructive"
      });
      return;
    }

    try {
      await createLibrary(newLibraryName);
      
      // Refresh libraries
      const updatedLibraries = await getLibraries();
      setLibraries(updatedLibraries);
      
      // Set the new library as selected
      const libraryId = newLibraryName.replace(/\s+/g, '_').toLowerCase();
      setSelectedLibrary(libraryId);
      
      setIsNewLibraryDialogOpen(false);
      setNewLibraryName('');
      
      toast({
        title: "Bibliothèque créée",
        description: `La bibliothèque "${newLibraryName}" a été créée avec succès`
      });
    } catch (err) {
      console.error('Error creating library:', err);
      toast({
        title: "Erreur",
        description: "Impossible de créer la bibliothèque",
        variant: "destructive"
      });
    }
  };
  
  // Load items when selected library changes
  useEffect(() => {
    const loadLibraryItems = async () => {
      try {
        const fetchedItems = await getLibraryItems(selectedLibrary);
        setItems(fetchedItems as unknown as LibraryItem[]);
        setSelectedItems([]);
        form.setValue('bibliotheque_id', selectedLibrary !== 'all' ? selectedLibrary : 'default');
      } catch (err) {
        console.error('Error loading items:', err);
      }
    };
    
    loadLibraryItems();
  }, [selectedLibrary]);
  
  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedItems([]);
  };
  
  const handleSelectItem = (id: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };
  
  const handleSelectAll = () => {
    setSelectedItems(paginatedItems.map(item => item.id));
  };
  
  const handleSelectNone = () => {
    setSelectedItems([]);
  };
  
  const handleDeleteSelected = () => {
    if (selectedItems.length > 0) {
      setIsDeleteConfirmOpen(true);
    }
  };
  
  const handleConfirmDeleteSelected = async () => {
    try {
      await deleteLibraryItems(selectedItems);
      
      // Refresh items and libraries
      const fetchedItems = await getLibraryItems(selectedLibrary);
      setItems(fetchedItems as unknown as LibraryItem[]);
      
      const updatedLibraries = await getLibraries();
      setLibraries(updatedLibraries);
      
      setSelectedItems([]);
      setIsDeleteConfirmOpen(false);
      
      toast({
        title: "Articles supprimés",
        description: `${selectedItems.length} articles ont été supprimés avec succès`,
      });
    } catch (err) {
      console.error('Error deleting items:', err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la suppression des articles",
        variant: "destructive"
      });
    }
  };
  
  const handleMoveToLibrary = async (targetLibraryId: string) => {
    if (!targetLibraryId || selectedItems.length === 0) return;
    
    try {
      await moveItemsToLibrary(selectedItems, targetLibraryId);
      
      // Refresh items and libraries
      const fetchedItems = await getLibraryItems(selectedLibrary);
      setItems(fetchedItems as unknown as LibraryItem[]);
      
      const updatedLibraries = await getLibraries();
      setLibraries(updatedLibraries);
      
      setSelectedItems([]);
      
      toast({
        title: "Articles déplacés",
        description: `${selectedItems.length} articles ont été déplacés vers la bibliothèque sélectionnée`,
      });
    } catch (err) {
      console.error('Error moving items:', err);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors du déplacement des articles",
        variant: "destructive"
      });
    }
  };
  
  // Handle library deletion
  const handleDeleteLibrary = async (id: string, deleteItems: boolean) => {
    return await deleteLibrary(id, deleteItems);
  };
  
  // Refresh data
  const refreshData = async () => {
    const updatedLibraries = await getLibraries();
    setLibraries(updatedLibraries);
    
    const fetchedItems = await getLibraryItems(selectedLibrary);
    setItems(fetchedItems as unknown as LibraryItem[]);
  };

  // Handle inline editing
  const handleCellDoubleClick = useCallback((item: LibraryItem, field: string) => {
    setInlineEditItem({ id: item.id, field });
  }, []);

  const handleInlineEditSave = async (value: string | number) => {
    if (!inlineEditItem) return;
    
    try {
      const itemToEdit = items.find(item => item.id === inlineEditItem.id);
      if (!itemToEdit) return;
      
      const updatedItem = { ...itemToEdit, [inlineEditItem.field]: value } as LibraryItem;
      await updateLibraryItem(updatedItem);
      
      setItems(items.map(item => 
        item.id === inlineEditItem.id ? updatedItem : item
      ));
      
      setInlineEditItem(null);
      
      toast({
        title: "Article mis à jour",
        description: "La modification a été enregistrée avec succès",
      });
    } catch (err) {
      console.error('Error updating item:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article",
        variant: "destructive"
      });
    }
  };

  const handleInlineEditCancel = () => {
    setInlineEditItem(null);
  };

  // Get options for inline edit fields
  const getOptionsForField = (field: string) => {
    if (field === 'lot') {
      return categories.map(cat => ({ value: cat, label: cat }));
    } else if (field === 'unite') {
      return units.map(unit => ({ value: unit.code, label: `${unit.name} (${unit.code})` }));
    }
    return undefined;
  };

  return (
    <DashboardLayout>
      <div className="container pb-10 pt-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Ma bibliothèque</h1>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            {!isSelectionMode && (
              <>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsManageLibrariesDialogOpen(true)}
                >
                  <Settings className="h-4 w-4" />
                  Gérer les bibliothèques
                </Button>
              
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setIsImportDialogOpen(true)}
                >
                  <Upload className="h-4 w-4" />
                  Importer une bibliothèque
                </Button>
              </>
            )}
          </div>
        </div>
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="w-full text-center py-4">
            <p>Chargement des données...</p>
          </div>
        )}
        
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
            subCategoryFilter={subCategoryFilter}
            setSubCategoryFilter={setSubCategoryFilter}
            unitFilter={unitFilter}
            setUnitFilter={setUnitFilter}
            categories={categories}
            uniqueSubCategories={uniqueSubCategories}
            uniqueUnits={uniqueUnits}
            filteredByLibraryItems={filteredByLibraryItems}
          />
          
          <div className="flex gap-2">
            {!isSelectionMode ? (
              <>
                <Button 
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={toggleSelectionMode}
                >
                  <CheckSquare className="h-4 w-4" />
                  Sélectionner
                </Button>
                
                <Button 
                  className="bg-metrOrange hover:bg-metrOrange/90"
                  onClick={handleAddArticle}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un article
                </Button>
              </>
            ) : (
              <Button 
                variant="outline"
                className="flex items-center gap-2"
                onClick={toggleSelectionMode}
              >
                Quitter le mode sélection
              </Button>
            )}
          </div>
        </div>
        
        {/* Selection toolbar and items count */}
        {isSelectionMode ? (
          <LibrarySelectionToolbar
            selectedItemsCount={selectedItems.length}
            allItemsCount={filteredItems.length}
            currentLibraryId={selectedLibrary}
            libraries={libraries}
            onSelectAll={handleSelectAll}
            onSelectNone={handleSelectNone}
            onDeleteSelected={handleDeleteSelected}
            onMoveToLibrary={handleMoveToLibrary}
            onExitSelectionMode={toggleSelectionMode}
          />
        ) : (
          <div className="mb-2 text-sm text-gray-500">
            {filteredItems.length} article{filteredItems.length > 1 ? 's' : ''} trouvé{filteredItems.length > 1 ? 's' : ''} 
            {selectedLibrary !== 'all' && (
              <span> dans {libraries.find(lib => lib.id === selectedLibrary)?.name}</span>
            )}
          </div>
        )}
        
        {/* Table */}
        <BibliothequeTable
          filteredItems={paginatedItems}
          onEditItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onFavoriteItem={handleFavoriteItem}
          selectionMode={isSelectionMode}
          selectedItems={selectedItems}
          onSelectItem={handleSelectItem}
          onCellDoubleClick={handleCellDoubleClick}
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
        
        {/* Manage Libraries Dialog */}
        <ManageLibrariesDialog
          open={isManageLibrariesDialogOpen}
          onOpenChange={setIsManageLibrariesDialogOpen}
          libraries={libraries}
          onDeleteLibrary={handleDeleteLibrary}
          onRefresh={refreshData}
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
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer les articles sélectionnés</AlertDialogTitle>
              <AlertDialogDescription>
                Vous êtes sur le point de supprimer {selectedItems.length} article{selectedItems.length > 1 ? 's' : ''}.
                Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleConfirmDeleteSelected}
                className="bg-red-600 hover:bg-red-700"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Inline Edit Dialog */}
        {inlineEditItem && (() => {
          const item = items.find(i => i.id === inlineEditItem.id);
          if (!item) return null;
          
          return (
            <Dialog open={!!inlineEditItem} onOpenChange={(open) => !open && setInlineEditItem(null)}>
              <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                  <DialogTitle>Modifier {inlineEditItem.field}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <InlineEdit
                    value={item[inlineEditItem.field as keyof LibraryItem] as string | number}
                    field={inlineEditItem.field}
                    onSave={handleInlineEditSave}
                    onCancel={handleInlineEditCancel}
                    options={getOptionsForField(inlineEditItem.field)}
                  />
                </div>
              </DialogContent>
            </Dialog>
          );
        })()}
      </div>
    </DashboardLayout>
  );
};

export default Library;
