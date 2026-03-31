import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req: { nextUrl: { pathname: string; search: any }; url: string | URL | undefined }) {
    {/* @ts-ignore */}
    const token = await getToken({ req })
    const isAuth = !!token
    const isAuthPage =
      req.nextUrl.pathname.startsWith("/login") ||
      req.nextUrl.pathname.startsWith("/register") ||
      req.nextUrl.pathname.startsWith("/onboard")

    if (isAuthPage) {
      if (isAuth) {
        if (req.nextUrl.pathname.startsWith("/login") || req.nextUrl.pathname.startsWith("/register")) {
          return NextResponse.redirect(new URL("/onboard", req.url))
        }
        // Allow access to /onboard if authenticated
        return null
      }
      // Redirect unauthenticated users to login from onboard
      if (req.nextUrl.pathname.startsWith("/onboard")) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      return null
    }

    // Check role-based routing
    if (req.nextUrl.pathname.startsWith("/client/dashboard") || req.nextUrl.pathname.startsWith("/client")) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      // Token role is checked in the layout.tsx file
      return null
    }

    if (req.nextUrl.pathname.startsWith("/freelancer/dashboard") || req.nextUrl.pathname.startsWith("/freelancer")) {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      // Token role is checked in the layout.tsx file
      return null
    }

    // Default dashboard redirect for backward compatibility
    if (req.nextUrl.pathname === "/dashboard" || req.nextUrl.pathname.startsWith("/dashboard")) {
      if (!isAuth) {
        let from = req.nextUrl.pathname;
        if (req.nextUrl.search) {
          from += req.nextUrl.search;
        }
        return NextResponse.redirect(
          new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
        );
      }
      // Redirect /dashboard to appropriate role dashboard
      const role = token?.role as string || "CLIENT"
      if (role === "FREELANCER") {
        return NextResponse.redirect(new URL("/freelancer/dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/client/dashboard", req.url))
    }

    if (!isAuth) {
      let from = req.nextUrl.pathname;
      if (req.nextUrl.search) {
        from += req.nextUrl.search;
      }

      return NextResponse.redirect(
        new URL(`/login?from=${encodeURIComponent(from)}`, req.url)
      );
    }
  },
  {
    callbacks: {
      async authorized() {
        // This is a work-around for handling redirect on auth pages.
        // We return true here so that the middleware function above
        // is always called.
        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/login',
    '/register',
    '/onboard',
    '/dashboard/:path*',
    '/client/:path*',
    '/freelancer/:path*',
  ]
}