
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Sparkles } from 'lucide-react';

interface AccountSuccessProps {
  onFinish: () => void;
}

const AccountSuccess: React.FC<AccountSuccessProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    // Start progress animation
    const timer = setTimeout(() => {
      setProgress(30);
    }, 200);
    
    // Middle progress
    const timer2 = setTimeout(() => {
      setProgress(70);
    }, 800);
    
    // Complete progress and redirect
    const timer3 = setTimeout(() => {
      setProgress(100);
    }, 1500);
    
    // Redirect to dashboard with a slight delay for visual feedback
    const redirectTimer = setTimeout(() => {
      onFinish();
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(redirectTimer);
    };
  }, [onFinish]);

  return (
    <Card className="w-full bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-md shadow-xl border-0 animate-scale-in">
      <CardContent className="pt-6 flex flex-col items-center justify-center space-y-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        
        <h2 className="text-xl font-bold text-center text-gray-800">
          Compte créé avec succès !
        </h2>
        
        <p className="text-center text-gray-600">
          Initialisation de votre espace Metr...
        </p>
        
        <div className="w-full">
          <Progress value={progress} className="h-2 bg-gray-200" />
        </div>
        
        <div className="flex items-center gap-2 text-metrBlue animate-pulse">
          <Sparkles size={18} />
          <span className="text-sm">Préparation de votre dashboard</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountSuccess;
