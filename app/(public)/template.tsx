import { PageTransition } from "@/components/transitions/page-transition";

export default function PublicTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="smooth">{children}</PageTransition>;
}
