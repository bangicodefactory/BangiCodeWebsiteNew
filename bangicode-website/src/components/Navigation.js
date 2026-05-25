import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const { i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setMobileMenuOpen(false);
  };

  const handleScroll = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  return (
    <header className="bg-surface border-b border-outline-variant top-0 z-50 sticky">
      <div className="flex justify-between items-center w-full px-gutter max-w-container-max mx-auto h-16">
        <a href="/" aria-label="Bangicode — home">
          <img
            src={process.env.PUBLIC_URL + '/brand/logo.svg'}
            alt="Bangicode"
            width={156}
            height={24}
            className="h-6 w-auto"
          />
        </a>

        <button
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          className="md:hidden text-primary p-2 -mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} aria-hidden="true" /> : <Menu size={24} aria-hidden="true" />}
        </button>

        <nav className="hidden md:flex items-center space-x-space-xl">
          {['services', 'portfolio', 'process', 'about', 'contact'].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleScroll(e, id)}
              className="text-on-surface-variant font-medium font-body-md text-body-md hover:text-secondary transition-colors duration-200 capitalize"
            >
              {id}
            </a>
          ))}
          <div className="flex items-center space-x-space-md ml-space-lg border-l border-outline-variant pl-space-lg">
            <span className="font-label-caps text-label-caps text-on-surface-variant lowercase flex gap-1">
              {['en', 'fr', 'ar'].map((lng, i) => (
                <button
                  key={lng}
                  onClick={() => changeLanguage(lng)}
                  aria-label={`Switch to ${lng}`}
                  aria-pressed={i18n.language === lng}
                  className={`px-2 py-2 hover:text-secondary transition-colors ${i18n.language === lng ? 'text-secondary' : ''}`}
                >
                  {i > 0 && <span aria-hidden="true" className="mr-1">·</span>}{lng}
                </button>
              ))}
            </span>
            <a
              href="#contact"
              onClick={(e) => handleScroll(e, 'contact')}
              className="bg-primary-container text-on-primary font-body-md text-body-md px-space-md py-space-md rounded hover:bg-secondary transition-colors duration-200 leading-none"
            >
              Start a project
            </a>
          </div>
        </nav>
      </div>

      {mobileMenuOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-outline-variant bg-surface px-gutter py-space-md flex flex-col gap-space-sm">
          {['services', 'portfolio', 'process', 'about', 'contact'].map((id) => (
            <a
              key={id}
              href={`#${id}`}
              onClick={(e) => handleScroll(e, id)}
              className="text-on-surface-variant font-body-md text-body-md py-space-sm capitalize hover:text-secondary transition-colors"
            >
              {id}
            </a>
          ))}
          <div className="flex items-center gap-space-sm pt-space-sm border-t border-outline-variant">
            {['en', 'fr', 'ar'].map((lng) => (
              <button
                key={lng}
                onClick={() => changeLanguage(lng)}
                aria-label={`Switch to ${lng}`}
                aria-pressed={i18n.language === lng}
                className={`font-label-caps text-label-caps uppercase px-3 py-3 hover:text-secondary transition-colors ${i18n.language === lng ? 'text-secondary' : 'text-on-surface-variant'}`}
              >
                {lng}
              </button>
            ))}
          </div>
          <a
            href="#contact"
            onClick={(e) => handleScroll(e, 'contact')}
            className="bg-primary-container text-on-primary font-body-md text-body-md px-space-md py-space-md rounded text-center hover:bg-secondary transition-colors"
          >
            Start a project
          </a>
        </div>
      )}
    </header>
  );
};

export default Navigation;
