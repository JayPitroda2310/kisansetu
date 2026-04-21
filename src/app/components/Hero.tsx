import { Link } from 'react-router';
import { useState } from 'react';
import { LoginModal } from './LoginModal';
import { SignUpModal } from './SignUpModal';
import { Menu, X } from 'lucide-react';
import logoSvg from '../imports/Logo-2.svg';
import heroBg from 'figma:asset/adaf9936451e7352fae43c59e4833aa9dba0f270.png';

export function Hero({ onSignupComplete, onLogin }: { onSignupComplete?: (signupData: any) => void; onLogin?: () => void }) {
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signUpModalOpen, setSignUpModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLoginClick = () => {
    setLoginModalOpen(true);
  };

  const handleSignUpClick = () => {
    setSignUpModalOpen(true);
  };

  const handleSwitchToSignUp = () => {
    setLoginModalOpen(false);
    setSignUpModalOpen(true);
  };

  const handleSwitchToLogin = () => {
    setSignUpModalOpen(false);
    setLoginModalOpen(true);
  };

  const handleSignUpComplete = (signupData: any) => {
    setSignUpModalOpen(false);
    onSignupComplete?.(signupData);
  };

  const handleLoginSuccess = () => {
    setLoginModalOpen(false);
    onLogin?.();
  };

  return (
    <section className="bg-[#fefaf0] min-h-screen relative w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full z-0"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header Navigation */}
        <header className="relative z-20 px-6 sm:px-8 lg:px-12 py-6 lg:py-8 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src={logoSvg} 
              alt="KisanSetu" 
              className="h-[32px] sm:h-[38px] lg:h-[44px] w-auto object-contain"
            />
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-8">
            <Link 
              to="/" 
              className="font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:text-[#64b900] transition-colors"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Home
            </Link>
            <Link 
              to="/features" 
              className="font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:text-[#64b900] transition-colors"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Features
            </Link>
            <Link 
              to="/market-rates" 
              className="font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:text-[#64b900] transition-colors"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Market Rates
            </Link>
            <Link 
              to="/government-schemes" 
              className="font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:text-[#64b900] transition-colors"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Schemes
            </Link>
          </nav>

          {/* Auth Buttons - Desktop */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={handleLoginClick}
              className="bg-[#64b900] text-white px-6 h-[40px] rounded-[10px] font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] hover:bg-[#559900] transition-colors"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Login
            </button>
            <button 
              onClick={handleSignUpClick}
              className="bg-white text-black px-6 h-[40px] rounded-[10px] font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] hover:bg-gray-50 transition-colors border-[1.6px] border-[rgba(0,0,0,0.1)]"
              style={{ fontVariationSettings: "'CRSV' 0, 'SHRP' 0" }}
            >
              Sign Up
            </button>
          </div>

          {/* Mobile Hamburger Menu Button */}
          <button 
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 backdrop-blur-sm hover:bg-white transition-colors shadow-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={20} className="text-black" /> : <Menu size={20} className="text-black" />}
          </button>
        </header>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-[80px] left-6 right-6 bg-white shadow-xl z-30 border border-gray-200 rounded-lg overflow-hidden animate-dropdown">
            <nav className="flex flex-col py-2">
              <Link 
                to="/" 
                className="px-6 py-3 font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:bg-[#64b900]/10 hover:text-[#64b900] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/features" 
                className="px-6 py-3 font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:bg-[#64b900]/10 hover:text-[#64b900] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                to="/market-rates" 
                className="px-6 py-3 font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:bg-[#64b900]/10 hover:text-[#64b900] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Market Rates
              </Link>
              <Link 
                to="/government-schemes" 
                className="px-6 py-3 font-['Geologica:Regular',sans-serif] text-[16px] leading-[24px] text-black hover:bg-[#64b900]/10 hover:text-[#64b900] transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Schemes
              </Link>
            </nav>
          </div>
        )}

        <style>{`
          @keyframes dropdown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-dropdown {
            animation: dropdown 0.3s ease-out forwards;
          }
        `}</style>

        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-8 lg:px-12 py-12 lg:py-0 -mt-48 lg:-mt-64">
          {/* Heading */}
          <div className="text-center mb-8 lg:mb-12">
            <h1 className="font-['Fraunces',sans-serif] text-[48px] sm:text-[56px] lg:text-[64px] xl:text-[72px] leading-[1.15] font-normal mb-0" style={{ fontVariationSettings: "'SOFT' 0, 'WONK' 1" }}>
              <span className="block">
                <span className="text-black">Empowering </span>
                <span className="text-[#64b900]">Farmers</span>
              </span>
              <span className="block">
                <span className="text-black">Through </span>
                <span className="text-[#64b900]">Technology</span>
              </span>
            </h1>
          </div>

          {/* Mobile Auth Buttons - Below Heading */}
          <div className="lg:hidden flex gap-4 mt-8">
            <button 
              onClick={handleLoginClick}
              className="bg-[#64b900] text-white px-8 h-[44px] rounded-[10px] font-['Geologica:Regular',sans-serif] text-[16px] hover:bg-[#559900] transition-colors shadow-md"
            >
              Login
            </button>
            <button 
              onClick={handleSignUpClick}
              className="bg-white text-black px-8 h-[44px] rounded-[10px] font-['Geologica:Regular',sans-serif] text-[16px] hover:bg-gray-50 transition-colors border-[1.6px] border-[rgba(0,0,0,0.1)] shadow-md"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <LoginModal 
        isOpen={loginModalOpen} 
        onClose={() => setLoginModalOpen(false)}
        onSwitchToSignUp={handleSwitchToSignUp}
        onLogin={handleLoginSuccess}
      />
      <SignUpModal 
        isOpen={signUpModalOpen} 
        onClose={() => setSignUpModalOpen(false)}
        onSwitchToLogin={handleSwitchToLogin}
        onSignupComplete={handleSignUpComplete}
      />
    </section>
  );
}