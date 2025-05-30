
import { ItemUnit } from '@/types/library';

export interface LibraryItem {
  id: string;
  designation: string;
  lot: string;
  subCategory: string;
  unite: ItemUnit;
  prix_unitaire: number;
  description?: string;
  bibliotheque_id?: string;
  tags?: string[];
  date_creation: string;
  date_derniere_utilisation?: string;
  actif: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  fichier_joint?: string;
}
