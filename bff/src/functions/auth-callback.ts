import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { exchangeCode } from '../lib/keycloak.js';
import { sealSession, sessionCookie } from '../lib/session.js';

function readCookie(request: HttpRequest, name: string): string | null {
  const cookieHeader = request.headers.get('cookie');

  if (!cookieHeader) {
    return null;
  }

  const cookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.substring(name.length + 1)) : null;
}

function decodeState(state: string | null): string {
  if (!state) {
    return '/';
  }

  try {
    const padded = state.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      returnUrl?: string;
    };

    return data.returnUrl || '/';
  } catch {
    return '/';
  }
}

async function authCallback(request: HttpRequest): Promise<HttpResponseInit> {
  const origin = process.env.ALLOWED_ORIGIN || 'http://localhost:4200';

  const code = request.query.get('code');
  const error = request.query.get('error');
  const state = request.query.get('state');

  const returnUrl = decodeState(state);

  if (error) {
    return {
      status: 302,
      headers: {
        Location: `${origin}/login?error=access_denied`,
      },
    };
  }

  const codeVerifier = readCookie(request, '__pkce');

  if (!code || !codeVerifier) {
    return {
      status: 302,
      headers: {
        Location: `${origin}/login?error=expired`,
      },
    };
  }

  try {
    const redirectUri = `${origin}/api/auth/callback`;

    const tokens = await exchangeCode(code, redirectUri, codeVerifier);

    const sealed = await sealSession({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    });

    return {
      status: 302,
      headers: {
        Location: `${origin}${returnUrl}`,
      },
      cookies: [
        sessionCookie(sealed),
        {
          name: '__pkce',
          value: '',
          httpOnly: true,
          secure: false,
          sameSite: 'Lax',
          path: '/',
          maxAge: 0,
        },
      ],
    };
  } catch {
    return {
      status: 302,
      headers: {
        Location: `${origin}/login?error=failed`,
      },
    };
  }
}

app.http('auth-callback', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/callback',
  handler: authCallback,
});
