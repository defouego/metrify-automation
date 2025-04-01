
import React, { useEffect, useState } from 'react';
import { FileUp, MousePointer, FileDown } from 'lucide-react';

const HowItWorks = () => {
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev % 3) + 1);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  const steps = [
    {
      id: 1,
      icon: <FileUp className="h-6 w-6" />,
      title: "Import",
      description: "Téléchargez simplement vos plans au format PDF ou DWG dans l'interface Metr."
    },
    {
      id: 2,
      icon: <MousePointer className="h-6 w-6" />,
      title: "Mesurez & sélectionnez",
      description: "Cliquez directement sur les surfaces du plan ou interrogez l'outil pour obtenir vos mesures."
    },
    {
      id: 3,
      icon: <FileDown className="h-6 w-6" />,
      title: "Exportez",
      description: "Exportez instantanément vos métrés précis dans un format Excel prêt à l'emploi."
    }
  ];

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
  };

  return (
    <section className="section-padding bg-white" id="how-it-works">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-4">
            Comment ça marche ?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Importez, mesurez, exportez.
          </h2>
          <p className="text-lg text-foreground/80">
            Notre solution s'intègre parfaitement dans votre flux de travail avec une interface intuitive en trois étapes simples.
          </p>
        </div>

        <div className="relative">
          {/* Progress line */}
          <div className="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gray-100 z-0">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${(activeStep - 1) * 50}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step) => (
              <div 
                key={step.id}
                className={`relative reveal ${activeStep === step.id ? 'active' : ''}`}
                onClick={() => handleStepClick(step.id)}
              >
                <div 
                  className={`
                    cursor-pointer transition-all duration-500 ease-in-out 
                    ${activeStep === step.id ? 'transform scale-105' : 'opacity-70 hover:opacity-100'}
                  `}
                >
                  <div className="flex flex-col md:items-center text-center">
                    <div 
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center mb-6 transition-colors duration-300
                        ${activeStep === step.id ? 'bg-primary text-white' : 'bg-gray-100 text-foreground/70'}
                      `}
                    >
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                    <p className="text-foreground/70">{step.description}</p>
                  </div>
                </div>

                {/* Mobile progress indicator */}
                <div className="block md:hidden w-full h-1 bg-gray-100 mt-6">
                  <div 
                    className={`h-full bg-primary transition-all duration-500 ease-in-out ${
                      activeStep >= step.id ? 'w-full' : 'w-0'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual presentation */}
        <div className="mt-20 reveal">
          <div className="bg-metrGray rounded-lg overflow-hidden shadow-soft">
            <div className="p-4 bg-primary/5 border-b border-gray-200">
              <div className="flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <div className="mx-auto text-sm font-medium text-foreground/60">Interface Metr</div>
              </div>
            </div>

            <div className="p-6 flex justify-center">
              <div className="relative w-full max-w-4xl aspect-[16/9] bg-white rounded shadow-sm">
                {activeStep === 1 && (
                  <div className="absolute inset-0 p-8 flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-full max-w-md text-center">
                      <FileUp className="w-12 h-12 mx-auto mb-4 text-primary/70" />
                      <h4 className="text-lg font-medium mb-2">Glissez-déposez vos plans ici</h4>
                      <p className="text-sm text-foreground/60 mb-6">Formats supportés : PDF, DWG, DXF</p>
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <button className="btn btn-primary px-4 py-2 text-sm">
                          Parcourir les fichiers
                        </button>
                        <p className="text-xs text-foreground/50 mt-2">ou glissez-déposez un fichier</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="absolute inset-0 p-4 animate-fade-in">
                    <div className="h-full rounded border border-gray-200 grid grid-cols-1 md:grid-cols-4">
                      <div className="md:col-span-3 bg-gray-50 border-r border-gray-200 flex items-center justify-center">
                        <div className="w-full h-full relative">
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-5/6 h-5/6 border border-gray-300 rounded relative">
                              <div className="absolute top-1/2 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-accent animate-pulse"></div>
                              <MousePointer className="absolute top-1/2 right-1/2 transform translate-x-6 -translate-y-6 text-primary w-5 h-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 flex flex-col justify-between">
                        <div>
                          <h5 className="font-medium mb-3">Résultats du métré</h5>
                          <div className="space-y-3">
                            <div className="p-2 bg-white rounded border border-gray-200">
                              <div className="text-xs text-foreground/60">Surface</div>
                              <div className="font-medium">35.48 m²</div>
                            </div>
                            <div className="p-2 bg-white rounded border border-gray-200">
                              <div className="text-xs text-foreground/60">Périmètre</div>
                              <div className="font-medium">24.75 m</div>
                            </div>
                          </div>
                        </div>
                        <button className="btn btn-primary w-full py-2 text-sm mt-4">
                          Ajouter au métré
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="absolute inset-0 p-8 flex items-center justify-center animate-fade-in">
                    <div className="w-full max-w-md text-center">
                      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                          <h4 className="font-medium">Export des données</h4>
                          <FileDown className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M14 2V8H20" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 13H8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M16 17H8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10 9H9H8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <span className="text-sm">Rapport_metré_détaillé.xlsx</span>
                            </div>
                            <button className="text-primary text-sm font-medium">
                              Télécharger
                            </button>
                          </div>
                          
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center mr-3">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M7 10L12 15L17 10" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M12 15V3" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                              <span className="text-sm">Métré_PDF.pdf</span>
                            </div>
                            <button className="text-primary text-sm font-medium">
                              Télécharger
                            </button>
                          </div>
                        </div>
                        
                        <div className="mt-6">
                          <button className="btn btn-accent w-full py-2">
                            Exporter tous les fichiers
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
