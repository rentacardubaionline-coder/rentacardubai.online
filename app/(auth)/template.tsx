import { PageTransition } from "@/components/transitions/page-transition";

export default function AuthTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="smooth">{children}</PageTransition>;
}
