import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import React from "react";

export const metadata = {
  title: "Build Projects | ALTFaze - Project Management",
  description: "Manage and collaborate on projects with freelancers. Track progress, set milestones, and deliver on time.",
};

const projects = [
  { id: 1, title: "E-commerce Website Redesign", category: "Web Design", budget: "$2,000-5,000", timeline: "4-6 weeks", status: "Active", proposals: 12 },
  { id: 2, title: "Mobile App Development", category: "Development", budget: "$5,000-10,000", timeline: "8-12 weeks", status: "Active", proposals: 8 },
  { id: 3, title: "Brand Strategy & Logo Design", category: "Design", budget: "$1,000-2,000", timeline: "2-3 weeks", status: "Active", proposals: 15 },
  { id: 4, title: "Content Writing - Blog Series", category: "Writing", budget: "$500-1,000", timeline: "3-4 weeks", status: "Filled", proposals: 24 },
  { id: 5, title: "App UI/UX Design", category: "Design", budget: "$3,000-4,000", timeline: "6-8 weeks", status: "Active", proposals: 19 },
  { id: 6, title: "Digital Marketing Campaign", category: "Marketing", budget: "$2,000-3,000", timeline: "3-4 weeks", status: "Active", proposals: 7 },
];

export default function ProjectsPage() {
  const activeProjects = projects.filter((p) => p.status === "Active");
  const filledProjects = projects.filter((p) => p.status === "Filled");

  return (
    <>
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-20">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Build Your Projects
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Post your project needs, get competitive bids, and collaborate with the best talent. Manage everything from start to finish.
          </p>
        </div>
      </section>

      {/* Create Project CTA */}
      <section className="container py-8 md:py-12">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 rounded-lg p-8 md:p-12 text-center space-y-4">
          <h2 className="font-heading text-2xl md:text-3xl">Have a New Project?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Post your project in minutes. Get bids from qualified freelancers within hours. Start collaborating immediately.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-primary">
              Post Your Project Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Active Projects Section */}
      <section className="container space-y-6 py-8 md:py-12">
        <div className="space-y-4">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl">Active Projects</h2>
            <p className="text-muted-foreground">Current opportunities looking for freelancers</p>
          </div>
          <div className="space-y-4">
            {activeProjects.map((project) => (
              <Card key={project.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{project.title}</h3>
                          <p className="text-sm text-muted-foreground">{project.category}</p>
                        </div>
                        <Badge variant="default">Active</Badge>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span>💰 {project.budget}</span>
                        <span>📅 {project.timeline}</span>
                        <span>📝 {project.proposals} proposals</span>
                      </div>
                    </div>
                    <Link href="/login">
                      <Button>View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Filled Projects Section */}
      {filledProjects.length > 0 && (
        <section className="container space-y-6 py-8 md:py-12">
          <div className="space-y-4">
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl">Recently Filled</h2>
              <p className="text-muted-foreground">These projects found their perfect match</p>
            </div>
            <div className="space-y-4">
              {filledProjects.map((project) => (
                <Card key={project.id} className="border-0 shadow-md opacity-75">
                  <CardContent className="p-6">
                    <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                      <div className="space-y-2">
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg line-through">{project.title}</h3>
                            <p className="text-sm text-muted-foreground">{project.category}</p>
                          </div>
                          <Badge variant="outline">Filled</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How It Works Section */}
      <section className="container bg-slate-50 dark:bg-slate-900 rounded-lg py-12 md:py-16 my-8">
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl">How Project Posting Works</h2>
            <p className="text-muted-foreground">Four simple steps to get your project done</p>
          </div>
          <div className="grid gap-6 md:grid-cols-4">
            <div className="space-y-3 text-center">
              <div className="text-4xl font-bold text-primary">1</div>
              <h3 className="font-semibold">Post Your Project</h3>
              <p className="text-sm text-muted-foreground">Describe what you need, budget, and timeline</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-4xl font-bold text-primary">2</div>
              <h3 className="font-semibold">Get Bids</h3>
              <p className="text-sm text-muted-foreground">Freelancers submit proposals with their rates</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-4xl font-bold text-primary">3</div>
              <h3 className="font-semibold">Choose & Contract</h3>
              <p className="text-sm text-muted-foreground">Select the best candidate and agree on terms</p>
            </div>
            <div className="space-y-3 text-center">
              <div className="text-4xl font-bold text-primary">4</div>
              <h3 className="font-semibold">Collaborate & Pay</h3>
              <p className="text-sm text-muted-foreground">Work together and pay upon completion</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why ALTFaze Projects Section */}
      <section className="container py-8 md:py-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Easy to Post</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Post your project in under 5 minutes. Our guided process makes it simple to describe what you need.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Quality Talent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Access vetted professionals with proven track records and client reviews.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Protected Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Money is held in escrow until you&apos;re satisfied with the work. Full protection guaranteed.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Project Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Built-in tools for collaboration, file sharing, and milestone tracking.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Transparent Communication</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Integrated messaging keeps all conversations on the platform for easy reference.
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Support & Mediation</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Our support team helps resolve disputes and ensures project success.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
            Start Your Next Project Today
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Post your project and connect with talented freelancers ready to help you succeed.
          </p>
          <div className="space-x-4 pt-4">
            <Link href="/login">
              <Button size="lg">Post a Project</Button>
            </Link>
            <Link href="/hire">
              <Button size="lg" variant="outline">
                Browse Freelancers
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
