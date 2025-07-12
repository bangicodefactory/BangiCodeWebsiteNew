const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <img src=" https://placehold.co/600x400?text=Bangicode+Team" alt="Bangicode Team" className="rounded-lg shadow-lg" />
          </div>
          <div className="md:w-1/2 md:pl-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">About Bangicode</h2>
            <p className="text-gray-600 mb-6">
              We're a dedicated team of technology enthusiasts committed to helping businesses harness the power of digital solutions.
            </p>

            <p className="text-gray-600 mb-6">
              Founded in 2020, Bangicode was born from a simple yet powerful idea: to help businesses of all sizes leverage technology to achieve their full potential. What began as a small team of passionate developers has grown into a comprehensive digital solutions provider with expertise across multiple domains.
            </p>

            <p className="text-gray-600 mb-6">
              We understand that in today's fast-paced digital landscape, businesses need reliable partners who can translate complex technical requirements into effective, user-friendly solutions. That's why we focus on combining technical excellence with a deep understanding of business needs.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">
              <div>
                <div className="text-3xl font-bold text-blue-600">20+</div>
                <div className="text-gray-600">Satisfied Clients</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24+</div>
                <div className="text-gray-600">Completed Projects</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">5+</div>
                <div className="text-gray-600">Years of Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">Support & Maintenance</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
