import { createClient } from "@/lib/supabase/server";
import { Database } from "@/types/database";

export type Business = Database["public"]["Tables"]["businesses"]["Row"];

export async function getBusinessBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("businesses")
    .select(`
      *,
      business_images (
        url,
        is_primary,
        sort_order
      ),
      business_reviews (
        reviewer_name,
        reviewer_avatar_url,
        rating,
        comment,
        created_at
      )
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error("Error fetching business:", error);
    return null;
  }

  return data;
}

export async function getBusinessListings(businessId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("listings")
    .select(`
      id,
      slug,
      title,
      year,
      city,
      transmission,
      fuel,
      seats,
      color,
      mileage_km,
      primary_image_url,
      status,
      pricing:listing_pricing (
        tier,
        price_pkr
      )
    `)
    .eq("business_id", businessId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching business listings:", error);
    return [];
  }

  return data;
}
export async function getSimilarBusinesses(city: string, excludeId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, address_line, city, phone, logo_url")
    .eq("city", city)
    .neq("id", excludeId)
    .limit(3);

  if (error) {
    console.error("Error fetching similar businesses:", error);
    return [];
  }

  return data;
}
