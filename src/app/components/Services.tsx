import { ImageWithFallback } from './figma/ImageWithFallback';

const services = [
  {
    title: 'Equipment Rental',
    description: 'Rent tractors, harvesters, and other farming equipment at competitive prices.',
    image: 'https://images.unsplash.com/photo-1763416160482-c77fadd32d3f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjB0cmFjdG9yJTIwZXF1aXBtZW50fGVufDF8fHx8MTc3MDYxOTU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: '₹500/day'
  },
  {
    title: 'Drone Services',
    description: 'Advanced drone technology for crop monitoring and precision agriculture.',
    image: 'https://images.unsplash.com/photo-1720071702672-d18c69cb475c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkcm9uZSUyMGZhcm1pbmclMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MDYxOTU2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: '₹2000/acre'
  },
  {
    title: 'Market Connect',
    description: 'Direct access to buyers and get the best prices for your produce.',
    image: 'https://images.unsplash.com/photo-1764784290159-a8ed4b30edcf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZ3JpY3VsdHVyYWwlMjBtYXJrZXQlMjBwcm9kdWNlfGVufDF8fHx8MTc3MDYxOTU2OHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: 'Free'
  },
  {
    title: 'Expert Consultation',
    description: 'Get advice from agricultural experts to improve your farming practices.',
    image: 'https://images.unsplash.com/photo-1623211269755-569fec0536d2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmRpYW4lMjBmYXJtZXIlMjBmaWVsZCUyMGFncmljdWx0dXJlfGVufDF8fHx8MTc3MDU3ODM5NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
    price: '₹300/session'
  }
];

export function Services() {
  return (
    <section id="services" className="py-12 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-['Fraunces',sans-serif] text-4xl md:text-5xl mb-4">
            <span className="text-black">Our </span>
            <span className="text-[#64b900]">Services</span>
          </h2>
          <p className="font-['Geologica:Regular',sans-serif] text-lg text-black/70 max-w-2xl mx-auto" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
            Comprehensive solutions tailored for modern farming needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow flex flex-col"
            >
              <div className="h-48 overflow-hidden">
                <ImageWithFallback
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-['Geologica:Regular',sans-serif] text-xl mb-2" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {service.title}
                </h3>
                <p className="font-['Geologica:Regular',sans-serif] text-black/70 mb-4 text-sm flex-grow" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-['Geologica:Regular',sans-serif] text-[#64b900]" style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}>
                    {service.price}
                  </span>
                  <button className="bg-[#64b900] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#559900] transition-colors">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}