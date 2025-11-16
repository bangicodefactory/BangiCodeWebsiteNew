import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const Navigation = () => {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false); 
  };

  // Smooth scroll handler
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false); // Close mobile menu on navigation
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-5">
      <div className="max-w-7xl mx-auto bg-[rgba(15,15,35,0.8)] backdrop-blur-lg rounded-[50px] border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3 ">
            <img 
              src="/logo.png" 
              alt="Bangicode Logo" 
              className="h-6 w-auto"
            />
          </div>

          <div className="hidden md:flex items-center space-x-8 rtl:space-x-reverse">
            <a href="#services" onClick={e => handleSmoothScroll(e, 'services')} className="text-white text-[15px] font-medium hover:text-blue-400 transition-all duration-300">{t('navigation.services')}</a>
            <a href="#about" onClick={e => handleSmoothScroll(e, 'about')} className="text-white text-[15px] font-medium hover:text-blue-400 transition-all duration-300">{t('navigation.about')}</a>
            <a href="#portfolio" onClick={e => handleSmoothScroll(e, 'portfolio')} className="text-white text-[15px] font-medium hover:text-blue-400 transition-all duration-300">{t('navigation.portfolio')}</a>
            <a href="#contact" onClick={e => handleSmoothScroll(e, 'contact')} className="text-white text-[15px] font-medium hover:text-blue-400 transition-all duration-300">{t('navigation.contact')}</a>
            <button onClick={e => handleSmoothScroll(e, 'contact')} className="bg-blue-500 text-white px-6 py-2 rounded-full hover:bg-blue-600 transition-all duration-300 font-medium">
              {t('navigation.getStarted')}
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => changeLanguage('en')} className="text-white hover:text-blue-400 transition-all duration-300 font-medium">EN</button>
              <span className="text-white/30">|</span>
              <button onClick={() => changeLanguage('fr')} className="text-white hover:text-blue-400 transition-all duration-300 font-medium">FR</button>
              <span className="text-white/30">|</span>
              <button onClick={() => changeLanguage('ar')} className="text-white hover:text-blue-400 transition-all duration-300 font-medium">AR</button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-4 bg-[rgba(15,15,35,0.95)] backdrop-blur-lg rounded-3xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] mx-4">
          <div className="px-4 pt-4 pb-4 space-y-2">
            <a href="#services" onClick={e => handleSmoothScroll(e, 'services')} className="block px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-300">{t('navigation.services')}</a>
            <a href="#about" onClick={e => handleSmoothScroll(e, 'about')} className="block px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-300">{t('navigation.about')}</a>
            <a href="#portfolio" onClick={e => handleSmoothScroll(e, 'portfolio')} className="block px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-300">{t('navigation.portfolio')}</a>
            <a href="#contact" onClick={e => handleSmoothScroll(e, 'contact')} className="block px-4 py-3 rounded-xl text-base font-medium text-white hover:bg-white/10 transition-all duration-300">{t('navigation.contact')}</a>
            
            {/* Language Buttons in Mobile Menu */}
            <div className="flex items-center justify-center gap-4 px-4 py-3">
              <button onClick={() => changeLanguage('en')} className="text-white hover:text-blue-400 transition-all duration-300 font-medium">EN</button>
              <span className="text-white/30">|</span>
              <button onClick={() => changeLanguage('fr')} className="text-white hover:text-blue-400 transition-all duration-300 font-medium">FR</button>
              <span className="text-white/30">|</span>
              <button onClick={() => changeLanguage('ar')} className="text-white hover:text-blue-400 transition-all duration-300 font-medium">AR</button>
            </div>
            
            <button onClick={e => handleSmoothScroll(e, 'contact')} className="mt-2 w-full text-center bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 transition-all duration-300 font-medium">
              {t('navigation.getStarted')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
