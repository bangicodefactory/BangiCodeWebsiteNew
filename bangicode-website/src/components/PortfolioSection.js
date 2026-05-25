import { ArrowRight } from 'lucide-react';

const otherProjects = [
  {
    title: 'Coinluminaire',
    desc: 'Scalable storefront for a growing catalog.',
    tags: [{ label: 'react', type: 'tech' }, { label: 'mongo', type: 'tech' }, { label: 'retail', type: 'industry' }],
  },
  {
    title: 'Classkom LMS',
    desc: 'Courses, students, grades — one system.',
    tags: [{ label: 'react', type: 'tech' }, { label: 'laravel', type: 'tech' }, { label: 'education', type: 'industry' }],
  },
  {
    title: 'Aqarchamal',
    desc: 'Real estate platform for Tanger-Tetouan.',
    tags: [{ label: 'laravel', type: 'tech' }, { label: 'bootstrap', type: 'tech' }, { label: 'real estate', type: 'industry' }],
  },
];

const DashboardPreview = () => (
  <svg
    viewBox="0 0 384 240"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto rounded-lg"
    role="img"
    aria-label="RentCar fleet management dashboard interface"
  >
    <rect width="384" height="240" fill="#001847" />
    {/* App header */}
    <rect width="384" height="36" fill="#002058" />
    <rect x="16" y="12" width="88" height="12" rx="2" fill="#b2c5ff" opacity="0.7" />
    <rect x="296" y="10" width="72" height="16" rx="8" fill="#5cb8fd" opacity="0.75" />
    {/* Nav tabs */}
    <rect x="16" y="48" width="60" height="20" rx="3" fill="#1a3673" />
    <rect x="16" y="66" width="60" height="2" rx="1" fill="#5cb8fd" />
    <rect x="84" y="52" width="52" height="8" rx="2" fill="#b2c5ff" opacity="0.25" />
    <rect x="144" y="52" width="52" height="8" rx="2" fill="#b2c5ff" opacity="0.25" />
    <rect x="204" y="52" width="40" height="8" rx="2" fill="#b2c5ff" opacity="0.25" />
    {/* Stat cards */}
    <rect x="16" y="80" width="78" height="44" rx="5" fill="#0d2a5c" />
    <rect x="24" y="89" width="36" height="11" rx="2" fill="#5cb8fd" opacity="0.85" />
    <rect x="24" y="104" width="56" height="7" rx="2" fill="#b2c5ff" opacity="0.35" />
    <rect x="102" y="80" width="78" height="44" rx="5" fill="#0d2a5c" />
    <rect x="110" y="89" width="28" height="11" rx="2" fill="#ffb4a9" opacity="0.8" />
    <rect x="110" y="104" width="56" height="7" rx="2" fill="#b2c5ff" opacity="0.35" />
    <rect x="188" y="80" width="78" height="44" rx="5" fill="#0d2a5c" />
    <rect x="196" y="89" width="44" height="11" rx="2" fill="#b2c5ff" opacity="0.65" />
    <rect x="196" y="104" width="48" height="7" rx="2" fill="#b2c5ff" opacity="0.35" />
    <rect x="274" y="80" width="94" height="44" rx="5" fill="#0d2a5c" />
    <rect x="282" y="89" width="32" height="11" rx="2" fill="#5cb8fd" opacity="0.5" />
    <rect x="282" y="104" width="60" height="7" rx="2" fill="#b2c5ff" opacity="0.35" />
    {/* Table header */}
    <rect x="16" y="136" width="352" height="14" rx="3" fill="#1a3673" opacity="0.9" />
    <rect x="24" y="140" width="56" height="6" rx="1" fill="#b2c5ff" opacity="0.55" />
    <rect x="120" y="140" width="72" height="6" rx="1" fill="#b2c5ff" opacity="0.55" />
    <rect x="248" y="140" width="56" height="6" rx="1" fill="#b2c5ff" opacity="0.55" />
    {/* Table rows */}
    <rect x="16" y="156" width="352" height="13" rx="2" fill="#0d2a5c" opacity="0.7" />
    <rect x="24" y="160" width="64" height="5" rx="1" fill="#b2c5ff" opacity="0.4" />
    <rect x="248" y="159" width="48" height="7" rx="3" fill="#5cb8fd" opacity="0.45" />
    <rect x="16" y="175" width="352" height="13" rx="2" fill="#0d2a5c" opacity="0.35" />
    <rect x="24" y="179" width="80" height="5" rx="1" fill="#b2c5ff" opacity="0.4" />
    <rect x="248" y="178" width="48" height="7" rx="3" fill="#ffb4a9" opacity="0.45" />
    <rect x="16" y="194" width="352" height="13" rx="2" fill="#0d2a5c" opacity="0.7" />
    <rect x="24" y="198" width="56" height="5" rx="1" fill="#b2c5ff" opacity="0.4" />
    <rect x="248" y="197" width="48" height="7" rx="3" fill="#5cb8fd" opacity="0.45" />
    <rect x="16" y="213" width="352" height="13" rx="2" fill="#0d2a5c" opacity="0.35" />
    <rect x="24" y="217" width="72" height="5" rx="1" fill="#b2c5ff" opacity="0.4" />
    <rect x="248" y="216" width="48" height="7" rx="3" fill="#5cb8fd" opacity="0.45" />
  </svg>
);

const PortfolioSection = () => (
  <section id="portfolio" className="px-space-md pb-space-2xl md:px-gutter max-w-container-max mx-auto">
    {/* Featured case study */}
    <div className="bg-primary rounded-xl p-space-lg md:p-space-2xl flex flex-col lg:flex-row gap-space-2xl text-on-primary">
      <div className="flex-1 flex flex-col justify-center w-full">
        <div className="font-label-caps text-label-caps text-secondary-fixed-dim lowercase mb-space-md">
          featured case · custom software
        </div>
        <h3 className="font-display-lg-mobile text-display-lg-mobile md:font-headline-lg md:text-headline-lg mb-space-md">
          RentCar — a complete rental ops platform for a Tangier fleet.
        </h3>
        <p className="font-body-md text-body-md text-inverse-primary mb-space-xl max-w-2xl">
          Booking, payments, fleet management in one stack. Replaced three vendor systems and cut 60% of the team's daily admin time.
        </p>
        <div className="flex flex-wrap gap-space-sm mb-space-xl w-full">
          {['laravel', 'postgresql', 'stripe'].map((t) => (
            <span key={t} className="px-2 py-1 bg-on-primary-fixed-variant bg-opacity-50 border border-outline rounded font-label-mono text-label-caps lowercase">
              {t}
            </span>
          ))}
          <span className="px-2 py-1 bg-tertiary-container bg-opacity-50 border border-outline rounded font-label-mono text-label-caps text-tertiary-fixed-dim lowercase">
            mobility
          </span>
        </div>
        <button type="button" className="font-label-mono text-label-mono text-secondary-fixed-dim hover:text-secondary-fixed flex items-center gap-1 lowercase group w-fit">
          read the case study <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
        </button>
      </div>

      {/* Interface preview + metrics */}
      <div className="w-full lg:w-96 flex flex-col gap-space-md shrink-0">
        <div className="rounded-lg overflow-hidden border border-on-primary-fixed-variant border-opacity-20">
          <DashboardPreview />
        </div>
        <div className="grid grid-cols-2 gap-space-sm">
          {[
            { value: '-60%', label: 'admin time' },
            { value: '3→1',  label: 'vendor systems' },
            { value: '14mo', label: 'still maintaining' },
            { value: '99.9%', label: 'uptime' },
          ].map(({ value, label }) => (
            <div key={label} className="bg-on-primary-fixed-variant bg-opacity-30 border border-on-primary-fixed-variant rounded-lg p-space-md flex flex-col justify-center h-20">
              <div className="font-headline-md text-headline-md mb-1">{value}</div>
              <div className="font-label-caps text-label-caps text-inverse-primary lowercase">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Other projects */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mt-space-md w-full">
      {otherProjects.map(({ title, desc, tags }) => (
        <div key={title} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-space-lg">
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2">{title}</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">{desc}</p>
          <div className="flex flex-wrap gap-space-sm w-full">
            {tags.map(({ label, type }) => (
              <span
                key={label}
                className={`px-2 py-1 border rounded text-[10px] font-label-mono lowercase ${
                  type === 'industry'
                    ? 'bg-tertiary-fixed bg-opacity-50 border-outline-variant text-on-tertiary-fixed-variant'
                    : 'bg-surface-container border-outline-variant text-on-surface-variant'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default PortfolioSection;
