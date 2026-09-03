import * as Iron from '@hapi/iron';
import type { Cookie } from '@azure/functions';

const SESSION_SECRET = process.env.SESSION_SECRET!;
const COOKIE_NAME = '__session';

export type SessionData = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
};

export async function sealSession(data: SessionData): Promise<string> {
  return Iron.seal(data, SESSION_SECRET, Iron.defaults);
}

export async function unsealSession(cookie: string): Promise<SessionData | null> {
  try {
    return (await Iron.unseal(cookie, SESSION_SECRET, Iron.defaults)) as SessionData;
  } catch {
    return null;
  }
}

export function parseCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  const raw = match.substring(COOKIE_NAME.length + 1);
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export function sessionCookie(sealed: string): Cookie {
  return {
    name: COOKIE_NAME,
    value: sealed,
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 86400,
  };
}

export function clearSessionCookieObj(): Cookie {
  return {
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/',
    maxAge: 0,
  };
}

export function isSessionExpired(session: SessionData): boolean {
  return Date.now() >= session.expiresAt;
}
