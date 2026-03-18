import { NextResponse } from "next/server"

export function middleware(request) {
  // Sem crypto.randomUUID, gera um nonce simples
  const nonce = Math.random().toString(36).substring(2, 15)

  const csp = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' https://www.gstatic.com 'unsafe-inline';
    style-src 'self' 'nonce-${nonce}' https://fonts.googleapis.com 'unsafe-inline';
    img-src 'self' data: https://via.placeholder.com https://images.unsplash.com;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.firebaseio.com https://identitytoolkit.googleapis.com;
    frame-src 'self' https://*.firebaseapp.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    upgrade-insecure-requests;
  `.replace(/\s+/g, " ").trim()

  const response = NextResponse.next()
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("x-nonce", nonce)

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
