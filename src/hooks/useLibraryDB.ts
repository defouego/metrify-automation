
import { useState } from 'react';
import { storage } from '../storage/DexieStorage';
import { LibraryItem } from '../models/LibraryItem';
import { Library } from '../models/Library';
import { generateId } from '../db/index';
import { ItemUnit } from '@/types/library';

/**
 * Hook pour gérer les opérations de la bibliothèque et des articles
 */
export function useLibraryDB() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Format current date to DD/MM/YYYY
  const formatDate = () => {
    const today = new Date();
    return `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  };

  // Library operations
  const createLibrary = async (name: string): Promise<Library> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newLibrary: Library = {
        id: name.replace(/\s+/g, '_').toLowerCase(),
        name,
        createdAt: formatDate(),
        itemCount: 0
      };
      
      await storage.addLibrary(newLibrary);
      return newLibrary;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLibraries = async (): Promise<Library[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const libraries = await storage.listLibraries();
      
      // Add the "all" library if it doesn't exist
      const allLibrary = libraries.find(lib => lib.id === 'all');
      if (!allLibrary) {
        const allItems = await storage.listLibraryItems();
        const newAllLibrary: Library = {
          id: 'all',
          name: 'Tous les articles',
          createdAt: formatDate(),
          itemCount: allItems.length
        };
        libraries.unshift(newAllLibrary);
      }

      // Add the "favorites" library if it doesn't exist
      const favoritesLibrary = libraries.find(lib => lib.id === 'favorites');
      if (!favoritesLibrary) {
        const allItems = await storage.listLibraryItems();
        const favoriteItems = allItems.filter(item => item.isFavorite);
        const newFavoritesLibrary: Library = {
          id: 'favorites',
          name: 'Favoris',
          createdAt: formatDate(),
          itemCount: favoriteItems.length
        };
        libraries.push(newFavoritesLibrary);
      }
      
      // Update library item counts
      const updatedLibraries = await Promise.all(libraries.map(async (library) => {
        if (library.id === 'all') {
          const allItems = await storage.listLibraryItems();
          return { ...library, itemCount: allItems.length };
        } else if (library.id === 'favorites') {
          const allItems = await storage.listLibraryItems();
          const favoriteItems = allItems.filter(item => item.isFavorite);
          return { ...library, itemCount: favoriteItems.length };
        } else {
          const items = await storage.listLibraryItemsByLibrary(library.id);
          return { ...library, itemCount: items.length };
        }
      }));
      
      return updatedLibraries;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // LibraryItem operations
  const createLibraryItem = async (
    designation: string, 
    lot: string,
    unite: ItemUnit,
    prix_unitaire: number,
    bibliotheque_id: string = 'default',
    description?: string,
    subCategory: string = 'Non spécifié',
    tags?: string[]
  ): Promise<LibraryItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const currentDate = formatDate();
      const newItem: LibraryItem = {
        id: generateId(),
        designation,
        lot,
        subCategory,
        unite,
        prix_unitaire,
        description,
        tags,
        bibliotheque_id,
        date_creation: currentDate,
        date_derniere_utilisation: currentDate, // Set derniere_utilisation to creation date
        actif: true,
        isFavorite: false
      };
      
      await storage.addLibraryItem(newItem);
      
      // Update library item count
      const libraries = await storage.listLibraries();
      const library = libraries.find(lib => lib.id === bibliotheque_id);
      
      if (library) {
        library.itemCount += 1;
        await storage.updateLibrary(library);
      }
      
      return newItem;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateLibraryItem = async (item: LibraryItem): Promise<LibraryItem> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedItem = {
        ...item,
        date_derniere_utilisation: formatDate()
      };
      
      await storage.updateLibraryItem(updatedItem);

      // If item is marked as favorite, ensure it's in the favorites library
      if (updatedItem.isFavorite) {
        const libraries = await storage.listLibraries();
        const favoritesLibrary = libraries.find(lib => lib.id === 'favorites');
        
        if (!favoritesLibrary) {
          // Create favorites library if it doesn't exist
          await createLibrary('Favoris');
        }
      }
      
      return updatedItem;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteLibraryItem = async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const item = (await storage.listLibraryItems()).find(item => item.id === id);
      
      if (item && item.bibliotheque_id) {
        const libraries = await storage.listLibraries();
        const library = libraries.find(lib => lib.id === item.bibliotheque_id);
        
        if (library && library.itemCount > 0) {
          library.itemCount -= 1;
          await storage.updateLibrary(library);
        }
      }
      
      await storage.deleteLibraryItem(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete multiple items at once
  const deleteLibraryItems = async (ids: string[]): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const items = (await storage.listLibraryItems()).filter(item => ids.includes(item.id));
      
      // Group items by library for efficient library count updates
      const libraryCountUpdates: Record<string, number> = {};
      
      for (const item of items) {
        if (item.bibliotheque_id) {
          if (!libraryCountUpdates[item.bibliotheque_id]) {
            libraryCountUpdates[item.bibliotheque_id] = 0;
          }
          libraryCountUpdates[item.bibliotheque_id]--;
        }
        
        await storage.deleteLibraryItem(item.id);
      }
      
      // Update library counts
      const libraries = await storage.listLibraries();
      for (const libId in libraryCountUpdates) {
        const library = libraries.find(lib => lib.id === libId);
        if (library) {
          library.itemCount = Math.max(0, library.itemCount + libraryCountUpdates[libId]);
          await storage.updateLibrary(library);
        }
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Move items to another library
  const moveItemsToLibrary = async (itemIds: string[], targetLibraryId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const items = (await storage.listLibraryItems()).filter(item => itemIds.includes(item.id));
      const sourceLibraryUpdates: Record<string, number> = {};
      
      for (const item of items) {
        const sourceLibraryId = item.bibliotheque_id;
        
        // Track count changes for the source library
        if (sourceLibraryId) {
          if (!sourceLibraryUpdates[sourceLibraryId]) {
            sourceLibraryUpdates[sourceLibraryId] = 0;
          }
          sourceLibraryUpdates[sourceLibraryId]--;
        }
        
        // Update item with new library
        const updatedItem = {
          ...item,
          bibliotheque_id: targetLibraryId,
          date_derniere_utilisation: formatDate() // Update last used date
        };
        
        await storage.updateLibraryItem(updatedItem);
      }
      
      // Update source library counts
      const libraries = await storage.listLibraries();
      for (const libId in sourceLibraryUpdates) {
        const library = libraries.find(lib => lib.id === libId);
        if (library) {
          library.itemCount = Math.max(0, library.itemCount + sourceLibraryUpdates[libId]);
          await storage.updateLibrary(library);
        }
      }
      
      // Update target library count
      const targetLibrary = libraries.find(lib => lib.id === targetLibraryId);
      if (targetLibrary) {
        targetLibrary.itemCount += items.length;
        await storage.updateLibrary(targetLibrary);
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a library and optionally its items
  const deleteLibrary = async (id: string, deleteItems: boolean = false): Promise<void> => {
    if (id === 'all') {
      throw new Error('La bibliothèque "Tous les articles" ne peut pas être supprimée');
    }
    
    if (id === 'favorites') {
      throw new Error('La bibliothèque "Favoris" ne peut pas être supprimée');
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const items = await storage.listLibraryItemsByLibrary(id);
      
      // If deleteItems is false, move items to default library
      if (!deleteItems && items.length > 0) {
        for (const item of items) {
          const updatedItem = { 
            ...item, 
            bibliotheque_id: 'default',
            date_derniere_utilisation: formatDate() // Update last used date
          };
          await storage.updateLibraryItem(updatedItem);
        }
        
        // Update default library count
        const libraries = await storage.listLibraries();
        const defaultLibrary = libraries.find(lib => lib.id === 'default');
        if (defaultLibrary) {
          defaultLibrary.itemCount += items.length;
          await storage.updateLibrary(defaultLibrary);
        }
      } else if (deleteItems && items.length > 0) {
        // Delete all items in the library
        for (const item of items) {
          await storage.deleteLibraryItem(item.id);
        }
      }
      
      await storage.deleteLibrary(id);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getLibraryItems = async (libraryId: string = 'all'): Promise<LibraryItem[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      let items: LibraryItem[];
      
      if (libraryId === 'all') {
        items = await storage.listLibraryItems();
      } else if (libraryId === 'favorites') {
        const allItems = await storage.listLibraryItems();
        items = allItems.filter(item => item.isFavorite);
      } else {
        items = await storage.listLibraryItemsByLibrary(libraryId);
      }
      
      // Mark newly created items (less than 24 hours old)
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      return items.map(item => {
        const creationParts = item.date_creation.split('/');
        if (creationParts.length === 3) {
          const creationDate = new Date(
            parseInt(creationParts[2]), 
            parseInt(creationParts[1]) - 1, 
            parseInt(creationParts[0])
          );
          
          return {
            ...item,
            isNew: creationDate > oneDayAgo
          };
        }
        return item;
      });
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize with sample data if needed
  const initializeWithSampleData = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const existingItems = await storage.listLibraryItems();
      const existingLibraries = await storage.listLibraries();
      
      if (existingItems.length === 0 && existingLibraries.length === 0) {
        // Import sample libraries
        const sampleLibraries: Library[] = [
          {
            id: 'default',
            name: 'Bibliothèque par défaut',
            createdAt: formatDate(),
            itemCount: 3
          },
          {
            id: 'attic_plus',
            name: 'ATTIC+',
            createdAt: formatDate(),
            itemCount: 1
          },
          {
            id: 'batimat_2023',
            name: 'BatiMat 2023',
            createdAt: formatDate(),
            itemCount: 1
          },
          {
            id: 'favorites',
            name: 'Favoris',
            createdAt: formatDate(),
            itemCount: 1
          }
        ];
        
        for (const library of sampleLibraries) {
          await storage.addLibrary(library);
        }
        
        const currentDate = formatDate();
        // Import sample items avec subCategory
        const sampleItems: Omit<LibraryItem, 'id'>[] = [
          { 
            designation: 'Béton de fondation', 
            lot: '2- GROS ŒUVRE - MAÇONNERIE',
            subCategory: 'Fondation', 
            unite: 'M3', 
            prix_unitaire: 120.50, 
            date_derniere_utilisation: currentDate,
            date_creation: currentDate,
            bibliotheque_id: 'default',
            actif: true,
            isFavorite: true
          },
          { 
            designation: 'Fenêtre PVC double vitrage', 
            lot: '10- MENUISERIES EXTÉRIEURES',
            subCategory: 'Fenêtre', 
            unite: 'U', 
            prix_unitaire: 425.00, 
            date_derniere_utilisation: currentDate, 
            date_creation: currentDate,
            bibliotheque_id: 'attic_plus',
            actif: true,
            isFavorite: false
          },
          { 
            designation: 'Peinture mate blanche', 
            lot: '8- PEINTURES',
            subCategory: 'Peinture', 
            unite: 'L', 
            prix_unitaire: 28.75, 
            date_derniere_utilisation: currentDate,
            date_creation: currentDate,
            bibliotheque_id: 'batimat_2023',
            actif: true,
            isFavorite: false
          },
          { 
            designation: 'Radiateur électrique', 
            lot: '11- ÉLECTRICITÉ COURANTS FORTS',
            subCategory: 'Chauffage', 
            unite: 'U', 
            prix_unitaire: 199.90,
            date_creation: currentDate,
            date_derniere_utilisation: currentDate,
            bibliotheque_id: 'default',
            actif: true,
            isFavorite: false
          },
          { 
            designation: 'Carrelage grès cérame', 
            lot: '6- CARRELAGES, REVÊTEMENTS',
            subCategory: 'Carrelage', 
            unite: 'M2', 
            prix_unitaire: 45.20, 
            date_derniere_utilisation: currentDate,
            date_creation: currentDate,
            bibliotheque_id: 'default',
            actif: true,
            isFavorite: false
          },
          { 
            designation: 'Porte intérieure', 
            lot: '9- MENUISERIES INTÉRIEURES',
            subCategory: 'Porte', 
            unite: 'U', 
            prix_unitaire: 235.00, 
            date_derniere_utilisation: currentDate,
            date_creation: currentDate,
            bibliotheque_id: 'default',
            actif: true,
            isFavorite: false
          }
        ];
        
        for (const itemData of sampleItems) {
          const item: LibraryItem = {
            id: generateId(),
            ...itemData
          };
          
          await storage.addLibraryItem(item);
        }
      }
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    // Library operations
    createLibrary,
    updateLibrary: storage.updateLibrary,
    deleteLibrary,
    getLibraries,
    // LibraryItem operations
    createLibraryItem,
    updateLibraryItem,
    deleteLibraryItem,
    deleteLibraryItems,
    moveItemsToLibrary,
    getLibraryItems,
    // Initialization
    initializeWithSampleData
  };
}
