import { useState } from 'react';
import { HallTicket } from '@/components/HallTicket';
import { AudioTest } from '@/components/AudioTest';
import { DocumentEditor } from '@/components/DocumentEditor';

const ExamApp = () => {
  const [currentStep, setCurrentStep] = useState<'hall-ticket' | 'audio-test' | 'exam'>('hall-ticket');

  const handleNext = () => {
    if (currentStep === 'hall-ticket') {
      setCurrentStep('audio-test');
    } else if (currentStep === 'audio-test') {
      setCurrentStep('exam');
    }
  };

  const handleBack = () => {
    if (currentStep === 'exam') {
      setCurrentStep('audio-test');
    } else if (currentStep === 'audio-test') {
      setCurrentStep('hall-ticket');
    }
  };

  return (
    <>
      {currentStep === 'hall-ticket' && <HallTicket onNext={handleNext} />}
      {currentStep === 'audio-test' && <AudioTest onNext={handleNext} />}
      {currentStep === 'exam' && <DocumentEditor onBack={handleBack} />}
    </>
  );
};

export default ExamApp;