import { Check } from 'lucide-react';

interface EscrowStep {
  id: string;
  label: string;
  status: 'completed' | 'active' | 'pending';
}

interface EscrowStatusTrackerProps {
  currentStep: number;
  steps?: EscrowStep[];
}

export function EscrowStatusTracker({ currentStep, steps }: EscrowStatusTrackerProps) {
  const defaultSteps: EscrowStep[] = [
    { id: '1', label: 'Auction Won', status: 'pending' },
    { id: '2', label: 'Payment in Escrow', status: 'pending' },
    { id: '3', label: 'Goods Shipped', status: 'pending' },
    { id: '4', label: 'Delivered', status: 'pending' },
    { id: '5', label: 'Payment Released', status: 'pending' }
  ];

  const escrowSteps = steps || defaultSteps.map((step, index) => ({
    ...step,
    status: index < currentStep ? 'completed' : index === currentStep ? 'active' : 'pending'
  })) as EscrowStep[];

  return (
    <div className="bg-white rounded-2xl border-2 border-black/10 p-6 shadow-lg">
      <h3 className="font-['Fraunces',sans-serif] text-2xl text-black mb-6">
        Transaction Progress
      </h3>
      
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-6 left-0 w-full h-0.5 bg-black/10">
          <div 
            className="h-full bg-[#64b900] transition-all duration-500"
            style={{ width: `${(currentStep / (escrowSteps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {escrowSteps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center" style={{ width: '100px' }}>
              {/* Step Circle */}
              <div 
                className={`
                  w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 border-2
                  ${step.status === 'completed' 
                    ? 'bg-[#64b900] border-[#64b900]' 
                    : step.status === 'active'
                    ? 'bg-white border-[#64b900] ring-4 ring-[#64b900]/20'
                    : 'bg-white border-black/20'
                  }
                `}
              >
                {step.status === 'completed' ? (
                  <Check className="w-6 h-6 text-white" />
                ) : (
                  <span 
                    className={`font-['Geologica:Regular',sans-serif] ${
                      step.status === 'active' ? 'text-[#64b900]' : 'text-black/40'
                    }`}
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    {index + 1}
                  </span>
                )}
              </div>

              {/* Step Label */}
              <p 
                className={`
                  mt-3 text-center text-sm font-['Geologica:Regular',sans-serif]
                  ${step.status === 'completed' || step.status === 'active' 
                    ? 'text-black' 
                    : 'text-black/50'
                  }
                `}
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}