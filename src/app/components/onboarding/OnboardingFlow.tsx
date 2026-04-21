import { useState } from 'react';
import { X } from 'lucide-react';
import { LocationScreen } from './LocationScreen';
import { SelectActivitiesScreen } from './SelectActivitiesScreen';
import { FarmingDetailsScreen } from './FarmingDetailsScreen';
import { EquipmentDetailsScreen } from './EquipmentDetailsScreen';
import { TransportDetailsScreen } from './TransportDetailsScreen';
import { CompletionScreen } from './CompletionScreen';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
}

export interface OnboardingData {
  location: {
    village: string;
    district: string;
    state: string;
  };
  selectedActivities: string[];
  farmingDetails?: {
    crops: string[];
    landSize: string;
    sellingMethod: string;
  };
  equipmentDetails?: {
    equipmentType: string;
    rentalPrice: string;
    availableDays: string;
  };
  transportDetails?: {
    vehicleType: string;
    loadCapacity: string;
    serviceRadius: string;
  };
}

export function OnboardingFlow({ isOpen, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({
    location: { village: '', district: '', state: '' },
    selectedActivities: []
  });

  if (!isOpen) return null;

  const updateData = (field: string, value: any) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Determine which screens to show based on selected activities
  const getScreenFlow = () => {
    const screens = [
      { type: 'location', component: LocationScreen },
      { type: 'activities', component: SelectActivitiesScreen }
    ];

    // Add dynamic screens based on selected activities
    if (data.selectedActivities.includes('sell-crop')) {
      screens.push({ type: 'farming', component: FarmingDetailsScreen });
    }
    if (data.selectedActivities.includes('rent-machinery')) {
      screens.push({ type: 'equipment', component: EquipmentDetailsScreen });
    }
    if (data.selectedActivities.includes('provide-transport')) {
      screens.push({ type: 'transport', component: TransportDetailsScreen });
    }

    screens.push({ type: 'completion', component: CompletionScreen });

    return screens;
  };

  const screens = getScreenFlow();
  const CurrentScreen = screens[currentStep]?.component;

  const handleNext = (stepData?: any) => {
    if (stepData) {
      const screenType = screens[currentStep].type;
      if (screenType === 'location') {
        updateData('location', stepData);
      } else if (screenType === 'activities') {
        updateData('selectedActivities', stepData);
      } else if (screenType === 'farming') {
        updateData('farmingDetails', stepData);
      } else if (screenType === 'equipment') {
        updateData('equipmentDetails', stepData);
      } else if (screenType === 'transport') {
        updateData('transportDetails', stepData);
      }
    }

    if (currentStep < screens.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    console.log('Onboarding complete:', data);
    onComplete();
  };

  const handleClose = () => {
    if (window.confirm('Are you sure you want to exit onboarding? Your progress will be lost.')) {
      onComplete();
    }
  };

  const isLastStep = currentStep === screens.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-[#fefaf0] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide relative">
        {/* Close Button - Only show if not on completion screen */}
        {!isLastStep && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-10 text-black/60 hover:text-black transition-colors"
            aria-label="Close onboarding"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        
        <CurrentScreen
          data={data}
          onNext={handleNext}
          onPrevious={handlePrevious}
          onComplete={handleComplete}
          isFirstStep={currentStep === 0}
          isLastStep={isLastStep}
        />
      </div>
    </div>
  );
}