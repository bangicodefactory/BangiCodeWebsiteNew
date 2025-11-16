import { useTranslation } from 'react-i18next';
import { useEffect, useRef } from 'react';
import LightRays from './LightRays';
import SplitText from './SplitText';
import { gsap } from 'gsap';

const ProcessSection = () => {
  const { t } = useTranslation();
  const divRef = useRef(null);
  const buttonRef = useRef(null);

  const handleClick = (e) => {
    e.preventDefault();
    
    if (buttonRef.current) {
      gsap.to(buttonRef.current, {
        x: window.innerWidth,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.in',
        onComplete: () => {
          window.open('https://wa.me/212664571370', '_blank');
          gsap.set(buttonRef.current, { x: 0 });
          gsap.to(buttonRef.current, {
            opacity: 1,
            duration: 0.5
          });
        }
      });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('opacity-100', 'translate-y-0');
            entry.target.classList.remove('opacity-0', 'translate-y-10');
          }
        });
      },
      { threshold: 0.1 }
    );

    if (divRef.current) {
      observer.observe(divRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#3b82f6"
          raysSpeed={0.8}
          lightSpread={1.2}
          rayLength={1.5}
          pulsating={false}
          fadeDistance={1.2}
          saturation={0.9}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.1}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="mb-4">
            <SplitText
              text={t('process.title')}
              tag="h2"
              className="text-3xl font-bold text-white"
              delay={40}
              duration={0.7}
              ease="power3.out"
              splitType="chars"
              from={{ opacity: 0, y: 40 }}
              to={{ opacity: 1, y: 0 }}
              threshold={0.2}
            />
          </div>
          <SplitText
            text={t('process.subtitle')}
            tag="p"
            className="max-w-2xl mx-auto text-lg text-gray-300"
            delay={25}
            duration={0.5}
            ease="power2.out"
            splitType="words"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
          />
        </div>

        <div ref={divRef} className="grid grid-cols-1 md:grid-cols-4 gap-8 opacity-0 translate-y-10 transition-all duration-700 ease-out">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/15 transition duration-500 border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-cyan-400 mb-4 font-bold text-lg border border-cyan-400/30">
              01
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{t('process.step1.title')}</h3>
            <p className="text-gray-300">
              {t('process.step1.description')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/15 transition duration-500 border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-cyan-400 mb-4 font-bold text-lg border border-cyan-400/30">
              02
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{t('process.step2.title')}</h3>
            <p className="text-gray-300">
              {t('process.step2.description')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/15 transition duration-500 border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-cyan-400 mb-4 font-bold text-lg border border-cyan-400/30">
              03
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{t('process.step3.title')}</h3>
            <p className="text-gray-300">
              {t('process.step3.description')}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-white/15 transition duration-500 border border-white/20 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 text-cyan-400 mb-4 font-bold text-lg border border-cyan-400/30">
              04
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">{t('process.step4.title')}</h3>
            <p className="text-gray-300">
              {t('process.step4.description')}
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <a 
            ref={buttonRef}
            href="https://wa.me/+212664571370" 
            onClick={handleClick}
            className="bg-white text-indigo-900 px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold w-full sm:w-auto inline-flex items-center justify-center cursor-pointer"
          >
            {t('process.discuss')}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
