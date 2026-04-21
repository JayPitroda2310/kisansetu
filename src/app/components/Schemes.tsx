import { FileText, ExternalLink, CheckCircle } from 'lucide-react';

const schemes = [
  {
    title: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Direct income support of ₹6,000 per year to all farmer families in three equal installments.',
    benefits: [
      '₹2,000 per installment',
      'Direct bank transfer',
      'No income limit'
    ],
    eligibility: 'All landholding farmers',
    link: 'https://pmkisan.gov.in/'
  },
  {
    title: 'PMFBY',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Comprehensive crop insurance scheme protecting farmers from crop loss due to natural calamities.',
    benefits: [
      'Low premium rates',
      'Coverage for all stages',
      'Quick claim settlement'
    ],
    eligibility: 'All farmers growing notified crops',
    link: 'https://pmfby.gov.in/'
  },
  {
    title: 'KCC',
    fullName: 'Kisan Credit Card',
    description: 'Credit facility for agricultural needs including cultivation, maintenance, and consumption requirements.',
    benefits: [
      'Low interest rate (4%)',
      'Flexible repayment',
      'Additional 3% interest subvention'
    ],
    eligibility: 'Farmers owning cultivable land',
    link: 'https://www.myscheme.gov.in/schemes/kcc'
  },
  {
    title: 'Soil Health Card',
    fullName: 'Soil Health Card Scheme',
    description: 'Provides soil nutrient status and recommendations to improve soil health and productivity.',
    benefits: [
      'Free soil testing',
      'Customized recommendations',
      'Improved crop yield'
    ],
    eligibility: 'All farmers',
    link: 'https://www.soilhealth.dac.gov.in/home'
  },
  {
    title: 'PMKSY',
    fullName: 'Pradhan Mantri Krishi Sinchayee Yojana',
    description: 'Aims to expand cultivated area with assured irrigation and improve water use efficiency.',
    benefits: [
      'Subsidy on drip irrigation',
      'Watershed development',
      'Per drop more crop'
    ],
    eligibility: 'Individual/Group farmers',
    link: 'https://pmksy.gov.in/'
  },
  {
    title: 'e-NAM',
    fullName: 'National Agriculture Market',
    description: 'Online trading platform for agricultural commodities ensuring better price discovery.',
    benefits: [
      'Transparent pricing',
      'Pan-India market access',
      'Reduced transaction costs'
    ],
    eligibility: 'All registered farmers',
    link: 'https://enam.gov.in/web/'
  }
];

export function Schemes() {
  return (
    <section id="schemes" className="py-20 px-4 sm:px-6 lg:px-8 bg-[#fefaf0]">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Government </span>
            <span className="text-[#64b900]">Schemes</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Explore various government schemes designed to support and empower farmers
          </p>
        </div>

        {/* Schemes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {schemes.map((scheme, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-[#64b900] flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="bg-[#64b900] p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Title */}
              <h3 className="font-['Geologica:Regular',sans-serif] text-2xl mb-2 text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {scheme.title}
              </h3>
              <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/70 mb-3" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {scheme.fullName}
              </p>

              {/* Description */}
              <p className="font-['Geologica:Regular',sans-serif] text-black/80 mb-4 text-sm flex-grow" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                {scheme.description}
              </p>

              {/* Benefits */}
              <div className="mb-4">
                <p className="font-['Geologica:Regular',sans-serif] text-sm mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Key Benefits:
                </p>
                <ul className="space-y-2">
                  {scheme.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#64b900] flex-shrink-0 mt-0.5" />
                      <span className="font-['Geologica:Regular',sans-serif] text-sm text-black/70" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                        {benefit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility */}
              <div className="mb-4 p-3 bg-[#fefaf0] rounded-lg">
                <p className="font-['Geologica:Regular',sans-serif] text-xs text-black/60 mb-1" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  Eligibility:
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/80" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {scheme.eligibility}
                </p>
              </div>

              {/* Action Button */}
              <a 
                href={scheme.link}
                target={scheme.link !== '#' ? '_blank' : undefined}
                rel={scheme.link !== '#' ? 'noopener noreferrer' : undefined}
                className="w-full bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors flex items-center justify-center gap-2 mt-auto" 
                style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
              >
                Learn More
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="font-['Geologica:Regular',sans-serif] text-black/70 mb-4" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Need help applying for these schemes?
          </p>
          <button className="bg-[#64b900] text-white px-8 py-3 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors text-lg" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Contact Our Support Team
          </button>
        </div>
      </div>
    </section>
  );
}