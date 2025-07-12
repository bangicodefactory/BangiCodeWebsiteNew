import { useTranslation } from 'react-i18next';

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const testimonials = t('testimonials', { returnObjects: true }) || {};
  const testimonialList = Object.values(testimonials).slice(0, 3);

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">{t('testimonials.title')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialList.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 p-8 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img src={`https://placehold.co/100x100?text=${testimonial.name ? testimonial.name.split(' ').map(n => n[0]).join('') : ''}`} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
              <p className="text-gray-600 italic">
                "{testimonial.quote}"
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">{t('testimonials.trusted')}</h3>
          <div className="flex flex-wrap justify-center items-center gap-8">
            {['TechFirm', 'Innovate', 'EcoTech', 'SunCorp', 'NexGen'].map((company, index) => (
              <div key={index} className="text-gray-500 hover:text-gray-700 transition">
                {company}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
