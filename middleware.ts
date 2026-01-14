/* eslint-disable @typescript-eslint/no-unused-vars */
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/contact",
  "/faq",
  "/terms",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/books(.*)",
  "/api/verify-admin(.*)",
  "/api/verify-role(.*)",
  "/user/reader(.*)",
  "www.google.com(.*)",
  "/api/contact(.*)",
]);

export default clerkMiddleware(async (auth, request) => {


  
  // 1) libera rotas públicas
  if (isPublicRoute(request)) return NextResponse.next();

  // 2) exige autenticação (redirect para sign-in se necessário)
  const { userId, redirectToSignIn } = await auth();
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: request.url });
  }

  // 3) se rota admin, pergunta ao endpoint server-side se é admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
  try {
    const res = await fetch(`${request.nextUrl.origin}/api/verify-role`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
      cache: "no-store",
      credentials: "same-origin",
    });

    if (!res.ok) {
    
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    const { role } = await res.json();
    

    if (role !== "admin") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  } catch (err) {
    
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }
}


  // 4️ Rota USER — apenas user e estudante
  if (request.nextUrl.pathname.startsWith("/user")) {
    try {
      const res = await fetch(`${request.nextUrl.origin}/api/verify-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
        credentials: "same-origin",
        cache: "no-store",
      });

      if (!res.ok) {
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }

      const { role } = await res.json();
     if (!["user", "student", "admin"].includes(role)) {
        // admin também pode acessar, se quiser permitir
        return NextResponse.redirect(new URL("/unauthorized", request.url));
      }
    } catch (err) {
      
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
  }


  // 4) tudo ok — segue
  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
