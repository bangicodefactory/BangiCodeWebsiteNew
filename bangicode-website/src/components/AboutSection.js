import { useTranslation } from 'react-i18next';
import SplitText from './SplitText';
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
          <div className="md:w-1/2 md:pl-12 rtl:md:pl-0 rtl:md:pr-12">
            <div className="mb-4 text-center">
              <SplitText
                text={t('about.title')}
                tag="h2"
                className="text-3xl font-bold text-gray-900"
                delay={40}
                duration={0.7}
                ease="power3.out"
                splitType="chars"
                from={{ opacity: 0, y: 40 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.2}
              />
            </div>
            
            <div className="mb-6">
              <SplitText
                text={t('about.p1')}
                tag="p"
                className="text-gray-600"
                delay={20}
                duration={0.5}
                ease="power2.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.2}
              />
            </div>

            <div className="mb-6">
              <SplitText
                text={t('about.p2')}
                tag="p"
                className="text-gray-600"
                delay={20}
                duration={0.5}
                ease="power2.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.2}
              />
            </div>

            <div className="mb-6">
              <SplitText
                text={t('about.p3')}
                tag="p"
                className="text-gray-600"
                delay={20}
                duration={0.5}
                ease="power2.out"
                splitType="words"
                from={{ opacity: 0, y: 20 }}
                to={{ opacity: 1, y: 0 }}
                threshold={0.2}
              />
            </div>

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
