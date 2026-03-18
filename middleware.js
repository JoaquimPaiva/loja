import { NextResponse } from "next/server"

// Middleware compatível com Vercel Edge
export function middleware(request) {
  // Nonce simples compatível com Edge Runtime
  const nonce = Math.random().toString(36).substring(2, 15)

  // Content Security Policy (CSP)
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

  // Cria a resposta com os headers CSP e x-nonce
  const response = NextResponse.next()
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("x-nonce", nonce)

  return response
}

// Aplica o middleware a todas as rotas exceto API, static e image
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
