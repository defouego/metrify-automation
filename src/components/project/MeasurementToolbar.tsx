
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Square, 
  Ruler, 
  Hash, 
  Scan, 
  GitCompare, 
  Layers,
  Maximize,
  MousePointer
} from 'lucide-react';
import { cn } from '@/lib/utils';

type MeasurementTool = 
  | 'select'
  | 'surface'
  | 'length'
  | 'counter'
  | 'detection'
  | 'compare'
  | 'layer';

interface MeasurementToolbarProps {
  activeTool: MeasurementTool;
  onToolChange: (tool: MeasurementTool) => void;
}

const MeasurementToolbar: React.FC<MeasurementToolbarProps> = ({
  activeTool,
  onToolChange
}) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Sélection' },
    { id: 'surface', icon: Square, label: 'Surface' },
    { id: 'length', icon: Ruler, label: 'Longueur' },
    { id: 'counter', icon: Hash, label: 'Compteur' },
    { id: 'detection', icon: Scan, label: 'Détection' },
    { id: 'compare', icon: GitCompare, label: 'Comparer' },
    { id: 'layer', icon: Layers, label: 'Calque' },
  ];

  return (
    <div className="flex items-center justify-center gap-1 bg-white p-2 rounded-md shadow-sm">
      {tools.map((tool) => (
        <Tooltip key={tool.id}>
          <TooltipTrigger asChild>
            <Button
              variant={activeTool === tool.id ? "default" : "outline"}
              size="sm"
              className={cn(
                "h-9",
                activeTool === tool.id ? "bg-metrBlue text-white" : "text-gray-700"
              )}
              onClick={() => onToolChange(tool.id as MeasurementTool)}
            >
              <tool.icon className="h-4 w-4 mr-1" />
              <span className="text-xs">{tool.label}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tool.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};

export default MeasurementToolbar;
