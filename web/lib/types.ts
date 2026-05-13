export type CourseSlug =
  | "direito"
  | "administracao"
  | "sistemas-da-informacao"
  | "processos-gerenciais"
  | "pedagogia"
  | "ciencias-contabeis"
  | "psicologia";

export type Course = {
  slug: CourseSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  /** rótulo curto usado em metadados */
  label: string;
};

export type Article = {
  id: string;
  slug: string;
  courseSlug: CourseSlug;
  title: string;
  subtitle: string;
  body: string;
  source: string;
  /** ISO 8601 */
  publishedAt: string;
  externalUrl: string;
  featured: boolean;
  /** seed determinístico para o placeholder visual */
  imageSeed: string;
};
