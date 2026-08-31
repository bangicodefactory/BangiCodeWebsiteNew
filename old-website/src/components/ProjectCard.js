const ProjectCard = ({ project }) => {
  const handleImageError = (e) => {
    console.error('Image failed to load:', project.image);
    console.error('Error event:', e);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', project.image);
  };

  return (
    <div 
      className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-white/20"
    >
      <img 
        src={project.image} 
        alt={project.title} 
        className="w-full h-48 object-cover"
        onError={handleImageError}
        onLoad={handleImageLoad}
      />
      <div className="p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-400">{project.category}</span>
        <h3 className="mt-2 text-xl font-semibold text-white">{project.title}</h3>
        <p className="mt-2 text-gray-300 text-sm">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-white/10 text-gray-300 rounded-full border border-white/20">
              {tech}
            </span>
          ))}
        </div>
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-blue-400 font-medium hover:text-blue-300 flex items-center transition"
          >
            View Case Study →
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;