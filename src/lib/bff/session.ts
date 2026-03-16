import { NextResponse } from 'next/server';

export const AUTH_COOKIE_NAME = 'mediconsult_auth_session';

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

export function getBackendApiBaseUrl(): string {
  const baseUrl = process.env.BACKEND_API_URL ?? process.env.NEXT_PUBLIC_API_URL;

  if (!baseUrl) {
    throw new Error('Missing BACKEND_API_URL or NEXT_PUBLIC_API_URL environment variable.');
  }

  return trimTrailingSlash(baseUrl);
}

export function getAuthCookieConfig() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
  };
}

export function setAuthSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    ...getAuthCookieConfig(),
  });
}

export function clearAuthSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: '',
    maxAge: 0,
    ...getAuthCookieConfig(),
  });
}

export function stripTokenFromPayload<T>(payload: T): T {
  if (!payload || typeof payload !== 'object') {
    return payload;
  }

  const payloadRecord = payload as Record<string, unknown>;
  const data = payloadRecord.data;

  if (!data || typeof data !== 'object') {
    return payload;
  }

  const dataRecord = data as Record<string, unknown>;
  if (!('token' in dataRecord)) {
    return payload;
  }

  const sanitizedData = { ...dataRecord };
  delete sanitizedData.token;

  return {
    ...payloadRecord,
    data: sanitizedData,
  } as T;
}
