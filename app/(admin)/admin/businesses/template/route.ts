import { NextResponse } from "next/server";

const HEADERS = [
  "name",
  "category",
  "city",
  "phone",
  "whatsapp_phone",
  "email",
  "website_url",
  "address_line",
  "description",
  "logo_url",
  "cover_url",
  "image_1_url",
  "image_2_url",
  "image_3_url",
  "image_4_url",
  "image_5_url",
  "image_6_url",
  "rating",
  "established_year",
  "google_maps_url",
].join(",");

export async function GET() {
  return new NextResponse(HEADERS + "\n", {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="businesses-template.csv"',
    },
  });
}
