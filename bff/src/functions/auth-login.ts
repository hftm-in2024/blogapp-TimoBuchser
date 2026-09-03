import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { createHash, randomBytes } from 'node:crypto';
import { authorizationEndpoint } from '../lib/keycloak.js';

function base64Url(buffer: Buffer): string {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function authLogin(request: HttpRequest): Promise<HttpResponseInit> {
  const returnUrl = request.query.get('returnUrl') || '/';
  const origin = process.env.ALLOWED_ORIGIN || 'http://localhost:4200';

  const codeVerifier = base64Url(randomBytes(32));

  const codeChallenge = base64Url(createHash('sha256').update(codeVerifier).digest());

  const state = base64Url(
    Buffer.from(
      JSON.stringify({
        returnUrl,
        nonce: base64Url(randomBytes(16)),
      }),
    ),
  );

  const redirectUri = `${origin}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: process.env.KEYCLOAK_CLIENT_ID!,
    response_type: 'code',
    scope: 'openid profile email',
    redirect_uri: redirectUri,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
    state,
  });

  return {
    status: 302,
    headers: {
      Location: `${authorizationEndpoint()}?${params.toString()}`,
    },
    cookies: [
      {
        name: '__pkce',
        value: codeVerifier,
        httpOnly: true,
        secure: false,
        sameSite: 'Lax',
        path: '/',
        maxAge: 600,
      },
    ],
  };
}

app.http('auth-login', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'auth/login',
  handler: authLogin,
});
