// URL segment resolver for SEO landing pages
// Maps [...segments] to one of 13+ page types with associated data

import { ALL_FILTERS, RESERVED_SEGMENTS, type SeoTemplate } from "./routes-config";
import { getCityBySlug, getTownBySlug, getRouteBySlug, getModelBySlug, getCategoryBySlug } from "./data";
import { getKeywordBySlug, isKeywordSlug } from "./keywords-db";

export type PageType =
  | "keyword_only"
  | "keyword_city"
  | "keyword_city_model"
  | "keyword_city_town"
  | "keyword_route"
  | "keyword_route_model"
  | "keyword_filter_city"
  | "keyword_filter_route"
  | "keyword_model"
  | "vehicle_model"
  | "vehicle_model_city"
  | "vehicle_model_city_town"
  | "vehicle_category"
  | "not_found";

export interface ResolvedPage {
  type: PageType;
  keyword?: {
    slug: string;
    label: string;
    templateOverrides?: {
      city?: SeoTemplate;
      town?: SeoTemplate;
      category?: SeoTemplate;
      model?: SeoTemplate;
      route?: SeoTemplate;
    } | null;
  };
  city?: { id: string; name: string; slug: string };
  town?: { id: string; name: string; slug: string };
  route?: { id: string; slug: string; originCity: { name: string; slug: string }; destinationCity: { name: string; slug: string } };
  model?: { id: string; name: string; slug: string; brand: { name: string; slug: string } };
  category?: { id: string; name: string; slug: string };
  filter?: string; // e.g. "with-driver", "7-seater"
  canonical: string;
}

/**
 * Resolve keyword-based URL segments (e.g. /rent-a-car/lahore/toyota-corolla)
 */
export async function resolveKeywordSegments(segments: string[]): Promise<ResolvedPage> {
  if (segments.length === 0) return { type: "not_found", canonical: "/" };

  const [first, ...rest] = segments;

  // Check if first segment is a keyword (DB-backed)
  const kw = await getKeywordBySlug(first);
  if (!kw) return { type: "not_found", canonical: `/${first}` };

  const keyword = { slug: kw.slug, label: kw.label, templateOverrides: kw.template_overrides };
  const basePath = `/${kw.slug}`;

  // /{keyword} — keyword only
  if (rest.length === 0) {
    return { type: "keyword_only", keyword, canonical: basePath };
  }

  const second = rest[0];

  // Check if second segment is a filter (with-driver, 7-seater, etc.)
  if (ALL_FILTERS.includes(second as any)) {
    const filter = second;

    if (rest.length === 1) {
      // /{keyword}/{filter} — not a valid page on its own, treat as not_found
      return { type: "not_found", canonical: `${basePath}/${filter}` };
    }

    const third = rest[1];

    // Check if third is a city
    const filterCity = await getCityBySlug(third);
    if (filterCity) {
      return {
        type: "keyword_filter_city",
        keyword, filter,
        city: { id: filterCity.id, name: filterCity.name, slug: filterCity.slug },
        canonical: `${basePath}/${filter}/${filterCity.slug}`,
      };
    }

    // Check if third is a route
    const filterRoute = await getRouteBySlug(third);
    if (filterRoute) {
      return {
        type: "keyword_filter_route",
        keyword, filter,
        route: {
          id: filterRoute.id,
          slug: filterRoute.slug,
          originCity: filterRoute.origin_city,
          destinationCity: filterRoute.destination_city,
        },
        canonical: `${basePath}/${filter}/${filterRoute.slug}`,
      };
    }

    return { type: "not_found", canonical: `${basePath}/${filter}/${third}` };
  }

  // Check if second segment is a city
  const city = await getCityBySlug(second);
  if (city) {
    const cityData = { id: city.id, name: city.name, slug: city.slug };

    if (rest.length === 1) {
      // /{keyword}/{city}
      return { type: "keyword_city", keyword, city: cityData, canonical: `${basePath}/${city.slug}` };
    }

    const third = rest[1];

    // Check if third is a model (e.g. toyota-corolla)
    const model = await getModelBySlug(third);
    if (model) {
      return {
        type: "keyword_city_model",
        keyword, city: cityData,
        model: { id: model.id, name: model.name, slug: model.slug, brand: model.make },
        canonical: `${basePath}/${city.slug}/${model.slug}`,
      };
    }

    // Check if third is a town
    const town = await getTownBySlug(third, city.id);
    if (town) {
      return {
        type: "keyword_city_town",
        keyword, city: cityData,
        town: { id: town.id, name: town.name, slug: town.slug },
        canonical: `${basePath}/${city.slug}/${town.slug}`,
      };
    }

    return { type: "not_found", canonical: `${basePath}/${city.slug}/${third}` };
  }

  // Check if second segment is a route (e.g. lahore-to-islamabad)
  const route = await getRouteBySlug(second);
  if (route) {
    const routeData = {
      id: route.id,
      slug: route.slug,
      originCity: route.origin_city,
      destinationCity: route.destination_city,
    };

    if (rest.length === 1) {
      // /{keyword}/{route}
      return { type: "keyword_route", keyword, route: routeData, canonical: `${basePath}/${route.slug}` };
    }

    const third = rest[1];
    const routeModel = await getModelBySlug(third);
    if (routeModel) {
      return {
        type: "keyword_route_model",
        keyword, route: routeData,
        model: { id: routeModel.id, name: routeModel.name, slug: routeModel.slug, brand: routeModel.make },
        canonical: `${basePath}/${route.slug}/${routeModel.slug}`,
      };
    }

    return { type: "not_found", canonical: `${basePath}/${route.slug}/${third}` };
  }

  // Check if second segment is a model (keyword + model, no city)
  const modelDirect = await getModelBySlug(second);
  if (modelDirect) {
    return {
      type: "keyword_model",
      keyword,
      model: { id: modelDirect.id, name: modelDirect.name, slug: modelDirect.slug, brand: modelDirect.make },
      canonical: `${basePath}/${modelDirect.slug}`,
    };
  }

  return { type: "not_found", canonical: `${basePath}/${second}` };
}

/**
 * Resolve /vehicles/[...segments] URLs
 */
export async function resolveVehiclesSegments(segments: string[]): Promise<ResolvedPage> {
  if (segments.length === 0) return { type: "not_found", canonical: "/vehicles" };

  const [first, ...rest] = segments;

  // Check if first is a category
  const category = await getCategoryBySlug(first);
  if (category) {
    return {
      type: "vehicle_category",
      category: { id: category.id, name: category.name, slug: category.slug },
      canonical: `/vehicles/${category.slug}`,
    };
  }

  // Check if first is a model
  const model = await getModelBySlug(first);
  if (model) {
    const modelData = { id: model.id, name: model.name, slug: model.slug, brand: model.make };

    if (rest.length === 0) {
      return { type: "vehicle_model", model: modelData, canonical: `/vehicles/${model.slug}` };
    }

    const second = rest[0];
    const city = await getCityBySlug(second);
    if (city) {
      const cityData = { id: city.id, name: city.name, slug: city.slug };

      if (rest.length === 1) {
        return {
          type: "vehicle_model_city",
          model: modelData, city: cityData,
          canonical: `/vehicles/${model.slug}/${city.slug}`,
        };
      }

      const third = rest[1];
      const town = await getTownBySlug(third, city.id);
      if (town) {
        return {
          type: "vehicle_model_city_town",
          model: modelData, city: cityData,
          town: { id: town.id, name: town.name, slug: town.slug },
          canonical: `/vehicles/${model.slug}/${city.slug}/${town.slug}`,
        };
      }
    }
  }

  return { type: "not_found", canonical: `/vehicles/${segments.join("/")}` };
}

/** Check if a slug is a keyword (DB-backed, async) */
export async function isKeyword(slug: string): Promise<boolean> {
  return isKeywordSlug(slug);
}

/** Check if a slug is reserved (not a keyword route) */
export function isReservedSegment(slug: string): boolean {
  return RESERVED_SEGMENTS.includes(slug);
}
