"use client";

import { motion } from "framer-motion";
import { Car, Heart, Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

import { Price } from "@/components/ui/price";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeading } from "@/components/ui/section-heading";
import { cardHover } from "@/lib/motion";

export default function KitchenSink() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <SectionHeading
        eyebrow="Phase 2"
        title="Kitchen Sink"
        description="All primitives rendered in the RentNowPk brand — orange accent, Mulish font. Hover the big Car card — it lifts using the cardHover motion preset."
      />

      <div className="grid gap-8">
        {/* Price */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-ink-500">
            Price
          </h3>
          <div className="flex flex-wrap items-end gap-6">
            <Price amount={8500} size="sm" suffix="/day" />
            <Price amount={52000} size="md" suffix="/week" />
            <Price amount={180000} size="lg" suffix="/month" />
          </div>
        </section>

        {/* Buttons */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Buttons</CardTitle>
            <CardDescription>
              Primary uses the brand orange primary token.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button>Default</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </CardContent>
        </Card>

        {/* Form primitives */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Form primitives</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" type="tel" placeholder="+92 3xx xxxxxxx" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" placeholder="A short note…" rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="terms" />
              <Label htmlFor="terms">I accept the terms</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch id="notify" />
              <Label htmlFor="notify">Email me about new leads</Label>
            </div>
          </CardContent>
        </Card>

        {/* Status & identity */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Status & identity</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-4">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Separator orientation="vertical" className="h-6" />
            <Avatar>
              <AvatarFallback>RN</AvatarFallback>
            </Avatar>
            <div className="w-48">
              <Progress value={62} />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Tabs</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-4 text-sm text-ink-700">
                Overview panel — compact, legible, Mulish.
              </TabsContent>
              <TabsContent value="pricing" className="pt-4 text-sm text-ink-700">
                Daily · Weekly · Monthly tiers in PKR.
              </TabsContent>
              <TabsContent value="policies" className="pt-4 text-sm text-ink-700">
                Deposit, min age, license, cancellation.
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Accordion */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Accordion</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion>
              <AccordionItem value="a">
                <AccordionTrigger>Requirements to rent</AccordionTrigger>
                <AccordionContent>
                  Valid CNIC, minimum age 22, valid driving license.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Frequently asked questions</AccordionTrigger>
                <AccordionContent>
                  Does the daily price include insurance? Yes — basic insurance
                  is always included.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Hoverable card using cardHover preset */}
        <motion.div {...cardHover}>
          <Card className="border-brand-200/60 shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="size-5 text-brand-500" />
                Hover me
              </CardTitle>
              <CardDescription>
                Card lifts using <code>cardHover</code> from{" "}
                <code>lib/motion.ts</code>.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Skeletons */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Skeleton loading</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </CardContent>
        </Card>

        {/* Empty state */}
        <Card className="shadow-card">
          <CardContent className="p-0">
            <EmptyState
              icon={<Inbox className="size-10" />}
              title="No leads yet"
              description="When a customer taps WhatsApp on one of your listings it'll show up here."
              action={
                <Button>
                  <Heart className="size-4" />
                  Browse cars
                </Button>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
