
import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Upload, FileUp } from 'lucide-react';

const NewProject = () => {
  const navigate = useNavigate();
  
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold font-heading text-metrBlue mb-6">Créer un nouveau projet</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Informations du projet</CardTitle>
            <CardDescription>
              Complétez les informations de base pour créer votre nouveau projet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Project form would go here */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center">
              <div className="flex flex-col items-center justify-center">
                <div className="mb-4 rounded-full bg-blue-50 p-3">
                  <Upload className="h-6 w-6 text-metrBlue" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Déposer votre plan</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Formats acceptés: PDF, DWG, JPG, PNG
                </p>
                <Button className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  Parcourir les fichiers
                </Button>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => navigate('/dashboard')}
              >
                Annuler
              </Button>
              <Button 
                className="bg-metrOrange hover:bg-orange-600"
                onClick={() => navigate('/dashboard')}
              >
                Créer le projet
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default NewProject;
