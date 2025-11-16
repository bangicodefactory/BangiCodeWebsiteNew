import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const ProjectCard = ({ project }) => {
  const cardRef = useRef(null);
  console.log('Project image path:', project.image); // Debug log

  useEffect(() => {
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      {
        opacity: 0,
        y: 60,
        scale: 0.95
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top 85%',
          once: true
        }
      }
    );
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    gsap.to(card, {
      rotateX: rotateX,
      rotateY: rotateY,
      transformPerspective: 800,
      duration: 0.20,
      ease: 'power2.out'
    });
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleImageError = (e) => {
    console.error('Image failed to load:', project.image);
    console.error('Error event:', e);
  };

  const handleImageLoad = () => {
    console.log('Image loaded successfully:', project.image);
  };

  return (
    <div 
      ref={cardRef} 
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-white/10 backdrop-blur-md rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition duration-500 border border-white/20"
      style={{ transformStyle: 'preserve-3d' }}
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