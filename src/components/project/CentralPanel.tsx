import React, { useRef, useEffect, useState } from 'react';
import { Canvas as FabricCanvas, Rect } from 'fabric';
import { Element, Plan, CalibrationStep, Projet, Surface } from '@/types/metr';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { processUploadedDWG, highlightSimilarElements, getCalibrationStepName } from '@/utils/plan-utils';
import PlanSelector from '@/components/project/PlanSelector';
import CalibrationGuide from '@/components/project/CalibrationGuide';

interface CentralPanelProps {
  projet: Projet;
  plan: Plan | null;
  setPlan: React.Dispatch<React.SetStateAction<Plan | null>>;
  calibrationStep: CalibrationStep;
  setCalibrationStep: React.Dispatch<React.SetStateAction<CalibrationStep>>;
  onPlanUploaded: (plan: Plan) => void;
  onCalibrationComplete: () => void;
  onElementSelected: (element: Element) => void;
  selectedSurface: Surface | null;
  hoveredElementId: string | null;
}

const CentralPanel: React.FC<CentralPanelProps> = ({ 
  projet,
  plan,
  setPlan,
  calibrationStep,
  setCalibrationStep,
  onPlanUploaded,
  onCalibrationComplete,
  onElementSelected,
  selectedSurface,
  hoveredElementId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<FabricCanvas | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  
  // Initialize fabric canvas
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new FabricCanvas(canvasRef.current, {
        width: 800,
        height: 600,
        backgroundColor: '#f8f9fa'
      });
      
      fabricCanvasRef.current = canvas;
      
      canvas.on('mouse:down', (options) => {
        // This would handle selecting elements on the plan
        if (plan && options.target) {
          const target: any = options.target;
          const elementId = target.id;
          if (elementId) {
            handleElementClick(elementId);
          }
        }
      });
      
      return () => {
        canvas.dispose();
        fabricCanvasRef.current = null;
      };
    }
  }, []);
  
  // Render plan elements when plan changes
  useEffect(() => {
    if (fabricCanvasRef.current && plan) {
      renderPlanElements(plan);
    }
  }, [plan, hoveredElementId, selectedSurface]);
  
  // Render plan elements on the canvas
  const renderPlanElements = (plan: Plan) => {
    const canvas = fabricCanvasRef.current;
    if (!canvas) return;
    
    canvas.clear();
    
    // In a real app, this would render actual DWG elements
    // For this demo, we'll just draw rectangles representing the elements
    
    // Draw murs (walls)
    plan.elements.murs.forEach(mur => {
      const rect = new Rect({
        left: mur.x,
        top: mur.y,
        width: mur.longueur ? mur.longueur / 10 : 100,
        height: 10,
        fill: mur.highlighted ? '#F97316' : '#8b8b8b',
        opacity: 0.8,
        selectable: true
      });
      rect.set('id', mur.id);
      canvas.add(rect);
    });
    
    // Draw portes (doors)
    plan.elements.portes.forEach(porte => {
      const rect = new Rect({
        left: porte.x,
        top: porte.y,
        width: porte.width || 40,
        height: 5,
        fill: porte.highlighted ? '#F97316' : '#bc8f8f',
        opacity: 0.8,
        selectable: true
      });
      rect.set('id', porte.id);
      canvas.add(rect);
    });
    
    // Draw fenetres (windows)
    plan.elements.fenetres.forEach(fenetre => {
      const rect = new Rect({
        left: fenetre.x,
        top: fenetre.y,
        width: fenetre.width || 60,
        height: 5,
        fill: fenetre.highlighted ? '#F97316' : '#add8e6',
        opacity: 0.8,
        selectable: true
      });
      rect.set('id', fenetre.id);
      canvas.add(rect);
    });
    
    // Draw pieces (rooms)
    plan.elements.pieces.forEach(piece => {
      const isHovered = hoveredElementId === piece.id;
      const isSurfacePiece = selectedSurface && selectedSurface.pieceId === piece.id;
      
      // Determine the appropriate styling based on the element state
      let fillColor = 'rgba(200, 200, 200, 0.2)';
      let strokeColor = '#ddd';
      let opacity = 0.5;
      
      if (isSurfacePiece) {
        fillColor = 'rgba(59, 130, 246, 0.2)';
        strokeColor = '#3b82f6';
        opacity = 0.7;
      } else if (isHovered) {
        fillColor = 'rgba(249, 115, 22, 0.2)';
        strokeColor = '#F97316';
        opacity = 0.7;
      } else if (piece.highlighted) {
        fillColor = 'rgba(249, 115, 22, 0.15)';
        strokeColor = '#F97316';
      }
      
      const rect = new Rect({
        left: piece.x,
        top: piece.y,
        width: piece.width || 150,
        height: piece.height || 150,
        fill: fillColor,
        stroke: strokeColor,
        strokeWidth: isSurfacePiece || isHovered ? 2 : 1,
        opacity: opacity,
        selectable: true
      });
      rect.set('id', piece.id);
      canvas.add(rect);
    });
    
    canvas.renderAll();
  };
  
  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Check if file is DWG
    if (!file.name.toLowerCase().endsWith('.dwg')) {
      toast.error("Le fichier doit être au format DWG");
      return;
    }
    
    try {
      toast.info("Traitement du fichier DWG en cours...");
      
      // Process the uploaded DWG file (simulated in this demo)
      const newPlan = await processUploadedDWG(file);
      
      // Update state
      setPlan(newPlan);
      onPlanUploaded(newPlan);
      setCalibrationStep('portes');
      
      toast.success("Plan importé avec succès");
    } catch (error) {
      console.error("Error processing DWG file:", error);
      toast.error("Erreur lors du traitement du fichier");
    }
  };
  
  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle plan selection
  const handleSelectPlan = (selectedPlan: Plan) => {
    setPlan(selectedPlan);
    toast.info(`Plan "${selectedPlan.nom}" sélectionné`);
  };
  
  // Handle element click during calibration or normal operation
  const handleElementClick = (elementId: string) => {
    if (!plan) return;
    
    let clickedElement: Element | null = null;
    let elementType: 'portes' | 'fenetres' | 'murs' | 'pieces' | null = null;
    
    // Find clicked element
    if (calibrationStep === 'portes') {
      clickedElement = plan.elements.portes.find(p => p.id === elementId) || null;
      elementType = 'portes';
    } else if (calibrationStep === 'fenetres') {
      clickedElement = plan.elements.fenetres.find(f => f.id === elementId) || null;
      elementType = 'fenetres';
    } else if (calibrationStep === 'murs' || calibrationStep === 'classification') {
      clickedElement = plan.elements.murs.find(m => m.id === elementId) || null;
      elementType = 'murs';
    } else {
      // If calibration is complete, any element can be clicked
      clickedElement = 
        plan.elements.portes.find(p => p.id === elementId) ||
        plan.elements.fenetres.find(f => f.id === elementId) ||
        plan.elements.murs.find(m => m.id === elementId) ||
        plan.elements.pieces.find(p => p.id === elementId) ||
        null;
      
      if (clickedElement) {
        switch (clickedElement.type) {
          case 'porte':
            elementType = 'portes';
            break;
          case 'fenetre':
            elementType = 'fenetres';
            break;
          case 'mur':
            elementType = 'murs';
            break;
          case 'piece':
            elementType = 'pieces';
            break;
        }
      }
    }
    
    if (clickedElement) {
      setSelectedElement(clickedElement);
      
      // During calibration, highlight similar elements
      if (calibrationStep !== 'complete') {
        const updatedPlan = highlightSimilarElements(plan, clickedElement);
        setPlan(updatedPlan);
      }
      
      onElementSelected(clickedElement);
    }
  };
  
  // Handle validation of current calibration step
  const handleValidateStep = () => {
    if (!selectedElement) {
      toast.error("Veuillez sélectionner un élément pour valider cette étape");
      return;
    }
    
    if (calibrationStep === 'portes') {
      setCalibrationStep('fenetres');
      setSelectedElement(null);
      toast.success("Portes identifiées, passons aux fenêtres");
    } else if (calibrationStep === 'fenetres') {
      setCalibrationStep('murs');
      setSelectedElement(null);
      toast.success("Fenêtres identifiées, passons aux murs");
    } else if (calibrationStep === 'murs') {
      setCalibrationStep('classification');
      setSelectedElement(null);
      toast.success("Murs identifiés, passons à la classification");
    } else if (calibrationStep === 'classification') {
      setCalibrationStep('complete');
      setSelectedElement(null);
      onCalibrationComplete();
      toast.success("Calibration terminée !");
    }
  };
  
  // Skip current calibration step
  const handleSkipStep = () => {
    if (calibrationStep === 'portes') {
      setCalibrationStep('fenetres');
      toast.info("Étape des portes ignorée");
    } else if (calibrationStep === 'fenetres') {
      setCalibrationStep('murs');
      toast.info("Étape des fenêtres ignorée");
    } else if (calibrationStep === 'murs') {
      setCalibrationStep('classification');
      toast.info("Étape des murs ignorée");
    } else if (calibrationStep === 'classification') {
      setCalibrationStep('complete');
      onCalibrationComplete();
      toast.info("Classification ignorée");
    }
  };
  
  // Render different UI based on calibration step
  const renderCalibrationUI = () => {
    if (!plan) {
      return (
        <div className="flex flex-col items-center justify-center h-full space-y-6">
          <CalibrationGuide 
            step="upload"
            onBeginCalibration={handleUploadClick}
            onSkipStep={handleSkipStep}
            onValidateStep={handleValidateStep}
            selectedElement={selectedElement}
            elementCount={0}
          />
        </div>
      );
    }
    
    return (
      <div className="absolute right-4 top-4 z-10">
        <CalibrationGuide 
          step={calibrationStep}
          onBeginCalibration={handleUploadClick}
          onSkipStep={handleSkipStep}
          onValidateStep={handleValidateStep}
          selectedElement={selectedElement}
          elementCount={
            selectedElement ? 
            (selectedElement.type === 'porte' 
              ? plan.elements.portes.filter(p => p.calque === selectedElement.calque).length
              : selectedElement.type === 'fenetre'
                ? plan.elements.fenetres.filter(p => p.calque === selectedElement.calque).length
                : selectedElement.type === 'mur'
                  ? plan.elements.murs.filter(p => p.calque === selectedElement.calque).length
                  : 0
            ) : 0
          }
        />
      </div>
    );
  };
  
  return (
    <div className="relative flex-1 h-full bg-gray-100 overflow-hidden">
      {plan && (
        <PlanSelector 
          projet={projet}
          currentPlan={plan}
          onSelectPlan={handleSelectPlan}
          onUploadPlan={handleUploadClick}
        />
      )}
      
      <canvas ref={canvasRef} className="w-full h-full" />
      
      {renderCalibrationUI()}
      
      <input 
        ref={fileInputRef}
        type="file" 
        accept=".dwg" 
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};

export default CentralPanel; 