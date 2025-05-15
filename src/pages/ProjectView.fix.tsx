{/* Calibration Dialog - Show for introduction and between steps */}
<Dialog open={isCalibrating && (calibrationStep === 0 || calibrationStep === 1)} onOpenChange={() => {}}>
  <DialogContent className="p-0 border-0 max-w-xl">
    <DialogTitle className="sr-only">Calibration Guide</DialogTitle>
    <CalibrationGuide onClose={() => console.log('Close calibration guide')} />
  </DialogContent>
</Dialog> 