import { Element, Plan } from '../types/metr';

// Simulated DWG file processing
export const processUploadedDWG = (file: File): Promise<Plan> => {
  // In a real app this would parse the DWG file
  // Here we'll create a simulated plan with sample elements
  return new Promise((resolve) => {
    setTimeout(() => {
      const planId = `plan-${Date.now()}`;
      const plan: Plan = {
        id: planId,
        nom: file.name.replace('.dwg', ''),
        elements: {
          portes: generateSampleElements('porte', 5),
          fenetres: generateSampleElements('fenetre', 8),
          murs: generateSampleElements('mur', 15),
          pieces: generateSampleElements('piece', 6),
        },
        file: file,
        calibrated: false,
        calibrationStep: 0
      };
      resolve(plan);
    }, 1000); // Simulate processing time
  });
};

// Generate sample elements for demonstration
const generateSampleElements = (type: string, count: number): Element[] => {
  const elements: Element[] = [];
  
  for (let i = 0; i < count; i++) {
    const element: Element = {
      id: `${type}-${i}`,
      type: type as any,
      calque: `Calque-${type}-${Math.floor(Math.random() * 3)}`,
      x: Math.random() * 800,
      y: Math.random() * 600,
      highlighted: false,
      properties: {}
    };
    
    // Add specific properties based on element type
    if (type === 'porte' || type === 'fenetre') {
      element.width = 80 + Math.random() * 40;
      element.height = 200 + Math.random() * 20;
      element.quantite = 1;
    } else if (type === 'mur') {
      element.longueur = 200 + Math.random() * 300;
      element.hauteur = 240 + Math.random() * 60;
    } else if (type === 'piece') {
      element.width = 300 + Math.random() * 200;
      element.height = 300 + Math.random() * 200;
    }
    
    elements.push(element);
  }
  
  return elements;
};

// Find similar elements based on calque (layer)
export const findSimilarElements = (plan: Plan, element: Element): Element[] => {
  const elementType = element.type;
  let elements: Element[] = [];
  
  switch (elementType) {
    case 'porte':
      elements = plan.elements.portes.filter(e => e.calque === element.calque);
      break;
    case 'fenetre':
      elements = plan.elements.fenetres.filter(e => e.calque === element.calque);
      break;
    case 'mur':
      elements = plan.elements.murs.filter(e => e.calque === element.calque);
      break;
    case 'piece':
      elements = plan.elements.pieces.filter(e => e.calque === element.calque);
      break;
  }
  
  return elements;
};

// Highlight similar elements
export const highlightSimilarElements = (plan: Plan, element: Element): Plan => {
  const updatedPlan = { ...plan };
  const similarElements = findSimilarElements(plan, element);
  
  switch (element.type) {
    case 'porte':
      updatedPlan.elements.portes = updatedPlan.elements.portes.map(e => 
        similarElements.some(se => se.id === e.id) 
          ? { ...e, highlighted: true } 
          : { ...e, highlighted: false }
      );
      break;
    case 'fenetre':
      updatedPlan.elements.fenetres = updatedPlan.elements.fenetres.map(e => 
        similarElements.some(se => se.id === e.id) 
          ? { ...e, highlighted: true } 
          : { ...e, highlighted: false }
      );
      break;
    case 'mur':
      updatedPlan.elements.murs = updatedPlan.elements.murs.map(e => 
        similarElements.some(se => se.id === e.id) 
          ? { ...e, highlighted: true } 
          : { ...e, highlighted: false }
      );
      break;
    case 'piece':
      updatedPlan.elements.pieces = updatedPlan.elements.pieces.map(e => 
        similarElements.some(se => se.id === e.id) 
          ? { ...e, highlighted: true } 
          : { ...e, highlighted: false }
      );
      break;
  }
  
  return updatedPlan;
};

// Calculate quantities for ouvrages based on elements
export const calculateQuantity = (element: Element): number => {
  switch (element.type) {
    case 'porte':
    case 'fenetre':
      return element.quantite || 1;
    case 'mur':
      return ((element.longueur || 0) * (element.hauteur || 0)) / 10000; // m²
    case 'piece':
      return ((element.width || 0) * (element.height || 0)) / 10000; // m²
    default:
      return 0;
  }
};

export const getCalibrationStepName = (step: number): string => {
  switch (step) {
    case 0:
      return "Importation";
    case 1:
      return "Identification des portes";
    case 2:
      return "Identification des menuiseries";
    case 3:
      return "Identification des murs";
    case 4:
      return "Classification des murs";
    default:
      return "Calibrage terminé";
  }
}; 