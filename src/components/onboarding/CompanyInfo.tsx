
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserData } from '../OnboardingSheet';

interface CompanyInfoProps {
  userData: UserData;
  onDataChange: (data: Partial<UserData>) => void;
  onComplete: () => void;
}

const CompanyInfo: React.FC<CompanyInfoProps> = ({ userData, onDataChange, onComplete }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <Card className="w-full bg-white/90 backdrop-blur-md shadow-xl border-0">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Infos projet / société</CardTitle>
        <CardDescription className="text-center">
          Aidez-nous à mieux vous connaître
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="company">Société (facultatif)</Label>
            <Input 
              id="company" 
              placeholder="Nom de votre entreprise"
              value={userData.company || ''}
              onChange={(e) => onDataChange({ company: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profession">Métier</Label>
            <Select 
              value={userData.profession} 
              onValueChange={(value) => onDataChange({ profession: value as UserData['profession'] })}
            >
              <SelectTrigger id="profession" className="w-full">
                <SelectValue placeholder="Sélectionnez votre métier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Économiste">Économiste</SelectItem>
                <SelectItem value="Ingénieur">Ingénieur</SelectItem>
                <SelectItem value="Architecte">Architecte</SelectItem>
                <SelectItem value="Autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-3">
            <Label>Expérience</Label>
            <RadioGroup 
              value={userData.experience} 
              onValueChange={(value) => onDataChange({ experience: value as UserData['experience'] })}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="0-3 ans" id="exp1" />
                <Label htmlFor="exp1">0-3 ans</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="3-7 ans" id="exp2" />
                <Label htmlFor="exp2">3-7 ans</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="7+ ans" id="exp3" />
                <Label htmlFor="exp3">7+ ans</Label>
              </div>
            </RadioGroup>
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleSubmit}
          className="w-full bg-metrOrange hover:bg-orange-600 text-white rounded-xl"
        >
          Suivant
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompanyInfo;
