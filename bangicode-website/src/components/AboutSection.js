import { useTranslation } from 'react-i18next';
import teamImage from '../assets/images/Team.PNG';

const AboutSection = () => {
  const { t } = useTranslation();

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <img src={teamImage} alt="Bangicode Team" className="rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 md:pl-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('about.title')}</h2>
            <p className="text-gray-600 mb-6">
              {t('about.p1')}
            </p>

            <p className="text-gray-600 mb-6">
              {t('about.p2')}
            </p>

            <p className="text-gray-600 mb-6">
              {t('about.p3')}
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">20+</div>
                <div className="text-gray-600">{t('about.stats.clients')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24+</div>
                <div className="text-gray-600">{t('about.stats.projects')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">5+</div>
                <div className="text-gray-600">{t('about.stats.experience')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">{t('about.stats.support')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
