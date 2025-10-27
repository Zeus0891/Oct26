import { env } from '@/config/env'

function buildUrls(base: string) {
  const trimmed = base.replace(/\/$/, '')
  const hasApi = trimmed.endsWith('/api')
  const originForHealth = hasApi ? trimmed.slice(0, -4) : trimmed
  return {
    base: trimmed,
    health: `${originForHealth}/health`,
    apiStatus: `${hasApi ? trimmed : `${trimmed}/api`}/status`,
  }
}

export async function GET() {
  const configured = process.env.NEXT_PUBLIC_API_URL || env.API_URL
  const urls = buildUrls(configured)

  const headers: Record<string, string> = {}
  if (env.TENANT_ID) headers['x-tenant-id'] = env.TENANT_ID

  async function probe(url: string) {
    try {
      const res = await fetch(url, {
        headers,
        cache: 'no-store',
      })
      const text = await res.text()
      return {
        url,
        status: res.status,
        ok: res.ok,
        bodySnippet: text.slice(0, 400),
      }
    } catch (err) {
      return {
        url,
        status: 0,
        ok: false,
        error: (err as Error).message || 'fetch_failed',
      }
    }
  }

  const [health, apiStatus] = await Promise.all([
    probe(urls.health),
    probe(urls.apiStatus),
  ])

  return Response.json({
    configuredBase: configured,
    resolved: urls,
    sentHeaders: headers,
    checks: { health, apiStatus },
    timestamp: new Date().toISOString(),
  })
}
