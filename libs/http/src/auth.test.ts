import { describe, expect, it } from 'vitest';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { ApiError } from '@afro90s/models';
import {
  ADMIN_GROUP,
  extractJwtClaims,
  parseCognitoGroups,
  requireAdminAuth,
} from './auth';

function eventWithClaims(
  claims: Record<string, unknown> | undefined,
): APIGatewayProxyEventV2 {
  return {
    requestContext: {
      http: { method: 'GET' },
      ...(claims
        ? { authorizer: { jwt: { claims } } }
        : {}),
    },
  } as APIGatewayProxyEventV2;
}

describe('extractJwtClaims', () => {
  it('returns claims from authorizer jwt', () => {
    const claims = { sub: 'user-1', 'cognito:groups': 'admins' };
    expect(extractJwtClaims(eventWithClaims(claims))).toEqual(claims);
  });

  it('returns undefined when authorizer is missing', () => {
    expect(extractJwtClaims(eventWithClaims(undefined))).toBeUndefined();
  });
});

describe('parseCognitoGroups', () => {
  it('parses string group', () => {
    expect(parseCognitoGroups({ 'cognito:groups': 'admins' })).toEqual(['admins']);
  });

  it('parses array group', () => {
    expect(parseCognitoGroups({ 'cognito:groups': ['admins', 'other'] })).toEqual([
      'admins',
      'other',
    ]);
  });

  it('parses comma-separated groups', () => {
    expect(parseCognitoGroups({ 'cognito:groups': 'admins, editors' })).toEqual([
      'admins',
      'editors',
    ]);
  });

  it('parses JSON array string groups', () => {
    expect(parseCognitoGroups({ 'cognito:groups': '["admins","editors"]' })).toEqual([
      'admins',
      'editors',
    ]);
  });

  it('coerces non-string groups claim to string array', () => {
    expect(parseCognitoGroups({ 'cognito:groups': 42 })).toEqual(['42']);
  });

  it('returns empty when groups claim is missing', () => {
    expect(parseCognitoGroups({})).toEqual([]);
  });
});

describe('requireAdminAuth', () => {
  it('returns sub when user is in admins group', () => {
    const sub = requireAdminAuth(
      eventWithClaims({ sub: 'admin-uuid', 'cognito:groups': ADMIN_GROUP }),
    );
    expect(sub).toBe('admin-uuid');
  });

  it('throws 401 when claims are missing', () => {
    expect(() => requireAdminAuth(eventWithClaims(undefined))).toThrow(ApiError);
    try {
      requireAdminAuth(eventWithClaims(undefined));
    } catch (error) {
      expect(error).toMatchObject({ code: 'UNAUTHORIZED', statusCode: 401 });
    }
  });

  it('throws 401 when sub is missing', () => {
    expect(() =>
      requireAdminAuth(eventWithClaims({ 'cognito:groups': ADMIN_GROUP })),
    ).toThrow(expect.objectContaining({ code: 'UNAUTHORIZED', statusCode: 401 }));
  });

  it('throws 401 when admins group is missing', () => {
    expect(() =>
      requireAdminAuth(eventWithClaims({ sub: 'user-1', 'cognito:groups': 'users' })),
    ).toThrow(expect.objectContaining({ code: 'UNAUTHORIZED', statusCode: 401 }));
  });
});
