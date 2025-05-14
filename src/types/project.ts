
// Types used throughout the project

// Element types that can be calibrated
export type ElementType = 'door' | 'window' | 'wall' | 'room';

// Calibration point representing an element on the plan
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

// Project settings
export interface ProjectSettings {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// User profile
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  company?: string;
  role?: string;
}
