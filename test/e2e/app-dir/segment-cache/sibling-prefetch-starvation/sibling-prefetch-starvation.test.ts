import { nextTestSetup, type Playwright } from 'e2e-utils'
import { retry } from 'next-test-utils'

describe('segment cache sibling prefetch starvation', () => {
  const { next, isNextDev } = nextTestSetup({
    files: __dirname,
  })

  if (isNextDev) {
    it('skipped in development', () => {})
    return
  }

  it('prefetches every statically generated sibling after bandwidth frees', async () => {
    let page!: Playwright.Page
    const requestedSlugs = new Set<string>()

    const browser = await next.browser('/', {
      beforePageLoad(p) {
        page = p
        page.on('request', (request) => {
          const { pathname } = new URL(request.url())
          const match = /^\/products\/([^/.]+)/.exec(pathname)
          if (match !== null) {
            requestedSlugs.add(match[1])
          }
        })
      },
    })

    await browser.eval(`
      for (const slug of ['alpha', 'bravo', 'charlie', 'delta', 'echo']) {
        window.next.router.prefetch('/products/' + slug)
      }
    `)

    await retry(() => {
      expect([...requestedSlugs].sort()).toEqual([
        'alpha',
        'bravo',
        'charlie',
        'delta',
        'echo',
      ])
    })
  })
})
