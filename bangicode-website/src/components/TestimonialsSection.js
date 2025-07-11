const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Don't justtake our word for it. Here's what our clients have to say about working with Bangicode.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img src=" https://placehold.co/100x100?text=SJ" alt="Sarah Johnson" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Sarah Johnson</h4>
                <p className="text-sm text-gray-600">CEO, StyleTech</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Bangicode transformed our online presence with an exceptional e-commerce platform that exceeded our expectations."
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img src=" https://placehold.co/100x100?text=MC" alt="Michael Chen" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Michael Chen</h4>
                <p className="text-sm text-gray-600">CTO, Innovate Inc</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "Their custom software solution streamlined our operations and increased productivity by over 40%. Highly recommended!"
            </p>
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <img src=" https://placehold.co/100x100?text=AR" alt="Amanda Rodriguez" className="w-12 h-12 rounded-full mr-4" />
              <div>
                <h4 className="font-semibold text-gray-900">Amanda Rodriguez</h4>
                <p className="text-sm text-gray-600">Marketing Director, Elevate</p>
              </div>
            </div>
            <p className="text-gray-600 italic">
              "The social media management services provided by Bangicode have significantly boosted our online engagement and brand awareness."
            </p>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-6">Trusted by innovative companies</h3>
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
