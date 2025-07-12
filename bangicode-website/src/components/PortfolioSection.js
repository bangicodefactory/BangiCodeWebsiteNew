import { useState } from 'react';
import ProjectCard from './ProjectCard';

const PortfolioSection = () => {
  const [activeTab, setActiveTab] = useState('All Projects');

  const projects = [
    {
      title: 'TechRetail E-commerce Platform',
      category: 'E-commerce',
      description: 'The client needed a scalable e-commerce platform to handle their growing product catalog and customer base...',
      technologies: ['React', 'Node.js', 'MongoDB'],
      image: 'https://placehold.co/600x400?text=TechRetail+E-commerce+Platform'
    },
    {
      title: 'RentCar Cars Rental Management System',
      category: 'Custom Software',
      description: 'The client needed a comprehensive platform to manage car rentals, including booking, payments, and fleet management...',
      technologies: ['Angular', 'Django', 'PostgreSQL'],
      image: ' https://placehold.co/600x400?text=HealthTrack+Patient+System'
    },
    {
      title: 'Friterie.ma Food Delivery Web App',
      category: 'Custom Software',
      description: 'The client needed a user-friendly food delivery web app to handle their growing product demand and customer base...',
      technologies: ['Html/CSS', 'Laravel', 'PHP'],
      image: ' https://placehold.co/600x400?text=Friterie.ma+Food+Delivery+Web+App'
    },
    {
      title: 'Fujiwara SocialMedia Campaign Management',
      category: 'Social Media',
      description: 'The client wanted to enhance their social media presence and streamline campaign management across multiple platforms...',
      technologies: ['Html/CSS', 'Laravel', 'PHP'],
      image: ' https://placehold.co/600x400?text=Fujiwara+SocialMedia+Campaign+Management'
    },
    {
      title: 'CafeImperial Website Design and Development',
      category: 'Web Development',
      description: 'The client needed a modern and responsive website to showcase their cafe\'s menu, ambiance, and services...',
      technologies: ['React', 'Node.js', 'HTML/CSS'],
      image: ' https://placehold.co/600x400?text=CafeImperial+Website+Design+and+Development'
    },
    {
      title: 'Classkom Learning Management System',
      category: 'Web Development',
      description: 'The educational institution needed a robust learning management system to manage online courses, student registrations, and assessments...',
      technologies: ['React', 'Laravel', 'MySQL'],
      image: ' https://placehold.co/600x400?text=Classkom+LMS'
    }
  ];

  const filteredProjects = activeTab === 'All Projects'
    ? projects
    : projects.filter(project => project.category === activeTab);

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Our Portfolio</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            Explore our successful projects that demonstrate our expertise and commitment to delivering exceptional digital solutions
          </p>
        </div>

        <div className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-2">
          {['All Projects', 'Custom Software', 'E-commerce', 'Web Development', 'Social Media'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={index} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
