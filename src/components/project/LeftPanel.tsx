import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Projet, Surface } from '@/types/metr';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Package, Tag, Ruler, Plus, ChevronDown, ChevronRight, Mountain, BrickWall, LayoutGrid, Thermometer, Grid, Layers, Paintbrush, DoorClosed, Square, Plug, Droplet, Umbrella, Shield, AlignVerticalSpaceBetween, TreePine, Library } from 'lucide-react';
import { LibraryItem, ItemUnit } from '@/types/library';
import { useLibraryDB } from '@/hooks/useLibraryDB';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CreateArticleDialog, { ItemFormValues } from '@/components/Bibliotheque/CreateArticleDialog';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { itemFormSchema } from '@/components/Bibliotheque/CreateArticleDialog';
import { toast } from 'sonner';
import SearchableSelect from '@/components/ui/searchable-select';
import PanelToggle from '@/components/ui/panel-toggle';

interface LeftPanelProps {
  projet: Projet;
  selectedSurface: Surface | null;
  onAddOuvrage: (ouvrage: any) => void;
}

const ITEMS_PER_PAGE = 50;

const UNITS = [
  { code: 'M2' as ItemUnit, name: 'Mètre carré' },
  { code: 'ML' as ItemUnit, name: 'Mètre linéaire' },
  { code: 'M3' as ItemUnit, name: 'Mètre cube' },
  { code: 'U' as ItemUnit, name: 'Unité' },
  { code: 'PCE' as ItemUnit, name: 'Pièce' },
  { code: 'KG' as ItemUnit, name: 'Kilogramme' },
  { code: 'T' as ItemUnit, name: 'Tonne' },
];

const CATEGORIES = [
  'Gros œuvre',
  'Second œuvre',
  'Électricité',
  'Plomberie',
  'Chauffage',
  'Menuiserie',
  'Revêtements',
  'Peinture',
];

// Add lot icons mapping
const LOT_ICONS: Record<string, React.ElementType> = {
  'TERRASSEMENTS GÉNÉRAUX': Mountain,
  'GROS ŒUVRE - MAÇONNERIE': BrickWall,
  'MÉTALLERIE, FERRONNERIE': Ruler,
  'PLÂTRERIE': LayoutGrid,
  'ISOLATION': Thermometer,
  'CARRELAGES, REVÊTEMENTS': Grid,
  'SOLS SOUPLES': Layers,
  'PEINTURES': Paintbrush,
  'MENUISERIES INTÉRIEURES': DoorClosed,
  'MENUISERIES EXTÉRIEURES': Square,
  'ÉLECTRICITÉ COURANTS FORTS': Plug,
  'PLOMBERIES SANITAIRES': Droplet,
  'COUVERTURE, ZINGUERIE': Umbrella,
  'ÉTANCHÉITÉ': Shield,
  'STORES ET FERMETURES': AlignVerticalSpaceBetween,
  'VRD, ESPACES EXTÉRIEURS': TreePine,
  'default': Package // Using Package as a default icon
};

// Define default library data based on OCR text
const DEFAULT_LIBRARY_ITEMS: LibraryItem[] = [
  { id: 'dflt-01-01', designation: 'TERRASSEMENTS GÉNÉRAUX', lot: 'TERRASSEMENTS GÉNÉRAUX', subCategory: 'Généraux', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-01-02', designation: 'TERRASSEMENTS GÉNÉRAUX', lot: 'TERRASSEMENTS GÉNÉRAUX', subCategory: 'Autre', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-02-01', designation: 'GROS ŒUVRE - MAÇONNERIE', lot: 'GROS ŒUVRE - MAÇONNERIE', subCategory: 'Murs', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-02-02', designation: 'GROS ŒUVRE - MAÇONNERIE', lot: 'GROS ŒUVRE - MAÇONNERIE', subCategory: 'Dalles', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-03-01', designation: 'GROS ŒUVRE - MAÇONNERIE', lot: 'GROS ŒUVRE - MAÇONNERIE', subCategory: 'Fondations', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-04-01', designation: 'GROS ŒUVRE - MAÇONNERIE', lot: 'GROS ŒUVRE - MAÇONNERIE', subCategory: 'Escaliers', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-05-01', designation: 'GROS ŒUVRE - MAÇONNERIE', lot: 'GROS ŒUVRE - MAÇONNERIE', subCategory: 'Charpente', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-06-01', designation: 'PLÂTRERIE', lot: 'PLÂTRERIE', subCategory: 'Doublage', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-06-02', designation: 'PLÂTRERIE', lot: 'PLÂTRERIE', subCategory: 'Plafonds', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-07-01', designation: 'ISOLATION', lot: 'ISOLATION', subCategory: 'Thermique', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-07-02', designation: 'ISOLATION', lot: 'ISOLATION', subCategory: 'Phonique', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-08-01', designation: 'PLÂTRERIE', lot: 'PLÂTRERIE', subCategory: 'Enduits', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] }, // Assuming 08 is also Plâtrerie
  { id: 'dflt-09-01', designation: 'MENUISERIES EXTÉRIEURES', lot: 'MENUISERIES EXTÉRIEURES', subCategory: 'Fenêtres', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-09-02', designation: 'MENUISERIES EXTÉRIEURES', lot: 'MENUISERIES EXTÉRIEURES', subCategory: 'Portes', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-10-01', designation: 'MENUISERIES INTÉRIEURES', lot: 'MENUISERIES INTÉRIEURES', subCategory: 'Portes', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-10-02', designation: 'MENUISERIES INTÉRIEURES', lot: 'MENUISERIES INTÉRIEURES', subCategory: 'Placards', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-11-01', designation: 'GROS ŒUVRE - MAÇONNERIE', lot: 'GROS ŒUVRE - MAÇONNERIE', subCategory: 'Divers', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] }, // Assuming 11 is also Gros Œuvre
  { id: 'dflt-12-01', designation: 'COUVERTURE, ZINGUERIE', lot: 'COUVERTURE, ZINGUERIE', subCategory: 'Couverture', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-12-02', designation: 'COUVERTURE, ZINGUERIE', lot: 'COUVERTURE, ZINGUERIE', subCategory: 'Zinguerie', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-13-01', designation: 'ÉTANCHÉITÉ', lot: 'ÉTANCHÉITÉ', subCategory: 'Toiture', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-13-02', designation: 'ÉTANCHÉITÉ', lot: 'ÉTANCHÉITÉ', subCategory: 'Façade', unite: 'U', prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-14-01', designation: 'CARRELAGES, REVÊTEMENTS', lot: 'CARRELAGES, REVÊTEMENTS', subCategory: 'Carrelage Sol', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-14-02', designation: 'CARRELAGES, REVÊTEMENTS', lot: 'CARRELAGES, REVÊTEMENTS', subCategory: 'Carrelage Mur', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-14-03', designation: 'CARRELAGES, REVÊTEMENTS', lot: 'CARRELAGES, REVÊTEMENTS', subCategory: 'Parquet', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-15-01', designation: 'PEINTURES', lot: 'PEINTURES', subCategory: 'Murs Intérieurs', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-15-02', designation: 'PEINTURES', lot: 'PEINTURES', subCategory: 'Plafonds', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-16-01', designation: 'MÉTALLERIE, FERRONNERIE', lot: 'MÉTALLERIE, FERRONNERIE', subCategory: 'Garde-corps', unite: 'ML' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-16-02', designation: 'MÉTALLERIE, FERRONNERIE', lot: 'MÉTALLERIE, FERRONNERIE', subCategory: 'Escaliers', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-17-01', designation: 'PLOMBERIES SANITAIRES', lot: 'PLOMBERIES SANITAIRES', subCategory: 'WC', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-17-02', designation: 'PLOMBERIES SANITAIRES', lot: 'PLOMBERIES SANITAIRES', subCategory: 'Lavabos', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-18-01', designation: 'CVC', lot: 'CVC', subCategory: 'Chauffage', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-18-02', designation: 'CVC', lot: 'CVC', subCategory: 'Climatisation', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-19-01', designation: 'ÉLECTRICITÉ COURANTS FORTS', lot: 'ÉLECTRICITÉ COURANTS FORTS', subCategory: 'Prises', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-19-02', designation: 'ÉLECTRICITÉ COURANTS FORTS', lot: 'ÉLECTRICITÉ COURANTS FORTS', subCategory: 'Éclairage', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-20-01', designation: 'COURANTS FAIBLES', lot: 'COURANTS FAIBLES', subCategory: 'RJ45', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-20-02', designation: 'COURANTS FAIBLES', lot: 'COURANTS FAIBLES', subCategory: 'Alarme', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-21-01', designation: 'ÉQUIPEMENTS', lot: 'ÉQUIPEMENTS', subCategory: 'Cuisine', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-21-02', designation: 'ÉQUIPEMENTS', lot: 'ÉQUIPEMENTS', subCategory: 'Salle de bain', unite: 'U' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-22-01', designation: 'AMÉNAGEMENTS INTÉRIEURS', lot: 'AMÉNAGEMENTS INTÉRIEURS', subCategory: 'Faux Plafonds', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-22-02', designation: 'AMÉNAGEMENTS INTÉRIEURS', lot: 'AMÉNAGEMENTS INTÉRIEURS', subCategory: 'Sols', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-23-01', designation: 'VRD, ESPACES EXTÉRIEURS', lot: 'VRD, ESPACES EXTÉRIEURS', subCategory: 'VRD', unite: 'ML' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-23-02', designation: 'VRD, ESPACES EXTÉRIEURS', lot: 'VRD, ESPACES EXTÉRIEURS', subCategory: 'Espaces Verts', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] },
  { id: 'dflt-24-01', designation: 'NETTOYAGE', lot: 'NETTOYAGE', subCategory: 'Fin de chantier', unite: 'M2' as ItemUnit, prix_unitaire: 0, description: '', bibliotheque_id: 'default', date_creation: new Date().toISOString(), actif: true, tags: [] }, // Assuming 24 is Nettoyage
];

// Add predefined lots with numbering
const PREDEFINED_LOTS = [
  { id: '01', name: 'TERRASSEMENTS GÉNÉRAUX' },
  { id: '02', name: 'GROS ŒUVRE - MAÇONNERIE' },
  { id: '03', name: 'MÉTALLERIE, FERRONNERIE' },
  { id: '04', name: 'PLÂTRERIE' },
  { id: '05', name: 'ISOLATION' },
  { id: '06', name: 'CARRELAGES, REVÊTEMENTS' },
  { id: '07', name: 'SOLS SOUPLES' },
  { id: '08', name: 'PEINTURES' },
  { id: '09', name: 'MENUISERIES INTÉRIEURES' },
  { id: '10', name: 'MENUISERIES EXTÉRIEURES' },
  { id: '11', name: 'ÉLECTRICITÉ COURANTS FORTS' },
  { id: '12', name: 'PLOMBERIES SANITAIRES' },
  { id: '13', name: 'COUVERTURE, ZINGUERIE' },
  { id: '14', name: 'ÉTANCHÉITÉ' },
  { id: '15', name: 'STORES ET FERMETURES' },
  { id: '16', name: 'VRD, ESPACES EXTÉRIEURS' }
];

const LeftPanel: React.FC<LeftPanelProps> = ({ projet, selectedSurface, onAddOuvrage }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLibrary, setSelectedLibrary] = useState<string>('default'); // Set default library as initially selected
  const [selectedLot, setSelectedLot] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>('all');
  const [selectedUnit, setSelectedUnit] = useState<string>('all');
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [libraries, setLibraries] = useState<{id: string, name: string}[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(300);
  const [isCreateArticleOpen, setIsCreateArticleOpen] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const resizeRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const [expandedLots, setExpandedLots] = useState<string[]>([]);
  const [expandedSubCategories, setExpandedSubCategories] = useState<string[]>([]); // New state for subcategory expansion
  
  const {
    isLoading,
    getLibraryItems,
    getLibraries,
    initializeWithSampleData,
    createLibraryItem
  } = useLibraryDB();
  
  const form = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      designation: '',
      lot: '',
      subCategory: '',
      unite: 'U',
      prix_unitaire: 0,
      description: '',
      bibliotheque_id: projet.id,
    },
  });

  // Load library items and libraries
  useEffect(() => {
    const loadData = async () => {
      try {
        // Attempt to initialize with sample data and fetch libraries/items
        await initializeWithSampleData();
        const fetchedLibraries = await getLibraries();
        
        // Add default library option if it doesn't exist
        const defaultLibraryExists = fetchedLibraries.some(lib => lib.id === 'default' || lib.name === 'Bibliothèque par défaut');
        if (!defaultLibraryExists) {
          setLibraries([{ id: 'default', name: 'Bibliothèque par défaut' }, ...fetchedLibraries || []]);
        } else {
           setLibraries(fetchedLibraries || []);
        }

        // If no library is selected or 'default' is selected, use default items
        if (!selectedLibrary || selectedLibrary === 'default') {
           setItems(DEFAULT_LIBRARY_ITEMS);
        } else { // Otherwise, fetch items for the selected library
           const fetchedItems = await getLibraryItems(selectedLibrary);
           setItems(fetchedItems as unknown as LibraryItem[] || []);
        }

      } catch (err) {
        console.error('Error loading data:', err);
        // Fallback to default library if loading fails
        setLibraries([{ id: 'default', name: 'Bibliothèque par défaut' }]);
        setItems(DEFAULT_LIBRARY_ITEMS);
      }
    };
    
    loadData();
  }, []); // Dependency array is empty to run only once on mount

   // Update items when selected library changes
  useEffect(() => {
    const loadLibraryItems = async () => {
      try {
        if (selectedLibrary === 'default') {
          setItems(DEFAULT_LIBRARY_ITEMS);
        } else {
          const fetchedItems = await getLibraryItems(selectedLibrary);
          setItems(fetchedItems as unknown as LibraryItem[] || []);
        }
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading items for library:', selectedLibrary, err);
        setItems(DEFAULT_LIBRARY_ITEMS); // Fallback to default if library items fail to load
      }
    };
    
    // Only load if libraries are fetched and a selection is made
    if(libraries.length > 0 || selectedLibrary === 'default') {
      loadLibraryItems();
    }
  }, [selectedLibrary, libraries]); // Depend on selectedLibrary and libraries

  // Setup resize handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && startXRef.current) {
        const dx = e.clientX - startXRef.current;
        const newWidth = Math.max(250, Math.min(600, startWidthRef.current + dx));
        setPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      startXRef.current = 0;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleResizeStart = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = panelWidth;
  };
  
  // Group items by lot and then by subcategory
  const groupedItems = (items || []).reduce((acc, item) => {
    const lot = item.lot || 'Non classé';
    const subCat = item.subCategory || 'Non classé';
    
    if (!acc[lot]) {
      acc[lot] = {};
    }
    if (!acc[lot][subCat]) {
        acc[lot][subCat] = [];
    }

    // Filter by search term here before grouping
    if (
        item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lot?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subCategory?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
        acc[lot][subCat].push(item);
    }
    return acc;
  }, {} as Record<string, Record<string, LibraryItem[]>>);

  const lotEntries = Object.entries(groupedItems);

  // Flatten items for search results
  const flattenedSearchResults = searchTerm ? Object.values(groupedItems).flatMap(subCategories => 
    Object.values(subCategories).flatMap(items => items)
  ) : [];

  // Calculate total pages
  const totalPages = Math.ceil(
    Object.values(groupedItems).reduce((acc, subCategories) => 
      acc + Object.values(subCategories).reduce((subAcc, items) => subAcc + items.length, 0)
    , 0) / ITEMS_PER_PAGE
  );

  // Generate page numbers array for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage === 1) {
        end = 3;
      } else if (currentPage === totalPages) {
        start = totalPages - 2;
      }
      
      if (start > 2) {
        pages.push('ellipsis');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('ellipsis');
      }
      
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  // Handle create article
  const handleCreateArticle = async (values: ItemFormValues) => {
    try {
      // Use selectedLibrary ID if it's not the default, otherwise potentially handle differently
      const targetLibraryId = selectedLibrary === 'default' ? projet.id : values.bibliotheque_id || selectedLibrary;

      await createLibraryItem(
        values.designation,
        values.lot,
        values.unite as ItemUnit,
        values.prix_unitaire,
        targetLibraryId, // Use the determined library ID
        values.description,
        values.subCategory,
        values.tags
      );
      
      // Refresh items based on current selection
      if (selectedLibrary === 'default') {
        // If default is selected, just update the local state or re-fetch all if default data isn't static
        // For now, we assume DEFAULT_LIBRARY_ITEMS is static and don't refresh items list here
         toast.success('Article créé, mais pas ajouté à la bibliothèque par défaut statique.');
      } else {
         const fetchedItems = await getLibraryItems(selectedLibrary);
         setItems(fetchedItems as unknown as LibraryItem[] || []);
         toast.success('Article créé avec succès dans la bibliothèque sélectionnée');
      }

      setIsCreateArticleOpen(false);
      form.reset();
     
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Erreur lors de la création de l\'article');
    }
  };

  // Add an item to the project
  const handleAddItem = (item: LibraryItem) => {
    const localisation = selectedSurface 
      ? { niveau: "Actuel", piece: selectedSurface.nom } 
      : { niveau: "RDC", piece: "Salon" };
    
    let quantite = 1;
    if (selectedSurface && item.unite === "M2") {
      quantite = selectedSurface.superficie;
    }
      
    const newOuvrage = {
      id: `ouvrage-${Date.now()}`,
      designation: item.designation,
      lot: item.lot,
      subCategory: item.subCategory,
      quantite: quantite,
      unite: item.unite,
      prix_unitaire: item.prix_unitaire,
      localisation: localisation,
      surfaceId: selectedSurface?.id,
      color: '#4ECDC4'
    };
    
    onAddOuvrage(newOuvrage);
  };

  // Function to determine what type of measurement is needed based on unit
  const getMeasurementType = (unit: ItemUnit): string => {
    switch (unit) {
      case 'ML':
        return 'linear';
      case 'M2':
        return 'area';
      case 'U':
      case 'PCE':
        return 'count';
      default:
        return 'manual';
    }
  };
  
  // Function to truncate text
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };

  // Toggle panel collapse
  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };
  
  const toggleLot = useCallback((lot: string) => {
    setExpandedLots(prev => 
      prev.includes(lot) 
        ? prev.filter(l => l !== lot)
        : [...prev, lot]
    );
  }, []);
  
  // New toggle function for subcategories
  const toggleSubCategory = useCallback((subCategory: string) => {
      setExpandedSubCategories(prev => 
          prev.includes(subCategory)
              ? prev.filter(sc => sc !== subCategory)
              : [...prev, subCategory]
      );
  }, []);

  return (
    <TooltipProvider>
      <div 
        className={`relative h-full flex flex-col overflow-hidden transition-all duration-300 border-r bg-white`} 
        style={{ width: isCollapsed ? '50px' : `${panelWidth}px` }}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center p-2">
            <span className="text-xs font-medium text-gray-500 rotate-90 mt-4">Bibliothèque</span>
            <div className="mt-8">
              <PanelToggle
                isCollapsed={isCollapsed}
                onToggle={toggleCollapse}
                position="left"
              />
            </div>
          </div>
        ) : (
          <Card className="w-full h-full flex flex-col border-0">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-2">
                <CardTitle className="flex items-center gap-2 text-metr-blue font-montserrat">
                  <Library className="h-6 w-6" />
                  Bibliothèque d'articles
                </CardTitle>
                <PanelToggle
                  isCollapsed={isCollapsed}
                  onToggle={toggleCollapse}
                  position="left"
                />
              </div>

              {selectedSurface && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-md">
                  <h3 className="text-sm font-medium text-primary">Surface sélectionnée</h3>
                  <p className="text-xs text-gray-600">{selectedSurface.nom} ({selectedSurface.superficie.toFixed(2)} {selectedSurface.unite})</p>
                  <p className="text-xs text-gray-500 mt-1">Les ouvrages ajoutés seront associés à cette surface</p>
                </div>
              )}
              
              {/* Library Selection */}
              <div className="mb-4">
                <SearchableSelect
                  value={selectedLibrary}
                  onChange={setSelectedLibrary}
                  options={libraries.map(lib => lib.name)}
                  placeholder="Choisir une bibliothèque"
                />
              </div>

              {/* Search input with create button */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Rechercher un article..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                 <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCreateArticleOpen(true)}
                  title="Créer un nouvel article"
                  className="px-2"
                  disabled={selectedLibrary === 'default'} // Disable if default library is selected
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto space-y-2">
              {/* Items List */}
              <div className="space-y-2">
                {isLoading ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Chargement des articles...</p>
                  </div>
                ) : searchTerm ? (
                  // Flat view for search results
                  <div className="space-y-2">
                    {flattenedSearchResults.length > 0 ? (
                      flattenedSearchResults.map((item) => (
                        <div 
                          key={item.id}
                          className="group flex items-center justify-between p-2 hover:bg-white rounded border hover:shadow-sm transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 mb-1">{item.lot}</div>
                            <div className="font-medium text-sm truncate">{item.designation}</div>
                            <div className="text-xs font-medium text-orange-600">{item.prix_unitaire.toFixed(2)} €/{item.unite}</div>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-8 w-8 p-0 bg-orange-500 text-white hover:bg-orange-600 flex-shrink-0"
                            onClick={() => handleAddItem(item)}
                            title={`Ajouter et mesurer (${getMeasurementType(item.unite)})`}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucun article trouvé</p>
                        <p className="text-xs">Essayez d'autres mots-clés</p>
                      </div>
                    )}
                  </div>
                ) : (
                  // Hierarchical view when no search
                  <div className="space-y-2">
                    {lotEntries.map(([lot, subCategoryGroups]) => (
                      <Collapsible 
                        key={lot}
                        open={expandedLots.includes(lot)}
                        onOpenChange={() => toggleLot(lot)}
                      >
                        <CollapsibleTrigger asChild>
                          <div className="flex items-center justify-between p-2 hover:bg-gray-100 rounded cursor-pointer transition-colors">
                            <div className="flex items-center gap-2">
                               {/* Render the icon */} 
                                {LOT_ICONS[lot] ? (
                                    React.createElement(LOT_ICONS[lot], { className: 'h-4 w-4 text-gray-600' })
                                ) : (
                                    React.createElement(LOT_ICONS.default, { className: 'h-4 w-4 text-gray-600' })
                                )}
                              <span className="font-medium text-sm text-gray-800">{lot}</span>
                            </div>
                            {expandedLots.includes(lot) ? (
                              <ChevronDown className="w-4 h-4 text-gray-600" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-gray-600" />
                            )}
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="ml-4 space-y-1">
                          {/* Group items by SubCategory within the lot */}
                          {Object.entries(subCategoryGroups).map(([subCategory, subCategoryItems]) => (
                             <Collapsible 
                                key={subCategory}
                                open={expandedSubCategories.includes(subCategory)}
                                onOpenChange={() => toggleSubCategory(subCategory)}
                             >
                               <CollapsibleTrigger asChild>
                                 <div className="border-l-2 border-gray-200 pl-4 p-1 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                                     <div className="font-medium text-xs text-gray-500 uppercase tracking-wide flex items-center gap-1">
                                          {expandedSubCategories.includes(subCategory) ? (
                                              <ChevronDown className="h-3 w-3 text-gray-500" />
                                          ) : (
                                              <ChevronRight className="h-3 w-3 text-gray-500" />
                                          )}
                                         {subCategory}
                                     </div>
                                 </div>
                               </CollapsibleTrigger>
                               <CollapsibleContent className="pl-4 space-y-1">
                                  {subCategoryItems.map((item) => (
                                      <div 
                                          key={item.id}
                                          className="group flex items-center justify-between p-2 hover:bg-white rounded border hover:shadow-sm transition-all"
                                      >
                                          <div className="flex-1 min-w-0">
                                              <div className="font-medium text-sm truncate">{item.designation}</div>
                                              {item.description && <div className="text-xs text-gray-500">{item.description}</div>}
                                              <div className="text-xs font-medium text-orange-600">{item.prix_unitaire.toFixed(2)} €/{item.unite}</div>
                                          </div>
                                          
                                          <Button
                                              size="sm"
                                              variant="ghost"
                                              className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 h-8 w-8 p-0 bg-orange-500 text-white hover:bg-orange-600 flex-shrink-0"
                                              onClick={() => handleAddItem(item)}
                                              title={`Ajouter et mesurer (${getMeasurementType(item.unite)})`}
                                          >
                                              <Plus className="h-4 w-4" />
                                          </Button>
                                      </div>
                                  ))}
                                </CollapsibleContent>
                             </Collapsible>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Article Dialog */}
        <CreateArticleDialog
          open={isCreateArticleOpen}
          onOpenChange={setIsCreateArticleOpen}
          isEditMode={false}
          categories={Object.keys(DEFAULT_LIBRARY_ITEMS.reduce((acc, item) => {
              if(item.subCategory) acc[item.subCategory] = true;
              return acc;
          }, {} as Record<string, boolean>))}
          units={UNITS}
          libraries={libraries.map(lib => lib.name)}
          form={form}
          onSubmit={handleCreateArticle}
          predefinedLots={[
            { id: '01', name: 'TERRASSEMENTS GÉNÉRAUX' },
            { id: '02', name: 'GROS ŒUVRE - MAÇONNERIE' },
            { id: '03', name: 'MÉTALLERIE, FERRONNERIE' },
            { id: '04', name: 'PLÂTRERIE' },
            { id: '05', name: 'ISOLATION' },
            { id: '06', name: 'CARRELAGES, REVÊTEMENTS' },
            { id: '07', name: 'SOLS SOUPLES' },
            { id: '08', name: 'PEINTURES' },
            { id: '09', name: 'MENUISERIES INTÉRIEURES' },
            { id: '10', name: 'MENUISERIES EXTÉRIEURES' },
            { id: '11', name: 'ÉLECTRICITÉ COURANTS FORTS' },
            { id: '12', name: 'PLOMBERIES SANITAIRES' },
            { id: '13', name: 'COUVERTURE, ZINGUERIE' },
            { id: '14', name: 'ÉTANCHÉITÉ' },
            { id: '15', name: 'STORES ET FERMETURES' },
            { id: '16', name: 'VRD, ESPACES EXTÉRIEURS' }
          ]}
        />
      </div>
    </TooltipProvider>
  );
};

export default LeftPanel;
