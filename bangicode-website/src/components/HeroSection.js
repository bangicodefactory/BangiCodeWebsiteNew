import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import FloatingLines from './FloatingLines';
import SplitText from './SplitText';

gsap.registerPlugin(ScrollTrigger);

// import digitalSolutions from '../assets/images/digital-solutions.avif';

const HeroSection = () => {
  const { t } = useTranslation();
  const buttonsRef = useRef(null);

  useEffect(() => {
    if (!buttonsRef.current) return;

    const buttons = buttonsRef.current.querySelectorAll('button');
    
    gsap.fromTo(
      buttons,
      { 
        opacity: 0, 
        y: 30,
        scale: 0.9
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: buttonsRef.current,
          start: 'top 90%',
          once: true
        }
      }
    );
  }, []);

  return (
    <section className="relative bg-black py-20 overflow-hidden min-h-screen flex items-center">
      {/* Floating Lines Background */}
      <div className="absolute inset-0 w-full h-full">
        <FloatingLines
          linesGradient={['#1c386b', '#941627', '#0d72b8']}
          enabledWaves={['top', 'middle', 'bottom']}
          lineCount={[6, 8, 6]}
          lineDistance={[5, 5, 5]}
          animationSpeed={1}
          interactive={true}
          bendRadius={5.0}
          bendStrength={-0.5}
          mouseDamping={0.05}
          parallax={true}
          parallaxStrength={0.2}
          mixBlendMode="screen"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center relative z-10">
        <div className="w-full max-w-3xl text-center">
          <SplitText
            text={t('hero.title')}
            tag="h1"
            className="text-4xl md:text-6xl font-bold leading-tight mb-6 text-white"
            delay={50}
            duration={0.8}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 50 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
          />
          <SplitText
            text={t('hero.subtitle')}
            tag="p"
            className="text-lg md:text-xl text-gray-200 mb-8"
            delay={30}
            duration={0.6}
            ease="power2.out"
            splitType="words"
            from={{ opacity: 0, y: 30 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
          />
          <div ref={buttonsRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button onClick={() => {
              const servicesSection = document.getElementById('services');
              if (servicesSection) {
                servicesSection.scrollIntoView({ behavior: 'smooth' });
              }
            }} className="bg-white text-indigo-900 px-8 py-3 rounded-full hover:bg-gray-100 transition font-semibold w-full sm:w-auto">
              {t('hero.explore')}
            </button>
            <button onClick={() => {
              const contactSection = document.getElementById('contact');
              if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
              }
            }} className="border-2 border-white/30 text-white px-8 py-3 rounded-full hover:bg-white/10 transition backdrop-blur-sm w-full sm:w-auto">
              {t('hero.contact')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
