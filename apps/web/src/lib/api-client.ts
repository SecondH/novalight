/**
 * Centralized API client -- per docs/architecture/011-frontend-architecture.md §12,
 * "Components must not call APIs directly." Minimal for the M1 onboarding skeleton (no
 * TanStack Query/React Hook Form wiring yet -- those remain "recommended" per
 * docs/architecture/social-ai-platform/028-m1-technical-design.md §4.3 and are added when a
 * second, more complex feature actually needs them, per ADR-014).
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  error: { code: string; message: string };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export async function apiRequest<T>(
  path: string,
  options: { method?: string; body?: unknown; token?: string } = {},
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // The backend's error envelope (success:false) is returned as-is, even for non-2xx
  // responses -- errors are handled by the caller reading `.success`, not by throwing on
  // every non-2xx status, per docs/architecture/011-frontend-architecture.md §15 "API error
  // handling" / "user-friendly messages" (no internal technical details exposed).
  return res.json() as Promise<ApiResponse<T>>;
}
