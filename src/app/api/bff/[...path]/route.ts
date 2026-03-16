import { NextRequest, NextResponse } from 'next/server';
import {
  buildClientResponse,
  forwardRequestToBackend,
  getSessionTokenFromRequest,
} from '@/lib/bff/proxy';
import { clearAuthSessionCookie } from '@/lib/bff/session';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleRequest(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { path } = await context.params;
    const upstreamPath = path.join('/');
    const token = getSessionTokenFromRequest(request);

    const upstreamResponse = await forwardRequestToBackend({
      request,
      upstreamPath,
      authToken: token,
    });

    const response = await buildClientResponse(upstreamResponse);

    if (upstreamResponse.status === 401 && token) {
      clearAuthSessionCookie(response);
    }

    return response;
  } catch (error) {
    console.error('[BFF] Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error interno del proxy BFF',
      },
      { status: 500 }
    );
  }
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PUT = handleRequest;
export const PATCH = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
