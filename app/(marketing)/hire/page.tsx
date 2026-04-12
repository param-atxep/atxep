import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Hire Freelancers | ALTFaze - Find Top Talent",
  description: "Hire vetted freelancers for web development, design, marketing, and more. Find the perfect talent for your project.",
};

const freelancers = [
  { id: 1, name: "Alex Chen", title: "Full-stack Developer", skills: ["React", "Node.js", "AWS"], rate: 85, rating: 4.9, projects: 127, image: "👨‍💻" },
  { id: 2, name: "Maria García", title: "UI/UX Designer", skills: ["Figma", "Adobe XD", "Web Design"], rate: 75, rating: 4.8, projects: 89, image: "👩‍🎨" },
  { id: 3, name: "James Wilson", title: "Python Developer", skills: ["Django", "FastAPI", "Data Analysis"], rate: 80, rating: 4.9, projects: 156, image: "👨‍💼" },
  { id: 4, name: "Sofia Rodriguez", title: "Content Writer", skills: ["SEO", "Copywriting", "Blog Writing"], rate: 45, rating: 4.7, projects: 203, image: "📝" },
  { id: 5, name: "David Kim", title: "Mobile Developer", skills: ["React Native", "Swift", "Flutter"], rate: 90, rating: 5.0, projects: 78, image: "📱" },
  { id: 6, name: "Emma Thompson", title: "Digital Marketer", skills: ["Google Ads", "Social Media", "Analytics"], rate: 70, rating: 4.8, projects: 112, image: "📊" },
  { id: 7, name: "Lucas Silva", title: "Backend Engineer", skills: ["Kubernetes", "PostgreSQL", "Microservices"], rate: 95, rating: 4.9, projects: 134, image: "⚙️" },
  { id: 8, name: "Nina Patel", title: "Product Manager", skills: ["Agile", "Strategy", "User Research"], rate: 100, rating: 4.8, projects: 56, image: "🎯" },
  { id: 9, name: "Carlos López", title: "Video Editor", skills: ["Premiere Pro", "After Effects", "Animation"], rate: 55, rating: 4.7, projects: 98, image: "🎬" },
  { id: 10, name: "Lisa Anderson", title: "Brand Strategist", skills: ["Branding", "Design System", "Consulting"], rate: 110, rating: 5.0, projects: 67, image: "🎨" },
  { id: 11, name: "Marco Rossi", title: "DevOps Engineer", skills: ["Docker", "CI/CD", "AWS"], rate: 88, rating: 4.9, projects: 142, image: "🔧" },
  { id: 12, name: "Priya Sharma", title: "Data Scientist", skills: ["Python", "ML", "TensorFlow"], rate: 105, rating: 4.8, projects: 45, image: "📊" },
];

export default function HireFreelancersPage() {
  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-20">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Hire Top Freelancers
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Find vetted professionals across 100+ skills. From developers and designers to marketers and strategists.
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="container py-8 md:py-12">
        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-6 md:p-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Input placeholder="Search by skill..." className="md:col-span-2" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge>Top Rated</Badge>
            <Badge>Most Experienced</Badge>
            <Badge>Recently Active</Badge>
            <Badge>Web Development</Badge>
            <Badge>Design</Badge>
            <Badge>Marketing</Badge>
          </div>
        </div>
      </section>

      {/* Freelancers Grid */}
      <section className="container py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {freelancers.map((freelancer) => (
            <Card key={freelancer.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{freelancer.image}</div>
                  <Badge variant="outline">${freelancer.rate}/hr</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">{freelancer.name}</h3>
                  <p className="text-sm text-muted-foreground">{freelancer.title}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {freelancer.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-yellow-500">★ {freelancer.rating}</span>
                  <span className="text-muted-foreground">{freelancer.projects} projects</span>
                </div>
                <Link href="/login">
                  <Button className="w-full">Hire</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Why Hire Section */}
      <section className="container bg-slate-50 dark:bg-slate-900 rounded-lg py-12 md:py-16 my-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl">Why Hire on ALTFaze?</h2>
            <p className="text-muted-foreground">Everything you need for a successful project</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <h3 className="font-semibold">Vetted Professionals</h3>
              <p className="text-sm text-muted-foreground">All freelancers are verified with proven track records and ratings.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Secure Payments</h3>
              <p className="text-sm text-muted-foreground">Escrow system ensures payment security for both clients and freelancers.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Quality Guaranteed</h3>
              <p className="text-sm text-muted-foreground">Satisfaction guaranteed or your money back on any project.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">24/7 Support</h3>
              <p className="text-sm text-muted-foreground">Our support team is available round-the-clock to help resolve issues.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Easy Communication</h3>
              <p className="text-sm text-muted-foreground">Built-in messaging, file sharing, and project management tools.</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Time Tracking</h3>
              <p className="text-sm text-muted-foreground">Transparent tracking of hours worked with screenshots and activity logs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
            Ready to Find Your Perfect Freelancer?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Post your project or browse our directory of vetted professionals. Get started in minutes.
          </p>
          <div className="space-x-4 pt-4">
            <Link href="/projects">
              <Button size="lg">Post a Project</Button>
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
