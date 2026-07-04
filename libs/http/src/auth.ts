import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { throwUnauthorized } from './errors';

export const ADMIN_GROUP = 'admins';

export type JwtClaims = Record<string, unknown>;

interface JwtAuthorizerContext {
  jwt?: {
    claims?: JwtClaims;
  };
}

function getJwtAuthorizer(event: APIGatewayProxyEventV2): JwtAuthorizerContext | undefined {
  return (event.requestContext as { authorizer?: JwtAuthorizerContext }).authorizer;
}

export function extractJwtClaims(event: APIGatewayProxyEventV2): JwtClaims | undefined {
  return getJwtAuthorizer(event)?.jwt?.claims;
}

export function parseCognitoGroups(claims: JwtClaims): string[] {
  const raw = claims['cognito:groups'];
  if (raw == null) {
    return [];
  }

  if (Array.isArray(raw)) {
    return raw.map(String);
  }

  if (typeof raw !== 'string') {
    return [String(raw)];
  }

  const trimmed = raw.trim();
  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // fall through to split
    }
  }

  return trimmed
    .split(',')
    .map((group) => group.trim())
    .filter(Boolean);
}

export function requireAdminAuth(event: APIGatewayProxyEventV2): string {
  const claims = extractJwtClaims(event);
  const sub = claims?.sub;
  const path = event.rawPath;
  const method = event.requestContext.http.method ?? '';

  if (typeof sub !== 'string' || !sub) {
    throwUnauthorized('Não autorizado.', {
      reason: claims ? 'missing_sub' : 'missing_claims',
      path: path ?? '',
      method,
    });
  }

  const groups = parseCognitoGroups(claims);
  if (!groups.includes(ADMIN_GROUP)) {
    throwUnauthorized('Não autorizado.', {
      reason: 'missing_admin_group',
      path: path ?? '',
      method,
      groups: groups.join(','),
    });
  }

  return sub;
}
