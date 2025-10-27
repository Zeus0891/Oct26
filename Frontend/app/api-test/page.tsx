'use client'

import React, { useEffect, useState } from 'react'

type Probe = {
  url: string
  status: number
  ok: boolean
  bodySnippet?: string
  error?: string
}
type HealthResponse = {
  configuredBase: string
  resolved: { base: string; health: string; apiStatus: string }
  sentHeaders: Record<string, string>
  checks: { health: Probe; apiStatus: Probe }
  timestamp: string
}

export default function ApiTestPage() {
  const [data, setData] = useState<HealthResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch('/api/backend-health', { cache: 'no-store' })
        const json = await res.json()
        setData(json)
      } catch (e) {
        setError((e as Error).message)
      }
    })()
  }, [])

  if (error) return <pre className="p-4 text-red-600">{error}</pre>
  if (!data) return <div className="p-4">Checking backend connectivity…</div>

  const health: Probe = data.checks.health
  const apiStatus: Probe = data.checks.apiStatus

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Backend Connectivity</h1>
      <div className="text-sm text-muted-foreground">
        <div>
          <strong>Configured Base:</strong> {data.configuredBase}
        </div>
        <div>
          <strong>Resolved:</strong> {JSON.stringify(data.resolved)}
        </div>
        <div>
          <strong>Sent Headers:</strong> {JSON.stringify(data.sentHeaders)}
        </div>
        <div>
          <strong>Time:</strong> {data.timestamp}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section className="neomorphic-card p-4">
          <h2 className="font-medium">/health</h2>
          <div>
            Status: {health.status} {health.ok ? 'OK' : 'FAIL'}
          </div>
          {health.error && (
            <div className="text-red-600">Error: {health.error}</div>
          )}
          {health.bodySnippet && (
            <pre className="mt-2 p-2 bg-muted/40 rounded text-xs whitespace-pre-wrap">
              {health.bodySnippet}
            </pre>
          )}
        </section>
        <section className="neomorphic-card p-4">
          <h2 className="font-medium">/api/status</h2>
          <div>
            Status: {apiStatus.status} {apiStatus.ok ? 'OK' : 'FAIL'}
          </div>
          {apiStatus.error && (
            <div className="text-red-600">Error: {apiStatus.error}</div>
          )}
          {apiStatus.bodySnippet && (
            <pre className="mt-2 p-2 bg-muted/40 rounded text-xs whitespace-pre-wrap">
              {apiStatus.bodySnippet}
            </pre>
          )}
        </section>
      </div>
    </div>
  )
}
