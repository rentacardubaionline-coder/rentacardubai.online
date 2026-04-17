import { JsonLd } from "./json-ld";
import { generateWebSiteSchema, generateOrganizationSchema } from "@/lib/seo/structured-data";

/** Inject WebSite + Organization schemas in root layout */
export function SiteSchema() {
  return (
    <>
      <JsonLd data={generateWebSiteSchema()} />
      <JsonLd data={generateOrganizationSchema()} />
    </>
  );
}
