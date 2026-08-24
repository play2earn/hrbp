import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

const STAFF_COOKIE = 'hrbp_staff_session';
const HRMS_COOKIE = 'hrbp_hrms_session';
const DRAFT_COOKIE = 'hrbp_draft_session';
const RESUBMIT_COOKIE = 'hrbp_resubmit_session';

type SessionKind = 'staff' | 'hrms' | 'draft' | 'resubmit';

export interface SessionPayload {
  kind: SessionKind;
  iat: number;
  exp: number;
  sub?: string;
  empId?: string;
  account?: string;
  draftId?: string;
  applicationId?: string;
  token?: string;
  allowedFields?: string[];
}

export interface ActiveStaffUser {
  id: string;
  role: 'admin' | 'mod';
  status: string;
  emp_id?: string;
  hrms_username?: string;
  [key: string]: unknown;
}

const cleanEnv = (value?: string) => value?.replace(/^["']|["']$/g, '').trim() || '';

function sessionSecret(): string {
  const secret = cleanEnv(process.env.HRBP_SESSION_SECRET);
  if (secret.length < 32) {
    throw new Error('HRBP_SESSION_SECRET must be configured with at least 32 characters');
  }
  return secret;
}

function encode(value: string): string {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function decode(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8');
}

export function signSession(payload: SessionPayload, secret = sessionSecret()): string {
  const body = encode(JSON.stringify(payload));
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string | undefined, expectedKind: SessionKind, secret = sessionSecret()): SessionPayload | null {
  if (!token) return null;
  const [body, providedSignature, extra] = token.split('.');
  if (!body || !providedSignature || extra) return null;

  const expectedSignature = createHmac('sha256', secret).update(body).digest('base64url');
  const provided = Buffer.from(providedSignature);
  const expected = Buffer.from(expectedSignature);
  if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null;

  try {
    const payload = JSON.parse(decode(body)) as SessionPayload;
    if (payload.kind !== expectedKind || !Number.isFinite(payload.exp) || payload.exp <= Math.floor(Date.now() / 1000)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function parseCookies(header: string | string[] | undefined): Record<string, string> {
  const raw = Array.isArray(header) ? header.join(';') : header || '';
  return raw.split(';').reduce<Record<string, string>>((cookies, part) => {
    const separator = part.indexOf('=');
    if (separator < 1) return cookies;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function appendCookie(res: VercelResponse, cookie: string): void {
  const current = res.getHeader('Set-Cookie');
  const values = current ? (Array.isArray(current) ? current.map(String) : [String(current)]) : [];
  res.setHeader('Set-Cookie', [...values, cookie]);
}

function cookieValue(name: string, value: string, maxAgeSeconds: number): string {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`;
}

export function setSignedSession(res: VercelResponse, name: SessionKind, claims: Omit<SessionPayload, 'kind' | 'iat' | 'exp'>, maxAgeSeconds: number): void {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = { kind: name, iat: now, exp: now + maxAgeSeconds, ...claims };
  const cookieName = name === 'staff' ? STAFF_COOKIE : name === 'hrms' ? HRMS_COOKIE : name === 'draft' ? DRAFT_COOKIE : RESUBMIT_COOKIE;
  appendCookie(res, cookieValue(cookieName, signSession(payload), maxAgeSeconds));
}

export function clearSession(res: VercelResponse, name: SessionKind): void {
  const cookieName = name === 'staff' ? STAFF_COOKIE : name === 'hrms' ? HRMS_COOKIE : name === 'draft' ? DRAFT_COOKIE : RESUBMIT_COOKIE;
  appendCookie(res, cookieValue(cookieName, '', 0));
}

export function readSignedSession(req: VercelRequest, name: SessionKind): SessionPayload | null {
  const cookieName = name === 'staff' ? STAFF_COOKIE : name === 'hrms' ? HRMS_COOKIE : name === 'draft' ? DRAFT_COOKIE : RESUBMIT_COOKIE;
  return verifySessionToken(parseCookies(req.headers.cookie)[cookieName], name);
}

export function getAdminSupabase() {
  const url = cleanEnv(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const key = cleanEnv(process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
  if (!url || !key) throw new Error('Server-side Supabase service credentials are missing');
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

export async function getActiveStaff(req: VercelRequest): Promise<ActiveStaffUser | null> {
  const session = readSignedSession(req, 'staff');
  if (!session?.sub) return null;
  const { data, error } = await getAdminSupabase()
    .from('users')
    .select('*')
    .eq('id', session.sub)
    .eq('status', 'Active')
    .maybeSingle();
  if (error || !data || (data.role !== 'admin' && data.role !== 'mod')) return null;
  return data as ActiveStaffUser;
}

export async function requireStaff(req: VercelRequest, res: VercelResponse, roles: Array<'admin' | 'mod'> = ['admin', 'mod']): Promise<ActiveStaffUser | null> {
  const user = await getActiveStaff(req);
  if (!user) {
    res.status(401).json({ error: 'Authentication required' });
    return null;
  }
  if (!roles.includes(user.role)) {
    res.status(403).json({ error: 'Insufficient permissions' });
    return null;
  }
  return user;
}

export function requireDraftSession(req: VercelRequest, res: VercelResponse, draftId: string): SessionPayload | null {
  const session = readSignedSession(req, 'draft');
  if (!session || session.draftId !== draftId) {
    res.status(403).json({ error: 'Invalid or expired draft session' });
    return null;
  }
  return session;
}

export function requireResubmitSession(req: VercelRequest, res: VercelResponse, token: string, applicationId: string, fieldName?: string): SessionPayload | null {
  const session = readSignedSession(req, 'resubmit');
  if (!session || session.token !== token || session.applicationId !== applicationId) {
    res.status(403).json({ error: 'Invalid or expired resubmit session' });
    return null;
  }
  if (fieldName && !session.allowedFields?.includes(fieldName)) {
    res.status(403).json({ error: 'This document field was not authorized for resubmission' });
    return null;
  }
  return session;
}

function firstHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export function configureSameOrigin(req: VercelRequest, res: VercelResponse, methods: string): boolean {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', `${methods}, OPTIONS`);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const origin = firstHeader(req.headers.origin);
  const host = firstHeader(req.headers['x-forwarded-host']) || firstHeader(req.headers.host);
  const configuredOrigin = cleanEnv(process.env.APP_ORIGIN);
  const allowed = !origin || origin === configuredOrigin || origin === `https://${host}` || (process.env.NODE_ENV !== 'production' && origin === `http://${host}`);
  if (origin && allowed) res.setHeader('Access-Control-Allow-Origin', origin);
  if (!allowed) {
    res.status(403).json({ error: 'Cross-origin request blocked' });
    return false;
  }
  return true;
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
