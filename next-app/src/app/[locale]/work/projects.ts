export const PROJECTS = [
  {
    slug: "rentcar",
    key: "rentcar",
    category: "software" as const,
    tags: ["Laravel", "Next.js", "Stripe", "PostgreSQL"],
    date: "2023",
  },
  {
    slug: "friterie-ma",
    key: "friterieMa",
    category: "software" as const,
    tags: ["React", "Node.js", "MongoDB"],
    date: "2022–2023",
  },
  {
    slug: "classkom",
    key: "classkom",
    category: "software" as const,
    tags: ["React Native", "Firebase", "Node.js"],
    date: "2023",
  },
  {
    slug: "nortecoffeeco",
    key: "nortecoffeeco",
    category: "software" as const,
    tags: ["Next.js", "Sanity", "Stripe"],
    date: "2024",
  },
  {
    slug: "ayaalmadina",
    key: "ayaalmadina",
    category: "software" as const,
    tags: ["Laravel", "MySQL", "Mapbox"],
    date: "2022",
  },
  {
    slug: "coinluminaire",
    key: "coinluminaire",
    category: "ecommerce" as const,
    tags: ["Shopify", "Liquid"],
    date: "2023",
  },
  {
    slug: "cafeimperial",
    key: "cafeimperial",
    category: "web" as const,
    tags: ["React", "Node.js"],
    date: "2024",
  },
  {
    slug: "aqarchamal",
    key: "aqarchamal",
    category: "web" as const,
    tags: ["Laravel", "Bootstrap", "MongoDB"],
    date: "2023–2024",
  },
  {
    slug: "fujiwara",
    key: "fujiwara",
    category: "social" as const,
    tags: ["Instagram", "Video"],
    date: "2023–present",
  },
  {
    slug: "alaturco",
    key: "alaturco",
    category: "social" as const,
    tags: ["Social Media", "Photography"],
    date: "2022–2023",
  },
  {
    slug: "riha-ma",
    key: "rihaMa",
    category: "social" as const,
    tags: ["TikTok", "Reels"],
    date: "2023–2024",
  },
  {
    slug: "cosas-buenas",
    key: "cosasbuenas",
    category: "social" as const,
    tags: ["Instagram", "Content"],
    date: "2024–present",
  },
] as const;

export type Project = (typeof PROJECTS)[number];
export type ProjectCategory = Project["category"];
export type ProjectSlug = Project["slug"];
