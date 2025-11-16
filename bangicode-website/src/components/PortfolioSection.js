import { useState } from 'react';
import ProjectCard from './ProjectCard';
import { useTranslation } from 'react-i18next';
import LightRays from './LightRays';

const PortfolioSection = () => {
  const { t } = useTranslation();
  // Use a key-based system instead of translated strings
  const [activeTab, setActiveTab] = useState('allprojects');

  const projects = t('portfolio.projects', { returnObjects: true }).map(project => ({
    ...project,
    image: project.image || `https://placehold.co/600x400?text=${project.title.replace(/\s/g, '+')}`
  }));

  // Define tab keys that correspond to your translation keys
  const tabKeys = [
    'allprojects',
    'customsoftware', 
    'ecommerce',
    'webdevelopment',
    'socialmedia'
  ];

  // Filter projects based on matching translated categories
  const filteredProjects = activeTab === 'allprojects'
    ? projects
    : projects.filter(project => {
        // Get the translated category name for the current active tab
        const translatedTabCategory = t(`portfolio.tabs.${activeTab}`);
        // Compare with the project's category (which is already translated in your JSON files)
        return project.category === translatedTabCategory;
      });

  return (
    <section id="portfolio" className="py-16 bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden min-h-screen">
      {/* LightRays Background */}
      <div className="absolute inset-0 w-full h-full">
        <LightRays
          raysOrigin="top-center"
          raysColor="#3b82f6"
          raysSpeed={0.8}
          lightSpread={1.2}
          rayLength={1.5}
          pulsating={false}
          fadeDistance={1.2}
          saturation={0.9}
          followMouse={true}
          mouseInfluence={0.15}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('portfolio.title')}
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            {t('portfolio.subtitle')}
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {tabKeys.map((tabKey) => (
            <button
              key={tabKey}
              onClick={() => setActiveTab(tabKey)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tabKey
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border border-white/20'
              }`}
            >
              {t(`portfolio.tabs.${tabKey}`)}
            </button>
          ))}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={index}
              project={project}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;