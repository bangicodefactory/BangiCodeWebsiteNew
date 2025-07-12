import './App.css';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import ServicesSection from './components/ServicesSection';
import ProcessSection from './components/ProcessSection';
import AboutSection from './components/AboutSection';
import PortfolioSection from './components/PortfolioSection';
import TestimonialsSection from './components/TestimonialsSection';
import CTASection from './components/CTASection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';

const App = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <div className="bg-white text-gray-800">
        <Navigation />
        <HeroSection />
        <ServicesSection />
        <ProcessSection />
        <AboutSection />
        <PortfolioSection />
        <TestimonialsSection />
        <CTASection />
        <ContactSection />
        <Footer />
      </div>
    </I18nextProvider>
  );
};

export default App;
