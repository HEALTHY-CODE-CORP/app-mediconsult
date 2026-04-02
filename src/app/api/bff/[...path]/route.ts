import { NextRequest, NextResponse } from 'next/server';
import {
  buildClientResponse,
  forwardRequestToBackend,
  getSessionTokenFromRequest,
} from '@/lib/bff/proxy';

export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function handleRequest(request: NextRequest, context: RouteContext): Promise<NextResponse> {
  try {
    const { path } = await context.params;
    const upstreamPath = path.join('/');
    const token = await getSessionTokenFromRequest();

    const upstreamResponse = await forwardRequestToBackend({
      request,
      upstreamPath,
      authToken: token,
    });

    return await buildClientResponse(upstreamResponse);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[BFF] Proxy error:', errorMessage, error);
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del proxy BFF",
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
