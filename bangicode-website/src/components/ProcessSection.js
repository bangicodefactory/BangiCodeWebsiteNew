const steps = [
  { num: '01', title: 'Tell us your problem',  desc: 'A short form. No NDAs, no sales calls scheduled blind.',                    duration: '~ 5 min' },
  { num: '02', title: 'Discovery call',         desc: '30 minutes with a senior engineer. Constraints, success criteria, fit.',    duration: 'within 24h' },
  { num: '03', title: 'Custom proposal',        desc: 'Scope, milestones, fixed price, team. Written, not pitched.',               duration: '5 working days' },
  { num: '04', title: 'Kickoff',                desc: 'Repo, ticket board, weekly demos. You\'re in the loop from day zero.',      duration: 'within 2 weeks' },
];

const ProcessSection = () => (
  <section id="process" className="px-space-md pb-space-2xl md:px-gutter max-w-container-max mx-auto w-full">
    <h2 className="font-headline-md text-headline-md text-primary mb-space-xl">
      From hello to kickoff, in two weeks or less.
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md w-full">
      {steps.map(({ num, title, desc, duration }) => (
        <div key={num} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-space-lg flex flex-col w-full">
          <div className="font-label-caps text-label-caps text-secondary lowercase mb-space-sm">step {num}</div>
          <h4 className="font-headline-sm text-headline-sm text-primary mb-2">{title}</h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-xl flex-grow">{desc}</p>
          <div className="font-label-caps text-label-caps text-on-surface-variant lowercase border-t border-outline-variant pt-space-md mt-auto">
            {duration}
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default ProcessSection;
