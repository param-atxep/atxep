import { getToken } from "next-auth/jwt"
import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  async function middleware(req: { nextUrl: { pathname: string; search: any }; url: string | URL | undefined }) {
    // @ts-ignore
    const token = await getToken({ req })
    const isAuth = !!token
    const userRole = token?.role as string | undefined
    const isSuspended = token?.isSuspended as boolean | undefined

    // Reject suspended users immediately
    if (isSuspended) {
      return NextResponse.redirect(new URL("/login?error=suspended", req.url))
    }

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

    // ✅ FIXED: Direct bare path redirects to dashboards
    if (req.nextUrl.pathname === "/client") {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      if (userRole !== "CLIENT") {
        return NextResponse.redirect(new URL("/freelancer/my-dashboard", req.url))
      }
      // Redirect bare /client to /client/dashboard
      return NextResponse.redirect(new URL("/client/dashboard", req.url))
    }

    if (req.nextUrl.pathname === "/freelancer") {
      if (!isAuth) {
        return NextResponse.redirect(new URL("/login", req.url))
      }
      if (userRole !== "FREELANCER") {
        return NextResponse.redirect(new URL("/client/dashboard", req.url))
      }
      // Redirect bare /freelancer to /freelancer/my-dashboard
      return NextResponse.redirect(new URL("/freelancer/my-dashboard", req.url))
    }

    // ✅ FIXED: Proper role validation at middleware level (not delegated to layout)
    if (req.nextUrl.pathname.startsWith("/client")) {
      if (!isAuth) {
        console.log('[MIDDLEWARE] Unauthenticated /client access - redirecting to login')
        return NextResponse.redirect(new URL("/login", req.url))
      }
      
      // ✅ NEW: Validate role here at request level for security
      if (!userRole) {
        // No role yet - user is onboarding
        console.log('[MIDDLEWARE] No role set for authenticated user - redirecting to onboard')
        return NextResponse.redirect(new URL("/onboard", req.url))
      }
      
      if (userRole !== "CLIENT") {
        console.log('[MIDDLEWARE] Non-client user attempted access to /client', { role: userRole })
        // Redirect to appropriate dashboard for their role
        if (userRole === "FREELANCER") {
          return NextResponse.redirect(new URL("/freelancer/my-dashboard", req.url))
        }
        return NextResponse.redirect(new URL("/onboard", req.url))
      }
      
      console.log('[MIDDLEWARE] ✅ CLIENT role verified for /client route')
      return null
    }

    // ✅ FIXED: Same for freelancer routes
    if (req.nextUrl.pathname.startsWith("/freelancer")) {
      if (!isAuth) {
        console.log('[MIDDLEWARE] Unauthenticated /freelancer access - redirecting to login')
        return NextResponse.redirect(new URL("/login", req.url))
      }
      
      // ✅ NEW: Validate role here at request level for security
      if (!userRole) {
        // No role yet - user is onboarding
        console.log('[MIDDLEWARE] No role set for authenticated user - redirecting to onboard')
        return NextResponse.redirect(new URL("/onboard", req.url))
      }
      
      if (userRole !== "FREELANCER") {
        console.log('[MIDDLEWARE] Non-freelancer user attempted access to /freelancer', { role: userRole })
        // Redirect to appropriate dashboard for their role
        if (userRole === "CLIENT") {
          return NextResponse.redirect(new URL("/client/dashboard", req.url))
        }
        return NextResponse.redirect(new URL("/onboard", req.url))
      }
      
      console.log('[MIDDLEWARE] ✅ FREELANCER role verified for /freelancer route')
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
      const role = userRole || "CLIENT"
      if (role === "FREELANCER") {
        return NextResponse.redirect(new URL("/freelancer/my-dashboard", req.url))
      }
      return NextResponse.redirect(new URL("/client/dashboard", req.url))
    }

    // Protect all other authenticated routes
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