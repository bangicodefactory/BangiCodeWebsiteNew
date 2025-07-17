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
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* <span className="font-bold text-xl text-blue-600">Bangicode</span> */}
        <img 
                src="/logo.png" 
                alt="Bangicode Logo" 
                className="h-8 w-auto"
              />

          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" onClick={e => handleSmoothScroll(e, 'services')} className="text-gray-700 hover:text-blue-600 transition">{t('navigation.services')}</a>
            <a href="#about" onClick={e => handleSmoothScroll(e, 'about')} className="text-gray-700 hover:text-blue-600 transition">{t('navigation.about')}</a>
            <a href="#portfolio" onClick={e => handleSmoothScroll(e, 'portfolio')} className="text-gray-700 hover:text-blue-600 transition">{t('navigation.portfolio')}</a>
            <a href="#contact" onClick={e => handleSmoothScroll(e, 'contact')} className="text-gray-700 hover:text-blue-600 transition">{t('navigation.contact')}</a>
            <button onClick={e => handleSmoothScroll(e, 'contact')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              {t('navigation.getStarted')}
            </button>
            <div className="flex items-center">
              <button onClick={() => changeLanguage('en')} className="text-gray-700 hover:text-blue-600 transition">EN</button>
              <span className="mx-2 text-gray-300">|</span>
              <button onClick={() => changeLanguage('fr')} className="text-gray-700 hover:text-blue-600 transition">FR</button>
              <span className="mx-2 text-gray-300">|</span>
              <button onClick={() => changeLanguage('ar')} className="text-gray-700 hover:text-blue-600 transition">AR</button>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#services" onClick={e => handleSmoothScroll(e, 'services')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">{t('navigation.services')}</a>
            <a href="#about" onClick={e => handleSmoothScroll(e, 'about')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">{t('navigation.about')}</a>
            <a href="#portfolio" onClick={e => handleSmoothScroll(e, 'portfolio')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">{t('navigation.portfolio')}</a>
            {/* <a href="#testimonials" onClick={e => handleSmoothScroll(e, 'testimonials')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">{t('navigation.testimonials')}</a> */}
            <a href="#contact" onClick={e => handleSmoothScroll(e, 'contact')} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">{t('navigation.contact')}</a>
            
            {/* Language Buttons in Mobile Menu */}
            <div className="flex items-center justify-center space-x-4 px-3 py-2">
              <button onClick={() => changeLanguage('en')} className="text-gray-700 hover:text-blue-600 transition font-medium">EN</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => changeLanguage('fr')} className="text-gray-700 hover:text-blue-600 transition font-medium">FR</button>
              <span className="text-gray-300">|</span>
              <button onClick={() => changeLanguage('ar')} className="text-gray-700 hover:text-blue-600 transition font-medium">AR</button>
            </div>
            
            <button onClick={e => handleSmoothScroll(e, 'contact')} className="mt-2 w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              {t('navigation.getStarted')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
