
export interface UsageLink {
  id: string;            // uuid
  dbSourceId: string;    // FK → DatabaseSource.id
  projectId: string;     // FK → Project.id
}
