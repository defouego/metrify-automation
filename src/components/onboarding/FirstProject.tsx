
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus2, LayoutDashboard } from 'lucide-react';

interface FirstProjectProps {
  onFinish: (goToDashboard: boolean) => void;
}

const FirstProject: React.FC<FirstProjectProps> = ({ onFinish }) => {
  return (
    <Card className="w-full bg-white/90 backdrop-blur-md shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Créer mon premier projet ?</CardTitle>
        <CardDescription className="text-center">
          Votre compte a été créé avec succès !
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl p-6 text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-lg font-medium text-metrBlue mb-2">Félicitations !</h3>
          <p className="text-sm text-gray-600">
            Vous voilà prêt à automatiser vos métrés avec Metr. Par où souhaitez-vous commencer ?
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          onClick={() => onFinish(false)}
          className="w-full bg-metrOrange hover:bg-orange-600 text-white rounded-xl flex items-center justify-center gap-2"
        >
          <FilePlus2 className="h-5 w-5" />
          Créer mon premier projet
        </Button>
        <Button 
          onClick={() => onFinish(true)}
          variant="outline"
          className="w-full border-metrBlue text-metrBlue hover:bg-blue-50 rounded-xl flex items-center justify-center gap-2"
        >
          <LayoutDashboard className="h-5 w-5" />
          Aller sur mon dashboard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FirstProject;
