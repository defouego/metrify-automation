import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalibrationStep } from '@/types/metr';
import { Button } from '@/components/ui/button';
import { Hand, HandMetal, Check, ChevronRight } from 'lucide-react';
import { AspectRatio } from '@/components/ui/aspect-ratio';

interface CalibrationGuideProps {
  step: CalibrationStep;
  onBeginCalibration: () => void;
  onSkipStep: () => void;
  onValidateStep: () => void;
  selectedElement: any | null;
  elementCount?: number;
}

const CalibrationGuide: React.FC<CalibrationGuideProps> = ({
  step,
  onBeginCalibration,
  onSkipStep,
  onValidateStep,
  selectedElement,
  elementCount = 0,
}) => {
  const renderPreCalibration = () => (
    <motion.div 
      className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center glass-effect"
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
        <div className="w-20 h-20 bg-metr-blue/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <HandMetal className="w-10 h-10 text-metr-blue" />
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
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-metr-blue/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-metr-blue">1</span>
          </div>
          <span className="text-gray-600">Identification des portes</span>
        </div>
        
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-metr-blue/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-metr-blue">2</span>
          </div>
          <span className="text-gray-600">Identification des menuiseries</span>
        </div>
        
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-metr-blue/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-metr-blue">3</span>
          </div>
          <span className="text-gray-600">Identification des murs</span>
        </div>
        
        <div className="flex items-center space-x-3 text-left">
          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-metr-blue/10 flex items-center justify-center">
            <span className="text-sm font-semibold text-metr-blue">4</span>
          </div>
          <span className="text-gray-600">Classification des murs</span>
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button 
          onClick={onBeginCalibration} 
          className="w-full bg-metr-blue hover:bg-metr-blue/90 transition-colors text-white"
          size="lg"
        >
          Commencer le calibrage <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 'portes':
        return (
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-metr-blue/5 py-3 px-6 border-b border-metr-blue/10">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-metr-blue">Étape 1/4 : Identification des portes</h3>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-metr-blue"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
                  <Hand className="text-metr-blue mr-3 h-8 w-8" />
                  <p className="text-gray-700">
                    Cliquez sur une <strong>porte</strong> du plan. Metr détectera automatiquement toutes les portes similaires.
                  </p>
                </div>

                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <AspectRatio ratio={16/9}>
                    <div className="w-full h-full flex items-center justify-center bg-metr-blue/5 text-metr-blue/30">
                      <p className="text-sm">Animation explicative</p>
                    </div>
                  </AspectRatio>
                </div>
              </div>

              {selectedElement && (
                <div 
                  className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{elementCount} portes identifiées automatiquement !</p>
                      <p className="text-sm text-green-700 mt-1">Type : {selectedElement.type} (calque : {selectedElement.calque})</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={onSkipStep}
                >
                  Ignorer cette étape
                </Button>
                <Button 
                  onClick={onValidateStep}
                  disabled={!selectedElement}
                  className="bg-metr-blue hover:bg-metr-blue/90 text-white"
                >
                  {selectedElement ? 'Valider et continuer' : 'Sélectionnez une porte'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'fenetres':
        return (
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-metr-blue/5 py-3 px-6 border-b border-metr-blue/10">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-metr-blue">Étape 2/4 : Identification des menuiseries</h3>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-metr-blue"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
                  <Hand className="text-metr-blue mr-3 h-8 w-8" />
                  <p className="text-gray-700">
                    Cliquez sur une <strong>fenêtre</strong> pour identifier toutes les menuiseries similaires.
                  </p>
                </div>

                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <AspectRatio ratio={16/9}>
                    <div className="w-full h-full flex items-center justify-center bg-metr-blue/5 text-metr-blue/30">
                      <p className="text-sm">Animation explicative</p>
                    </div>
                  </AspectRatio>
                </div>
              </div>

              {selectedElement && (
                <div 
                  className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{elementCount} menuiseries identifiées automatiquement !</p>
                      <p className="text-sm text-green-700 mt-1">Type : {selectedElement.type} (calque : {selectedElement.calque})</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={onSkipStep}
                >
                  Ignorer cette étape
                </Button>
                <Button 
                  onClick={onValidateStep}
                  disabled={!selectedElement}
                  className="bg-metr-blue hover:bg-metr-blue/90 text-white"
                >
                  {selectedElement ? 'Valider et continuer' : 'Sélectionnez une fenêtre'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'murs':
        return (
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-metr-blue/5 py-3 px-6 border-b border-metr-blue/10">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-metr-blue">Étape 3/4 : Identification des murs</h3>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-metr-blue"></div>
                  <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100 flex items-center">
                  <Hand className="text-metr-blue mr-3 h-8 w-8" />
                  <p className="text-gray-700">
                    Sélectionnez un <strong>mur</strong>. Metr reconnaîtra automatiquement les murs similaires.
                  </p>
                </div>

                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <AspectRatio ratio={16/9}>
                    <div className="w-full h-full flex items-center justify-center bg-metr-blue/5 text-metr-blue/30">
                      <p className="text-sm">Animation explicative</p>
                    </div>
                  </AspectRatio>
                </div>
              </div>

              {selectedElement && (
                <div 
                  className="bg-green-50 p-4 rounded-lg border border-green-100 mb-6"
                >
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-green-800">{elementCount} murs identifiés avec succès !</p>
                      <p className="text-sm text-green-700 mt-1">Type : {selectedElement.type} (calque : {selectedElement.calque})</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={onSkipStep}
                >
                  Ignorer cette étape
                </Button>
                <Button 
                  onClick={onValidateStep}
                  disabled={!selectedElement}
                  className="bg-metr-blue hover:bg-metr-blue/90 text-white"
                >
                  {selectedElement ? 'Valider et continuer' : 'Sélectionnez un mur'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'classification':
        return (
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-metr-blue/5 py-3 px-6 border-b border-metr-blue/10">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-metr-blue">Étape 4/4 : Classification des murs</h3>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-metr-blue"></div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 mb-2">
                    Classez les différents types de murs pour faciliter les calculs du métré.
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <span className="block font-medium">Mur porteur</span>
                      <span className="text-xs text-gray-500">Élément de structure</span>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <span className="block font-medium">Cloison</span>
                      <span className="text-xs text-gray-500">Mur non porteur</span>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <span className="block font-medium">Doublage</span>
                      <span className="text-xs text-gray-500">Isolation thermique</span>
                    </div>
                    <div className="bg-white rounded p-2 border border-gray-200">
                      <span className="block font-medium">Mur de façade</span>
                      <span className="text-xs text-gray-500">Extérieur</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedElement && (
                <div 
                  className="mb-6 bg-white border rounded-lg overflow-hidden"
                >
                  <div className="border-b px-4 py-3 bg-gray-50">
                    <h4 className="font-medium">Groupe de murs sélectionné</h4>
                  </div>
                  <div className="p-4">
                    <p className="text-sm mb-2">Type de mur: <span className="font-medium">{selectedElement.calque}</span></p>
                    <p className="text-sm mb-3">{elementCount} éléments dans ce groupe</p>
                    
                    <label className="block mb-1 text-sm font-medium">Classification:</label>
                    <select className="w-full p-2 border rounded text-sm">
                      <option value="">Choisir une classification</option>
                      <option value="porteur">Mur porteur</option>
                      <option value="cloison">Cloison simple</option>
                      <option value="cloison_isolee">Cloison isolée</option>
                      <option value="doublage">Doublage</option>
                      <option value="facade">Mur de façade</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={onSkipStep}
                >
                  Ignorer cette étape
                </Button>
                <Button 
                  onClick={onValidateStep}
                  disabled={!selectedElement}
                  className="bg-metr-blue hover:bg-metr-blue/90 text-white"
                >
                  {selectedElement ? 'Terminer le calibrage' : 'Sélectionnez un mur'}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-green-50 py-3 px-6 border-b border-green-100">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-lg text-green-900">Calibrage terminé</h3>
                <div className="flex space-x-2">
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
                  <div className="w-2 h-2 rounded-full bg-green-600"></div>
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
                onClick={onValidateStep}
                className="bg-green-600 hover:bg-green-700 text-white px-8"
                size="lg"
              >
                Démarrer le métré
              </Button>
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  // Pour le message initial
  if (step === 'upload') {
    return (
      <AnimatePresence mode="wait">
        {renderPreCalibration()}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {renderStepContent()}
    </AnimatePresence>
  );
};

export default CalibrationGuide; 