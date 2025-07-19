import { useState } from 'react';
import ProjectCard from './ProjectCard';
import { useTranslation } from 'react-i18next';

const PortfolioSection = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('allprojects');

  // const projects = t('portfolio.projects', { returnObjects: true }).map(project => ({
  //   ...project,
  //   image: `https://placehold.co/600x400?text=${project.title.replace(/\s/g, '+')}`
  // }));
  const projects = t('portfolio.projects', { returnObjects: true }).map(project => ({
    ...project,
    image: project.image || `https://placehold.co/600x400?text=${project.title.replace(/\s/g, '+')}`
  }));

  const filteredProjects = activeTab === 'allprojects'
    ? projects
    : projects.filter(project => project.category.toLowerCase().replace(/ /g, '') === activeTab);

  const tabs = ['allprojects', 'customsoftware', 'e-commerce', 'webdevelopment', 'socialmedia'];

  return (
    <section id="portfolio" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">{t('portfolio.title')}</h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
            {t('portfolio.subtitle')}
          </p>
        </div>

        <div className="flex justify-center mb-8 space-x-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t(`portfolio.tabs.${tab}`)}
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
