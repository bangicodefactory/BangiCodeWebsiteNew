const Footer = () => (
  <footer className="bg-surface-container-lowest border-t border-outline-variant">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-space-xl px-gutter py-space-3xl max-w-container-max mx-auto">
      <div className="flex flex-col">
        <a href="/" aria-label="Bangicode — home" className="mb-space-md">
          <img
            src={process.env.PUBLIC_URL + '/brand/logo.svg'}
            alt="Bangicode"
            width={140}
            height={22}
            className="h-5 w-auto"
          />
        </a>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
          Software studio in Tetouan, Morocco. Code that ages well.
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-auto">
          © 2020–2026 Bangicode SARL. Crafted with Moroccan precision.
        </p>
      </div>

      <div className="flex flex-col gap-space-sm">
        <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-space-xs lowercase">services</h4>
        {['Custom software', 'E-commerce', 'Technical training', 'Social presence'].map((s) => (
          <a key={s} href="#services" className="text-on-surface-variant font-body-sm text-body-sm hover:text-secondary transition-colors w-fit">{s}</a>
        ))}
      </div>

      <div className="flex flex-col gap-space-sm">
        <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-space-xs lowercase">company</h4>
        {['About', 'Work', 'Industries', 'Process', 'Careers', 'Contact'].map((s) => (
          <a key={s} href={`#${s.toLowerCase()}`} className="text-on-surface-variant font-body-sm text-body-sm hover:text-secondary transition-colors w-fit">{s}</a>
        ))}
      </div>

      <div className="flex flex-col gap-space-sm">
        <h4 className="font-label-caps text-label-caps text-on-surface-variant mb-space-xs lowercase">location</h4>
        <p className="text-on-surface-variant font-body-sm text-body-sm">
          Av. Ali Yaeta<br />Centre Commercial Wilaya Center<br />Etage 6, N69<br />Tetouan, Morocco
        </p>
        <p className="text-on-surface-variant font-label-mono text-label-mono mt-space-sm lowercase">
          +212 6645 71370<br />admin@bangicode.ma
        </p>
      </div>
    </div>

    <div className="px-gutter pb-space-lg max-w-container-max mx-auto flex flex-wrap gap-space-md font-label-caps text-label-caps text-on-surface-variant lowercase">
      {['privacy', 'terms', 'cookies'].map((l) => (
        <a key={l} href={`/${l}`} className="hover:text-secondary">{l}</a>
      ))}
      <span aria-hidden="true">·</span>
      <a href="https://linkedin.com/company/bangicode" aria-label="Bangicode on LinkedIn" className="hover:text-secondary">linkedin</a>
      <a href="https://github.com/bangicodefactory" aria-label="Bangicode on GitHub" className="hover:text-secondary">github</a>
      <a href="https://wa.me/212664571370" aria-label="Contact Bangicode on WhatsApp" className="hover:text-secondary">whatsapp</a>
    </div>
  </footer>
);

export default Footer;
