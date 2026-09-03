import { app, HttpRequest, HttpResponseInit } from '@azure/functions';
import { checkCsrf } from '../lib/csrf.js';
import { corsHeaders, handlePreflight } from '../lib/cors.js';
import { revokeToken } from '../lib/keycloak.js';
import { clearSessionCookieObj, parseCookie, unsealSession } from '../lib/session.js';

async function authLogout(request: HttpRequest): Promise<HttpResponseInit> {
  const preflight = handlePreflight(request);
  if (preflight) return preflight;

  const csrfError = checkCsrf(request);
  if (csrfError) return { ...csrfError, headers: corsHeaders };

  const sealed = parseCookie(request.headers.get('cookie'));
  if (sealed) {
    const session = await unsealSession(sealed);
    if (session) await revokeToken(session.refreshToken).catch(() => undefined);
  }

  return {
    status: 200,
    jsonBody: { isAuthenticated: false },
    headers: corsHeaders,
    cookies: [clearSessionCookieObj()],
  };
}

app.http('auth-logout', {
  methods: ['POST', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'auth/logout',
  handler: authLogout,
});
