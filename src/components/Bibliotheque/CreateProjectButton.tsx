
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const CreateProjectButton: React.FC = () => {
  return (
    <Button asChild className="bg-metrOrange hover:bg-metrOrange/90">
      <Link to="/project/new">
        <Plus className="mr-2 h-4 w-4" />
        Créer un projet
      </Link>
    </Button>
  );
};

export default CreateProjectButton;
