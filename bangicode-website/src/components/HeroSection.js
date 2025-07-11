const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-r from-blue-50 to-indigo-100 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Transforming Ideas into Powerful Digital Solutions
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            We help businesses transform ideas into powerful digital solutions that drive growth and innovation.
          </p>
          <div className="flex space-x-4">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition">
              Explore Our Services
            </button>
            <button className="border border-blue-600 text-blue-600 px-6 py-3 rounded-md hover:bg-blue-50 transition">
              Contact Us
            </button>
          </div>
        </div>
        <div className="md:w-1/2">
          <img src=" https://placehold.co/600x400?text=Digital+Solutions" alt="Digital Solutions" className="rounded-lg shadow-lg" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
