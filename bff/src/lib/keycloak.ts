const KEYCLOAK_URL = process.env.KEYCLOAK_URL!;
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID!;
const CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET!;

function tokenEndpoint(): string {
  return `${KEYCLOAK_URL}/protocol/openid-connect/token`;
}

function revokeEndpoint(): string {
  return `${KEYCLOAK_URL}/protocol/openid-connect/revoke`;
}

export function authorizationEndpoint(): string {
  return `${KEYCLOAK_URL}/protocol/openid-connect/auth`;
}

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
};

export async function exchangeCode(
  code: string,
  redirectUri: string,
  codeVerifier: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(tokenEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Authorization code exchange failed');
  }

  return response.json() as Promise<TokenResponse>;
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: refreshToken,
  });

  const response = await fetch(tokenEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    throw new Error('Token refresh failed');
  }

  return response.json() as Promise<TokenResponse>;
}

export async function revokeToken(refreshToken: string): Promise<void> {
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    token: refreshToken,
    token_type_hint: 'refresh_token',
  });

  await fetch(revokeEndpoint(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
}
