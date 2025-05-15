import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Hand, HandMetal, Check, ChevronRight } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { useCalibrationContext } from '@/contexts/CalibrationContext';
import { cn } from "@/lib/utils";
import { ElementType } from '@/types/project';

interface CalibrationGuideProps {
  onClose: () => void;
}

const CalibrationGuide: React.FC<CalibrationGuideProps> = ({ onClose }) => {
  const { 
    calibrationStep, 
    currentElementType,
    currentStepIndex,
    totalSteps,
    beginCalibrationStep,
    completeCalibration,
    currentTypePoints
  } = useCalibrationContext();
  
  // Show different content based on the element type being calibrated
  const renderStepContent = () => {
    const stepNumber = currentStepIndex + 1;
    let title = "Calibrage du Plan";
    let instructionText = "";
    let elementName = "";
    
    switch (currentElementType) {
      case 'door':
        title = `Étape ${stepNumber}/${totalSteps} : Identification des portes`;
        instructionText = "Cliquez sur une porte du plan. Metr détectera automatiquement toutes les portes similaires.";
        elementName = "porte";
        break;
      case 'window':
        title = `Étape ${stepNumber}/${totalSteps} : Identification des fenêtres`;
        instructionText = "Cliquez sur une fenêtre pour identifier toutes les menuiseries similaires.";
        elementName = "fenêtre";
        break;
      case 'wall':
        title = `Étape ${stepNumber}/${totalSteps} : Identification des murs`;
        instructionText = "Sélectionnez un mur. Metr reconnaîtra automatiquement les murs similaires.";
        elementName = "mur";
        break;
      case 'room':
        title = `Étape ${stepNumber}/${totalSteps} : Identification des pièces`;
        instructionText = "Sélectionnez une pièce pour l'identifier et la mesurer automatiquement.";
        elementName = "pièce";
        break;
      default:
        title = "Calibrage du Plan";
        instructionText = "Suivez les étapes pour calibrer votre plan.";
        break;
    }
    
    return (
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-50 py-3 px-6 border-b border-blue-100">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg text-blue-800">{title}</h3>
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    idx < currentStepIndex ? "bg-green-600" : 
                    idx === currentStepIndex ? "bg-primary" : 
                    "bg-gray-300"
                  )}
                ></div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
              <Hand className="text-primary mr-3 h-8 w-8" />
              <p className="text-gray-700">
                {instructionText}
              </p>
            </div>

            <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4">
              <AspectRatio ratio={16/9}>
                <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-300">
                  <p className="text-sm">Animation explicative</p>
                </div>
              </AspectRatio>
            </div>
          </div>

          {currentTypePoints.length > 0 && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Check className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">{currentTypePoints.length} {elementName}{currentTypePoints.length > 1 ? 's' : ''} identifiée{currentTypePoints.length > 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button 
              onClick={() => {
                console.log("Bouton 'Commencer l'identification' cliqué, calibrationStep =", calibrationStep);
                beginCalibrationStep();
                console.log("Après beginCalibrationStep, le calibrationStep devrait passer à 2");
              }}
              className="bg-primary hover:bg-blue-700 text-white"
            >
              {calibrationStep === 2 ? "Valider et continuer" : "Commencer l'identification"}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // Pre-calibration introduction
  const renderPreCalibration = () => (
    <motion.div 
      className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <HandMetal className="w-10 h-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Calibrage du Plan</h2>
        <p className="text-gray-600">
          Avant de commencer votre métré, nous allons calibrer votre plan en 4 étapes simples.
        </p>
      </motion.div>
      
      <motion.div 
        className="space-y-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">1</span>
          </div>
          <span className="text-gray-600">Identification des portes</span>
        </div>
        
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">2</span>
          </div>
          <span className="text-gray-600">Identification des menuiseries</span>
        </div>
        
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">3</span>
          </div>
          <span className="text-gray-600">Identification des murs</span>
        </div>
        
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">4</span>
          </div>
          <span className="text-gray-600">Identification des pièces</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={beginCalibrationStep} 
          className="w-full bg-primary hover:bg-blue-800 transition-colors text-white"
          size="lg"
        >
          Commencer le calibrage <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );

  // Final calibration completion
  const renderCalibrationComplete = () => (
    <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-green-50 py-3 px-6 border-b border-green-100">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg text-green-900">Calibrage terminé</h3>
          <div className="flex space-x-2">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div 
                key={idx}
                className="w-2 h-2 rounded-full bg-green-600"
              ></div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-6 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">🎉 Votre calibrage est terminé !</h2>
          <p className="text-gray-600 mb-6">
            Vous pouvez maintenant démarrer le métré de votre projet.
          </p>
        </div>
        
        <Button 
          onClick={onClose}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
          size="lg"
        >
          Démarrer le métré
        </Button>
      </div>
    </div>
  );

  // Determine which view to show based on calibration step
  if (calibrationStep === 0) {
    return renderPreCalibration();
  } else if (currentStepIndex >= totalSteps) {
    return renderCalibrationComplete();
  } else {
    return renderStepContent();
  }
};

export default CalibrationGuide;
