import { Suspense } from "react";
import type { Metadata } from "next";
import { searchParamsSchema, buildSearchParams } from "@/lib/search/params";
import { searchListings, getMakesForFacets } from "@/lib/search/query";
import { SearchResultCard } from "@/components/search/search-result-card";
import { FiltersSidebar } from "@/components/search/filters-sidebar";
import { FiltersSheet } from "@/components/search/filters-sheet";
import { SortDropdown } from "@/components/search/sort-dropdown";
import { Button } from "@/components/ui/button";
import { Sliders } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { SearchSkeleton } from "@/components/search/search-skeleton";

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

  const { data: listings, count, totalPages } = await searchListings(parsedParams);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-left pl-10 pt-10 text-ink-900">Search Cars</h1>
        <p className="mt-2 text-ink-600 pl-5">
          Found <span className="font-semibold text-brand-600">{count}</span> cars available for rent
        </p>
      </div>

      {/* Main layout */}
      <div className="grid gap-6 md:grid-cols-4">
        {/* Desktop sidebar filters */}
        <aside className="hidden md:block">
          <FiltersSidebar initialParams={parsedParams} />
        </aside>

        {/* Main content */}
        <main className="md:col-span-3 space-y-6">
          {/* Top bar: mobile filters + sort */}
          <div className="flex items-center justify-between gap-4">
            <div className="md:hidden flex-1">
              <FiltersSheet
                trigger={
                  <Button variant="outline" className="w-full">
                    <Sliders size={16} className="mr-2" />
                    Filters
                  </Button>
                }
                initialParams={parsedParams}
              />
            </div>
            <SortDropdown value={parsedParams.sort} />
          </div>

          {/* Results grid */}
          {listings.length > 0 ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <SearchResultCard key={listing.id} listing={listing} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center py-8">
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

                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (parsedParams.page <= 3) {
                          pageNum = i + 1;
                        } else if (parsedParams.page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = parsedParams.page - 2 + i;
                        }

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
            <EmptyState
              title="No cars found"
              description="Try adjusting your filters to find more results"
              action={
                <a href="/search" className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
                  Clear Filters
                </a>
              }
            />
          )}
        </main>
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
