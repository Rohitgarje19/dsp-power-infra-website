import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only CSP: allows Vite's inline HMR bootstrap and websocket, plus the
// GA4 endpoints used only after cookie consent. Production must serve an
// equivalent policy from nginx.
const devCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob: https://www.google-analytics.com https://*.google-analytics.com",
  "connect-src 'self' ws://127.0.0.1:5173 ws://localhost:5173 https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const securityHeaders = {
  "Content-Security-Policy": devCsp,
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    strictPort: true,
    headers: securityHeaders,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8081",
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: securityHeaders,
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.js",
    css: false,
    include: ["src/**/*.{test,spec}.{js,jsx}"],
  },
});