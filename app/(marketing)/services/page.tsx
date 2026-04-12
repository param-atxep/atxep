import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Services | ALTFaze - Freelance Platform",
  description: "Discover all ALTFaze services: hire freelancers, become a freelancer, build projects, buy templates, and get professional help.",
};

export default function ServicesPage() {
  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-20">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Our Services
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Everything you need to succeed in the gig economy. From hiring talent to selling your expertise.
          </p>
        </div>
      </section>

      <section className="container space-y-12 py-8 md:py-12 lg:py-24">
        <div className="grid gap-8 md:grid-cols-2">
          {/* Service 1 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Hire Freelancers</CardTitle>
              <CardDescription>Find and hire the best talent for your projects</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Access thousands of vetted professionals across 100+ skills and expertise areas. From developers and designers to marketers and project managers.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Browse by skill and experience
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Verified ratings and portfolios
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Secure escrow payments
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  24/7 support
                </li>
              </ul>
              <Link href="/hire">
                <Button className="w-full mt-4">Browse Freelancers</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Service 2 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Become a Freelancer</CardTitle>
              <CardDescription>Monetize your skills and build your freelance career</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Join thousands of successful freelancers earning on ALTFaze. Showcase your work, manage projects, and build a sustainable income stream.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Create professional profiles
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Bid on projects directly
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Get full visibility into opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Easy withdrawals
                </li>
              </ul>
              <Link href="/login">
                <Button className="w-full mt-4">Sign Up as Freelancer</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Service 3 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Build Projects</CardTitle>
              <CardDescription>Manage and collaborate on projects seamlessly</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Post your project needs, get competitive bids, and collaborate with your team. Track progress, manage budgets, and deliver on time.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Easy project posting
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Team collaboration tools
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Progress tracking and milestones
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Integrated messaging
                </li>
              </ul>
              <Link href="/projects">
                <Button className="w-full mt-4">Start a Project</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Service 4 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Buy Templates</CardTitle>
              <CardDescription>Accelerate your projects with professional templates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Browse a curated collection of templates for websites, apps, designs, and more. Speed up your development with production-ready code and assets.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  100+ professional templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Free and premium options
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Full source code access
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Lifetime updates
                </li>
              </ul>
              <Link href="/templates">
                <Button className="w-full mt-4">Browse Templates</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Service 5 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Get Expert Help</CardTitle>
              <CardDescription>Expert guidance when you need it most</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Need consulting or expert advice? Connect with specialists in business strategy, technology, marketing, and more to help you succeed.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  1-on-1 consulting sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Expert mentorship programs
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Business strategy workshops
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Priority support access
                </li>
              </ul>
              <Button className="w-full mt-4">Talk to an Expert</Button>
            </CardContent>
          </Card>

          {/* Service 6 */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Sell Your Templates</CardTitle>
              <CardDescription>Create a new revenue stream with your designs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Have great designs or code? Sell your templates to thousands of potential customers. Passive income from your creative work.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Easy template publishing
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Competitive revenue share
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Marketing support
                </li>
                <li className="flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-primary" />
                  Analytics and insights
                </li>
              </ul>
              <Button className="w-full mt-4" variant="outline">
                Become a Creator
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Ready to Get Started?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join thousands of professionals and businesses using ALTFaze to succeed.
          </p>
          <div className="space-x-4 pt-4">
            <Link href="/login">
              <Button size="lg">Sign Up Now</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
