import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import StatsSection from './components/StatsSection';
import TrustBar from './components/TrustBar';
import ServicesSection from './components/ServicesSection';
import PortfolioSection from './components/PortfolioSection';
import TestimonialsSection from './components/TestimonialsSection';
import ProcessSection from './components/ProcessSection';
import CTASection from './components/CTASection';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';

const LocaleSync = () => {
  useEffect(() => {
    const sync = (lng) => {
      document.documentElement.lang = lng;
      document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    };
    sync(i18n.language);
    i18n.on('languageChanged', sync);
    return () => i18n.off('languageChanged', sync);
  }, []);
  return null;
};

const App = () => (
  <I18nextProvider i18n={i18n}>
    <LocaleSync />
    <div className="bg-background text-on-background antialiased w-full">
      <Navigation />
      <main className="w-full">
        <HeroSection />
        <StatsSection />
        <TrustBar />
        <ServicesSection />
        <PortfolioSection />
        <TestimonialsSection />
        <ProcessSection />
        <CTASection />
      </main>
      <Footer />
      <WhatsAppButton phoneNumber="+212664571370" message="Hi! I'd like to know more about your services." />
    </div>
  </I18nextProvider>
);

export default App;
