// middleware.js

// Força o runtime para Node.js (não Edge)
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import crypto from "crypto"

// Middleware
export function middleware(request) {
  // Gera um nonce seguro
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64")

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

  // Cria a resposta e adiciona os headers
  const response = NextResponse.next()
  response.headers.set("Content-Security-Policy", csp)
  response.headers.set("x-nonce", nonce)

  return response
}

// Configuração de rotas que o middleware vai afetar
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
