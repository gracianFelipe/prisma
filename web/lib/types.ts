export type ThemeSlug =
  | "justica"
  | "negocios"
  | "tecnologia"
  | "gestao"
  | "educacao"
  | "financas"
  | "comportamento"
  | "saude";

export type Theme = {
  slug: ThemeSlug;
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
  themeSlug: ThemeSlug;
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
