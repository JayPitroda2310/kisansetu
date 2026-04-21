import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Rajesh Kumar',
    location: 'Punjab',
    rating: 5,
    text: 'KisanSetu has transformed my farming business. I can now rent modern equipment without huge investment. My productivity has increased by 40%!',
    crop: 'Wheat & Rice Farmer'
  },
  {
    name: 'Priya Patel',
    location: 'Gujarat',
    rating: 5,
    text: 'The market price feature helps me sell my produce at the right time. I no longer rely on middlemen and earn 30% more profit.',
    crop: 'Cotton Farmer'
  },
  {
    name: 'Suresh Yadav',
    location: 'Maharashtra',
    rating: 5,
    text: 'Excellent platform! The drone services helped me identify crop diseases early. The expert consultation is also very helpful.',
    crop: 'Sugarcane Farmer'
  },
  {
    name: 'Anita Singh',
    location: 'Uttar Pradesh',
    rating: 5,
    text: 'Easy to use app and great customer support. Equipment delivery is always on time. Highly recommended for all farmers!',
    crop: 'Vegetable Farmer'
  }
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">What Farmers </span>
            <span className="text-[#64b900]">Say</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Hear from farmers across India who are growing with KisanSetu
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow relative"
            >
              {/* Quote Icon */}
              <div className="absolute top-4 right-4 text-[#64b900]/20">
                <Quote className="w-8 h-8" />
              </div>

              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#fd0] text-[#fd0]" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="font-['Geologica:Regular',sans-serif] text-black/80 mb-6 text-sm" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                "{testimonial.text}"
              </p>

              {/* Author Info */}
              <div className="border-t border-black/10 pt-4">
                <p className="font-['Geologica:Regular',sans-serif]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {testimonial.name}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-black/60" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {testimonial.crop}
                </p>
                <p className="font-['Geologica:Regular',sans-serif] text-sm text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}