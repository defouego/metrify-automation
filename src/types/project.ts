
export type ElementType = 'Mur' | 'Fenêtre' | 'Porte' | 'Sol' | 'Plafond' | 'HSP' | 'HSD';

export interface OuvrageItem {
  id: string;
  designation: string;
  lot: string;
  unite: string;
  prix: number;
}

export interface OuvrageCategory {
  id: string;
  categorie: string;
  items: OuvrageItem[];
}

export interface ElementAssociation {
  id: string;
  elementType: ElementType;
  elementId: string;
  ouvrage: {
    designation: string;
    unite: string;
    prix: number;
  };
  quantite: number;
  dimension: string;
}

export interface CalibrationPoint {
  type: ElementType;
  x: number;
  y: number;
  realDimension: {
    width?: number;
    height?: number;
    length?: number;
  };
}
