import { FileText, ExternalLink, CheckCircle, IndianRupee, Sprout, Droplets, CreditCard, Building2, Users } from 'lucide-react';

const schemes = [
  {
    title: 'PM-KISAN',
    fullName: 'Pradhan Mantri Kisan Samman Nidhi',
    description: 'Direct income support of ₹6,000 per year to all farmer families in three equal installments.',
    benefits: [
      '₹2,000 per installment',
      'Direct bank transfer',
      'No income limit',
      'All landholding farmers eligible'
    ],
    eligibility: 'All landholding farmers across India',
    link: 'https://pmkisan.gov.in/',
    category: 'Financial Support',
    icon: IndianRupee
  },
  {
    title: 'PMFBY',
    fullName: 'Pradhan Mantri Fasal Bima Yojana',
    description: 'Comprehensive crop insurance scheme protecting farmers from crop loss due to natural calamities.',
    benefits: [
      'Low premium rates (2% for Kharif, 1.5% for Rabi)',
      'Coverage for all stages of crop cycle',
      'Quick claim settlement',
      'Protection against natural disasters'
    ],
    eligibility: 'All farmers growing notified crops in notified areas',
    link: 'https://pmfby.gov.in/',
    category: 'Insurance',
    icon: FileText
  },
  {
    title: 'KCC',
    fullName: 'Kisan Credit Card',
    description: 'Credit facility for agricultural needs including cultivation, maintenance, and consumption requirements.',
    benefits: [
      'Low interest rate (4% per annum)',
      'Flexible repayment schedule',
      'Additional 3% interest subvention',
      'Insurance coverage included'
    ],
    eligibility: 'Farmers owning cultivable land',
    link: 'https://www.myscheme.gov.in/schemes/kcc',
    category: 'Credit',
    icon: CreditCard
  },
  {
    title: 'Soil Health Card',
    fullName: 'Soil Health Card Scheme',
    description: 'Provides soil nutrient status and recommendations to improve soil health and productivity.',
    benefits: [
      'Free soil testing',
      'Customized fertilizer recommendations',
      'Improved crop yield',
      'Reduced input costs'
    ],
    eligibility: 'All farmers',
    link: 'https://www.soilhealth.dac.gov.in/home',
    category: 'Technical Support',
    icon: Sprout
  },
  {
    title: 'PMKSY',
    fullName: 'Pradhan Mantri Krishi Sinchayee Yojana',
    description: 'Aims to expand cultivated area with assured irrigation and improve water use efficiency.',
    benefits: [
      'Subsidy on drip and sprinkler irrigation',
      'Watershed development support',
      'Per drop more crop initiative',
      'Micro-irrigation promotion'
    ],
    eligibility: 'Individual/Group farmers having water source',
    link: 'https://pmksy.gov.in/',
    category: 'Irrigation',
    icon: Droplets
  },
  {
    title: 'e-NAM',
    fullName: 'National Agriculture Market',
    description: 'Online trading platform for agricultural commodities ensuring better price discovery.',
    benefits: [
      'Transparent pricing mechanism',
      'Pan-India market access',
      'Reduced transaction costs',
      'Direct buyer-farmer connection'
    ],
    eligibility: 'All registered farmers and traders',
    link: 'https://enam.gov.in/web/',
    category: 'Marketing',
    icon: Building2
  },
  {
    title: 'PMKVY',
    fullName: 'PM Kaushal Vikas Yojana (Agriculture Sector)',
    description: 'Skill development program for farmers and agricultural workers to enhance their capabilities.',
    benefits: [
      'Free training programs',
      'Certification upon completion',
      'Placement assistance',
      'Modern farming techniques'
    ],
    eligibility: 'Farmers and agricultural workers',
    link: 'https://www.msde.gov.in/pmkvy.html',
    category: 'Skill Development',
    icon: Users
  },
  {
    title: 'PKVY',
    fullName: 'Paramparagat Krishi Vikas Yojana',
    description: 'Promotes organic farming and certification to improve soil health and organic product value.',
    benefits: [
      '₹50,000 per hectare support',
      'Organic certification assistance',
      'Training on organic practices',
      'Market linkage support'
    ],
    eligibility: 'Farmers willing to adopt organic farming',
    link: 'https://pgsindia-ncof.gov.in/',
    category: 'Organic Farming',
    icon: Sprout
  },
  {
    title: 'MIDH',
    fullName: 'Mission for Integrated Development of Horticulture',
    description: 'Comprehensive program for holistic growth of horticulture sector covering fruits, vegetables, and flowers.',
    benefits: [
      'Subsidy on planting material',
      'Protected cultivation support',
      'Post-harvest management',
      'Market infrastructure development'
    ],
    eligibility: 'Farmers engaged in horticulture',
    link: 'https://hortnet.gov.in/',
    category: 'Horticulture',
    icon: Sprout
  }
];

export default function GovernmentSchemesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Government </span>
            <span className="text-[#64b900]">Schemes</span>
          </h1>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-3xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Explore various government initiatives designed to support farmers and boost agricultural development across India
          </p>
        </div>
      </section>

      {/* Schemes Grid */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-[#fefaf0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {schemes.map((scheme, index) => {
              const Icon = scheme.icon;
              return (
                <div 
                  key={index}
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border-2 border-transparent hover:border-[#64b900] flex flex-col"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-[#64b900] p-3 rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-[#fefaf0] text-xs rounded-full font-['Geologica:Regular',sans-serif] text-black/70">
                      {scheme.category}
                    </span>
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
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-[#64b900] text-white py-2.5 rounded-lg font-['Geologica:Regular',sans-serif] hover:bg-[#559900] transition-colors flex items-center justify-center gap-2 mt-auto" 
                    style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
                  >
                    Learn More & Apply
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}