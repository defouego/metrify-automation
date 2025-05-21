
import { ItemUnit } from '@/types/library';

export interface Measurement {
  id: string;
  type: 'linear' | 'area' | 'count';
  value: number;  // The measured value (length, area, count)
  unit: ItemUnit;
  height?: number; // For vertical surfaces
  points?: {x: number, y: number}[]; // Points used in the measurement
  pieceId?: string; // Associated room
  surfaceId?: string; // Associated surface
  ouvrageId?: string; // Associated ouvrage
  date: string;
}
