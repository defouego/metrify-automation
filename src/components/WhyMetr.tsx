
import React, { useEffect, useRef } from 'react';
import { Check, Clock, Download, FileWarning } from 'lucide-react';

const WhyMetr = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

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

        <div className="mt-16 glass-card overflow-hidden reveal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="p-8 flex flex-col justify-center">
              <div className="inline-block mb-4">
                <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
                  Amélioration de la rentabilité
                </span>
              </div>
              <h3 className="text-2xl font-bold mb-4">
                Éliminez les risques d'erreurs coûteuses
              </h3>
              <p className="text-foreground/70 mb-6">
                Une étude montre que les erreurs de métrés peuvent réduire vos marges de 15 à 25%. Metr élimine ce risque avec une précision inégalée, sécurisant ainsi vos projets et votre rentabilité.
              </p>
              <div className="flex items-center gap-4">
                <button className="btn btn-accent px-6 py-2.5">
                  Estimer mes économies
                </button>
                <button className="btn btn-ghost px-6 py-2.5">
                  En savoir plus
                </button>
              </div>
            </div>
            <div className="relative h-64 lg:h-auto bg-primary/5 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center mb-4">
                      <FileWarning className="h-6 w-6 text-destructive mr-3" />
                      <h4 className="font-semibold">Impact des erreurs de métrés</h4>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground/70">Méthode traditionnelle</span>
                          <span className="text-sm font-medium">25% d'erreur</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-destructive h-2.5 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-foreground/70">Avec Metr</span>
                          <span className="text-sm font-medium">2% d'erreur</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: '2%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
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
