
export interface Project {
  id: string;            // uuid
  name: string;          // libellé du projet
  description?: string;  // optionnel
  createdAt: number;     // timestamp (ms depuis 1970)
}
