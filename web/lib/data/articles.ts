import type { Article, ThemeSlug } from "../types";
import snapshot from "./articles.json";

// Snapshot real gerado pelo backend Python (`python -m esup_news.cli export-web`)
// a partir do SQLite. Re-rode o export-web após cada ingest para atualizar.
export const ARTICLES: Article[] = snapshot as unknown as Article[];

export function getArticlesByTheme(slug: ThemeSlug): Article[] {
  return ARTICLES.filter((a) => a.themeSlug === slug).sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export function getArticleBySlug(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getFeaturedByTheme(slug: ThemeSlug): Article | undefined {
  const list = getArticlesByTheme(slug);
  return list.find((a) => a.featured) ?? list[0];
}

export function getRelated(article: Article, limit = 3): Article[] {
  return getArticlesByTheme(article.themeSlug)
    .filter((a) => a.id !== article.id)
    .slice(0, limit);
}

export function getLatest(limit = 8): Article[] {
  return [...ARTICLES]
    .sort(
      (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}
