
import React, { useState } from 'react';
import { Plus, Upload, Search, Filter } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LibraryItem, ItemUnit, Library } from '@/types/library';
import BibliothequeFilter from '@/components/Bibliotheque/BibliothequeFilter';
import BibliothequeTable from '@/components/Bibliotheque/BibliothequeTable';
import CreateArticleDialog from '@/components/Bibliotheque/CreateArticleDialog';
import ImportExcelModal from '@/components/Bibliotheque/ImportExcelModal';
import LoadBibliothequeModal from '@/components/Bibliotheque/LoadBibliothequeModal';
import { ItemFormValues } from '@/components/Bibliotheque/CreateArticleDialog';
import { Link } from 'react-router-dom';
import CreateProjectButton from '@/components/Bibliotheque/CreateProjectButton';

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
const sampleLibraries: Library[] = [
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

const Library = () => {
  const [items, setItems] = useState<LibraryItem[]>(sampleItems);
  const [libraries, setLibraries] = useState<Library[]>(sampleLibraries);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');
  const [libraryFilter, setLibraryFilter] = useState('all');
  const [currentTab, setCurrentTab] = useState('items');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isLoadLibraryDialogOpen, setIsLoadLibraryDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Initialize form
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(CreateArticleDialog.itemFormSchema),
    defaultValues: {
      designation: '',
      lot: '',
      subCategory: '',
      type: '',
      unite: '',
      prix_unitaire: 0,
      description: '',
      bibliotheque_id: 'default',
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
      // Update existing item
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
      // Add new item - make sure all required fields are set
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
  const handleImportConfirm = (rows: any[]) => {
    // Create new items from valid rows
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    const newItems: LibraryItem[] = rows.map(row => ({
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      designation: row.designation,
      lot: row.lot,
      type: row.type,
      unite: row.unite as ItemUnit,
      prix_unitaire: typeof row.prix_unitaire === 'string' ? parseFloat(row.prix_unitaire) : row.prix_unitaire,
      date_creation: formattedDate,
      date_derniere_utilisation: formattedDate,
      bibliotheque_id: row.bibliotheque || 'default',
      actif: true,
      isNew: true
    }));
    
    // Add new items to the existing ones
    setItems([...newItems, ...items]);
    
    toast({
      title: "Import réussi",
      description: `${rows.length} articles importés avec succès`,
    });
  };
  
  // Handle load library
  const handleLoadLibrary = (name: string) => {
    const libraryId = name.replace(/\s+/g, '_').toLowerCase();
    
    // Check if library already exists
    if (libraries.some(lib => lib.id === libraryId)) {
      toast({
        title: "Bibliothèque existante",
        description: `La bibliothèque "${name}" existe déjà`,
        variant: "destructive",
      });
      return;
    }
    
    // Create a new library
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    const newLibrary: Library = {
      id: libraryId,
      name: name,
      createdAt: formattedDate,
      itemCount: 0
    };
    
    setLibraries([...libraries, newLibrary]);
    
    toast({
      title: "Bibliothèque créée",
      description: `La bibliothèque "${name}" a été créée avec succès`,
    });
  };

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
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
    
    // Library filter
    if (libraryFilter !== 'all' && item.bibliotheque_id !== libraryFilter) {
      return false;
    }
    
    return true;
  });

  // Extract unique types from items for filter
  const uniqueTypes = Array.from(new Set(items.map(item => item.type)));
  
  // Get unique units from items for filter
  const uniqueUnits = Array.from(new Set(items.map(item => item.unite)));
  
  // Get unique libraries for filter
  const uniqueLibraries = libraries.map(lib => lib.id);

  return (
    <DashboardLayout>
      <div className="container pb-10 pt-8">
        {/* Header with tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Ma bibliothèque</h1>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button 
              className="bg-metrOrange hover:bg-metrOrange/90"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Créer un article
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsImportDialogOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Importer depuis Excel
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setIsLoadLibraryDialogOpen(true)}
            >
              Charger bibliothèque
            </Button>
            
            <CreateProjectButton />
          </div>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="items">📦 Articles</TabsTrigger>
            <TabsTrigger value="libraries">📃 Mes bibliothèques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-6">
            {/* Search and filters row */}
            <BibliothequeFilter
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              unitFilter={unitFilter}
              setUnitFilter={setUnitFilter}
              libraryFilter={libraryFilter}
              setLibraryFilter={setLibraryFilter}
              categories={categories}
              uniqueTypes={uniqueTypes}
              uniqueUnits={uniqueUnits}
              libraries={uniqueLibraries}
            />
            
            {/* Table */}
            <BibliothequeTable
              filteredItems={filteredItems}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
            />
          </TabsContent>
          
          <TabsContent value="libraries">
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Mes bibliothèques enregistrées</h3>
              <p className="text-muted-foreground">
                Vous pouvez gérer différentes bibliothèques et basculer entre elles selon vos projets.
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Article Creation/Edit Dialog */}
        <CreateArticleDialog
          open={isDialogOpen}
          onOpenChange={handleDialogOpenChange}
          isEditMode={isEditMode}
          categories={categories}
          units={units}
          libraries={uniqueLibraries}
          form={form}
          onSubmit={onSubmit}
        />
        
        {/* Import Excel Dialog */}
        <ImportExcelModal
          open={isImportDialogOpen}
          onOpenChange={setIsImportDialogOpen}
          onImportConfirm={handleImportConfirm}
        />
        
        {/* Load Library Dialog */}
        <LoadBibliothequeModal
          open={isLoadLibraryDialogOpen}
          onOpenChange={setIsLoadLibraryDialogOpen}
          onLoadLibrary={handleLoadLibrary}
        />
      </div>
    </DashboardLayout>
  );
};

export default Library;
