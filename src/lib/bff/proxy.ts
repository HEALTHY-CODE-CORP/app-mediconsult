import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { getBackendApiBaseUrl } from './session';

const REQUEST_HEADERS_BLOCKLIST = new Set([
  'host',
  'connection',
  'content-length',
  'cookie',
  'authorization',
]);

const RESPONSE_HEADERS_BLOCKLIST = new Set([
  'connection',
  'content-length',
  'content-encoding',
  'set-cookie',
  'transfer-encoding',
]);

interface ForwardRequestOptions {
  request: NextRequest;
  upstreamPath: string;
  authToken?: string | null;
  search?: string;
}

interface BuildResponseOptions {
  transformJson?: (payload: unknown) => unknown;
}

function hasBody(method: string): boolean {
  return method !== 'GET' && method !== 'HEAD';
}

function buildBackendUrl(upstreamPath: string, search = ''): string {
  const cleanPath = upstreamPath.replace(/^\/+/, '');
  return `${getBackendApiBaseUrl()}/${cleanPath}${search}`;
}

function buildUpstreamHeaders(request: NextRequest, authToken?: string | null): Headers {
  const headers = new Headers();

  request.headers.forEach((value, key) => {
    const normalizedKey = key.toLowerCase();
    if (REQUEST_HEADERS_BLOCKLIST.has(normalizedKey)) return;
    headers.set(key, value);
  });

  if (!headers.has('accept')) {
    headers.set('accept', 'application/json');
  }

  if (authToken) {
    headers.set('authorization', `Bearer ${authToken}`);
  }

  return headers;
}

function buildClientHeaders(upstreamHeaders: Headers): Headers {
  const headers = new Headers(upstreamHeaders);

  RESPONSE_HEADERS_BLOCKLIST.forEach((header) => {
    headers.delete(header);
  });

  return headers;
}

function isJsonResponse(contentType: string | null): boolean {
  return Boolean(contentType && contentType.includes('application/json'));
}

export async function forwardRequestToBackend({
  request,
  upstreamPath,
  authToken,
  search,
}: ForwardRequestOptions): Promise<Response> {
  const method = request.method;
  const backendUrl = buildBackendUrl(upstreamPath, search ?? request.nextUrl.search);
  const headers = buildUpstreamHeaders(request, authToken);

  const requestInit: RequestInit = {
    method,
    headers,
    redirect: 'manual',
    cache: 'no-store',
  };

  if (hasBody(method)) {
    const rawBody = await request.arrayBuffer();
    requestInit.body = rawBody.byteLength > 0 ? Buffer.from(rawBody) : undefined;
  }

  return fetch(backendUrl, requestInit);
}

export async function buildClientResponse(
  upstreamResponse: Response,
  options: BuildResponseOptions = {}
): Promise<NextResponse> {
  const headers = buildClientHeaders(upstreamResponse.headers);

  if (isJsonResponse(upstreamResponse.headers.get('content-type'))) {
    const payload = await upstreamResponse.json().catch(() => ({}));
    const transformedPayload = options.transformJson
      ? options.transformJson(payload)
      : payload;

    return NextResponse.json(transformedPayload, {
      status: upstreamResponse.status,
      headers,
    });

  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}

export async function getSessionTokenFromRequest(request: NextRequest): Promise<string | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  const token = await getToken({ req: request, secret });
  return (token?.backendToken as string) ?? null;
}

export function buildUnauthorizedResponse(message = 'No autenticado'): NextResponse {
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: 401 }
  );
}
