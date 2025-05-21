
export type ItemUnit = 'CM' | 'ENS' | 'Forf' | 'GR' | 'HA' | 'H' | 'J' | 'KG' | 'KM' | 'L' | 'M2' | 'M3' | 'ML' | 'MOIS' | 'PAIRE' | 'PCE' | 'SEM' | 'T' | 'U';

export interface LibraryItem {
  id: string;
  designation: string;
  lot: string;
  subCategory: string;
  unite: ItemUnit;
  prix_unitaire: number;
  description?: string;
  tags?: string[];
  date_creation: string;
  date_derniere_utilisation?: string;
  actif: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  bibliotheque_id?: string;
  fichier_joint?: string;
}

export interface Library {
  id: string;
  name: string;
  createdAt: string;
  itemCount: number;
}
