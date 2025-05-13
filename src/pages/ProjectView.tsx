
import React from 'react';
import { useParams } from 'react-router-dom';
import ProjectLayout from '@/components/project/ProjectLayout';
import ProjectToolbar from '@/components/project/ProjectToolbar';
import OuvragesPanel from '@/components/project/OuvragesPanel';
import PlanViewer from '@/components/project/PlanViewer';
import AssociationsPanel from '@/components/project/AssociationsPanel';

const ProjectView = () => {
  const { id } = useParams();

  return (
    <ProjectLayout>
      <ProjectToolbar />
      <div className="flex flex-1 overflow-hidden">
        <OuvragesPanel />
        <PlanViewer projectId={id} />
        <AssociationsPanel />
      </div>
    </ProjectLayout>
  );
};

export default ProjectView;
