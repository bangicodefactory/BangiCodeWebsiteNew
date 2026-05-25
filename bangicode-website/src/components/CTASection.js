import { ArrowRight } from 'lucide-react';

const CTASection = () => (
  <section id="contact" className="px-space-md pb-space-3xl md:px-gutter max-w-container-max mx-auto w-full">
    <div className="bg-surface-container-low rounded-xl p-space-xl md:p-space-2xl flex flex-col md:flex-row items-center md:items-start gap-space-lg md:gap-space-2xl w-full">
      <div
        className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-on-primary font-display-lg text-display-lg shrink-0"
        aria-hidden="true"
      >
        A
      </div>
      <div className="flex-1 flex flex-col w-full text-center md:text-left">
        <h3 className="font-headline-md text-headline-md text-primary mb-space-sm">Talk to Ahmed — founder.</h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-space-xl max-w-2xl">
          Skip the form. 30-min call, every Tuesday and Thursday. I'll tell you straight whether we're the right team for your project.
        </p>
      </div>
      <div className="flex flex-col items-center md:items-end shrink-0 w-full md:w-auto">
        <a
          href="https://cal.com/bangicode"
          target="_blank"
          rel="noreferrer"
          className="inline-flex justify-center items-center gap-2 px-space-2xl py-space-md bg-primary text-on-primary font-body-md text-body-md font-medium rounded-lg hover:bg-primary-container transition-colors w-full md:w-auto mb-space-sm"
        >
          Book 30 min <ArrowRight size={18} aria-hidden="true" />
        </a>
        <div className="font-label-mono text-[10px] text-on-surface-variant lowercase text-center md:text-right w-full">
          or whatsapp · admin@bangicode.ma
        </div>
      </div>
    </div>
  </section>
);

export default CTASection;
