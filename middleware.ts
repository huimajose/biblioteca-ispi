import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { verifyAdmin } from "./db/crud/users.crud";
import { getAuth } from "@clerk/nextjs/server";


const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/",
  "/contact",
  "/faq",
  "/terms",
  "/sign-up(.*)",
  "/api/books",
  "/api/books/(.*)",
  "/api/books/count(.*)",
  "/api/user/count(.*)",
  "/user/reader(.*)",
]);

export default clerkMiddleware(async (auth, request) => {

  if (!isPublicRoute(request)) {
    await auth.protect();

    //if(request.nextUrl.pathname.startsWith('/admin')) {
     
    //return NextResponse.redirect(new URL('/unauthorized', request.url))
  //}
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
