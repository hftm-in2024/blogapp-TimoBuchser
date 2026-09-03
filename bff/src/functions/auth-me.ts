import { app, Cookie, HttpRequest, HttpResponseInit } from '@azure/functions';
import { decodeJwt } from 'jose';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { refreshTokens } from '../lib/keycloak.js';
import {
  clearSessionCookieObj,
  isSessionExpired,
  parseCookie,
  sealSession,
  sessionCookie,
  unsealSession,
} from '../lib/session.js';

function userFromToken(accessToken: string) {
  const claims = decodeJwt(accessToken);
  const realmAccess = (claims as { realm_access?: { roles?: string[] } }).realm_access;
  return {
    preferred_username: claims.preferred_username,
    email: claims.email,
    name: claims.name,
    roles: realmAccess?.roles ?? [],
  };
}

async function authMe(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const sealed = parseCookie(request.headers.get('cookie'));
  if (!sealed)
    return { status: 200, jsonBody: { isAuthenticated: false, user: null }, headers: corsHeaders };

  let session = await unsealSession(sealed);
  if (!session) {
    return {
      status: 200,
      jsonBody: { isAuthenticated: false, user: null },
      headers: corsHeaders,
      cookies: [clearSessionCookieObj()],
    };
  }

  const cookies: Cookie[] = [];
  if (isSessionExpired(session)) {
    try {
      const tokens = await refreshTokens(session.refreshToken);
      session = {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      };
      cookies.push(sessionCookie(await sealSession(session)));
    } catch {
      return {
        status: 200,
        jsonBody: { isAuthenticated: false, user: null },
        headers: corsHeaders,
        cookies: [clearSessionCookieObj()],
      };
    }
  }

  return {
    status: 200,
    jsonBody: { isAuthenticated: true, user: userFromToken(session.accessToken) },
    headers: corsHeaders,
    cookies: cookies.length > 0 ? cookies : undefined,
  };
}

app.http('auth-me', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/me',
  handler: authMe,
});
