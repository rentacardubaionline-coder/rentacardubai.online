import { Suspense } from "react";
import type { Metadata } from "next";
import { searchParamsSchema, buildSearchParams, formatCity } from "@/lib/search/params";
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
  title: "Search Cars - RentNowPk",
  description: "Find and rent cars in Pakistan",
};

async function SearchContent({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const parsedParams = await searchParamsSchema.parseAsync(params);

  const [{ data: listings, count, totalPages }, allCities] = await Promise.all([
    searchListings(parsedParams),
    getCities(),
  ]);

  const normalizedCity = parsedParams.city ? formatCity(parsedParams.city) : null;
  let fallbackBusinesses: any[] = [];
  if (listings.length === 0) {
    fallbackBusinesses = normalizedCity
      ? await getPublishedBusinessesInCity(normalizedCity, 12)
      : await getTopPublishedBusinesses(12);
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-900 sm:text-3xl">
          {normalizedCity ? `Cars in ${normalizedCity}` : "Search cars"}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Compare verified rental vendors — book via WhatsApp with a small advance.
        </p>
      </div>

      {/* Top filter bar */}
      <SearchTopBar
        initialParams={parsedParams}
        cities={allCities.map((c) => ({ name: c.name, slug: c.slug }))}
        count={count}
      />

      {/* Results */}
      <div className="mt-6">
        {listings.length > 0 ? (
          <>
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
          </>
        ) : (
          <CityFallbackGrid
            city={normalizedCity ?? "Pakistan"}
            businesses={fallbackBusinesses}
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
