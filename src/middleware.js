// src/middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  // Halaman publik yang tidak perlu autentikasi
  const publicPaths = ["/login", "/register", "/"];
  const isPublicPath = publicPaths.includes(pathname);

  // Jika tidak ada token dan mencoba akses halaman protected
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika ada token dan mencoba akses halaman login/register
  if (token && (pathname === "/login" || pathname === "/register")) {
    // Arahkan ke dasbor default, AuthContext di sisi klien akan menangani
    // pengalihan ke dasbor yang sesuai dengan peran pengguna.
    return NextResponse.redirect(
      new URL("/super-admin/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
