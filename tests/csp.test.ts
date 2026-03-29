import { buildCsp } from '../electron/main/csp'

describe('buildCsp', () => {
  describe('development mode', () => {
    const csp = buildCsp(true)

    it('allows localhost:3000 in connect-src', () => {
      expect(csp).toContain('http://localhost:3000')
      expect(csp).toContain('ws://localhost:3000')
    })

    it('allows ws: and wss: for WebSocket connections', () => {
      expect(csp).toMatch(/connect-src[^;]*\bws:/)
      expect(csp).toMatch(/connect-src[^;]*\bwss:/)
    })

    it('allows unsafe-inline for style-src (MUI/emotion)', () => {
      expect(csp).toMatch(/style-src[^;]*'unsafe-inline'/)
    })

    it('allows unsafe-eval in script-src for Next.js React Refresh', () => {
      expect(csp).toMatch(/script-src[^;]*'unsafe-eval'/)
    })

    it('does not include app: protocol', () => {
      expect(csp).not.toContain('app:')
    })

    it('includes default-src self', () => {
      expect(csp).toMatch(/default-src\s+'self'/)
    })

    it('includes script-src self with unsafe-eval for dev HMR', () => {
      expect(csp).toMatch(/script-src\s+'self'\s+'unsafe-eval'/)
    })

    it('allows data: URIs for fonts and images', () => {
      expect(csp).toMatch(/font-src[^;]*data:/)
      expect(csp).toMatch(/img-src[^;]*data:/)
    })

    it('allows https: for connect-src and img-src', () => {
      expect(csp).toMatch(/connect-src[^;]*https:/)
      expect(csp).toMatch(/img-src[^;]*https:/)
    })
  })

  describe('production mode', () => {
    const csp = buildCsp(false)

    it('allows app:// protocol in default-src', () => {
      expect(csp).toMatch(/default-src[^;]*app:/)
    })

    it('allows app: in script-src', () => {
      expect(csp).toMatch(/script-src[^;]*app:/)
    })

    it('allows app: in style-src', () => {
      expect(csp).toMatch(/style-src[^;]*app:/)
    })

    it('allows unsafe-inline for style-src (MUI/emotion)', () => {
      expect(csp).toMatch(/style-src[^;]*'unsafe-inline'/)
    })

    it('does not allow unsafe-eval anywhere', () => {
      expect(csp).not.toContain('unsafe-eval')
    })

    it('does not include localhost references', () => {
      expect(csp).not.toContain('localhost')
    })

    it('allows ws: and wss: for WebSocket connections', () => {
      expect(csp).toMatch(/connect-src[^;]*\bws:/)
      expect(csp).toMatch(/connect-src[^;]*\bwss:/)
    })

    it('allows data: URIs for fonts and images', () => {
      expect(csp).toMatch(/font-src[^;]*data:/)
      expect(csp).toMatch(/img-src[^;]*data:/)
    })

    it('allows https: for connect-src and img-src', () => {
      expect(csp).toMatch(/connect-src[^;]*https:/)
      expect(csp).toMatch(/img-src[^;]*https:/)
    })
  })
})
