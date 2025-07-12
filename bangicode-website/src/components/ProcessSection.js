import { useTranslation } from 'react-i18next';

const ProcessSection = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">{t('process.title')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            {t('process.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              01
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('process.step1.title')}</h3>
            <p className="text-gray-600">
              {t('process.step1.description')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              02
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('process.step2.title')}</h3>
            <p className="text-gray-600">
              {t('process.step2.description')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              03
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('process.step3.title')}</h3>
            <p className="text-gray-600">
              {t('process.step3.description')}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
              04
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('process.step4.title')}</h3>
            <p className="text-gray-600">
              {t('process.step4.description')}
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition inline-flex items-center">
            {t('process.discuss')}
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
