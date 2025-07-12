const CTASection = () => {
  return (
    <section className="py-20 bg-blue-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold mb-6">Ready to Start Your Project?</h2>
        <p className="text-xl mb-10 max-w-3xl mx-auto">
          Let us help you transform your business with innovative digital solutions tailored to your specific needs and goals.
        </p>
        <div className="flex flex-wrap justify-center gap-6">
          <button className="bg-white text-blue-600 px-8 py-3 rounded-md hover:bg-gray-100 transition">
            Get in Touch
          </button>
          <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-md hover:bg-blue-700 transition">
            Explore Services
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <div className="text-4xl font-bold">20+</div>
            <div className="text-blue-200">Projects Completed</div>
          </div>
          <div>
            <div className="text-4xl font-bold">25+</div>
            <div className="text-blue-200">Happy Clients</div>
          </div>
          <div>
            <div className="text-4xl font-bold">5+</div>
            <div className="text-blue-200">Years Experience</div>
          </div>
          <div>
            <div className="text-4xl font-bold">24/7</div>
            <div className="text-blue-200">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
