import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCalibrationContext } from '@/contexts/CalibrationContext';
import CalibrationToolbar from '@/components/project/CalibrationToolbar';
import MeasurementToolbar from '@/components/project/MeasurementToolbar';
import PlanSelector from '@/components/project/PlanSelector';
import { ElementType } from '@/types/project';
import { toast } from 'sonner';
import { Element, Plan, Projet } from '@/types/metr';
import { Canvas, Rect, Circle, Line, Polygon, Point, Text, Point as FabricPoint } from 'fabric';
import { Button } from '@/components/ui/button';
import { 
  Square, 
  Ruler, 
  Hash, 
  Scan, 
  GitCompare, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Move, 
  RotateCcw, 
  Home, 
  FileText,
  Wand2,
  Minus,
  Trash2
} from 'lucide-react';
import * as fabric from 'fabric';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface PlanViewerProps {
  projectId?: string;
  isCalibrating: boolean;
  plan?: Plan | null;
  projet: Projet;
  onElementSelected?: (element: Element) => void;
  selectedSurface?: string | null;
  hoveredElementId?: string | null;
  onSelectPlan: (plan: Plan) => void;
  onUploadPlan: () => void;
  onAddOuvrage?: (ouvrage: any) => void;
}

type MeasurementTool = 
  | 'select'
  | 'surface'
  | 'length'
  | 'counter'
  | 'detection'
  | 'compare'
  | 'layer';

type SurfaceType = 'polygon' | 'rectangle' | 'circle';

interface CounterPoint {
  x: number;
  y: number;
  id: string;
}

interface ManualCountPoint {
  id: string;
  x: number;
  y: number;
}

// Définition des éléments du plan de test
const TEST_PLAN_ELEMENTS = [
  // Pièce principale
  {
    type: 'room',
    points: [
      { x: 50, y: 50 },
      { x: 850, y: 50 },
      { x: 850, y: 450 },
      { x: 50, y: 450 }
    ],
    label: 'Salon'
  },
  // Chambre 1
  {
    type: 'room',
    points: [
      { x: 100, y: 100 },
      { x: 400, y: 100 },
      { x: 400, y: 300 },
      { x: 100, y: 300 }
    ],
    label: 'Chambre 1'
  },
  // Chambre 2
  {
    type: 'room',
    points: [
      { x: 500, y: 100 },
      { x: 800, y: 100 },
      { x: 800, y: 300 },
      { x: 500, y: 300 }
    ],
    label: 'Chambre 2'
  },
  // Portes
  {
    type: 'door',
    x: 150,
    y: 295,
    width: 60,
    height: 10,
    angle: 0,
    label: 'P'
  },
  {
    type: 'door',
    x: 550,
    y: 295,
    width: 60,
    height: 10,
    angle: 0,
    label: 'P'
  },
  // Nouvelle porte dans le salon
  {
    type: 'door',
    x: 450,
    y: 445,
    width: 60,
    height: 10,
    angle: 0,
    label: 'P'
  },
  // Fenêtres
  {
    type: 'window',
    x: 200,
    y: 90,
    width: 80,
    height: 10,
    angle: 0,
    label: 'F'
  },
  {
    type: 'window',
    x: 600,
    y: 90,
    width: 80,
    height: 10,
    angle: 0,
    label: 'F'
  },
  // Nouvelles fenêtres sur les côtés
  {
    type: 'window',
    x: 90,
    y: 150,
    width: 10,
    height: 80,
    angle: 0,
    label: 'F'
  },
  {
    type: 'window',
    x: 90,
    y: 350,
    width: 10,
    height: 80,
    angle: 0,
    label: 'F'
  },
  {
    type: 'window',
    x: 800,
    y: 150,
    width: 10,
    height: 80,
    angle: 0,
    label: 'F'
  },
  // Porte-fenêtre
  {
    type: 'french-door',
    x: 700,
    y: 90,
    width: 100,
    height: 10,
    angle: 0,
    label: 'PF'
  },
  // Nouvelle porte-fenêtre
  {
    type: 'french-door',
    x: 300,
    y: 445,
    width: 100,
    height: 10,
    angle: 0,
    label: 'PF'
  }
];

// Types personnalisés pour Fabric
interface ElementData {
  type: string;
  id: string;
}

interface CustomFabricObject extends fabric.Object {
  data?: ElementData;
}

interface ExtendButtonPosition {
  x: number;
  y: number;
}

const PlanViewer = ({ 
  projectId, 
  isCalibrating, 
  plan,
  projet,
  onElementSelected,
  selectedSurface,
  hoveredElementId,
  onSelectPlan,
  onUploadPlan,
  onAddOuvrage
}: PlanViewerProps) => {
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState<MeasurementTool>('select');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<Canvas | null>(null);
  const [counterPoints, setCounterPoints] = useState<CounterPoint[]>([]);
  const [isolationMode, setIsolationMode] = useState(false);
  const [selectedElementType, setSelectedElementType] = useState<string>("Aucun type détecté");
  const [selectedCount, setSelectedCount] = useState(0);
  const [showExtendButton, setShowExtendButton] = useState(false);
  const [showExtendRemovalButton, setShowExtendRemovalButton] = useState(false);
  const [extendButtonPosition, setExtendButtonPosition] = useState<ExtendButtonPosition>({ x: 0, y: 0 });
  const [hoveredExtendButton, setHoveredExtendButton] = useState(false);
  const [lastClickedElement, setLastClickedElement] = useState<CustomFabricObject | null>(null);
  const [removedElements, setRemovedElements] = useState<string[]>([]);
  const [isManualMode, setIsManualMode] = useState(false);
  const [manualPoints, setManualPoints] = useState<ManualCountPoint[]>([]);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { 
    calibrationStep, 
    addCalibrationPoint, 
    currentElementType,
    currentTypePoints 
  } = useCalibrationContext();

  // Initialize Fabric canvas
  useEffect(() => {
    if (!canvasRef.current || fabricCanvas) return;
    
    const canvas = new Canvas(canvasRef.current, {
      width: containerRef.current?.clientWidth || 800,
      height: containerRef.current?.clientHeight || 600,
      selection: !isCalibrating,
      backgroundColor: '#f9f9f9'
    });
    
    setFabricCanvas(canvas);
    
    // Add demo plan background image (in real app, would be the actual plan)
    const planBackground = new Rect({
      left: 50,
      top: 50,
      width: 700,
      height: 500,
      fill: '#fff',
      stroke: '#ddd',
      strokeWidth: 1,
      selectable: false
    });
    
    // Demo room outlines (would be replaced by actual plan data)
    const room1 = new Rect({
      left: 100, 
      top: 100,
      width: 200,
      height: 150,
      fill: 'transparent',
      stroke: '#333',
      strokeWidth: 2,
      selectable: false
    });
    
    const room2 = new Rect({
      left: 350, 
      top: 100,
      width: 150,
      height: 150,
      fill: 'transparent',
      stroke: '#333',
      strokeWidth: 2,
      selectable: false
    });
    
    const room3 = new Rect({
      left: 100, 
      top: 300,
      width: 400,
      height: 150,
      fill: 'transparent',
      stroke: '#333',
      strokeWidth: 2,
      selectable: false
    });
    
    // Door examples
    const door1 = new Line([150, 100, 180, 100], {
      stroke: '#555',
      strokeWidth: 3,
      selectable: false
    });
    
    const door2 = new Line([350, 150, 350, 180], {
      stroke: '#555',
      strokeWidth: 3,
      selectable: false
    });
    
    canvas.add(planBackground, room1, room2, room3, door1, door2);
    
    return () => {
      canvas.dispose();
    };
  }, []);
  
  // Update canvas selection based on calibration state
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.selection = !isCalibrating;
      fabricCanvas.getObjects().forEach(obj => {
        if (obj.strokeWidth !== 1) { // Skip background
          obj.selectable = !isCalibrating;
        }
      });
      fabricCanvas.renderAll();
    }
  }, [isCalibrating, fabricCanvas]);
  
  // Handle window resize
  useEffect(() => {
    if (!fabricCanvas || !containerRef.current) return;
    
    const handleResize = () => {
      if (containerRef.current) {
        fabricCanvas.setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
        fabricCanvas.renderAll();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [fabricCanvas]);

  // Handle measurement tool change
  const handleToolChange = (tool: MeasurementTool) => {
    // Disable tool changes during calibration
    if (isCalibrating) {
      toast.info('Les outils de mesure sont désactivés pendant la calibration');
      return;
    }
    
    // Si on clique sur l'outil actif, on revient à la sélection
    if (tool === activeTool) {
      setActiveTool('select');
      setIsDrawing(false);
      setCounterPoints([]);
      setSelectedCount(0);
      return;
    }
    
    setActiveTool(tool);
    setIsDrawing(false);
    setSelectedCount(0);
    
    if (!fabricCanvas) return;
    
    // Reset drawing mode
    fabricCanvas.isDrawingMode = false;
    
    // Enable selection only for select tool
    fabricCanvas.selection = tool === 'select';
    
    // Set all objects to be selectable or not based on tool
    fabricCanvas.getObjects().forEach(obj => {
      if (obj.strokeWidth !== 1) { // Skip background
        obj.selectable = tool === 'select';
      }
    });
    
    toast.info(`Outil ${tool} activé`);
  };

  // Handle mouse down for drawing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCalibrating || (activeTool !== 'surface' && activeTool !== 'length')) return;
    if (!fabricCanvas) return;
    
    setIsDrawing(true);
    
    if (activeTool === 'surface') {
      if (surfaceType === 'rectangle') {
        const rect = new Rect({
          left: e.nativeEvent.offsetX,
          top: e.nativeEvent.offsetY,
          width: 0,
          height: 0,
          fill: 'rgba(30, 144, 255, 0.2)',
          stroke: 'rgb(30, 144, 255)',
          strokeWidth: 2
        });
        fabricCanvas.add(rect);
        fabricCanvas.setActiveObject(rect);
      } else if (surfaceType === 'circle') {
        const circle = new Circle({
          left: e.nativeEvent.offsetX,
          top: e.nativeEvent.offsetY,
          radius: 0,
          fill: 'rgba(30, 144, 255, 0.2)',
          stroke: 'rgb(30, 144, 255)',
          strokeWidth: 2
        });
        fabricCanvas.add(circle);
        fabricCanvas.setActiveObject(circle);
      }
    } else if (activeTool === 'length') {
      const line = new Line([
        e.nativeEvent.offsetX, 
        e.nativeEvent.offsetY, 
        e.nativeEvent.offsetX, 
        e.nativeEvent.offsetY
      ], {
        stroke: 'rgb(30, 144, 255)',
        strokeWidth: 2
      });
      fabricCanvas.add(line);
      fabricCanvas.setActiveObject(line);
    }
  };
  
  // Handle mouse move for drawing
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !fabricCanvas || isCalibrating) return;
    
    const activeObj = fabricCanvas.getActiveObject();
    if (!activeObj) return;
    
    if (activeTool === 'surface') {
      if (surfaceType === 'rectangle' && activeObj instanceof Rect) {
        const width = e.nativeEvent.offsetX - activeObj.left!;
        const height = e.nativeEvent.offsetY - activeObj.top!;
        
        activeObj.set({
          width: Math.abs(width),
          height: Math.abs(height),
          left: width > 0 ? activeObj.left : e.nativeEvent.offsetX,
          top: height > 0 ? activeObj.top : e.nativeEvent.offsetY
        });
      } else if (surfaceType === 'circle' && activeObj instanceof Circle) {
        const dx = e.nativeEvent.offsetX - activeObj.left!;
        const dy = e.nativeEvent.offsetY - activeObj.top!;
        const radius = Math.sqrt(dx * dx + dy * dy);
        
        activeObj.set({
          radius: radius
        });
      }
    } else if (activeTool === 'length' && activeObj instanceof Line) {
      activeObj.set({ 
        x2: e.nativeEvent.offsetX, 
        y2: e.nativeEvent.offsetY 
      });
    }
    
    fabricCanvas.renderAll();
  };
  
  // Handle mouse up for drawing
  const handleMouseUp = () => {
    if (!isDrawing || !fabricCanvas || isCalibrating) return;
    
    setIsDrawing(false);
    
    const activeObj = fabricCanvas.getActiveObject();
    if (!activeObj) return;
    
    // Finalize the measurement
    if (activeTool === 'surface') {
      // Calculate area
      let area = 0;
      if (activeObj instanceof Rect) {
        area = (activeObj.width || 0) * (activeObj.height || 0) / 10000; // Convert to m²
        toast.success(`Surface: ${area.toFixed(2)} m²`);
      } else if (activeObj instanceof Circle) {
        area = Math.PI * Math.pow(activeObj.radius || 0, 2) / 10000; // Convert to m²
        toast.success(`Surface: ${area.toFixed(2)} m²`);
      }
    } else if (activeTool === 'length' && activeObj instanceof Line) {
      const x1 = activeObj.x1 || 0;
      const y1 = activeObj.y1 || 0;
      const x2 = activeObj.x2 || 0;
      const y2 = activeObj.y2 || 0;
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy) / 100; // Convert to m
      
      toast.success(`Longueur: ${length.toFixed(2)} m`);
    }
    
    fabricCanvas.renderAll();
  };

  // Réinitialiser l'état quand on change d'outil
  useEffect(() => {
    if (activeTool !== 'counter') {
      setManualPoints([]);
      setSelectedCount(0);
      setCounterPoints([]);
      setIsolationMode(false);
      setShowExtendButton(false);
      setShowExtendRemovalButton(false);
      setLastClickedElement(null);
      setSelectedElementType("Aucun type détecté");
      
      // Réinitialiser les couleurs des éléments
      if (fabricCanvas) {
        fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
          if (obj.data?.type) {
            obj.set('fill', obj.data.type === 'door' ? '#1E3A8A' : '#F97316');
          }
        });
        fabricCanvas.renderAll();
      }
    }
  }, [activeTool]);

  // Gérer le clic sur le plan
  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCalibrating) {
      if (calibrationStep === 2) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        addCalibrationPoint(x, y);
        toast.success(`Élément ${currentElementType} ajouté à la position (${Math.round(x)}, ${Math.round(y)})`);
      }
      return;
    }

    // Ne pas ajouter de points en mode automatique
    if (activeTool === 'counter' && !isManualMode) return;

    // Ajouter des points uniquement en mode manuel
    if (activeTool === 'counter' && isManualMode) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newPoint: ManualCountPoint = {
        id: `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x,
        y
      };
      
      setManualPoints(prev => [...prev, newPoint]);
    }
  };

  // Handle counter mode actions
  const handleToggleIsolation = () => {
    if (!fabricCanvas) return;

    setIsolationMode(!isolationMode);

    fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
      if (obj.data?.type) {
        const isSelected = obj.fill?.toString() === '#22C55E';
        const isRemoved = removedElements.includes(obj.data.id);

        if (!isRemoved) {
          if (isolationMode) {
            // Désactiver l'isolation : tout réafficher
            obj.set('opacity', 1);
          } else {
            // Activer l'isolation : masquer les éléments non sélectionnés
            obj.set('opacity', isSelected ? 1 : 0.3);
          }
        }
      }
    });

    fabricCanvas.renderAll();
    toast.info(isolationMode ? "Mode isolation désactivé" : "Mode isolation activé");
  };

  const handleValidateCounter = () => {
    if (counterPoints.length === 0) return;
    
    // Créer un nouvel ouvrage avec tous les points comptés
    if (onAddOuvrage) {
      const newOuvrage = {
        id: `ouvrage-${Date.now()}`,
        designation: selectedElementType,
        lot: "Divers",
        subCategory: "Comptage",
        quantite: counterPoints.length,
        unite: "U",
        prix_unitaire: 0,
        localisation: selectedSurface 
          ? { niveau: "Actuel", piece: selectedSurface }
          : { niveau: "RDC", piece: "Salon" },
        surfaceId: selectedSurface,
        color: '#4ECDC4'
      };
      
      onAddOuvrage(newOuvrage);
      toast.success(`${counterPoints.length} éléments comptés validés`);
    }
    
    // Reset counter mode
    setCounterPoints([]);
    setActiveTool('select');
  };

  const handleCancelCounter = () => {
    setCounterPoints([]);
    setActiveTool('select');
    toast.info("Comptage annulé");
  };

  // Calculer le nombre total d'éléments détectés
  const getTotalDetectedCount = () => {
    if (isManualMode) {
      // En mode manuel, on compte les points manuels ET les éléments sélectionnés automatiquement
      return manualPoints.length + selectedCount;
    } else {
      // En mode automatique, on compte uniquement les éléments sélectionnés
      return selectedCount;
    }
  };

  // Gérer la validation du comptage
  const handleValidate = () => {
    const totalCount = getTotalDetectedCount();
    if (totalCount === 0) return;

    // Créer un nouvel ouvrage
    if (onAddOuvrage) {
      if (isManualMode) {
        // En mode manuel, on crée deux ouvrages si nécessaire
        if (manualPoints.length > 0) {
          // Ouvrage pour les points manuels
          const manualOuvrage = {
            id: `ouvrage-manual-${Date.now()}`,
            designation: "Points manuels",
            lot: "Divers",
            subCategory: "Comptage",
            quantite: manualPoints.length,
            unite: "U",
            prix_unitaire: 0,
            localisation: selectedSurface 
              ? { niveau: "Actuel", piece: selectedSurface }
              : { niveau: "RDC", piece: "Salon" },
            surfaceId: selectedSurface,
            color: '#4ECDC4',
            isManual: true,
            points: manualPoints
          };
          onAddOuvrage(manualOuvrage);
        }

        if (selectedCount > 0) {
          // Ouvrage pour les éléments détectés automatiquement
          const autoOuvrage = {
            id: `ouvrage-auto-${Date.now()}`,
            designation: selectedElementType,
            lot: "Divers",
            subCategory: "Comptage",
            quantite: selectedCount,
            unite: "U",
            prix_unitaire: 0,
            localisation: selectedSurface 
              ? { niveau: "Actuel", piece: selectedSurface }
              : { niveau: "RDC", piece: "Salon" },
            surfaceId: selectedSurface,
            color: '#4ECDC4',
            isManual: false
          };
          onAddOuvrage(autoOuvrage);
        }

        toast.success(`${totalCount} éléments validés (${manualPoints.length} points manuels, ${selectedCount} éléments détectés)`);
      } else {
        // En mode automatique, on crée un ouvrage pour les éléments sélectionnés
        if (selectedCount > 0) {
          const newOuvrage = {
            id: `ouvrage-${Date.now()}`,
            designation: selectedElementType,
            lot: "Divers",
            subCategory: "Comptage",
            quantite: selectedCount,
            unite: "U",
            prix_unitaire: 0,
            localisation: selectedSurface 
              ? { niveau: "Actuel", piece: selectedSurface }
              : { niveau: "RDC", piece: "Salon" },
            surfaceId: selectedSurface,
            color: '#4ECDC4',
            isManual: false
          };
          
          onAddOuvrage(newOuvrage);
          toast.success(`${selectedCount} éléments comptés validés`);
        }
      }
    }

    // Reset
    setManualPoints([]);
    setSelectedCount(0);
    setActiveTool('select');
    setIsolationMode(false);
    
    // Réinitialiser les couleurs des éléments
    if (fabricCanvas) {
      fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
        if (obj.data?.type) {
          obj.set({
            fill: obj.data.type === 'door' ? '#1E3A8A' : '#F97316',
            opacity: 1
          });
        }
      });
      fabricCanvas.renderAll();
    }
  };

  const handleCancel = () => {
    setManualPoints([]);
    setSelectedCount(0);
    setActiveTool('select');
    toast.info("Comptage annulé");
  };

  // Initialiser le plan de test
  useEffect(() => {
    if (!fabricCanvas || !plan || plan.id !== 'test-plan') return;

    // Nettoyer le canvas
    fabricCanvas.clear();

    // Ajouter le fond blanc
    const background = new Rect({
      left: 0,
      top: 0,
      width: fabricCanvas.width || 800,
      height: fabricCanvas.height || 600,
      fill: '#FAFAFA',
      selectable: false
    });
    fabricCanvas.add(background);

    // Ajouter la grille
    for (let i = 0; i < (fabricCanvas.width || 800); i += 50) {
      for (let j = 0; j < (fabricCanvas.height || 600); j += 50) {
        const gridLine = new Line([i, j, i + 50, j], {
          stroke: '#E5E7EB',
          strokeWidth: 1,
          selectable: false,
          opacity: 0.3
        });
        fabricCanvas.add(gridLine);
        
        const gridLine2 = new Line([i, j, i, j + 50], {
          stroke: '#E5E7EB',
          strokeWidth: 1,
          selectable: false,
          opacity: 0.3
        });
        fabricCanvas.add(gridLine2);
      }
    }

    // Ajouter les éléments du plan
    TEST_PLAN_ELEMENTS.forEach(element => {
      if (element.type === 'room') {
        const points = element.points.map(p => new FabricPoint(p.x, p.y));
        const room = new Polygon(points, {
          fill: 'transparent',
          stroke: element.type === 'room' ? '#374151' : '#6B7280',
          strokeWidth: element.type === 'room' ? 3 : 2,
          selectable: false
        });
        
        const label = new Text(element.label, {
          left: (element.points[0].x + element.points[2].x) / 2,
          top: (element.points[0].y + element.points[2].y) / 2,
          fontSize: 14,
          fontFamily: 'Roboto',
          fill: '#374151',
          selectable: false
        });
        
        fabricCanvas.add(room, label);
      } else {
        // Portes, fenêtres et portes-fenêtres
        const color = element.type === 'door' ? '#1E3A8A' : 
                     element.type === 'window' ? '#F97316' : 
                     '#22C55E';
        
        const rect = new Rect({
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          fill: color,
          angle: element.angle,
          selectable: true,
          hasControls: false,
          hasBorders: true,
          lockMovementX: true,
          lockMovementY: true,
          hoverCursor: activeTool === 'counter' ? 'pointer' : 'default',
          data: {
            type: element.type,
            id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
          }
        }) as CustomFabricObject;

        // Ajouter l'événement de clic sur l'élément
        rect.on('mousedown', () => {
          if (activeTool === 'counter') {
            handleElementClick(rect);
          }
        });

        const label = new Text(element.label, {
          left: element.x + element.width / 2,
          top: element.y + element.height / 2,
          fontSize: 12,
          fontFamily: 'Roboto',
          fill: '#FFFFFF',
          selectable: false,
          originX: 'center',
          originY: 'center'
        });

        fabricCanvas.add(rect, label);
      }
    });

    fabricCanvas.renderAll();
  }, [fabricCanvas, plan, activeTool]);

  // Gérer le clic sur un élément
  const handleElementClick = (element: CustomFabricObject) => {
    if (!fabricCanvas || activeTool !== 'counter') return;

    const elementData = element.data;
    if (!elementData) return;
    
    const elementType = elementData.type;
    
    // Mettre à jour le dernier élément cliqué
    setLastClickedElement(element);
    setSelectedElementType(elementType);

    // Gérer la sélection/désélection
    if (element.fill === '#22C55E') { // Si déjà sélectionné
      element.set('fill', elementType === 'door' ? '#1E3A8A' : '#F97316');
      setSelectedCount(prev => prev - 1);
    } else {
      element.set('fill', '#22C55E');
      setSelectedCount(prev => prev + 1);
    }

    // Calculer la position du bouton d'extension
    const elementBounds = element.getBoundingRect();
    setExtendButtonPosition({
      x: elementBounds.left + elementBounds.width / 2,
      y: elementBounds.top + elementBounds.height + 20
    });

    // Afficher le bouton approprié
    if (element.fill === '#22C55E') {
      setShowExtendButton(true);
      setShowExtendRemovalButton(false);
    } else {
      setShowExtendButton(false);
      setShowExtendRemovalButton(true);
    }

    fabricCanvas.renderAll();
  };

  // Étendre la sélection
  const handleExtendSelection = () => {
    if (!fabricCanvas || !lastClickedElement || !lastClickedElement.data) return;

    const elementType = lastClickedElement.data.type;

    fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
      if (obj.data?.type === elementType && obj.fill !== '#22C55E' && !removedElements.includes(obj.data.id)) {
        obj.set('fill', '#22C55E');
        setSelectedCount(prev => prev + 1);
      }
    });

    setShowExtendButton(false);
    fabricCanvas.renderAll();
  };

  // Étendre la suppression
  const handleExtendRemoval = () => {
    if (!fabricCanvas || !lastClickedElement || !lastClickedElement.data) return;

    const elementType = lastClickedElement.data.type;

    fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
      if (obj.data?.type === elementType) {
        obj.set('fill', '#9CA3AF');
        if (obj.data) {
          setRemovedElements(prev => [...prev, obj.data.id]);
        }
        if (obj.fill === '#22C55E') {
          setSelectedCount(prev => prev - 1);
        }
      }
    });

    setShowExtendRemovalButton(false);
    fabricCanvas.renderAll();
  };

  // Gérer le survol du bouton d'extension
  const handleExtendHover = (isHovering: boolean) => {
    if (!fabricCanvas || !lastClickedElement || !lastClickedElement.data) return;

    setHoveredExtendButton(isHovering);

    const elementType = lastClickedElement.data.type;

    fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
      if (obj.data?.type === elementType && obj.fill !== '#22C55E' && !removedElements.includes(obj.data.id)) {
        obj.set('fill', isHovering ? '#93C5FD' : (obj.data.type === 'door' ? '#1E3A8A' : '#F97316'));
      }
    });

    fabricCanvas.renderAll();
  };

  // Gérer le survol du bouton de suppression
  const handleRemovalHover = (isHovering: boolean) => {
    if (!fabricCanvas || !lastClickedElement) return;

    const elementData = lastClickedElement.data;
    if (!elementData) return;

    const elementType = elementData.type;

    fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
      if (obj.data?.type === elementType) {
        if (isHovering) {
          // Mettre en évidence les éléments qui seront supprimés
          obj.set('opacity', 1);
          if (!removedElements.includes(obj.data.id)) {
            obj.set('fill', '#93C5FD'); // Bleu clair pour prévisualiser
          }
        } else {
          // Restaurer l'état normal
          if (isolationMode && !obj.fill?.toString().includes('22C55E')) { // Si pas sélectionné
            obj.set('opacity', 0.3);
          } else {
            obj.set('opacity', 1);
          }
          if (!removedElements.includes(obj.data.id)) {
            obj.set('fill', obj.data.type === 'door' ? '#1E3A8A' : '#F97316');
          }
        }
      }
    });

    fabricCanvas.renderAll();
  };

  // Gérer la touche Échap
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeTool === 'counter') {
        if (selectedCount > 0 || manualPoints.length > 0) {
          setShowExitDialog(true);
        } else {
          setActiveTool('select');
        }
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [activeTool, selectedCount, manualPoints.length]);

  // Gérer le clic droit sur une pastille
  const handlePointRightClick = (e: React.MouseEvent, pointId: string) => {
    e.preventDefault();
    setManualPoints(prev => prev.filter(p => p.id !== pointId));
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 relative overflow-hidden h-full", 
        "bg-white", 
        (isCalibrating && calibrationStep === 2) || activeTool === 'counter' ? "cursor-crosshair" : ""
      )}
      onClick={handlePlanClick}
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Plan canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      {/* Counter points */}
      {activeTool === 'counter' && counterPoints.map((point) => (
        <div
          key={point.id}
          className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: point.x,
            top: point.y
          }}
        />
      ))}
      
      {/* Points manuels */}
      {isManualMode && activeTool === 'counter' && manualPoints.map((point) => (
        <div
          key={point.id}
          className="absolute w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 cursor-pointer hover:bg-blue-600 transition-colors"
          style={{
            left: point.x,
            top: point.y
          }}
          onContextMenu={(e) => handlePointRightClick(e, point.id)}
        />
      ))}
      
      {/* Extend button */}
      {showExtendButton && (
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
            className="bg-metrBlue hover:bg-metrBlue/90 text-white text-xs px-2 py-1 h-7 shadow-lg font-medium"
          >
            <Wand2 className="w-3 h-3 mr-1" />
            Étendre
          </Button>
        </div>
      )}
      
      {/* Measurement toolbar */}
      {!isCalibrating && (
        <div className="absolute top-0 left-0 right-0 z-10">
          <MeasurementToolbar 
            activeTool={activeTool}
            onToolChange={handleToolChange}
            selectedCount={selectedCount}
            detectedCount={getTotalDetectedCount()}
            isolationMode={isolationMode}
            onToggleIsolation={handleToggleIsolation}
            onValidate={handleValidate}
            onCancel={handleCancel}
            elementType={selectedElementType}
            isManualMode={isManualMode}
            onToggleManualMode={() => {
              setIsManualMode(!isManualMode);
              setManualPoints([]);
              setSelectedCount(0);
              if (fabricCanvas) {
                fabricCanvas.getObjects().forEach((obj: CustomFabricObject) => {
                  if (obj.data?.type) {
                    obj.set('fill', obj.data.type === 'door' ? '#1E3A8A' : '#F97316');
                  }
                });
                fabricCanvas.renderAll();
              }
            }}
          />
        </div>
      )}
      
      {/* Surface type selection when surface tool is active and not calibrating */}
      {activeTool === 'surface' && !isCalibrating && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white p-2 rounded-md shadow-sm flex gap-2">
          <Button 
            variant={surfaceType === 'rectangle' ? "default" : "outline"}
            size="sm" 
            onClick={() => setSurfaceType('rectangle')}
          >
            Rectangle
          </Button>
          <Button 
            variant={surfaceType === 'circle' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSurfaceType('circle')}
          >
            Cercle
          </Button>
          <Button 
            variant={surfaceType === 'polygon' ? "default" : "outline"} 
            size="sm" 
            onClick={() => setSurfaceType('polygon')}
          >
            Polygone
          </Button>
        </div>
      )}
      
      {/* Information tooltip */}
      <div 
        className="absolute left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 
                  bg-white p-2 rounded-md shadow-md border border-gray-200 opacity-0 hover:opacity-100
                  transition-opacity duration-200 pointer-events-none"
      >
        <p className="text-sm font-medium">Mur Nord</p>
        <p className="text-xs text-gray-500">L: 4.50m - H: 2.80m</p>
      </div>
      
      {/* Demo selection elements */}
      <div 
        className="absolute left-1/3 top-1/2 w-24 h-24 border-2 border-blue-500 bg-blue-100/20 
                  rounded-sm pointer-events-none"
      ></div>
      
      <div 
        className="absolute right-1/3 top-2/3 w-16 h-32 border-2 border-yellow-500 bg-yellow-100/20 
                  rounded-sm pointer-events-none"
      ></div>
      
      {/* Calibration toolbar that appears above the plan controls during calibration */}
      {isCalibrating && calibrationStep === 2 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20">
          <CalibrationToolbar elementType={currentElementType} />
        </div>
      )}
      
      {/* Plan navigation controls - bottom left */}
      <div className="absolute bottom-4 left-4 bg-white p-2 rounded-md shadow-sm flex gap-1 z-10">
        <Button variant="outline" size="icon" onClick={() => setScale(scale * 1.2)}>
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => setScale(Math.max(0.5, scale / 1.2))}>
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => {/* handle pan */}}>
          <Move className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => {/* handle rotate */}}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => {/* handle reset view */}}>
          <Home className="h-4 w-4" />
        </Button>
      </div>

      {/* Plan selector - bottom right */}
      <div className="absolute bottom-4 right-4 z-10">
        <PlanSelector 
          projet={projet}
          currentPlan={plan}
          onSelectPlan={onSelectPlan}
          onUploadPlan={onUploadPlan}
        />
      </div>

      {/* Remove button */}
      {showExtendRemovalButton && (
        <div 
          className="absolute z-20"
          style={{
            left: `${extendButtonPosition.x}px`,
            top: `${extendButtonPosition.y}px`,
            transform: 'translate(-50%, 0)'
          }}
        >
          <Button
            onClick={handleExtendRemoval}
            onMouseEnter={() => handleRemovalHover(true)}
            onMouseLeave={() => handleRemovalHover(false)}
            variant="default"
            size="sm"
            className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 h-7 shadow-lg font-medium"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Tout Supprimer
          </Button>
        </div>
      )}

      {/* Dialog de confirmation de sortie */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitter le mode compteur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Vous avez des éléments sélectionnés. Êtes-vous sûr de vouloir quitter le mode compteur ? 
              Cette action supprimera toutes les sélections en cours.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowExitDialog(false);
              handleCancel();
            }}>
              Quitter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PlanViewer;
