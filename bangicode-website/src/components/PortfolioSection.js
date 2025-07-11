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
      title: 'HealthTrack Patient Management System',
      category: 'Custom Software',
      description: 'The healthcare provider struggled with inefficient patient record management and appointment scheduling...',
      technologies: ['Angular', 'Django', 'PostgreSQL'],
      image: ' https://placehold.co/600x400?text=HealthTrack+Patient+System'
    },
    {
      title: 'FoodDelivery Mobile App',
      category: 'Custom Software',
      description: 'The startup needed a user-friendly food delivery app with real-time order tracking...',
      technologies: ['React Native', 'Firebase', 'Google Maps API'],
      image: ' https://placehold.co/600x400?text=FoodDelivery+Mobile+App'
    },
    {
      title: 'SocialBoost Campaign Management',
      category: 'Social Media',
      description: 'The marketing agency needed a unified platform to manage social media campaigns across multiple platforms...',
      technologies: ['Vue.js', 'Python', 'TensorFlow'],
      image: ' https://placehold.co/600x400?text=SocialBoost+Campaign+Tool'
    },
    {
      title: 'LuxBrands Online Boutique',
      category: 'E-commerce',
      description: 'The luxury fashion retailer wanted to translate their exclusive in-store experience to an online platform...',
      technologies: ['Shopify Plus', 'Three.js', 'AWS'],
      image: ' https://placehold.co/600x400?text=LuxBrands+Online+Boutique'
    },
    {
      title: 'EduLearn Learning Management System',
      category: 'Web Development',
      description: 'The educational institution needed a robust learning management system to deliver courses online...',
      technologies: ['React', 'Express.js', 'MySQL'],
      image: ' https://placehold.co/600x400?text=EduLearn+LMS'
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
