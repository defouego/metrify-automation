
import React from 'react';
import { MoreHorizontal, ExternalLink, FileOutput, Trash2 } from 'lucide-react';
import { Project } from '@/pages/Dashboard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onDelete: () => void;
}

const ProjectCard = ({ project, onDelete }: ProjectCardProps) => {
  const statusColors = {
    active: 'bg-green-100 text-green-800',
    draft: 'bg-amber-100 text-amber-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    active: 'En cours',
    draft: 'Brouillon',
    completed: 'Terminé',
    archived: 'Archivé'
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col h-full border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-lg text-metrBlue mb-1">{project.name}</h3>
          <p className="text-sm text-gray-500">{project.client}</p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
              <MoreHorizontal className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center mb-2">
        <span className="text-sm text-gray-500">Créé le {project.date}</span>
      </div>
      
      <div className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium w-fit",
        statusColors[project.status]
      )}>
        {statusLabels[project.status]}
      </div>
      
      <div className="flex-grow"></div>
      
      <div className="flex space-x-2 mt-4 pt-4 border-t border-gray-100">
        <Button 
          className="flex-1 bg-metrBlue hover:bg-blue-800"
          size="sm"
        >
          <ExternalLink className="mr-1 h-4 w-4" />
          Ouvrir
        </Button>
        <Button 
          variant="outline"
          className="flex-1 border-gray-300 text-gray-600 hover:text-gray-800"
          size="sm"
        >
          <FileOutput className="mr-1 h-4 w-4" />
          Exporter
        </Button>
      </div>
    </div>
  );
};

export default ProjectCard;
