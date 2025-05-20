
import { db } from '../db/AppDB';
import { IStorage } from './IStorage';
import { DatabaseSource } from '../models/DatabaseSource';
import { UsageLink } from '../models/UsageLink';
import { Project } from '../models/Project';
import { Plan } from '../models/Plan';
import { LibraryItem } from '../models/LibraryItem';
import { Library } from '../models/Library';

export class DexieStorage implements IStorage {
  // ↳ DatabaseSource
  async addDbSource(src: DatabaseSource): Promise<void> { 
    await db.dbSources.add(src); 
  }
  
  async updateDbSource(src: DatabaseSource): Promise<void> { 
    await db.dbSources.put(src); 
  }
  
  async deleteDbSource(id: string): Promise<void> { 
    await db.dbSources.delete(id); 
  }
  
  async listDbSources(): Promise<DatabaseSource[]> { 
    return await db.dbSources.toArray(); 
  }

  // ↳ UsageLink
  async linkSourceToProject(link: UsageLink): Promise<void> {
    await db.usageLinks.add(link);
  }
  
  async unlinkSource(id: string): Promise<void> {
    await db.usageLinks.delete(id);
  }
  
  async listLinksForProject(projectId: string): Promise<UsageLink[]> {
    return await db.usageLinks
      .where('projectId')
      .equals(projectId)
      .toArray();
  }

  // ↳ Project
  async addProject(p: Project): Promise<void> { 
    await db.projects.add(p); 
  }
  
  async updateProject(p: Project): Promise<void> { 
    await db.projects.put(p); 
  }
  
  async deleteProject(id: string): Promise<void> { 
    await db.projects.delete(id); 
  }
  
  async listProjects(): Promise<Project[]> { 
    return await db.projects.toArray(); 
  }

  // ↳ Plan
  async addPlan(plan: Plan): Promise<void> { 
    await db.plans.add(plan); 
  }
  
  async updatePlan(plan: Plan): Promise<void> { 
    await db.plans.put(plan); 
  }
  
  async deletePlan(id: string): Promise<void> { 
    await db.plans.delete(id); 
  }
  
  async listPlansForProject(projectId: string): Promise<Plan[]> {
    return await db.plans
      .where('projectId')
      .equals(projectId)
      .toArray();
  }

  // ↳ LibraryItem
  async addLibraryItem(item: LibraryItem): Promise<void> {
    await db.libraryItems.add(item);
  }
  
  async updateLibraryItem(item: LibraryItem): Promise<void> {
    await db.libraryItems.put(item);
  }
  
  async deleteLibraryItem(id: string): Promise<void> {
    await db.libraryItems.delete(id);
  }
  
  async listLibraryItems(): Promise<LibraryItem[]> {
    return await db.libraryItems.toArray();
  }
  
  async listLibraryItemsByLibrary(libraryId: string): Promise<LibraryItem[]> {
    if (libraryId === 'all') {
      return await this.listLibraryItems();
    }
    
    return await db.libraryItems
      .where('bibliotheque_id')
      .equals(libraryId)
      .toArray();
  }
  
  // ↳ Library
  async addLibrary(library: Library): Promise<void> {
    await db.libraries.add(library);
  }
  
  async updateLibrary(library: Library): Promise<void> {
    await db.libraries.put(library);
  }
  
  async deleteLibrary(id: string): Promise<void> {
    await db.libraries.delete(id);
  }
  
  async listLibraries(): Promise<Library[]> {
    return await db.libraries.toArray();
  }
}

// Singleton à importer partout
export const storage: IStorage = new DexieStorage();
