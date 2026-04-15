import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-muted px-4 py-8">
      <Card className="w-full max-w-md shadow-card">
        <CardHeader className="text-center">
          <CardTitle>Check your email</CardTitle>
          <CardDescription>
            We&apos;ve sent a confirmation link to your email address.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-ink-600">
            Click the link in the email to confirm your account and get started.
          </p>

          <div className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
            <p>The confirmation link will expire in 24 hours.</p>
          </div>

          <div className="pt-4">
            <p className="text-xs text-ink-400 text-center mb-3">
              Didn&apos;t get the email? Check your spam folder or{" "}
              <Link href="/signup" className="text-brand-500 hover:text-brand-600">
                try signing up again
              </Link>.
            </p>
          </div>

          <Link href="/login" className="block">
            <Button variant="outline" className="w-full">
              Back to sign in
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
