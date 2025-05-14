import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, Plus, Layers } from 'lucide-react';
import { Plan, Projet } from '@/types/metr';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onUploadPlan
}) => {
  return (
    <div className="absolute top-3 left-3 z-10">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="bg-white shadow-sm flex items-center gap-2">
            <Layers size={16} />
            <span>{currentPlan ? currentPlan.nom : 'Sélectionner un plan'}</span>
            <ChevronDown size={14} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuLabel>Plans du projet</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {projet.plans.length > 0 ? (
            projet.plans.map((plan) => (
              <DropdownMenuItem 
                key={plan.id} 
                className={`${currentPlan?.id === plan.id ? 'bg-gray-100 font-medium' : ''}`}
                onClick={() => onSelectPlan(plan)}
              >
                {plan.nom}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>Aucun plan disponible</DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onUploadPlan} className="text-blue-600">
            <Plus size={16} className="mr-2" />
            Ajouter un nouveau plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default PlanSelector; 