import { PageTransition } from "@/components/transitions/page-transition";

export default function DashboardsTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="snappy">{children}</PageTransition>;
}
