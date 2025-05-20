
export interface Plan {
  id: string;            // uuid
  projectId: string;     // FK → Project.id
  name: string;          // nom du plan
  schedule?: any;        // JSON du plan (étapes, dates…)
  status?: string;       // 'draft'|'active'|'archived'
}
