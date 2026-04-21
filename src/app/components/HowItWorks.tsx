import { UserPlus, Search, CreditCard, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    step: '01',
    title: 'Sign Up',
    description: 'Create your free account in minutes. Simple registration process designed for farmers.'
  },
  {
    icon: Search,
    step: '02',
    title: 'Browse Services',
    description: 'Explore our wide range of equipment, services, and market opportunities.'
  },
  {
    icon: CreditCard,
    step: '03',
    title: 'Book & Pay',
    description: 'Select your service, choose your dates, and make secure payments online.'
  },
  {
    icon: CheckCircle,
    step: '04',
    title: 'Get Service',
    description: 'Receive equipment or service at your location. Start farming smarter!'
  }
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fefaf0]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">How It </span>
            <span className="text-[#64b900]">Works</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Get started with KisanSetu in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative flex flex-col items-center">
              <div className="flex items-center w-full">
                {/* Icon Circle */}
                <div className="bg-[#64b900] w-32 h-32 rounded-full flex items-center justify-center relative z-10 shadow-lg mx-auto">
                  <step.icon className="w-16 h-16 text-white" />
                </div>
                
                {/* Connecting line to next step */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute left-[calc(50%+80px)] w-[calc(100%-160px+32px)] h-1 bg-[#64b900] top-16"></div>
                )}
              </div>

              <div className="flex flex-col items-center text-center mt-6">
                {/* Step Number */}
                <div className="font-['Fraunces',sans-serif] text-6xl text-[#ffd700] mb-4 opacity-70">
                  {step.step}
                </div>

                {/* Step Title */}
                <h3 className="font-['Geologica:Regular',sans-serif] text-xl mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="font-['Geologica:Regular',sans-serif] text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="bg-[#64b900] text-white px-12 py-4 rounded-[10px] font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors text-lg">
            Get Started Today
          </button>
        </div>
      </div>
    </section>
  );
}