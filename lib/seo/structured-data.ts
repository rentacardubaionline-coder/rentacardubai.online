// JSON-LD structured data generators for SEO pages

const BASE_URL = "https://www.rentnowpk.com";

// ── WebSite Schema (root layout) ────────────────────────────────────────────

export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "RentNowPK",
    url: BASE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${BASE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// ── Organization Schema (root layout) ───────────────────────────────────────

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "RentNowPK",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.svg`,
    sameAs: [
      "https://www.facebook.com/rentnowpk",
      "https://twitter.com/rentnowpk",
      "https://www.instagram.com/rentnowpk",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+923144174625",
      contactType: "customer service",
      email: "help@rentnowpk.com",
      areaServed: "PK",
      availableLanguage: "English",
    },
  };
}

// ── BreadcrumbList Schema ───────────────────────────────────────────────────

export function generateBreadcrumbSchema(crumbs: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: `${BASE_URL}${crumb.href}`,
    })),
  };
}

// ── Product Schema (listing detail page) ────────────────────────────────────

export function generateProductSchema(listing: {
  title: string;
  description?: string | null;
  city: string;
  slug: string;
  primaryImageUrl?: string | null;
  dailyPrice?: number | null;
  businessName?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || `Rent ${listing.title} in ${listing.city}`,
    image: listing.primaryImageUrl || undefined,
    url: `${BASE_URL}/cars/${listing.slug}`,
    offers: {
      "@type": "Offer",
      price: listing.dailyPrice || undefined,
      priceCurrency: "PKR",
      availability: "https://schema.org/InStock",
      seller: listing.businessName
        ? { "@type": "Organization", name: listing.businessName }
        : undefined,
    },
  };
}

// ── ItemList Schema (landing pages with vehicle grids) ──────────────────────

export function generateItemListSchema(
  items: { title: string; slug: string; imageUrl?: string | null; businessName?: string }[],
  context: { name: string; description: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: context.name,
    description: context.description,
    numberOfItems: items.length,
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Product",
        name: item.title,
        url: `${BASE_URL}/cars/${item.slug}`,
        image: item.imageUrl || undefined,
        brand: item.businessName
          ? { "@type": "Brand", name: item.businessName }
          : undefined,
      },
    })),
  };
}

// ── FAQPage Schema ──────────────────────────────────────────────────────────

export function generateFaqSchema(faqs: { q: string; a: string }[]) {
  if (faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}

// ── LocalBusiness Schema (vendor profile page) ──────────────────────────────

export function generateLocalBusinessSchema(business: {
  name: string;
  slug: string;
  city?: string;
  phone?: string | null;
  email?: string | null;
  rating?: number;
  reviewsCount?: number;
  logoUrl?: string | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.name,
    url: business.city
      ? `${BASE_URL}/vendors/${business.city
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-")}/${business.slug}`
      : `${BASE_URL}/vendors/${business.slug}`,
    image: business.logoUrl || undefined,
    address: business.city
      ? {
          "@type": "PostalAddress",
          addressLocality: business.city,
          addressCountry: "PK",
        }
      : undefined,
    telephone: business.phone || undefined,
    email: business.email || undefined,
    aggregateRating:
      business.rating && business.reviewsCount
        ? {
            "@type": "AggregateRating",
            ratingValue: business.rating,
            reviewCount: business.reviewsCount,
          }
        : undefined,
  };
}
