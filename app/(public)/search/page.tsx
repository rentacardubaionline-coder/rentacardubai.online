import { Suspense } from "react";
import type { Metadata } from "next";
import {
  searchParamsSchema,
  buildSearchParams,
  formatCity,
} from "@/lib/search/params";
import { searchListings } from "@/lib/search/query";
import { SearchResultCard } from "@/components/search/search-result-card";
import { SearchTopBar } from "@/components/search/search-top-bar";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { SearchSkeleton } from "@/components/search/search-skeleton";
import {
  getCities,
  getPublishedBusinessesInCity,
  getTopPublishedBusinesses,
} from "@/lib/seo/data";
import { CityFallbackGrid } from "@/components/seo/pages/city-fallback-grid";

interface SearchPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const metadata: Metadata = {
  title: "Search Cars - DubaiRentACar",
  description: "Find and rent cars in Dubai",
};

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const parsedParams = await searchParamsSchema.parseAsync(params);

  const [{ data: listings, count, totalPages }, allCities] = await Promise.all([
    searchListings(parsedParams),
    getCities(),
  ]);

  const normalizedCity = parsedParams.city
    ? formatCity(parsedParams.city)
    : null;

  // Always fetch the city's businesses (or top businesses globally) so we
  // can show them BELOW cars when cars exist, and as the full surface when
  // cars are empty. Only on page 1 — deep pagination skips the extra query.
  const showBusinesses = parsedParams.page === 1;
  let cityBusinesses: any[] = [];
  if (showBusinesses) {
    cityBusinesses = normalizedCity
      ? await getPublishedBusinessesInCity(normalizedCity, 12)
      : await getTopPublishedBusinesses(12);
  }
  const hasCars = listings.length > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {normalizedCity ? `Cars in ${normalizedCity}` : "Search cars"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Compare verified rental vendors — book via WhatsApp with easy booking.
        </p>
      </div>

      {/* Top filter bar */}
      <SearchTopBar
        initialParams={parsedParams}
        cities={allCities.map((c) => ({ name: c.name, slug: c.slug }))}
        count={count}
      />

      {/* Results */}
      <div className="mt-6 space-y-12">
        {hasCars ? (
          <section className="space-y-4">
            {normalizedCity && (
              <h2 className="text-lg font-bold text-ink-900">
                Available cars{normalizedCity ? ` in ${normalizedCity}` : ""}
              </h2>
            )}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {listings.map((listing) => (
                <SearchResultCard key={listing.id} listing={listing} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center py-10">
                <Pagination>
                  <PaginationContent>
                    {parsedParams.page > 1 && (
                      <PaginationItem>
                        <PaginationPrevious
                          href={`/search?${buildSearchParams({
                            ...parsedParams,
                            page: parsedParams.page - 1,
                          }).toString()}`}
                        />
                      </PaginationItem>
                    )}

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum: number;
                      if (totalPages <= 5) pageNum = i + 1;
                      else if (parsedParams.page <= 3) pageNum = i + 1;
                      else if (parsedParams.page >= totalPages - 2)
                        pageNum = totalPages - 4 + i;
                      else pageNum = parsedParams.page - 2 + i;

                      const isActive = pageNum === parsedParams.page;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            href={`/search?${buildSearchParams({
                              ...parsedParams,
                              page: pageNum,
                            }).toString()}`}
                            isActive={isActive}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}

                    {totalPages > 5 && parsedParams.page < totalPages - 2 && (
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )}

                    {parsedParams.page < totalPages && (
                      <PaginationItem>
                        <PaginationNext
                          href={`/search?${buildSearchParams({
                            ...parsedParams,
                            page: parsedParams.page + 1,
                          }).toString()}`}
                        />
                      </PaginationItem>
                    )}
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </section>
        ) : null}

        {/* Businesses — shown below cars when cars exist (page 1 only), and
            as the full surface when no cars match the filters. */}
        {showBusinesses && cityBusinesses.length > 0 && (
          <section className="space-y-4">
            {hasCars && (
              <div>
                <h2 className="text-lg font-bold text-ink-900">
                  Car rental agencies
                  {normalizedCity ? ` in ${normalizedCity}` : ""}
                </h2>
                <p className="mt-1 text-sm text-ink-500">
                  Verified vendors you can message directly on WhatsApp.
                </p>
              </div>
            )}
            <CityFallbackGrid
              city={normalizedCity ?? "the UAE"}
              businesses={cityBusinesses}
              showBanner={!hasCars}
            />
          </section>
        )}

        {!hasCars && cityBusinesses.length === 0 && showBusinesses && (
          <CityFallbackGrid
            city={normalizedCity ?? "UAE"}
            businesses={[]}
          />
        )}
      </div>
    </div>
  );
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchContent searchParams={searchParams} />
    </Suspense>
  );
}
