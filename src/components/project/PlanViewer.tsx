
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useCalibrationContext } from '@/contexts/CalibrationContext';
import CalibrationToolbar from '@/components/project/CalibrationToolbar';
import MeasurementToolbar from '@/components/project/MeasurementToolbar';
import { ElementType } from '@/types/project';
import { toast } from 'sonner';
import { Element, Plan } from '@/types/metr';
import { Canvas as FabricCanvas, Rect, Circle, Line, Polygon, Point } from 'fabric';
import { Button } from '@/components/ui/button';
import { Square, Ruler, Hash, Scan, GitCompare, Layers, Maximize, MousePointer } from 'lucide-react';

interface PlanViewerProps {
  projectId?: string;
  isCalibrating: boolean;
  plan?: Plan | null;
  onElementSelected?: (element: Element) => void;
  selectedSurface?: string | null;
  hoveredElementId?: string | null;
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

const PlanViewer = ({ 
  projectId, 
  isCalibrating, 
  plan,
  onElementSelected,
  selectedSurface,
  hoveredElementId
}: PlanViewerProps) => {
  const [scale, setScale] = useState(1);
  const [activeTool, setActiveTool] = useState<MeasurementTool>('select');
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('rectangle');
  const [isDrawing, setIsDrawing] = useState(false);
  const [fabricCanvas, setFabricCanvas] = useState<FabricCanvas | null>(null);
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
    
    const canvas = new FabricCanvas(canvasRef.current, {
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
    
    setActiveTool(tool);
    setIsDrawing(false);
    
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

  // Handle click on the plan during calibration
  const handlePlanClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCalibrating || calibrationStep !== 2) return;
    
    // Get click coordinates relative to the plan viewer
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add calibration point
    addCalibrationPoint(x, y);
    toast.success(`Élément ${currentElementType} ajouté à la position (${Math.round(x)}, ${Math.round(y)})`);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 relative overflow-hidden", 
        "bg-white", 
        isCalibrating && calibrationStep === 2 && "cursor-crosshair"
      )}
      onClick={isCalibrating ? handlePlanClick : undefined}
      onMouseDown={!isCalibrating ? handleMouseDown : undefined}
      onMouseMove={!isCalibrating ? handleMouseMove : undefined}
      onMouseUp={!isCalibrating ? handleMouseUp : undefined}
    >
      {/* Plan canvas */}
      <canvas ref={canvasRef} className="absolute inset-0" />
      
      {/* Measurement toolbar at the top (only when not calibrating) */}
      {!isCalibrating && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
          <MeasurementToolbar 
            activeTool={activeTool}
            onToolChange={handleToolChange}
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
      
      {/* Plan controls - zoom, pan, rotate (always visible for navigation) */}
      <div className="absolute bottom-4 right-4 bg-white p-2 rounded-md shadow-sm flex flex-col gap-1 z-10">
        <Button variant="outline" size="sm" onClick={() => setScale(scale * 1.2)}>
          <Maximize className="h-4 w-4" />
          <span className="ml-1">Zoom +</span>
        </Button>
        <Button variant="outline" size="sm" onClick={() => setScale(Math.max(0.5, scale / 1.2))}>
          <Maximize className="h-4 w-4 rotate-180" />
          <span className="ml-1">Zoom -</span>
        </Button>
      </div>
    </div>
  );
};

export default PlanViewer;
