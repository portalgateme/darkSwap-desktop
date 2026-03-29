/**
 * Content-Security-Policy header generation for Electron BrowserWindow.
 *
 * Dev CSP:  allows localhost:3000, ws://, wss://, unsafe-inline for MUI/emotion.
 * Prod CSP: allows app://, wss://, unsafe-inline for styles, no unsafe-eval.
 */

export function buildCsp(isDev: boolean): string {
  if (isDev) {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "img-src 'self' data: https:",
      "connect-src 'self' http://localhost:3000 ws://localhost:3000 ws: wss: https:",
    ].join('; ')
  }

  return [
    "default-src 'self' app:",
    "script-src 'self' app:",
    "style-src 'self' 'unsafe-inline' app:",
    "font-src 'self' data: app:",
    "img-src 'self' data: https: app:",
    "connect-src 'self' app: ws: wss: https:",
  ].join('; ')
}
