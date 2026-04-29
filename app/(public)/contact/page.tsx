"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Phone, MapPin } from "lucide-react";
import { submitContactFormAction } from "@/app/actions/contact";
import { toast } from "sonner";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await submitContactFormAction(formData);

    setLoading(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    setSuccess(true);

    // Reset form
    (e.target as HTMLFormElement).reset();
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="space-y-12 bg-surface-muted px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-ink-900">
            Contact us
          </h1>
          <p className="mt-4 text-lg text-ink-600">
            Have a question? We'd love to hear from you.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Contact info */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail className="size-5 text-brand-500" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="mailto:help@rentacardubai.online"
                  className="text-brand-600 hover:underline"
                >
                  help@rentacardubai.online
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Phone className="size-5 text-brand-500" />
                  WhatsApp
                </CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href="https://wa.me/971"
                  className="text-brand-600 hover:underline"
                >
                  Chat with us
                </a>
              </CardContent>
            </Card>

            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <MapPin className="size-5 text-brand-500" />
                  Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ink-600">Business Bay, Dubai</p>
              </CardContent>
            </Card>
          </div>

          {/* Contact form */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Send a message</CardTitle>
              <CardDescription>
                We'll get back to you within 24 hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" name="name" required disabled={loading} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    disabled={loading}
                  />
                </div>

                {success && (
                  <div className="rounded-lg bg-brand-50 px-4 py-3 text-sm text-brand-700">
                    Thanks for reaching out! We'll be in touch soon.
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send message"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
