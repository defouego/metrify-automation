
import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/90 backdrop-blur-md shadow-soft py-3' : 'bg-transparent py-6'
    }`}>
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">
              Metr<span className="text-accent">.</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Fonctionnalités
            </a>
            <a href="#clients" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Cas clients
            </a>
            <a href="#blog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Blog
            </a>
            <a href="#careers" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Carrière
            </a>
            <a href="#login" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Connexion
            </a>
          </nav>

          {/* CTA Button */}
          <div className="hidden md:block">
            <button className="btn btn-accent px-6 py-2.5 shadow-sm transform transition-transform duration-300 hover:scale-105">
              Devenir un bêta testeur
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-foreground p-2 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md shadow-medium animate-fade-in">
          <div className="container px-4 py-6 flex flex-col space-y-4">
            <a href="#features" className="text-foreground py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              Fonctionnalités
            </a>
            <a href="#clients" className="text-foreground py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              Cas clients
            </a>
            <a href="#blog" className="text-foreground py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              Blog
            </a>
            <a href="#careers" className="text-foreground py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              Carrière
            </a>
            <a href="#login" className="text-foreground py-2 border-b border-border/30" onClick={() => setIsMenuOpen(false)}>
              Connexion
            </a>
            <button className="btn btn-accent py-2.5 mt-4 w-full">
              Devenir un bêta testeur
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
