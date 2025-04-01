
import React, { useState } from 'react';
import { Building, Calculator, Ruler } from 'lucide-react';

const TargetAudience = () => {
  const [activeTab, setActiveTab] = useState(0);

  const audiences = [
    {
      id: 0,
      icon: <Building className="h-6 w-6" />,
      title: 'Constructeurs & Promoteurs',
      description: "Vérifiez rapidement vos métrés sans erreur et sécurisez votre rentabilité dès l'avant-projet.",
      benefits: [
        'Vérification rapide des surfaces et métrés',
        'Précision dans les calculs de coûts',
        'Meilleure visibilité sur la rentabilité',
        'Validation facilitée des plans'
      ]
    },
    {
      id: 1,
      icon: <Calculator className="h-6 w-6" />,
      title: 'Métreurs & Économistes',
      description: 'Automatisez vos calculs pour des devis fiables et précis.',
      benefits: [
        'Automatisation complète des métrés',
        'Élimination des erreurs de calcul',
        'Gain de temps considérable',
        'Devis plus précis et compétitifs'
      ]
    },
    {
      id: 2,
      icon: <Ruler className="h-6 w-6" />,
      title: "Bureaux d'études & Ingénierie",
      description: 'Obtenez instantanément vos métrés et facilitez vos analyses.',
      benefits: [
        'Accès instantané aux données de métrés',
        'Intégration facile avec vos outils existants',
        'Partage simplifié des informations',
        'Optimisation des processus de conception'
      ]
    }
  ];

  return (
    <section className="section-padding bg-metrGray/50" id="clients">
      <div className="container">
        <div className="max-w-3xl mx-auto text-center mb-16 reveal">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-4">
            À qui s'adresse Metr ?
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Une solution adaptée à chaque besoin
          </h2>
          <p className="text-lg text-foreground/80">
            Que vous soyez constructeur, métreur ou bureau d'études, Metr s'adapte à vos exigences spécifiques.
          </p>
        </div>

        {/* Tabs navigation for desktop */}
        <div className="hidden md:flex justify-center mb-12 reveal">
          <div className="inline-flex p-1 bg-white rounded-full shadow-sm">
            {audiences.map((audience, index) => (
              <button
                key={audience.id}
                className={`
                  flex items-center px-6 py-3 rounded-full transition-all duration-300
                  ${activeTab === index ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}
                `}
                onClick={() => setActiveTab(index)}
              >
                <span className="mr-2">{audience.icon}</span>
                <span className="font-medium">{audience.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex overflow-x-auto pb-4 mb-8 reveal no-scrollbar">
          <div className="inline-flex p-1 bg-white rounded-full shadow-sm">
            {audiences.map((audience, index) => (
              <button
                key={audience.id}
                className={`
                  flex items-center px-4 py-2 rounded-full whitespace-nowrap transition-all duration-300
                  ${activeTab === index ? 'bg-primary text-white shadow-sm' : 'text-foreground/70 hover:text-primary'}
                `}
                onClick={() => setActiveTab(index)}
              >
                <span className="mr-2">{audience.icon}</span>
                <span className="font-medium text-sm">{audience.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center reveal">
          <div className="glass-card p-8 h-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center mr-4">
                {audiences[activeTab].icon}
              </div>
              <h3 className="text-2xl font-bold">{audiences[activeTab].title}</h3>
            </div>
            
            <p className="text-lg mb-8 text-foreground/80">{audiences[activeTab].description}</p>
            
            <h4 className="font-semibold mb-4 text-primary">Bénéfices clés :</h4>
            <ul className="space-y-3">
              {audiences[activeTab].benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <div className="rounded-full bg-primary/10 p-1 mr-3 mt-0.5">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
            
            <div className="mt-8">
              <button className="btn btn-accent px-6 py-2.5">
                Devenir un bêta testeur
              </button>
            </div>
          </div>
          
          <div className="relative min-h-[400px] bg-white rounded-lg shadow-soft overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/20 flex items-center justify-center p-8">
              <div className="text-center">
                <div className="mb-6 opacity-90">
                  {activeTab === 0 && (
                    <Building className="h-20 w-20 mx-auto text-primary" />
                  )}
                  {activeTab === 1 && (
                    <Calculator className="h-20 w-20 mx-auto text-primary" />
                  )}
                  {activeTab === 2 && (
                    <Ruler className="h-20 w-20 mx-auto text-primary" />
                  )}
                </div>
                
                <div className="glass-card p-6 max-w-md mx-auto">
                  <div className="text-sm text-primary font-medium mb-2">Témoignage client</div>
                  <blockquote className="text-lg italic mb-4">
                    " {activeTab === 0 && "Metr nous a permis de réduire le temps de vérification des métrés de 70% et d'éliminer les erreurs coûteuses dans nos projets."}
                    {activeTab === 1 && "Avec Metr, nos devis sont désormais précis à 99% et nous les réalisons en un temps record. Un vrai gain de productivité !"}
                    {activeTab === 2 && "L'intégration de Metr dans notre workflow a révolutionné notre approche des métrés et optimisé toute notre chaîne de conception."} "
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center text-sm font-medium text-primary">
                      {activeTab === 0 && "CP"}
                      {activeTab === 1 && "ML"}
                      {activeTab === 2 && "JS"}
                    </div>
                    <div>
                      <div className="font-medium">
                        {activeTab === 0 && "Charles Petit"}
                        {activeTab === 1 && "Marie Lemaire"}
                        {activeTab === 2 && "Jean Schmidt"}
                      </div>
                      <div className="text-sm text-foreground/60">
                        {activeTab === 0 && "Directeur, Petit Constructions"}
                        {activeTab === 1 && "Économiste, Métrix Consultants"}
                        {activeTab === 2 && "Chef de projet, Bureau Ingénierie+"}
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

const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default TargetAudience;
