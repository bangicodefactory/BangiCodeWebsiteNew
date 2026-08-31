import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import SplitText from './SplitText';
import Stack from './Stack';
import teamImage from '../assets/images/Team.PNG';
import digitalSolutionsImage from '../assets/images/center1.jpeg';
import logoImperialImage from '../assets/images/center2.jpeg';

const AboutSection = () => {
  const { t } = useTranslation();
  const [cardSize, setCardSize] = useState({ width: 400, height: 400 });

  const teamCards = [
    { id: 1, img: teamImage },
    { id: 2, img: digitalSolutionsImage },
    { id: 3, img: logoImperialImage }
  ];

  useEffect(() => {
    const updateCardSize = () => {
      if (window.innerWidth < 640) {
        // Mobile
        setCardSize({ width: 250, height: 250 });
      } else if (window.innerWidth < 768) {
        // Small tablet
        setCardSize({ width: 300, height: 300 });
      } else {
        // Desktop
        setCardSize({ width: 400, height: 400 });
      }
    };

    updateCardSize();
    window.addEventListener('resize', updateCardSize);
    return () => window.removeEventListener('resize', updateCardSize);
  }, []);

  return (
    <section id="about" className="py-20 relative" style={{ background: 'linear-gradient(90deg, rgba(28, 56, 107, 1) 0%, rgba(7, 11, 22, 1) 50%, rgba(13, 114, 184, 1) 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="w-full md:w-1/2 mb-10 md:mb-0 flex justify-center">
            <Stack 
              cardsData={teamCards}
              cardDimensions={cardSize}
              randomRotation={true}
              sensitivity={150}
              sendToBackOnClick={true}
              animationConfig={{ stiffness: 260, damping: 20 }}
            />
          </div>
          <div className="md:w-1/2 md:pl-12 rtl:md:pl-0 rtl:md:pr-12">
            <div className="mb-4 text-center">
              <SplitText
                text={t('about.title')}
                tag="h2"
                className="text-2xl sm:text-3xl font-bold text-white"
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
                className="text-sm sm:text-base text-gray-300"
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
                className="text-sm sm:text-base text-gray-300"
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
                className="text-sm sm:text-base text-gray-300"
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
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">20+</div>
                <div className="text-xs sm:text-sm text-gray-300">{t('about.stats.clients')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">24+</div>
                <div className="text-xs sm:text-sm text-gray-300">{t('about.stats.projects')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">5+</div>
                <div className="text-xs sm:text-sm text-gray-300">{t('about.stats.experience')}</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-bold text-blue-400">24/7</div>
                <div className="text-xs sm:text-sm text-gray-300">{t('about.stats.support')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
