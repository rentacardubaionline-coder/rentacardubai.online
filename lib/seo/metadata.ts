// SEO metadata generator — produces Next.js Metadata objects from resolved page data

import type { Metadata } from "next";
import { DEFAULT_TEMPLATES, FAQS } from "./routes-config";
import type { ResolvedPage } from "./seo-resolver";
import type { FaqItem } from "./routes-config";

const BASE_URL = "https://www.rentacardubai.online";



/** Apply template variable substitution */
function applyVars(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

/** Build template variables from resolved page */
function getVars(resolved: ResolvedPage): Record<string, string> {
  const vars: Record<string, string> = {};

  if (resolved.keyword) {
    vars.keyword = resolved.keyword.label;
    vars.keyword_lower = resolved.keyword.label.toLowerCase();
  }
  if (resolved.city) {
    vars.city = resolved.city.name;
  }
  if (resolved.town) {
    vars.town = resolved.town.name;
  }
  if (resolved.model) {
    vars.model = resolved.model.name;
    vars.brand = resolved.model.brand.name;
  }
  if (resolved.category) {
    vars.category = resolved.category.name;
  }
  if (resolved.route) {
    vars.from_city = resolved.route.originCity.name;
    vars.to_city = resolved.route.destinationCity.name;
  }
  if (resolved.filter) {
    // Convert "with-driver" → "With Driver", "7-seater" → "7 Seater"
    vars.filter = resolved.filter
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return vars;
}

/** Get the right template for a page type (with keyword overrides from DB) */
function getTemplate(resolved: ResolvedPage) {
  const base = DEFAULT_TEMPLATES[resolved.type];
  if (!base) return DEFAULT_TEMPLATES.keyword_only;

  // Check for keyword-specific template overrides (now stored on resolved.keyword from DB)
  const overrides = resolved.keyword?.templateOverrides;
  if (overrides) {
    // More specific first: town beats city, category beats model.
    if (resolved.type.includes("town") && overrides.town) return overrides.town;
    if (resolved.type.includes("category") && overrides.category) return overrides.category;
    if (resolved.type.includes("city") && overrides.city) return overrides.city;
    if (resolved.type.includes("model") && overrides.model) return overrides.model;
    if (resolved.type.includes("route") && overrides.route) return overrides.route;
  }

  return base;
}

/** Generate full Next.js Metadata object from resolved page */
export function generateSeoMetadata(resolved: ResolvedPage): Metadata {
  const template = getTemplate(resolved);
  const vars = getVars(resolved);

  const title = applyVars(template.title, vars);
  const description = applyVars(template.description, vars);
  const canonical = `${BASE_URL}${resolved.canonical}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "RentNow",

      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large" as const,
        "max-snippet": -1,
      },
    },
  };
}

/** Generate H1 text from resolved page */
export function generateH1(resolved: ResolvedPage): string {
  const template = getTemplate(resolved);
  const vars = getVars(resolved);
  return applyVars(template.h1, vars);
}

/** Generate FAQs from resolved page context */
export function generateFaqs(resolved: ResolvedPage): FaqItem[] {
  const vars = getVars(resolved);

  let faqKey = "general";
  if (resolved.type === "keyword_only" || resolved.type === "keyword_model") faqKey = "general";
  else if (resolved.type.includes("route")) faqKey = "route";
  else if (resolved.keyword?.slug.includes("airport")) faqKey = "airport";
  else if (resolved.city) faqKey = "city";

  const templates = FAQS[faqKey] ?? FAQS.general;

  return templates.map((faq) => ({
    q: applyVars(faq.q, vars),
    a: applyVars(faq.a, vars),
  }));
}

/** Generate breadcrumb items */
export function generateBreadcrumbs(
  resolved: ResolvedPage,
): { name: string; href: string }[] {
  const crumbs: { name: string; href: string }[] = [
    { name: "Home", href: "/" },
  ];

  if (resolved.keyword) {
    crumbs.push({ name: resolved.keyword.label, href: `/${resolved.keyword.slug}` });
  }

  if (resolved.city) {
    const base = resolved.keyword ? `/${resolved.keyword.slug}` : "";
    crumbs.push({ name: resolved.city.name, href: `${base}/${resolved.city.slug}` });
  }

  if (resolved.town) {
    const base = resolved.keyword ? `/${resolved.keyword.slug}` : "";
    const citySlug = resolved.city?.slug ?? "";
    crumbs.push({ name: resolved.town.name, href: `${base}/${citySlug}/${resolved.town.slug}` });
  }

  if (resolved.model && resolved.type.includes("model")) {
    crumbs.push({ name: `${resolved.model.brand.name} ${resolved.model.name}`, href: resolved.canonical });
  }

  if (resolved.route) {
    crumbs.push({
      name: `${resolved.route.originCity.name} to ${resolved.route.destinationCity.name}`,
      href: resolved.canonical,
    });
  }

  if (resolved.category) {
    crumbs.push({ name: resolved.category.name, href: `/vehicles/${resolved.category.slug}` });
  }

  return crumbs;
}
