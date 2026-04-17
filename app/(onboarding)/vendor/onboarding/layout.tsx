import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Set up your account — RentNowPk",
  description: "Complete your vendor profile to start listing cars on RentNowPk.",
};

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-50 via-white to-brand-50/20">
      {children}
    </div>
  );
}
