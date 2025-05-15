
// Types for Metr application

export interface Element {
  id: string;
  type: 'porte' | 'fenetre' | 'mur' | 'piece';
  calque: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  longueur?: number;
  hauteur?: number;
  quantite?: number;
  highlighted?: boolean;
  properties?: Record<string, any>;
}

export interface Plan {
  id: string;
  nom: string;
  elements: {
    portes: Element[];
    fenetres: Element[];
    murs: Element[];
    pieces: Element[];
  };
  file?: File;
  calibrated?: boolean;
  calibrationStep?: number;
}

export interface Surface {
  id: string;
  pieceId: string;
  nom: string;
  type: 'sol' | 'mur' | 'plafond';
  superficie: number;
  unite: string;
  ouvragesIds: string[];
  modified?: boolean;
}

export interface Ouvrage {
  id: string;
  designation: string;
  lot: string;
  type?: string;
  quantite: number;
  unite: string;
  prix_unitaire: number;
  coefficient?: number;
  surfaceId?: string;
  localisation: {
    niveau: string;
    piece: string;
  };
}

export interface Projet {
  id: string;
  nom: string;
  plans: Plan[];
  ouvrages: Ouvrage[];
  surfaces?: Surface[];
  currentPlanIndex?: number;
}

export type CalibrationStep = 
  | 'upload' 
  | 'portes' 
  | 'fenetres'
  | 'murs'
  | 'classification'
  | 'complete'; 
