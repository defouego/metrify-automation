
import React, { useEffect, useRef, useState } from 'react';
import { Check, Clock, Download } from 'lucide-react';

const WhyMetr = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeFeature, setActiveFeature] = useState(0);
  
  // Features for the carousel
  const features = [
    {
      title: "Comptage automatique d'éléments",
      description: "Créez des tableaux détaillés, comme celui des portes, en quelques clics. Identifiez et comptez automatiquement tous les éléments sur vos plans.",
      status: "Disponible",
      image: "/placeholder.svg"
    },
    {
      title: "Détection des différences entre plans",
      description: "Comparez facilement différentes versions de plans pour identifier les modifications. Restez informé de chaque évolution de votre projet.",
      status: "En développement",
      image: "/placeholder.svg"
    },
    {
      title: "Sélection automatique des surfaces",
      description: "Identifiez et sélectionnez précisément et rapidement les surfaces sur vos plans sans effort manuel.",
      status: "En développement",
      image: "/placeholder.svg"
    }
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('.reveal');
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, [features.length]);

  return (
    <section className="bg-metrGray py-20 sm:py-28" id="features" ref={sectionRef}>
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            Pourquoi Metr ?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Chaque erreur de métré impacte votre rentabilité
          </h2>
          <p className="text-lg text-foreground/80">
            Avec des marges limitées, une erreur d'estimation peut coûter cher. Metr sécurise vos projets en garantissant une précision totale des mesures.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-card p-6 md:p-8 transform transition-all duration-500 hover:shadow-medium hover:-translate-y-1 reveal">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Check className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Précision absolue</h3>
            <p className="text-foreground/70">
              Obtenez des métrés à la précision millimétrique, sans utiliser de règle. Notre technologie de calcul assure des mesures exactes à chaque fois.
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 transform transition-all duration-500 hover:shadow-medium hover:-translate-y-1 reveal">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Gain de temps immédiat</h3>
            <p className="text-foreground/70">
              Transformez des heures de travail manuel en quelques minutes. Metr automatise l'ensemble du processus de métrage pour vous faire gagner un temps précieux.
            </p>
          </div>

          <div className="glass-card p-6 md:p-8 transform transition-all duration-500 hover:shadow-medium hover:-translate-y-1 reveal">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Export automatique</h3>
            <p className="text-foreground/70">
              Exportez vos métrés directement vers Excel avec un simple clic. Intégrez les données dans vos devis et documents professionnels sans aucune ressaisie.
            </p>
          </div>
        </div>

        {/* Fonctionnalités Carousel - Replacing the risk elimination section */}
        <div className="mt-16 glass-card overflow-hidden reveal">
          <div className="py-8 px-4 md:p-0">
            <div className="max-w-3xl mx-auto text-center mb-8">
              <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent mb-2">
                Fonctionnalités avancées
              </span>
              <h3 className="text-2xl font-bold">Découvrez nos fonctionnalités innovantes</h3>
            </div>
            
            {/* Carousel Navigation */}
            <div className="flex justify-center mb-8">
              <div className="flex space-x-2">
                {features.map((_, index) => (
                  <button 
                    key={index} 
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeFeature ? 'bg-primary w-8' : 'bg-gray-300'}`}
                    onClick={() => setActiveFeature(index)}
                  />
                ))}
              </div>
            </div>
            
            {/* Carousel Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="p-6 md:p-8 flex flex-col justify-center order-2 lg:order-1">
                <div className="inline-block mb-2">
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium 
                    ${features[activeFeature].status === "Disponible" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-accent/10 text-accent"}`}>
                    {features[activeFeature].status}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{features[activeFeature].title}</h3>
                <p className="text-foreground/70 mb-6">{features[activeFeature].description}</p>
                <button className="btn btn-accent px-6 py-2.5 w-full sm:w-auto">
                  Devenir un bêta testeur
                </button>
              </div>
              
              <div className="p-6 bg-primary/5 flex items-center justify-center order-1 lg:order-2 min-h-[250px]">
                <div className="w-full max-w-md aspect-video bg-white/50 rounded-lg flex items-center justify-center">
                  <img 
                    src={features[activeFeature].image} 
                    alt={features[activeFeature].title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyMetr;
