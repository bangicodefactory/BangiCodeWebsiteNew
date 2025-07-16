const ProjectCard = ({ project }) => {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition duration-300">
      {/* <img src={project.image} alt={project.title} className="w-full h-48 object-cover" /> */}
      <div className="p-6">
        <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">{project.category}</span>
        <h3 className="mt-2 text-xl font-semibold text-gray-900">{project.title}</h3>
        <p className="mt-2 text-gray-600 text-sm">{project.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {project.technologies.map((tech, idx) => (
            <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
              {tech}
            </span>
          ))}
        </div>
        {project.website && (
          <a
            href={project.website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-blue-600 font-medium hover:text-blue-800 flex items-center"
          >
            View Case Study →
          </a>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
