import { useTranslation } from 'react-i18next';
// import digitalSolutions from '../assets/images/digital-solutions.avif';

const HeroSection = () => {
  const { t } = useTranslation();

  return (
    <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            {t('hero.title')}
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            {t('hero.subtitle')}
          </p>
          <div className="flex space-x-4">
            <button onClick={() => {
              const servicesSection = document.getElementById('services');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
              {t('hero.explore')}
            </button>
            <button onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition">
              {t('hero.contact')}
            </button>
          </div>
        </div>
        <div className="md:w-1/2">
          {/* <img src={digitalSolutions} alt="Digital Solutions" className="rounded-lg shadow-lg" /> */}
          <video 
            className="rounded-lg shadow-lg object-cover"
            style={{ width: '800px', height: '450px' }}
            autoPlay 
            loop 
            muted 
            playsInline
          >
            <source src="/videos/video1.mp4" type="video/mp4" />
            <source src="/videos/video1.webm" type="video/webm" />
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
