
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { UserData } from '../OnboardingSheet';

interface CreateAccountProps {
  userData: UserData;
  onDataChange: (data: Partial<UserData>) => void;
  onComplete: () => void;
}

const CreateAccount: React.FC<CreateAccountProps> = ({ userData, onDataChange, onComplete }) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!userData.firstName) newErrors.firstName = 'Le prénom est requis';
    if (!userData.lastName) newErrors.lastName = 'Le nom est requis';
    
    if (!userData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      newErrors.email = 'L\'email est invalide';
    }
    
    if (!userData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (userData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    if (!userData.acceptTerms) newErrors.acceptTerms = 'Vous devez accepter les conditions d\'utilisation';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      setIsLoading(true);
      
      // Simulate API call
      setTimeout(() => {
        setIsLoading(false);
        onComplete();
      }, 1000);
    }
  };

  return (
    <Card className="w-full bg-white/90 backdrop-blur-md shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Créer mon compte</CardTitle>
        <CardDescription className="text-center">
          Rejoignez Metr pour automatiser vos métrés
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <Input 
              id="firstName" 
              placeholder="Votre prénom"
              value={userData.firstName}
              onChange={(e) => onDataChange({ firstName: e.target.value })}
              className={errors.firstName ? 'border-red-500' : ''}
            />
            {errors.firstName && <p className="text-xs text-red-500">{errors.firstName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <Input 
              id="lastName" 
              placeholder="Votre nom"
              value={userData.lastName}
              onChange={(e) => onDataChange({ lastName: e.target.value })}
              className={errors.lastName ? 'border-red-500' : ''}
            />
            {errors.lastName && <p className="text-xs text-red-500">{errors.lastName}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="votre@email.com"
              value={userData.email}
              onChange={(e) => onDataChange({ email: e.target.value })}
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input 
              id="password" 
              type="password" 
              placeholder="8 caractères minimum"
              value={userData.password}
              onChange={(e) => onDataChange({ password: e.target.value })}
              className={errors.password ? 'border-red-500' : ''}
            />
            {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="terms" 
              checked={userData.acceptTerms} 
              onCheckedChange={(checked) => onDataChange({ acceptTerms: checked === true })}
            />
            <Label 
              htmlFor="terms" 
              className={`text-sm ${errors.acceptTerms ? 'text-red-500' : ''}`}
            >
              J'accepte les CGU de Metr
            </Label>
          </div>
          {errors.acceptTerms && <p className="text-xs text-red-500">{errors.acceptTerms}</p>}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          className="w-full bg-metrOrange hover:bg-orange-600 text-white rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Création en cours...
            </>
          ) : (
            'Créer mon compte'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CreateAccount;
