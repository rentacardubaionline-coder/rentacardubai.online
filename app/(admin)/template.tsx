import { PageTransition } from "@/components/transitions/page-transition";

export default function AdminTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="snappy">{children}</PageTransition>;
}
