import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Upload } from 'lucide-react';
import { Plan, Projet } from '@/types/metr';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PlanSelectorProps {
  projet: Projet;
  currentPlan: Plan | null;
  onSelectPlan: (plan: Plan) => void;
  onUploadPlan: () => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  projet,
  currentPlan,
  onSelectPlan,
  onUploadPlan,
}) => {
  // Ajouter le plan de test aux plans disponibles
  const testPlan: Plan = {
    id: 'test-plan',
    nom: 'Plan de test',
    elements: {
      portes: [],
      fenetres: [],
      murs: [],
      pieces: []
    }
  };

  const allPlans = [
    ...(projet.plans || []),
    testPlan
  ];

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentPlan?.id || ''}
        onValueChange={(value) => {
          const selectedPlan = allPlans.find(p => p.id === value);
          if (selectedPlan) onSelectPlan(selectedPlan);
        }}
      >
        <SelectTrigger className="w-[200px] bg-white">
          <SelectValue placeholder="Sélectionner un plan">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{currentPlan?.nom || 'Sélectionner un plan'}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allPlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>{plan.nom}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="icon"
        onClick={onUploadPlan}
        className="bg-white"
      >
        <Upload className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default PlanSelector; 