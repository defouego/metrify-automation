
import { storage } from '../storage/DexieStorage';
import { v4 as uuidv4 } from 'uuid';

// Utility functions
export const generateId = () => uuidv4();
export const getCurrentTimestamp = () => Date.now();

// Export the storage singleton
export { storage };
