
import React, { useState } from 'react';
import { Plus, Upload, FileUp, Search, Edit, Trash2, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import DashboardLayout from '@/components/dashboard/DashboardLayout';

// Define types for library items
type ItemUnit = 'CM' | 'ENS' | 'Forf' | 'GR' | 'HA' | 'H' | 'J' | 'KG' | 'KM' | 'L' | 'M2' | 'M3' | 'ML' | 'MOIS' | 'PAIRE' | 'PCE' | 'SEM' | 'T' | 'U';

interface LibraryItem {
  id: string;
  designation: string;
  lot: string;
  subCategory?: string;
  type: string;
  unite: ItemUnit;
  prix_unitaire: number;
  description?: string;
  tags?: string[];
  date_creation: string;
  date_derniere_utilisation?: string;
  actif: boolean;
  isNew?: boolean;
}

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
    isNew: true 
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
    actif: true
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
  { code: 'CM', name: 'Centimètre' },
  { code: 'ENS', name: 'Ensemble' },
  { code: 'Forf', name: 'Forfait' },
  { code: 'GR', name: 'Gramme' },
  { code: 'HA', name: 'Hectare' },
  { code: 'H', name: 'Heure' },
  { code: 'J', name: 'Jour' },
  { code: 'KG', name: 'Kilogramme' },
  { code: 'KM', name: 'Kilomètre' },
  { code: 'L', name: 'Litre' },
  { code: 'M2', name: 'Mètre Carré' },
  { code: 'M3', name: 'Mètre cube' },
  { code: 'ML', name: 'Mètre linéaire' },
  { code: 'MOIS', name: 'Mois' },
  { code: 'PAIRE', name: 'Paire' },
  { code: 'PCE', name: 'Pièce' },
  { code: 'SEM', name: 'Semaine' },
  { code: 'T', name: 'Tonne' },
  { code: 'U', name: 'Unité' }
];

// Types for the item form
const itemFormSchema = z.object({
  designation: z.string().min(3, "La désignation doit contenir au moins 3 caractères"),
  lot: z.string().min(1, "Veuillez sélectionner un lot"),
  subCategory: z.string().optional(),
  type: z.string().min(1, "Veuillez entrer un type"),
  unite: z.string().min(1, "Veuillez sélectionner une unité"),
  prix_unitaire: z.coerce.number().min(0, "Le prix doit être positif"),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

type ItemFormValues = z.infer<typeof itemFormSchema>;

const Library = () => {
  const [items, setItems] = useState<LibraryItem[]>(sampleItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [unitFilter, setUnitFilter] = useState('');
  const [currentTab, setCurrentTab] = useState('items');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
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
      description: item.description || ''
    });
    setCurrentItemId(item.id);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (values: ItemFormValues) => {
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
          description: values.description
        } : item
      ));
      
      toast({
        title: "Ouvrage mis à jour",
        description: "L'ouvrage a été modifié avec succès",
      });
    } else {
      // Add new item - make sure all required fields are set
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
      
      const newItem: LibraryItem = {
        id: Date.now().toString(),
        designation: values.designation,
        lot: values.lot,
        subCategory: values.subCategory,
        type: values.type,
        unite: values.unite as ItemUnit,
        prix_unitaire: values.prix_unitaire,
        description: values.description,
        date_creation: formattedDate,
        actif: true,
        isNew: true
      };
      setItems([newItem, ...items]);
      
      toast({
        title: "Ouvrage créé",
        description: "L'ouvrage a été ajouté avec succès à votre bibliothèque",
      });
    }
    setIsDialogOpen(false);
    form.reset();
  };

  // Handle item delete
  const handleDeleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    
    toast({
      title: "Ouvrage supprimé",
      description: "L'ouvrage a été supprimé de votre bibliothèque",
      variant: "destructive",
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
    if (categoryFilter && item.lot !== categoryFilter) {
      return false;
    }
    
    // Type filter
    if (typeFilter && item.type !== typeFilter) {
      return false;
    }
    
    // Unit filter
    if (unitFilter && item.unite !== unitFilter) {
      return false;
    }
    
    return true;
  });

  // Extract unique types from items for filter
  const uniqueTypes = Array.from(new Set(items.map(item => item.type)));
  
  // Get unique units from items for filter
  const uniqueUnits = Array.from(new Set(items.map(item => item.unite)));

  return (
    <DashboardLayout>
      <div className="container pb-10">
        {/* Header with tabs */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-3xl font-bold">Ma bibliothèque</h1>
          
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
              <DialogTrigger asChild>
                <Button className="bg-metrOrange hover:bg-metrOrange/90">
                  <Plus className="mr-2 h-4 w-4" />
                  Créer un ouvrage
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] backdrop-blur-md bg-white/95 border-white/20">
                <DialogHeader>
                  <DialogTitle>{isEditMode ? 'Modifier un ouvrage' : 'Créer un ouvrage'}</DialogTitle>
                  <DialogDescription>
                    Renseignez les informations de l'ouvrage ci-dessous.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="designation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Désignation*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="lot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Lot*</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un lot" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="subCategory"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sous-lot</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type*</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="unite"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unité*</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner une unité" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {units.map((unit) => (
                                  <SelectItem key={unit.code} value={unit.code}>
                                    {unit.name} ({unit.code})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="prix_unitaire"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Prix unitaire HT*</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description technique</FormLabel>
                          <FormControl>
                            <textarea 
                              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              rows={3} 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="bg-metrOrange hover:bg-metrOrange/90">
                        {isEditMode ? 'Mettre à jour' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <FileUp className="mr-2 h-4 w-4" />
                  Importer depuis Excel
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Importer une bibliothèque</DialogTitle>
                  <DialogDescription>
                    Déposez votre fichier Excel contenant votre bibliothèque d'ouvrages.
                  </DialogDescription>
                </DialogHeader>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                  <Upload className="mx-auto h-10 w-10 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Déposez votre fichier Excel ici, ou cliquez pour sélectionner</p>
                  <p className="text-xs text-gray-400 mt-1">Formats supportés: .xlsx, .xls, .csv</p>
                </div>
                <DialogFooter>
                  <Button variant="outline">Annuler</Button>
                  <Button>Importer</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            <Select>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Charger bibliothèque" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attic">ATTIC+</SelectItem>
                <SelectItem value="excel">Excel personnalisé</SelectItem>
                <SelectItem value="batimat">BatiMat 2023</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mb-6">
          <TabsList className="mb-6">
            <TabsTrigger value="items">📦 Ouvrages</TabsTrigger>
            <TabsTrigger value="supplies">💼 Fournitures</TabsTrigger>
            <TabsTrigger value="libraries">📃 Mes bibliothèques</TabsTrigger>
          </TabsList>
          
          <TabsContent value="items" className="space-y-6">
            {/* Search and filters row */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input 
                  placeholder="Rechercher un ouvrage..." 
                  className="pl-10" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtres
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filtres</SheetTitle>
                  </SheetHeader>
                  <div className="space-y-4 mt-4">
                    {/* Mobile filters */}
                    <div>
                      <FormLabel>Lot</FormLabel>
                      <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les lots" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les lots</SelectItem>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel>Type</FormLabel>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tous les types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Tous les types</SelectItem>
                          {uniqueTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel>Unité</FormLabel>
                      <Select value={unitFilter} onValueChange={setUnitFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="Toutes les unités" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Toutes les unités</SelectItem>
                          {uniqueUnits.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
              
              {/* Desktop filters */}
              <div className="hidden lg:flex lg:flex-row gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Lot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les lots</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tous les types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={unitFilter} onValueChange={setUnitFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Unité" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Toutes les unités</SelectItem>
                    {uniqueUnits.map(unit => (
                      <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Table */}
            <div className="rounded-md border bg-white overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[300px]">Désignation</TableHead>
                    <TableHead className="min-w-[200px]">Lot</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Unité</TableHead>
                    <TableHead className="text-right">Prix unitaire</TableHead>
                    <TableHead className="text-right">Dernière utilisation</TableHead>
                    <TableHead className="w-[100px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id} className="group transition-colors hover:bg-gray-50">
                        <TableCell>
                          <div className="flex items-center">
                            {item.designation}
                            {item.isNew && (
                              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">Nouveau</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{item.lot}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{item.unite}</TableCell>
                        <TableCell className="text-right">{item.prix_unitaire.toFixed(2)} €</TableCell>
                        <TableCell className="text-right">{item.date_derniere_utilisation || '-'}</TableCell>
                        <TableCell>
                          <div className="flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button variant="ghost" size="icon" onClick={() => handleEditItem(item)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeleteItem(item.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Aucun élément trouvé.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="supplies">
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Module de fournitures en cours de développement</h3>
              <p className="text-muted-foreground">
                Cette fonctionnalité sera bientôt disponible. Elle permettra de gérer vos fournitures séparément des ouvrages.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="libraries">
            <div className="rounded-lg border p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Mes bibliothèques enregistrées</h3>
              <p className="text-muted-foreground">
                Vous pourrez bientôt enregistrer différentes configurations de bibliothèques et basculer entre elles selon vos projets.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Library;
