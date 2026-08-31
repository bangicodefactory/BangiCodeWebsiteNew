const clients = ['Cafe Imperial', 'Friterie.ma', 'Aqarchamal', 'Classkom', 'Coinluminaire', 'Riha'];

const TrustBar = () => (
  <section className="w-full border-y border-outline-variant bg-surface-container-low py-space-md overflow-x-auto no-scrollbar">
    <div className="px-space-md md:px-gutter max-w-container-max mx-auto flex items-center min-w-max">
      <span className="font-label-caps text-label-caps text-outline mr-space-xl lowercase whitespace-nowrap">trusted by</span>
      <div className="flex items-center space-x-space-xl font-body-md text-body-md text-on-surface-variant whitespace-nowrap">
        {clients.map((name, i) => (
          <span key={name} className="flex items-center gap-space-xl">
            {i > 0 && <span className="text-outline-variant text-xs">•</span>}
            {name}
          </span>
        ))}
      </div>
    </div>
  </section>
);

export default TrustBar;
