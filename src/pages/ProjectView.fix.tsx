
import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import CalibrationGuide from '@/components/project/CalibrationGuide';
import DetailedMeasurements from '@/components/project/DetailedMeasurements';

const ProjectViewFixContent = ({ 
  isCalibrating, 
  calibrationStep,
  projet 
}: { 
  isCalibrating: boolean;
  calibrationStep: number;
  projet: any;  // Using 'any' here since we're receiving it from parent component
}) => (
  <>
    {/* Calibration Dialog - Show for introduction and between steps */}
    <Dialog open={isCalibrating && (calibrationStep === 0 || calibrationStep === 1)} onOpenChange={() => {}}>
      <DialogContent className="p-0 border-0 max-w-xl">
        <DialogTitle className="sr-only">Calibration Guide</DialogTitle>
        <CalibrationGuide onClose={() => console.log('Close calibration guide')} />
      </DialogContent>
    </Dialog>
    
    {/* Detailed Measurements View */}
    {projet && !isCalibrating && <DetailedMeasurements projet={projet} />}
  </>
);

export default ProjectViewFixContent;
