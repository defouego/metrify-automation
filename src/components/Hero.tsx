
import React, { useEffect, useRef } from 'react';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const heroElement = heroRef.current;
    if (!heroElement) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const { offsetX, offsetY } = e;
      const { width, height } = heroElement.getBoundingClientRect();
      
      const moveX = (offsetX / width - 0.5) * 20;
      const moveY = (offsetY / height - 0.5) * 20;
      
      const illustrations = heroElement.querySelectorAll('.hero-illustration');
      illustrations.forEach((illustration: Element) => {
        if (illustration instanceof HTMLElement) {
          illustration.style.transform = `translate(${moveX}px, ${moveY}px)`;
        }
      });
    };
    
    heroElement.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      heroElement.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center pt-16 overflow-hidden relative bg-gradient-to-b from-white to-metrGray/30" ref={heroRef}>
      <div className="absolute top-0 right-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full filter blur-3xl transform translate-x-1/2 -translate-y-1/4"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl transform -translate-x-1/3 translate-y-1/4"></div>
      </div>
      
      <div className="container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col space-y-8 max-w-xl">
            <div className="inline-block">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent animate-fade-in">
                Simplifiez vos métrés
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight animate-fade-in animate-delay-100">
              Vos métrés précis, <span className="text-primary relative">
                sans sortir
                <svg className="absolute bottom-0 left-0 w-full h-2 text-accent/40" viewBox="0 0 200 8" preserveAspectRatio="none">
                  <path d="M0,5 Q40,0 80,5 T160,5 T200,5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span> votre règle
            </h1>
            
            <p className="text-lg text-foreground/80 animate-fade-in animate-delay-200">
              Automatisez vos métrés et sécurisez votre rentabilité avec Metr. 
              Notre solution SaaS révolutionne le processus de métrés dans le BTP.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animate-delay-300">
              <button className="btn btn-accent px-8 py-3 text-base shadow-md transform transition-transform duration-300 hover:scale-105">
                Demandez votre accès
              </button>
              <button className="btn btn-ghost px-8 py-3 text-base">
                Voir la démo
              </button>
            </div>
            
            <div className="flex items-center space-x-4 animate-fade-in animate-delay-400">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-medium text-gray-600">JD</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-medium text-gray-600">MP</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-medium text-gray-600">AL</span>
                </div>
              </div>
              <p className="text-sm text-foreground/60">
                <span className="font-medium">150+</span> entreprises nous font confiance
              </p>
            </div>
          </div>
          
          <div className="relative">
            <div className="relative z-10 hero-illustration animate-float">
              <div className="bg-white rounded-lg shadow-medium p-2 max-w-md mx-auto">
                <div className="relative rounded-md overflow-hidden aspect-[4/3]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-metrBlue/80 to-metrBlue/30 flex items-center justify-center">
                    <div className="text-center px-4">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M3 7.8L12 3L21 7.8V16.2L12 21L3 16.2V7.8Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M3 7.8L12 12L21 7.8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 12L12 21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <h3 className="text-white text-lg font-medium mb-2">Plan interactif</h3>
                      <p className="text-white/80 text-sm">Cliquez sur n'importe quelle surface pour obtenir instantanément le métré</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                      <span className="text-sm font-medium">Calcul en cours...</span>
                    </div>
                    <span className="text-xs text-foreground/60">12:06</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-100 rounded w-full"></div>
                    <div className="h-2 bg-gray-100 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute top-1/2 -right-12 transform translate-x-1/4 -translate-y-1/2 w-40 h-40 bg-accent/10 rounded-lg shadow-sm p-3 rotate-6 hero-illustration animate-float animate-delay-200">
              <div className="bg-white rounded h-full w-full flex items-center justify-center">
                <div className="text-center p-2">
                  <div className="text-3xl font-bold text-accent">98%</div>
                  <div className="text-xs text-foreground/70">Précision</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -bottom-8 -left-8 transform -translate-x-1/4 w-36 h-24 bg-primary/10 rounded-lg shadow-sm p-3 -rotate-3 hero-illustration animate-float animate-delay-300">
              <div className="bg-white rounded h-full w-full flex items-center">
                <div className="text-center p-2 w-full">
                  <div className="text-xs text-foreground/70 mb-1">Gain de temps</div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="text-xs text-right font-medium mt-1">75%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
