import { useState } from 'react';

const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="font-bold text-xl text-blue-600">Bangicode</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition">Services</a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition">About Us</a>
            <a href="#portfolio" className="text-gray-700 hover:text-blue-600 transition">Portfolio</a>
            <a href="#testimonials" className="text-gray-700 hover:text-blue-600 transition">Testimonials</a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">Contact</a>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a href="#services" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Services</a>
            <a href="#about" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">About Us</a>
            <a href="#portfolio" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Portfolio</a>
            <a href="#testimonials" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Testimonials</a>
            <a href="#contact" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-100">Contact</a>
            <button className="mt-2 w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition">
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
