import { requireRole } from '../requireRole';
import { Role } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../../errors';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

describe('requireRole Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
    };
    nextFunction = jest.fn();
  });

  it('no token -> privileged endpoint -> 401 Unauthorized', () => {
    const middleware = requireRole(Role.TENANT_ADMIN);
    expect(() => middleware(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(UnauthorizedError);
  });

  it('valid LEARNER -> tenant-admin endpoint -> 403 Forbidden', () => {
    mockRequest = { user: { role: Role.LEARNER } } as any;
    const middleware = requireRole(Role.TENANT_ADMIN);
    expect(() => middleware(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('valid TRAINER -> tenant-admin endpoint -> 403 Forbidden', () => {
    mockRequest = { user: { role: Role.TRAINER } } as any;
    const middleware = requireRole(Role.TENANT_ADMIN);
    expect(() => middleware(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('valid TENANT_ADMIN -> own-tenant authorized operation -> success', () => {
    mockRequest = { user: { role: Role.TENANT_ADMIN } } as any;
    const middleware = requireRole(Role.TENANT_ADMIN);
    middleware(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('missing role claim -> privileged endpoint -> denied (403)', () => {
    mockRequest = { user: { } } as any; // No role
    const middleware = requireRole(Role.TENANT_ADMIN);
    expect(() => middleware(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('SUPER_ADMIN -> cannot implicitly bypass tenant-scoped boundaries', () => {
    mockRequest = { user: { role: Role.SUPER_ADMIN } } as any;
    // Assume a tenant-scoped route only allows TENANT_ADMIN
    const middleware = requireRole(Role.TENANT_ADMIN);
    expect(() => middleware(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });
});

describe('requireSuperAdmin Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn() as any,
    };
    nextFunction = jest.fn();
  });

  const { requireSuperAdmin } = require('../requireSuperAdmin');

  it('unauthenticated -> 401', () => {
    expect(() => requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(UnauthorizedError);
  });

  it('LEARNER -> 403', () => {
    mockRequest = { user: { role: Role.LEARNER } } as any;
    expect(() => requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('TRAINER -> 403', () => {
    mockRequest = { user: { role: Role.TRAINER } } as any;
    expect(() => requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('TENANT_ADMIN -> 403', () => {
    mockRequest = { user: { role: Role.TENANT_ADMIN } } as any;
    expect(() => requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('SUPER_ADMIN -> allowed', () => {
    mockRequest = { user: { role: Role.SUPER_ADMIN } } as any;
    requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('missing role -> 403', () => {
    mockRequest = { user: { } } as any;
    expect(() => requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });

  it('invalid role -> 403', () => {
    mockRequest = { user: { role: 'FAKE_ROLE' } } as any;
    expect(() => requireSuperAdmin(mockRequest as Request, mockResponse as Response, nextFunction)).toThrow(ForbiddenError);
  });
});
