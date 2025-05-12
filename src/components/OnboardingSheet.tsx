
import React, { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import CreateAccount from './onboarding/CreateAccount';
import CompanyInfo from './onboarding/CompanyInfo';
import AccountSuccess from './onboarding/AccountSuccess';
import { useNavigate } from 'react-router-dom';

export type UserData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  company?: string;
  profession?: 'Économiste' | 'Ingénieur' | 'Architecte' | 'Autre';
  experience?: '0-3 ans' | '3-7 ans' | '7+ ans';
};

interface OnboardingSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

const OnboardingSheet = ({ isOpen, onClose }: OnboardingSheetProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [userData, setUserData] = useState<UserData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    acceptTerms: false
  });
  
  const handleUserDataChange = (data: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...data }));
  };

  const handleStepComplete = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleFinish = () => {
    onClose();
    // Reset for next time
    setStep(1);
    
    // Navigate to dashboard after success screen
    navigate('/dashboard');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] p-0 rounded-t-3xl bg-white/80 backdrop-blur-lg border-none overflow-auto">
        <div className="flex justify-center items-center min-h-full p-4">
          <div className="w-full max-w-md">
            {step === 1 && (
              <CreateAccount 
                userData={userData}
                onDataChange={handleUserDataChange}
                onComplete={handleStepComplete}
              />
            )}
            {step === 2 && (
              <CompanyInfo 
                userData={userData}
                onDataChange={handleUserDataChange}
                onComplete={handleStepComplete}
              />
            )}
            {step === 3 && (
              <AccountSuccess onFinish={handleFinish} />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default OnboardingSheet;
