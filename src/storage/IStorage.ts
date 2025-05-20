
import { DatabaseSource } from '../models/DatabaseSource';
import { UsageLink } from '../models/UsageLink';
import { Project } from '../models/Project';
import { Plan } from '../models/Plan';
import { LibraryItem } from '../models/LibraryItem';
import { Library } from '../models/Library';

export interface IStorage {
  // DatabaseSource
  addDbSource(src: DatabaseSource): Promise<void>;
  updateDbSource(src: DatabaseSource): Promise<void>;
  deleteDbSource(id: string): Promise<void>;
  listDbSources(): Promise<DatabaseSource[]>;

  // UsageLink
  linkSourceToProject(link: UsageLink): Promise<void>;
  unlinkSource(id: string): Promise<void>;
  listLinksForProject(projectId: string): Promise<UsageLink[]>;

  // Project
  addProject(p: Project): Promise<void>;
  updateProject(p: Project): Promise<void>;
  deleteProject(id: string): Promise<void>;
  listProjects(): Promise<Project[]>;

  // Plan
  addPlan(plan: Plan): Promise<void>;
  updatePlan(plan: Plan): Promise<void>;
  deletePlan(id: string): Promise<void>;
  listPlansForProject(projectId: string): Promise<Plan[]>;

  // LibraryItem
  addLibraryItem(item: LibraryItem): Promise<void>;
  updateLibraryItem(item: LibraryItem): Promise<void>;
  deleteLibraryItem(id: string): Promise<void>;
  listLibraryItems(): Promise<LibraryItem[]>;
  listLibraryItemsByLibrary(libraryId: string): Promise<LibraryItem[]>;
  
  // Library
  addLibrary(library: Library): Promise<void>;
  updateLibrary(library: Library): Promise<void>;
  deleteLibrary(id: string): Promise<void>;
  listLibraries(): Promise<Library[]>;
}
