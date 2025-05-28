import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Square, 
  Ruler, 
  Hash, 
  Scan, 
  GitCompare, 
  Layers,
  MousePointer,
  Calculator,
  Eye,
  EyeOff,
  Check,
  X,
  Wand2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type MeasurementTool = 
  | 'select'
  | 'surface'
  | 'length'
  | 'counter'
  | 'detection'
  | 'compare'
  | 'layer';

// Outils qui ont le comportement spécial
const CALCULATION_TOOLS: MeasurementTool[] = ['surface', 'length', 'counter', 'detection'];

interface MeasurementToolbarProps {
  activeTool: MeasurementTool;
  onToolChange: (tool: MeasurementTool) => void;
  selectedCount?: number;
  detectedCount?: number;
  isolationMode?: boolean;
  onToggleIsolation?: () => void;
  onValidate?: () => void;
  onCancel?: () => void;
  elementType?: string;
  isManualMode?: boolean;
  onToggleManualMode?: () => void;
}

const MeasurementToolbar: React.FC<MeasurementToolbarProps> = ({
  activeTool,
  onToolChange,
  selectedCount = 0,
  detectedCount = 0,
  isolationMode = false,
  onToggleIsolation,
  onValidate,
  onCancel,
  elementType = "Aucun type détecté",
  isManualMode = false,
  onToggleManualMode
}) => {
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Sélection' },
    { id: 'surface', icon: Square, label: 'Surface' },
    { id: 'length', icon: Ruler, label: 'Longueur' },
    { 
      id: 'counter', 
      icon: Hash, 
      label: 'Compteur',
      extraContent: (
        <div className="flex items-center gap-2 ml-2">
          <div className="flex items-center gap-1.5">
            <Switch
              id="manual-mode"
              checked={isManualMode}
              onCheckedChange={onToggleManualMode}
            />
            <Label 
              htmlFor="manual-mode" 
              className="text-xs text-gray-600"
            >
              Manuel
            </Label>
          </div>
        </div>
      )
    },
    { id: 'detection', icon: Scan, label: 'Détection' },
    { id: 'compare', icon: GitCompare, label: 'Comparer' },
    { id: 'layer', icon: Layers, label: 'Calque' },
  ];

  // Trouver l'outil actif
  const activeToolConfig = tools.find(tool => tool.id === activeTool);
  const isCalculationTool = activeTool && CALCULATION_TOOLS.includes(activeTool);

  // Rendu des boutons communs
  const renderCommonButtons = () => (
    <div className="flex items-center gap-2">
      <Button
        onClick={onToggleIsolation}
        variant="outline"
        size="sm"
        className="border-gray-300 hover:border-metr-blue hover:bg-metr-blue hover:text-white transition-all duration-200"
      >
        {isolationMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
        {isolationMode ? "Désactiver isolation" : "Mode isolation"}
      </Button>

      <Button
        onClick={onValidate}
        disabled={detectedCount === 0}
        className="bg-green-600 hover:bg-green-700 text-white font-montserrat font-semibold transition-all duration-200"
      >
        <Check className="w-4 h-4 mr-2" />
        Valider ({detectedCount})
      </Button>
      <Button
        onClick={onCancel}
        variant="outline"
        className="border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
      >
        <X className="w-4 h-4 mr-2" />
        Annuler
      </Button>
    </div>
  );

  return (
    <div className="w-full h-14 bg-white border-b border-gray-200 flex items-center px-4 justify-between shadow-sm">
      <div className="flex items-center space-x-3">
        {/* Bouton actif pour les outils de calcul */}
        {isCalculationTool && activeToolConfig && (
          <div className="flex items-center">
            <Button
              variant="default"
              size="sm"
              className="h-9 bg-metrBlue text-white"
              onClick={() => onToolChange('select')} // Retour à la sélection
            >
              <activeToolConfig.icon className="h-4 w-4 mr-1" />
              <span className="text-xs">{activeToolConfig.label}</span>
            </Button>
            {activeToolConfig.extraContent}
          </div>
        )}

        {/* Tous les outils - masqués si un outil de calcul est actif */}
        {(!activeTool || !isCalculationTool) && tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <div className="flex items-center">
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
                {activeTool === tool.id && tool.extraContent}
              </div>
            </TooltipTrigger>
            <TooltipContent>{tool.label}</TooltipContent>
          </Tooltip>
        ))}
      </div>

      {/* Extend selection button */}
      {/* {showExtendButton && (
        <div 
          className="absolute z-20"
          style={{
            left: `${extendButtonPosition.x}px`,
            top: `${extendButtonPosition.y}px`,
            transform: 'translate(-50%, 0)'
          }}
        >
          <Button
            onClick={handleExtendSelection}
            onMouseEnter={() => handleExtendHover(true)}
            onMouseLeave={() => handleExtendHover(false)}
            variant="default"
            size="sm"
            className="bg-metrBlue hover:bg-metrBlue/90 text-white font-medium shadow-lg flex items-center gap-1.5"
          >
            <span className="text-lg leading-none">🪄</span>
            <span className="text-xs">Étendre la sélection</span>
          </Button>
        </div>
      )} */}

      {/* Contrôles spécifiques à l'outil de calcul actif */}
      {isCalculationTool && (
        <div className="flex items-center gap-4">
          {/* Contrôles spécifiques à l'outil */}
          <div className="flex items-center gap-3">
            {activeTool === 'counter' && (
              <>
                <div className="flex items-center gap-2 px-3 py-1 bg-metr-gray rounded-lg">
                  <span className="text-sm font-roboto text-gray-600">Type:</span>
                  <Badge variant="outline" className="border-metrBlue text-metrBlue font-roboto text-xs">
                    {elementType}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-metrBlue text-white font-roboto">
                    {detectedCount} {isManualMode ? "points" : "éléments"} détectés
                  </Badge>
                </div>
              </>
            )}

            {activeTool === 'surface' && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-gray-300">
                  Rectangle
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300">
                  Cercle
                </Button>
                <Button variant="outline" size="sm" className="border-gray-300">
                  Polygone
                </Button>
              </div>
            )}

            {activeTool === 'length' && (
              <Badge variant="secondary" className="bg-blue-100 text-metr-blue font-roboto">
                Longueur: 0.00 m
              </Badge>
            )}

            {activeTool === 'detection' && (
              <Badge variant="secondary" className="bg-blue-100 text-metr-blue font-roboto">
                Éléments détectés: 0
              </Badge>
            )}
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* Boutons communs */}
          {renderCommonButtons()}
        </div>
      )}
    </div>
  );
};

export default MeasurementToolbar;
