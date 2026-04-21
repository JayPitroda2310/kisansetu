import { Hero } from '../components/Hero';
import { StatsCounter } from '../components/StatsCounter';
import { Services } from '../components/Services';
import { HowItWorks } from '../components/HowItWorks';
import { Testimonials } from '../components/Testimonials';
import { useOutletContext } from 'react-router';
import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function Home() {
  const { onSignupComplete, onLogin } = useOutletContext<{
    onSignupComplete: (signupData: any) => void;
    onLogin: () => void;
  }>();

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button when user scrolls down 300px
      setShowScrollTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Hero onSignupComplete={onSignupComplete} onLogin={onLogin} />
      <StatsCounter />
      <Services />
      <HowItWorks />
      <Testimonials />

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-[#64b900] hover:bg-[#559900] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-6 h-6 group-hover:translate-y-[-2px] transition-transform duration-300" />
        </button>
      )}
    </>
  );
}