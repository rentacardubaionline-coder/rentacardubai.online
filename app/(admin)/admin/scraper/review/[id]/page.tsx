import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, MapPin, Phone, Globe, Star, MessageCircle, Clock, Building2, ExternalLink,
} from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import { DetailActions } from "@/components/admin/scraper/detail-actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminScraperReviewDetailPage({ params }: PageProps) {
  await requireRole("admin");
  const { id } = await params;
  const admin = createAdminClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: biz } = await (admin as any)
    .from("scraped_businesses")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!biz) notFound();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: reviewsData } = await (admin as any)
    .from("scraped_reviews")
    .select("id, reviewer_name, reviewer_avatar_url, rating, comment, review_date")
    .eq("scraped_business_id", id)
    .order("scraped_at", { ascending: false });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews = (reviewsData ?? []) as any[];

  const workingHours = biz.working_hours as Record<string, string> | null;
  const imageUrls = (biz.image_urls ?? []) as string[];

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin/scraper/review"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to review queue
      </Link>

      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {biz.category && (
                <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-[11px] font-semibold text-ink-600">
                  {biz.category}
                </span>
              )}
              {biz.city_name && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 ring-1 ring-amber-200">
                  <MapPin className="h-3 w-3" />
                  {biz.city_name}
                </span>
              )}
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-200">
                Pending review
              </span>
            </div>
            <h1 className="text-2xl font-bold text-ink-900">{biz.name}</h1>
            {biz.rating && (
              <div className="mt-2 flex items-center gap-2 text-sm text-ink-600">
                <div className="flex items-center gap-1 text-amber-700">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-bold">{Number(biz.rating).toFixed(1)}</span>
                </div>
                <span className="text-ink-400">•</span>
                <span>{biz.total_ratings ?? 0} Google reviews</span>
                <span className="text-ink-400">•</span>
                <span>{reviews.length} scraped</span>
              </div>
            )}
          </div>

          {/* Image gallery */}
          {imageUrls.length > 0 && (
            <section className="rounded-2xl overflow-hidden border border-surface-muted bg-white">
              <div className="grid grid-cols-4 gap-1 aspect-[16/9] max-h-[400px]">
                <div className="col-span-2 row-span-2 relative bg-surface-muted">
                  <Image
                    src={imageUrls[0]}
                    alt={biz.name}
                    fill
                    sizes="600px"
                    className="object-cover"
                  />
                </div>
                {imageUrls.slice(1, 5).map((url, i) => (
                  <div key={i} className="relative bg-surface-muted">
                    <Image
                      src={url}
                      alt={`${biz.name} photo ${i + 2}`}
                      fill
                      sizes="300px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="px-4 py-2 text-xs text-ink-400 border-t border-surface-muted">
                {imageUrls.length} photos scraped from Google. Will be uploaded to Cloudinary on approval.
              </p>
            </section>
          )}

          {/* Contact info */}
          <section className="rounded-2xl border border-surface-muted bg-white p-5">
            <h2 className="text-sm font-bold text-ink-900 mb-4">Contact Info</h2>
            <dl className="space-y-3 text-sm">
              {biz.address && (
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-ink-400 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Address</dt>
                    <dd className="text-ink-800">{biz.address}</dd>
                  </div>
                </div>
              )}
              {biz.normalised_phone && (
                <div className="flex gap-3">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Phone (normalised)</dt>
                    <dd>
                      <a
                        href={`https://wa.me/${biz.normalised_phone.replace(/[^\d]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-ink-800 hover:text-emerald-700"
                      >
                        {biz.normalised_phone}
                      </a>
                      {biz.phone && biz.phone !== biz.normalised_phone && (
                        <span className="ml-2 text-[11px] text-ink-400">(raw: {biz.phone})</span>
                      )}
                    </dd>
                  </div>
                </div>
              )}
              {biz.website && (
                <div className="flex gap-3">
                  <Globe className="h-4 w-4 text-brand-500 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Website</dt>
                    <dd>
                      <a href={biz.website} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:underline">
                        {biz.website}
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {biz.google_maps_url && (
                <div className="flex gap-3">
                  <Building2 className="h-4 w-4 text-ink-400 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Google Maps</dt>
                    <dd>
                      <a
                        href={biz.google_maps_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                      >
                        View on Maps <ExternalLink className="h-3 w-3" />
                      </a>
                    </dd>
                  </div>
                </div>
              )}
              {(biz.lat && biz.lng) && (
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Coordinates</dt>
                    <dd className="font-mono text-xs text-ink-600">{biz.lat.toFixed(5)}, {biz.lng.toFixed(5)}</dd>
                  </div>
                </div>
              )}
            </dl>
          </section>

          {/* Description */}
          {biz.description && (
            <section className="rounded-2xl border border-surface-muted bg-white p-5">
              <h2 className="text-sm font-bold text-ink-900 mb-3">Description</h2>
              <p className="text-sm text-ink-700 whitespace-pre-line leading-relaxed">{biz.description}</p>
            </section>
          )}

          {/* Working hours */}
          {workingHours && Object.keys(workingHours).length > 0 && (
            <section className="rounded-2xl border border-surface-muted bg-white p-5">
              <h2 className="text-sm font-bold text-ink-900 mb-3 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-amber-500" />
                Business Hours
              </h2>
              <div className="grid sm:grid-cols-2 gap-1 text-sm">
                {Object.entries(workingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between gap-4 border-b border-surface-muted/50 py-1.5">
                    <span className="font-medium text-ink-700">{day}</span>
                    <span className="text-ink-500 text-right">{String(hours)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Reviews */}
          {reviews.length > 0 && (
            <section className="rounded-2xl border border-surface-muted bg-white p-5">
              <h2 className="text-sm font-bold text-ink-900 mb-4 flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4 text-amber-500" />
                Scraped Reviews ({reviews.length})
              </h2>
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="flex gap-3 pb-4 border-b border-surface-muted last:border-b-0 last:pb-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-muted overflow-hidden">
                      {r.reviewer_avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.reviewer_avatar_url} alt={r.reviewer_name} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-ink-500">{(r.reviewer_name ?? "?").charAt(0)}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-ink-900">{r.reviewer_name}</span>
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                          {r.rating}
                        </span>
                        {r.review_date && (
                          <span className="text-[11px] text-ink-400">• {r.review_date}</span>
                        )}
                      </div>
                      {r.comment && (
                        <p className="mt-1 text-sm text-ink-600 whitespace-pre-line">{r.comment}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-8 h-fit space-y-4">
          <div className="rounded-2xl border border-surface-muted bg-white p-5">
            <h3 className="text-sm font-bold text-ink-900 mb-3">Ready to import?</h3>
            <p className="text-xs text-ink-500 mb-4">
              Approving will create a public vendor page, upload images to Cloudinary, and import all reviews.
              Business will be marked &quot;unclaimed&quot; so the owner can later claim it.
            </p>
            <DetailActions scrapedId={biz.id} businessName={biz.name} />
          </div>

          {/* Meta */}
          <div className="rounded-2xl border border-surface-muted bg-white p-5 text-xs text-ink-500 space-y-1.5">
            <div>
              <span className="font-semibold text-ink-700">Scraped:</span>{" "}
              {new Date(biz.scraped_at).toLocaleString()}
            </div>
            {biz.google_place_id && (
              <div>
                <span className="font-semibold text-ink-700">Place ID:</span>{" "}
                <code className="text-[10px]">{biz.google_place_id}</code>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
