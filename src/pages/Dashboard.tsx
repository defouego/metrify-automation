
import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import ProjectCard from '@/components/dashboard/ProjectCard';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { PlusCircle, BriefcaseBusiness, Ruler, FileOutput } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface Project {
  id: string;
  name: string;
  client: string;
  date: string;
  status: 'draft' | 'active' | 'completed' | 'archived';
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Immeuble Haussmannien',
      client: 'Rénovation Paris',
      date: '12/04/2025',
      status: 'active',
    },
    {
      id: '2',
      name: 'Villa Méditerranée',
      client: 'Costa Architectes',
      date: '28/03/2025',
      status: 'draft',
    },
    {
      id: '3',
      name: 'Centre Commercial Nord',
      client: 'Groupe Carrefour',
      date: '15/03/2025',
      status: 'completed',
    },
    {
      id: '4',
      name: 'Résidence Les Ormes',
      client: 'Bouygues Immobilier',
      date: '02/03/2025',
      status: 'active',
    }
  ]);

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  const handleCreateProject = () => {
    navigate('/project/new');
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold font-heading uppercase text-metrBlue">Mes projets</h1>
        <Button 
          onClick={handleCreateProject}
          className="bg-metrOrange hover:bg-orange-600 text-white rounded-2xl flex items-center gap-2"
        >
          <PlusCircle size={18} />
          Créer un projet
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onDelete={() => handleDeleteProject(project.id)}
          />
        ))}
      </div>

      <h2 className="text-xl font-bold font-heading mb-6 text-metrBlue flex items-center">
        <span className="mr-2">📈</span> Statistiques
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={<BriefcaseBusiness className="h-10 w-10 text-metrBlue" />}
          title="Projets actifs"
          value="2"
          trend="+1 ce mois-ci"
          trendUp={true}
        />
        <StatCard
          icon={<Ruler className="h-10 w-10 text-metrBlue" />}
          title="m² mesurés ce mois"
          value="1254"
          trend="+326 vs mois dernier"
          trendUp={true}
        />
        <StatCard
          icon={<FileOutput className="h-10 w-10 text-metrBlue" />}
          title="Exports récents"
          value="8"
          trend="Dernier: 2 jours"
          trendUp={null}
        />
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
