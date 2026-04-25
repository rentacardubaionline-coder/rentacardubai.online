import { PageTransition } from "@/components/transitions/page-transition";

export default function SeoTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="smooth">{children}</PageTransition>;
}
