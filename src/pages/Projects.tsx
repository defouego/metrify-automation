
import React, { useState } from 'react';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectCard from '@/components/dashboard/ProjectCard';
import { Project as DashboardProject } from '@/pages/Dashboard';

// Extended Project type with lastModified
interface Project extends DashboardProject {
  lastModified?: string;
}

// Update the base type import from Dashboard to include 'archived'
// Then modify Project interface to use that updated type
type ProjectStatus = 'active' | 'draft' | 'completed' | 'archived';

// Sample projects data
const sampleProjects: Project[] = [
  {
    id: '1',
    name: 'Résidence Les Terrasses',
    client: 'SCI Habitat',
    status: 'active',
    date: '20/04/2025',
    lastModified: '28/04/2025'
  },
  {
    id: '2',
    name: 'Bureau OpenSpace',
    client: 'TechCorp',
    status: 'completed',
    date: '15/03/2025',
    lastModified: '16/04/2025'
  },
  {
    id: '3',
    name: 'Rénovation Villa Marine',
    client: 'M. Dupont',
    status: 'draft',
    date: '10/04/2025',
    lastModified: '11/04/2025'
  },
  {
    id: '4',
    name: 'Centre commercial Est',
    client: 'Retail Invest',
    status: 'archived',
    date: '05/01/2025',
    lastModified: '20/02/2025'
  },
  {
    id: '5',
    name: 'Maison écologique',
    client: 'Mme Martin',
    status: 'active',
    date: '12/04/2025',
    lastModified: '13/04/2025'
  },
  {
    id: '6',
    name: 'Immeuble résidentiel',
    client: 'SCI Horizon',
    status: 'completed',
    date: '01/03/2025',
    lastModified: '05/04/2025'
  }
];

const projectTypes = ["Tous", "Maison", "Collectif", "Tertiaire", "Autre"];
const clientsList = ["Tous", "SCI Habitat", "TechCorp", "M. Dupont", "Retail Invest", "Mme Martin", "SCI Horizon"];
const yearsList = ["Tous", "2025", "2024", "2023", "2022"];
const sortOptions = ["Dernière modification", "Nom A-Z", "Date de création"];

const Projects = () => {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [typeFilter, setTypeFilter] = useState('Tous');
  const [clientFilter, setClientFilter] = useState('Tous');
  const [yearFilter, setYearFilter] = useState('Tous');
  const [sortBy, setSortBy] = useState('Dernière modification');
  const [showArchived, setShowArchived] = useState(false);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      // Search query filter
      if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !project.client.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'Tous') {
        const statusMap: Record<string, ProjectStatus> = {
          'En cours': 'active',
          'Brouillon': 'draft',
          'Terminé': 'completed',
          'Archivé': 'archived'
        };
        if (project.status !== statusMap[statusFilter]) {
          return false;
        }
      }

      // Show archived toggle
      if (!showArchived && project.status === 'archived') {
        return false;
      }

      // Client filter (would need client data in project)
      if (clientFilter !== 'Tous' && project.client !== clientFilter) {
        return false;
      }

      // Year filter (would need to extract year from date)
      if (yearFilter !== 'Tous') {
        const projectYear = project.date.split('/')[2];
        if (projectYear !== yearFilter) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      // Sort logic
      if (sortBy === 'Nom A-Z') {
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'Dernière modification') {
        // Convert dates to comparable format (assuming date format is dd/mm/yyyy)
        const dateA = a.lastModified?.split('/').reverse().join('') || '';
        const dateB = b.lastModified?.split('/').reverse().join('') || '';
        return dateB.localeCompare(dateA);
      } else if (sortBy === 'Date de création') {
        const dateA = a.date.split('/').reverse().join('');
        const dateB = b.date.split('/').reverse().join('');
        return dateB.localeCompare(dateA);
      }
      return 0;
    });

  const handleDeleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  const activeProjects = projects.filter(p => p.status !== 'archived').length;
  const archivedProjects = projects.filter(p => p.status === 'archived').length;

  // Find last modified project
  const lastModifiedProject = projects.reduce((prev, current) => {
    if (!prev.lastModified) return current;
    if (!current.lastModified) return prev;
    
    const prevDate = prev.lastModified.split('/').reverse().join('');
    const currentDate = current.lastModified.split('/').reverse().join('');
    return currentDate > prevDate ? current : prev;
  }, projects[0]);

  return (
    <DashboardLayout>
      <div className="container pb-10">
        <h1 className="text-3xl font-bold mb-6">Mes projets</h1>
        
        {/* Search and filters row */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input 
              placeholder="Rechercher un projet ou un client..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tous">Tous les statuts</SelectItem>
                <SelectItem value="En cours">En cours</SelectItem>
                <SelectItem value="Brouillon">Brouillon</SelectItem>
                <SelectItem value="Terminé">Terminé</SelectItem>
                <SelectItem value="Archivé">Archivé</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Typologie" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Client" />
              </SelectTrigger>
              <SelectContent>
                {clientsList.map(client => (
                  <SelectItem key={client} value={client}>{client}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Année" />
              </SelectTrigger>
              <SelectContent>
                {yearsList.map(year => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Sort and archived toggle */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Switch 
              id="show-archived" 
              checked={showArchived} 
              onCheckedChange={setShowArchived} 
            />
            <Label htmlFor="show-archived">Afficher aussi les projets archivés</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <SlidersHorizontal size={18} className="text-gray-500" />
            <span className="text-sm text-gray-500">Trier par:</span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Projects grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={() => handleDeleteProject(project.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-500">Aucun projet ne correspond à vos critères de recherche.</p>
            <Link to="/project/new">
              <Button className="mt-4 bg-metrOrange hover:bg-metrOrange/90">
                Créer un nouveau projet
              </Button>
            </Link>
          </div>
        )}
        
        {/* Stats section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Nombre total de projets</h3>
            <p className="text-2xl font-bold">{projects.length}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Projets actifs</h3>
            <p className="text-2xl font-bold">{activeProjects}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h3 className="text-sm font-medium text-gray-500">Projets archivés</h3>
            <p className="text-2xl font-bold">{archivedProjects}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Projects;
