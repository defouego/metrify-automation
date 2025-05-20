
import Dexie from 'dexie';
import { DatabaseSource } from '../models/DatabaseSource';
import { UsageLink } from '../models/UsageLink';
import { Project } from '../models/Project';
import { Plan } from '../models/Plan';
import { LibraryItem } from '../models/LibraryItem';
import { Library } from '../models/Library';

export class AppDB extends Dexie {
  dbSources!: Dexie.Table<DatabaseSource, string>;
  usageLinks!: Dexie.Table<UsageLink, string>;
  projects!: Dexie.Table<Project, string>;
  plans!: Dexie.Table<Plan, string>;
  libraryItems!: Dexie.Table<LibraryItem, string>;
  libraries!: Dexie.Table<Library, string>;

  constructor() {
    super('MetrifyLocalDB');
    this.version(1).stores({
      dbSources: 'id, name, type',
      usageLinks: 'id, dbSourceId, projectId',
      projects: 'id, name, createdAt',
      plans: 'id, projectId, name',
      libraryItems: 'id, designation, lot, bibliotheque_id, actif',
      libraries: 'id, name, createdAt'
    });
  }
}

export const db = new AppDB();
