
import React, { useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import WhyMetr from '@/components/WhyMetr';
import HowItWorks from '@/components/HowItWorks';
import TargetAudience from '@/components/TargetAudience';
import Footer from '@/components/Footer';

const Index = () => {
  useEffect(() => {
    const revealElements = () => {
      const reveals = document.querySelectorAll('.reveal');
      
      reveals.forEach((element) => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', revealElements);
    // Initial check
    revealElements();
    
    return () => window.removeEventListener('scroll', revealElements);
  }, []);

  return (
    <div className="relative w-full overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <WhyMetr />
        <HowItWorks />
        <TargetAudience />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
