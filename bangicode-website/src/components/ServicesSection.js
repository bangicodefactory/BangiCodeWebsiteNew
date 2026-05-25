import { ArrowRight } from 'lucide-react';

const services = [
  { num: '01', slug: 'software',  count: '12 projects', title: 'Custom software',    desc: 'Internal tools, ERPs, POS, school platforms. Laravel · Node · PostgreSQL.' },
  { num: '02', slug: 'ecommerce', count: '5 projects',  title: 'E-commerce',          desc: 'Storefronts, checkout, inventory. Built for Moroccan and EU rails.' },
  { num: '03', slug: 'training',  count: '3 cohorts',   title: 'Technical training',  desc: 'Cohort programs for engineering teams. Hands-on, outcome-graded.' },
  { num: '04', slug: 'social',    count: '4 brands',    title: 'Social presence',     desc: 'Brand-led content, paid acquisition, community. Measured, not vanity.' },
];

const ServicesSection = () => (
  <section id="services" className="px-space-md py-space-2xl md:px-gutter max-w-container-max mx-auto">
    <h2 className="font-headline-md text-headline-md text-primary mb-space-xl">Four practices, one team.</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
      {services.map(({ num, slug, count, title, desc }) => (
        <div
          key={slug}
          className="bg-surface-container-lowest border border-outline-variant rounded-xl p-space-lg flex flex-col hover:border-secondary transition-colors group cursor-pointer"
        >
          <div className="flex justify-between items-start mb-space-md w-full">
            <div className="font-label-caps text-label-caps text-outline lowercase">{num} · {slug}</div>
            <div className="font-label-caps text-label-caps text-secondary lowercase flex items-center gap-1 group-hover:underline">
              {count} <ArrowRight size={14} aria-hidden="true" />
            </div>
          </div>
          <h3 className="font-headline-sm text-headline-sm text-primary mb-space-sm">{title}</h3>
          <p className="font-body-md text-body-md text-on-surface-variant">{desc}</p>
        </div>
      ))}
    </div>
  </section>
);

export default ServicesSection;
