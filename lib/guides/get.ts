import { GUIDES, type Guide, type GuideCategory } from "./data";

/** All guides, newest first. */
export function getAllGuides(): Guide[] {
  return [...GUIDES].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export function getGuidesByCategory(category: GuideCategory | "all"): Guide[] {
  const all = getAllGuides();
  if (category === "all") return all;
  return all.filter((g) => g.category === category);
}

export function getGuideBySlug(slug: string): Guide | null {
  return GUIDES.find((g) => g.slug === slug) ?? null;
}

/** Sibling articles in the same category, excluding the current one. */
export function getRelatedGuides(slug: string, limit = 3): Guide[] {
  const current = getGuideBySlug(slug);
  if (!current) return [];
  return GUIDES.filter(
    (g) => g.slug !== slug && g.category === current.category,
  ).slice(0, limit);
}
