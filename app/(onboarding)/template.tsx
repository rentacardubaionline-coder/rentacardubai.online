import { PageTransition } from "@/components/transitions/page-transition";

export default function OnboardingTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageTransition variant="smooth">{children}</PageTransition>;
}
