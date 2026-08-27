import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomBytes } from 'crypto';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security.js';

function q(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function text(value: unknown): string {
  return String(value ?? '').replace(/\0/g, '').trim();
}

function num(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function validUuid(value: string): boolean {
  return /^[a-f0-9-]{20,50}$/i.test(value);
}

function avatarUrl(empId: string): string {
  return empId ? `https://wms.advanceagro.net/WSVIS/api/Face/GetImage?CardID=${encodeURIComponent(empId)}` : '';
}

function normalizeHrmsEmployee(empId: string, emp: any) {
  const cleanEmpId = text(empId || emp?.emp_id || emp?.ID_Emp || emp?.EmpID || emp?.EmpId || emp?.CardID);
  const fullName = text(emp?.full_name || emp?.EmpName || `${emp?.FNameT || ''} ${emp?.LNameT || ''}`.trim() || emp?.name) || cleanEmpId;
  return {
    emp_id: cleanEmpId,
    full_name: fullName,
    email: text(emp?.email || emp?.EMail || emp?.Email || emp?.Gmail) || null,
    phone: text(emp?.phone || emp?.Sim_Number || emp?.sim) || null,
    position: text(emp?.position || emp?.Position || emp?.PositionName || emp?.JobTitle) || null,
    department: text(emp?.department || emp?.Department || emp?.DepartmentName || emp?.Section) || null,
    company_name: text(emp?.company_name || emp?.CompanyName || emp?.Comp_NameE || emp?.company) || null,
    avatar_url: avatarUrl(cleanEmpId),
  };
}

function normalizeSearchResult(item: any) {
  const empId = text(item?.emp_id || item?.empId || item?.EmpId || item?.EmpID || item?.ID_Emp || item?.CardID);
  const fullName = text(item?.full_name || item?.name || item?.EmpName || `${item?.FNameT || ''} ${item?.LNameT || ''}`.trim()) || empId;
  return {
    emp_id: empId,
    full_name: fullName,
    email: text(item?.email || item?.EMail || item?.Gmail || item?.Email) || null,
    phone: text(item?.phone || item?.sim || item?.Sim_Number) || null,
    position: text(item?.position || item?.Position || item?.PositionName || item?.JobTitle) || null,
    department: text(item?.department || item?.Department || item?.DepartmentName || item?.Section) || null,
    company_name: text(item?.company_name || item?.companyName || item?.CompanyName || item?.company) || null,
    avatar_url: avatarUrl(empId),
  };
}

async function getShareTokenApplication(supabase: ReturnType<typeof getAdminSupabase>, token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) return null;
  const { data } = await supabase
    .from('application_share_tokens')
    .select('id, application_id, access_count')
    .eq('token', token)
    .eq('token_type', 'share')
    .eq('is_revoked', false)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle();
  return data || null;
}

async function fetchTemplateSnapshot(supabase: ReturnType<typeof getAdminSupabase>, templateId: string) {
  const { data: template, error } = await supabase
    .from('evaluation_templates')
    .select('*')
    .eq('id', templateId)
    .eq('is_deleted', false)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  if (!template) return null;
  const { data: items, error: itemError } = await supabase
    .from('evaluation_template_items')
    .select('*')
    .eq('template_id', templateId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  if (itemError) throw itemError;
  return { ...template, items: items || [] };
}

async function fetchSessionBundle(supabase: ReturnType<typeof getAdminSupabase>, applicationId: string) {
  const { data: sessions, error } = await supabase
    .from('application_evaluation_sessions')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  const session = sessions?.[0] || null;
  if (!session) return { session: null, reviewers: [], evaluations: [], summary: null };

  const [{ data: reviewers, error: reviewerError }, { data: evaluations, error: evalError }] = await Promise.all([
    supabase.from('application_reviewers').select('*').eq('session_id', session.id).order('created_at', { ascending: true }),
    supabase.from('application_reviewer_evaluations').select('*').eq('session_id', session.id).order('submitted_at', { ascending: true }),
  ]);
  if (reviewerError) throw reviewerError;
  if (evalError) throw evalError;

  const evals = evaluations || [];
  const reviewerRows = (reviewers || []).map((reviewer: any) => ({
    ...reviewer,
    evaluation: evals.find((ev: any) => ev.reviewer_id === reviewer.id) || null,
  }));
  const submitted = evals.length;
  const avgPercent = submitted ? evals.reduce((sum: number, ev: any) => sum + Number(ev.total_percent || 0), 0) / submitted : 0;
  return {
    session,
    reviewers: reviewerRows,
    evaluations: evals,
    summary: {
      reviewer_count: reviewerRows.length,
      submitted_count: submitted,
      average_percent: Number(avgPercent.toFixed(2)),
      passed_count: evals.filter((ev: any) => ev.is_passed).length,
    },
  };
}

function computeScore(snapshot: any, scores: Record<string, any>) {
  const scaleMin = Number(snapshot?.scale_min ?? 1);
  const scaleMax = Number(snapshot?.scale_max ?? 5);
  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
  let totalWeighted = 0;
  let maxWeighted = 0;
  const normalizedScores: Record<string, any> = {};

  for (const item of items) {
    const id = String(item.id);
    const weight = Math.max(0, Number(item.weight || 1));
    const raw = scores[id] || {};
    const value = Number(raw.score);
    if (item.is_required && !Number.isFinite(value)) {
      throw new Error(`Missing score: ${item.title}`);
    }
    if (Number.isFinite(value)) {
      const clamped = Math.max(scaleMin, Math.min(scaleMax, value));
      totalWeighted += clamped * weight;
      maxWeighted += scaleMax * weight;
      normalizedScores[id] = {
        item_id: id,
        title: item.title,
        score: clamped,
        weight,
        comment: text(raw.comment) || null,
      };
    }
  }

  const totalPercent = maxWeighted ? (totalWeighted / maxWeighted) * 100 : 0;
  return {
    scores_json: normalizedScores,
    total_score: Number(totalWeighted.toFixed(2)),
    total_percent: Number(totalPercent.toFixed(2)),
    is_passed: totalPercent >= Number(snapshot?.passing_score_percent || 70),
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const supabase = getAdminSupabase();

  try {
    if (req.method === 'GET' && q(req.query.shareToken)) {
      const shareToken = q(req.query.shareToken);
      const tokenRow = await getShareTokenApplication(supabase, shareToken);
      if (!tokenRow) return res.status(404).json({ error: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' });
      const bundle = await fetchSessionBundle(supabase, tokenRow.application_id);
      const publicReviewers = (bundle.reviewers || []).map((reviewer: any) => ({
        id: reviewer.id,
        emp_id: reviewer.emp_id,
        full_name: reviewer.full_name,
        email: reviewer.email,
        position: reviewer.position,
        department: reviewer.department,
        avatar_url: reviewer.avatar_url,
        status: reviewer.status,
        has_phone_check: Boolean(reviewer.phone),
        submitted_at: reviewer.submitted_at,
      }));
      return res.status(200).json({
        success: true,
        data: {
          session: bundle.session && bundle.session.status === 'active' ? {
            id: bundle.session.id,
            status: bundle.session.status,
            template_snapshot: bundle.session.template_snapshot,
            expires_at: bundle.session.expires_at,
          } : null,
          reviewers: bundle.session?.status === 'active' ? publicReviewers : [],
          summary: bundle.summary,
        },
      });
    }

    if (req.method === 'POST' && text(req.body?.action) === 'submit-public') {
      const shareToken = text(req.body?.shareToken);
      const reviewerId = text(req.body?.reviewerId);
      const tokenRow = await getShareTokenApplication(supabase, shareToken);
      if (!tokenRow || !validUuid(reviewerId)) return res.status(403).json({ error: 'Invalid evaluation link' });

      const { data: reviewer, error: reviewerError } = await supabase
        .from('application_reviewers')
        .select('*, session:application_evaluation_sessions(*)')
        .eq('id', reviewerId)
        .eq('application_id', tokenRow.application_id)
        .maybeSingle();
      if (reviewerError) throw reviewerError;
      if (!reviewer || reviewer.session?.status !== 'active') return res.status(403).json({ error: 'ยังไม่เปิดให้ประเมิน หรือรอบประเมินถูกปิดแล้ว' });
      if (reviewer.session?.expires_at && new Date(reviewer.session.expires_at) < new Date()) return res.status(403).json({ error: 'รอบประเมินหมดอายุแล้ว' });
      if (reviewer.phone) {
        const expected = String(reviewer.phone).replace(/\D/g, '').slice(-4);
        const supplied = text(req.body?.phoneLast4).replace(/\D/g, '').slice(-4);
        if (expected && expected !== supplied) return res.status(403).json({ error: 'ยืนยันตัวตนไม่ถูกต้อง' });
      }

      const existing = await supabase
        .from('application_reviewer_evaluations')
        .select('id')
        .eq('session_id', reviewer.session_id)
        .eq('reviewer_id', reviewer.id)
        .maybeSingle();
      if (existing.data) return res.status(409).json({ error: 'กรรมการรายนี้ส่งผลประเมินแล้ว' });

      const score = computeScore(reviewer.session.template_snapshot, req.body?.scores || {});
      const payload = {
        session_id: reviewer.session_id,
        reviewer_id: reviewer.id,
        application_id: tokenRow.application_id,
        ...score,
        recommendation: text(req.body?.recommendation),
        strengths: text(req.body?.strengths) || null,
        concerns: text(req.body?.concerns) || null,
        comments: text(req.body?.comments) || null,
        submitted_via_share_token: shareToken,
      };
      if (!payload.recommendation) return res.status(400).json({ error: 'กรุณาเลือก Recommendation' });
      const { data, error } = await supabase.from('application_reviewer_evaluations').insert([payload]).select('*').single();
      if (error) throw error;
      await supabase.from('application_reviewers').update({
        status: 'submitted',
        viewed_at: reviewer.viewed_at || new Date().toISOString(),
        submitted_at: new Date().toISOString(),
      }).eq('id', reviewer.id);
      return res.status(200).json({ success: true, data });
    }

    const staff = await requireStaff(req, res);
    if (!staff) return;

    if (req.method === 'GET') {
      const action = text(req.query.action || 'bundle');
      if (action === 'search-employee') {
        const query = text(req.query.query);
        if (query.length < 2) return res.status(400).json({ error: 'Search query is too short' });
        const url = `https://api-idms.advanceagro.net/hrms/employee/search/${encodeURIComponent(query)}/?index=0&row=8`;
        const response = await fetch(url, { headers: { Accept: 'application/json' } });
        if (!response.ok) return res.status(502).json({ error: 'HRMS search unavailable' });
        const json = await response.json();
        const list = json?.data?.search || json?.search || [];
        return res.status(200).json({ success: true, data: list.map(normalizeSearchResult).filter((item: any) => item.emp_id) });
      }

      const applicationId = text(req.query.applicationId);
      if (!validUuid(applicationId)) return res.status(400).json({ error: 'Invalid application id' });
      return res.status(200).json({ success: true, data: await fetchSessionBundle(supabase, applicationId) });
    }

    const action = text(req.body?.action);
    const applicationId = text(req.body?.applicationId);
    if (!validUuid(applicationId)) return res.status(400).json({ error: 'Invalid application id' });

    if (action === 'create-session') {
      const templateId = text(req.body?.templateId);
      if (!validUuid(templateId)) return res.status(400).json({ error: 'Invalid template id' });
      const snapshot = await fetchTemplateSnapshot(supabase, templateId);
      if (!snapshot || !snapshot.items?.length) return res.status(400).json({ error: 'Template is inactive or has no active items' });
      const { data, error } = await supabase.from('application_evaluation_sessions').insert([{
        application_id: applicationId,
        template_id: templateId,
        template_snapshot: snapshot,
        status: 'draft',
        expires_at: req.body?.expiresAt || null,
        created_by: staff.full_name || staff.email || staff.id,
      }]).select('*').single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (action === 'activate' || action === 'close') {
      const sessionId = text(req.body?.sessionId);
      if (!validUuid(sessionId)) return res.status(400).json({ error: 'Invalid session id' });
      const patch = action === 'activate'
        ? { status: 'active', activated_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        : { status: 'closed', closed_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('application_evaluation_sessions')
        .update(patch)
        .eq('id', sessionId)
        .eq('application_id', applicationId);
      if (error) throw error;
      return res.status(200).json({ success: true, data: await fetchSessionBundle(supabase, applicationId) });
    }

    if (action === 'add-reviewer') {
      const sessionId = text(req.body?.sessionId);
      const empId = text(req.body?.empId);
      if (!validUuid(sessionId) || !empId) return res.status(400).json({ error: 'Missing reviewer/session data' });

      let profile = req.body?.profile || {};
      try {
        const detailRes = await fetch(`https://api-idms.advanceagro.net/hrms/employee/${encodeURIComponent(empId)}/`, { headers: { Accept: 'application/json' } });
        if (detailRes.ok) {
          const json = await detailRes.json();
          profile = normalizeHrmsEmployee(empId, json?.data?.employee || json?.employee || json || profile);
        }
      } catch {
        profile = normalizeSearchResult({ ...profile, empId });
      }
      const normalized = normalizeSearchResult({ ...profile, empId });
      const { error } = await supabase.from('application_reviewers').insert([{
        session_id: sessionId,
        application_id: applicationId,
        emp_id: normalized.emp_id,
        full_name: normalized.full_name,
        email: normalized.email,
        phone: normalized.phone,
        position: normalized.position,
        department: normalized.department,
        company_name: normalized.company_name,
        avatar_url: normalized.avatar_url,
        reviewer_token: randomBytes(24).toString('hex'),
      }]);
      if (error) throw error;
      return res.status(200).json({ success: true, data: await fetchSessionBundle(supabase, applicationId) });
    }

    if (action === 'remove-reviewer') {
      const reviewerId = text(req.body?.reviewerId);
      if (!validUuid(reviewerId)) return res.status(400).json({ error: 'Invalid reviewer id' });
      const { error } = await supabase.from('application_reviewers').delete().eq('id', reviewerId).eq('application_id', applicationId);
      if (error) throw error;
      return res.status(200).json({ success: true, data: await fetchSessionBundle(supabase, applicationId) });
    }

    return res.status(400).json({ error: 'Unsupported action' });
  } catch (error: any) {
    console.error('[candidate-evaluations]', error?.message || error);
    return res.status(500).json({ error: error.message || 'Candidate evaluation operation failed' });
  }
}
