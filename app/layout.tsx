import type { Metadata } from "next";
import { MainNav } from "@/components/main-nav";
import { fontDisplay } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/providers";
import { ModeToggle } from "@/components/toggle";
import MobileNav from "@/components/mobile-nav";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALTFaze - Hire, Build, Launch",
  description: "The all-in-one platform to hire freelancers, build projects, buy templates, and get help",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning style={{ fontFamily: "var(--font-display)" }}>
      <body
        className={cn(
          "relative flex min-h-screen w-full flex-col justify-center scroll-smooth bg-background font-sans antialiased",
          fontDisplay.variable
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
          {/* <div className="flex min-h-screen flex-col">
            <header className="h-16 container sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-16 items-center justify-between py-6 w-full">
              <MobileNav />
                <MainNav />
                <nav>
                  <div className="md:flex">
                    <div className="flex gap-4">
                      <ModeToggle />
                      <Link
                        href="/login"
                        className={cn(
                          buttonVariants({ variant: "secondary", size: "sm" }),
                          "px-4"
                        )}
                      >
                        Get Started
                      </Link>
                    </div>
                  </div>
                </nav>
              </div>
            </header> */}
          {/* <HeroPage /> */}

          <main className="flex-1">{children}</main>
          {/* Removed SpeedInsights and Analytics to fix performance monitoring issues */}
          {/* <SiteFooter /> */}
          <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
