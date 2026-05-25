import { ArrowRight } from 'lucide-react';

const TestimonialsSection = () => (
  <section className="px-space-md pb-space-2xl md:px-gutter max-w-container-max mx-auto">
    <div
      data-placeholder="true"
      className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-xl flex flex-col md:flex-row gap-space-lg items-start"
    >
      <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary-container font-headline-md text-headline-md shrink-0" aria-hidden="true">
        YB
      </div>
      <div className="flex-1 flex flex-col w-full">
        <blockquote className="font-headline-sm text-headline-sm text-primary mb-space-lg">
          "They shipped what they promised, on the date they promised, and the system has run for two years without us calling them once for a fix. That's rarer than it should be."
        </blockquote>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-space-md">
          <div>
            <div className="font-body-md text-body-md font-medium text-primary">Youssef B.</div>
            <div className="font-label-caps text-label-caps text-on-surface-variant lowercase">director, friterie.ma</div>
          </div>
          <a href="#" className="font-label-mono text-label-mono text-secondary hover:underline flex items-center gap-1 lowercase w-fit">
            read case study <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
