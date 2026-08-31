import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const HeroSection = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date().toLocaleTimeString('en-GB', {
        hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Casablanca',
      });
      setTime(now);
    };
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, []);

  const handleScroll = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="px-space-md py-space-2xl md:py-space-3xl md:px-gutter max-w-container-max mx-auto flex flex-col md:flex-row gap-space-2xl items-start">
      {/* Left copy */}
      <div className="flex-1 flex flex-col gap-space-lg w-full">
        <div className="font-label-mono text-label-mono text-secondary lowercase">
          software studio · tetouan, morocco
        </div>
        <h1 className="font-display-lg-mobile text-display-lg-mobile md:font-display-lg md:text-display-lg text-primary">
          Software studio<br />in Tetouan.<br />
          <span className="text-secondary">Code that ages well.</span>
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
          Five years shipping software for clients across Morocco and Europe. Small senior team — opinionated, accountable end to end. Custom software, e-commerce, training, and social.
        </p>
        <div className="flex flex-col sm:flex-row gap-space-md mt-space-sm w-full">
          <button
            onClick={() => handleScroll('contact')}
            className="inline-flex justify-center items-center gap-space-sm px-space-xl py-space-md bg-primary text-on-primary font-body-md text-body-md font-medium rounded hover:bg-primary-container transition-colors w-full sm:w-auto"
          >
            Start a project <ArrowRight size={18} aria-hidden="true" />
          </button>
          <button
            onClick={() => handleScroll('portfolio')}
            className="inline-flex justify-center items-center px-space-xl py-space-md bg-surface text-primary border border-outline-variant font-body-md text-body-md font-medium rounded hover:bg-surface-container transition-colors w-full sm:w-auto"
          >
            See our work
          </button>
        </div>
        <div className="font-label-mono text-label-mono text-on-surface-variant lowercase mt-space-xs">
          30-min discovery call · we reply within 24h
        </div>
      </div>

      {/* Terminal block */}
      <div className="w-full md:w-80 lg:w-96 bg-primary text-on-primary rounded-xl p-space-lg flex flex-col gap-space-lg shadow-sm shrink-0">
        <div className="flex justify-between items-center border-b border-on-primary-fixed-variant pb-space-sm">
          <div className="font-label-mono text-label-mono text-inverse-primary opacity-70 lowercase">// studio · live</div>
          <div className="flex items-center gap-space-xs font-label-mono text-label-mono text-tertiary-fixed-dim lowercase">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim inline-block" aria-hidden="true"></span> online
          </div>
        </div>
        <div className="flex flex-col gap-space-md">
          <div>
            <div className="font-label-caps text-label-caps text-secondary-fixed-dim lowercase mb-1">current sprint</div>
            <div className="font-label-mono text-label-mono">Friterie.ma iOS app</div>
          </div>
          <div>
            <div className="font-label-caps text-label-caps text-secondary-fixed-dim lowercase mb-1">next availability</div>
            <div className="font-label-mono text-label-mono">late july 2026</div>
          </div>
          <div>
            <div className="font-label-caps text-label-caps text-secondary-fixed-dim lowercase mb-1">team</div>
            <div className="font-label-mono text-label-mono">12 people · 4 practices</div>
          </div>
          <div>
            <div className="font-label-caps text-label-caps text-secondary-fixed-dim lowercase mb-1">local time</div>
            <div className="font-label-mono text-label-mono">{time || '—'} · gmt+1</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
