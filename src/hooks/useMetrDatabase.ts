
import { useState, useEffect } from 'react';
import { storage } from '../db/index';
import { generateId, getCurrentTimestamp } from '../db/index';
import { DatabaseSource } from '../models/DatabaseSource';
import { UsageLink } from '../models/UsageLink';
import { Project } from '../models/Project';
import { Plan } from '../models/Plan';

/**
 * Hook for interacting with Metr application database
 */
export function useMetrDatabase() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Project related functions
  const createProject = async (name: string, description?: string): Promise<Project> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newProject: Project = {
        id: generateId(),
        name,
        description,
        createdAt: getCurrentTimestamp()
      };
      
      await storage.addProject(newProject);
      return newProject;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getProjects = async (): Promise<Project[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await storage.listProjects();
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Plan related functions
  const createPlan = async (projectId: string, name: string, status: string = 'draft'): Promise<Plan> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newPlan: Plan = {
        id: generateId(),
        projectId,
        name,
        status
      };
      
      await storage.addPlan(newPlan);
      return newPlan;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  const getProjectPlans = async (projectId: string): Promise<Plan[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      return await storage.listPlansForProject(projectId);
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Data source related functions
  const createDataSource = async (name: string, type: 'sql'|'api'|'prometheus'|'csv'|'excel', config: any): Promise<DatabaseSource> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newSource: DatabaseSource = {
        id: generateId(),
        name,
        type,
        config
      };
      
      await storage.addDbSource(newSource);
      return newSource;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Link projects to data sources
  const linkSourceToProject = async (dbSourceId: string, projectId: string): Promise<UsageLink> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const link: UsageLink = {
        id: generateId(),
        dbSourceId,
        projectId
      };
      
      await storage.linkSourceToProject(link);
      return link;
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    // Project operations
    createProject,
    getProjects,
    updateProject: storage.updateProject,
    deleteProject: storage.deleteProject,
    // Plan operations
    createPlan,
    getProjectPlans,
    updatePlan: storage.updatePlan,
    deletePlan: storage.deletePlan,
    // Data source operations
    createDataSource,
    updateDataSource: storage.updateDbSource,
    deleteDataSource: storage.deleteDbSource,
    listDataSources: storage.listDbSources,
    // Link operations
    linkSourceToProject,
    unlinkSource: storage.unlinkSource,
    getProjectLinks: storage.listLinksForProject
  };
}
