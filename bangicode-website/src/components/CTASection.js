import { useTranslation } from 'react-i18next';

const CTASection = () => {
  const { t } = useTranslation();

  const handleGetInTouchClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">{t('cta.title')}</h2>
        <p className="text-xl mb-10 max-w-3xl mx-auto">
          {t('cta.subtitle')}
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button
            className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 transition"
            onClick={handleGetInTouchClick}
          >
            {t('cta.getInTouch')}
          </button>
          <button
            className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md hover:bg-blue-700 transition"
            onClick={() => {
              const servicesSection = document.getElementById('services');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }}
          >
            {t('cta.exploreServices')}
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold">20+</div>
            <div className="text-blue-200">{t('cta.stats.projects')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold">25+</div>
            <div className="text-blue-200">{t('cta.stats.clients')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold">5+</div>
            <div className="text-blue-200">{t('cta.stats.experience')}</div>
          </div>
          <div>
            <div className="text-4xl font-bold">24/7</div>
            <div className="text-blue-200">{t('cta.stats.support')}</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
