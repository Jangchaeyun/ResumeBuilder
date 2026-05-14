const TOKEN_KEY = 'resume_builder_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export type ApiErrorBody = {
  message?: string
  errors?: Record<string, string> | string
}

export async function parseApiError(res: Response): Promise<string> {
  try {
    const body = (await res.json()) as ApiErrorBody
    if (typeof body.errors === 'string') return body.errors
    if (body.errors && typeof body.errors === 'object') {
      const first = Object.values(body.errors)[0]
      if (first) return first
    }
    if (body.message) return body.message
  } catch {
    /* ignore */
  }
  return res.statusText || '요청에 실패했습니다.'
}

export async function apiFetch(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<Response> {
  const headers = new Headers(init.headers)
  const auth = init.auth !== false
  if (auth) {
    const t = getStoredToken()
    if (t) headers.set('Authorization', `Bearer ${t}`)
  }
  if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  const { auth: _a, ...rest } = init
  return fetch(path, { ...rest, headers })
}

import type { Resume } from '../types/models'

export function normalizeResume(raw: Record<string, unknown>): Resume {
  const id = (raw.id as string) ?? (raw._id as string) ?? ''
  return { ...(raw as object), id } as Resume
}
