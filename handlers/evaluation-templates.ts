import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security.js';

function first(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

function cleanText(value: unknown, fallback = ''): string {
  return String(value ?? fallback).replace(/\0/g, '').trim();
}

function cleanNumber(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function cleanBool(value: unknown, fallback: boolean): boolean {
  if (typeof value === 'boolean') return value;
  return fallback;
}

function normalizeItems(items: unknown): Array<Record<string, unknown>> {
  if (!Array.isArray(items)) return [];
  return items.map((item, index) => {
    const raw = item as Record<string, unknown>;
    return {
      sort_order: cleanNumber(raw.sort_order, index + 1),
      title: cleanText(raw.title),
      description: cleanText(raw.description) || null,
      weight: Math.max(0, cleanNumber(raw.weight, 1)),
      is_required: cleanBool(raw.is_required, true),
      has_comment: cleanBool(raw.has_comment, false),
      is_active: cleanBool(raw.is_active, true),
    };
  }).filter(item => item.title);
}

function avatarUrl(empId?: string): string | null {
  if (!empId) return null;
  return `https://api-idms.advanceagro.net/hrms/employee/${encodeURIComponent(empId)}/photocard/?size=120`;
}

function buildUserMap(users: any[]) {
  const map = new Map<string, any>();
  for (const u of users) {
    if (u.id) map.set(String(u.id).toLowerCase(), u);
    if (u.emp_id) map.set(String(u.emp_id).toLowerCase(), u);
    if (u.email) map.set(String(u.email).toLowerCase(), u);
    if (u.full_name) map.set(String(u.full_name).toLowerCase(), u);
  }
  return map;
}

function resolveUser(identifier: string | undefined | null, userMap: Map<string, any>) {
  if (!identifier) return null;
  const key = String(identifier).trim().toLowerCase();
  const matched = userMap.get(key);
  if (matched) {
    return {
      name: matched.full_name || matched.email || matched.emp_id || identifier,
      emp_id: matched.emp_id || null,
      email: matched.email || null,
      avatar_url: avatarUrl(matched.emp_id),
    };
  }
  for (const [k, u] of userMap.entries()) {
    if (k.length > 3 && (k.includes(key) || key.includes(k))) {
      return {
        name: u.full_name || u.email || u.emp_id || identifier,
        emp_id: u.emp_id || null,
        email: u.email || null,
        avatar_url: avatarUrl(u.emp_id),
      };
    }
  }
  return {
    name: identifier,
    emp_id: null,
    email: null,
    avatar_url: null,
  };
}

async function enrichTemplates(supabase: ReturnType<typeof getAdminSupabase>, templates: any[]) {
  if (!templates.length) return [];
  const { data: users } = await supabase.from('users').select('id, full_name, emp_id, email');
  const userMap = buildUserMap(users || []);
  return templates.map(t => ({
    ...t,
    creator: resolveUser(t.created_by, userMap),
    updater: resolveUser(t.updated_by, userMap),
  }));
}

async function fetchTemplate(supabase: ReturnType<typeof getAdminSupabase>, id: string) {
  const { data: template, error } = await supabase
    .from('evaluation_templates')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .maybeSingle();
  if (error) throw error;
  if (!template) return null;
  const { data: items, error: itemError } = await supabase
    .from('evaluation_template_items')
    .select('*')
    .eq('template_id', id)
    .order('sort_order', { ascending: true });
  if (itemError) throw itemError;
  const [enriched] = await enrichTemplates(supabase, [template]);
  return { ...enriched, items: items || [] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'GET, POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const staff = await requireStaff(req, res);
  if (!staff) return;
  const supabase = getAdminSupabase();

  try {
    if (req.method === 'GET') {
      const id = first(req.query.id);
      if (id) {
        const template = await fetchTemplate(supabase, id);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        return res.status(200).json({ success: true, data: template });
      }

      const activeOnly = first(req.query.activeOnly) === 'true';
      let query = supabase
        .from('evaluation_templates')
        .select('*, evaluation_template_items(id)')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      if (activeOnly) query = query.eq('is_active', true);
      const { data, error } = await query;
      if (error) throw error;
      const formatted = (data || []).map((row: any) => ({
        ...row,
        item_count: row.evaluation_template_items?.length || 0,
        evaluation_template_items: undefined,
      }));
      const enriched = await enrichTemplates(supabase, formatted);
      return res.status(200).json({
        success: true,
        data: enriched,
      });
    }

    const action = cleanText(req.body?.action);
    if (action === 'delete') {
      const id = cleanText(req.body?.id);
      if (!id) return res.status(400).json({ error: 'Missing template id' });
      const { error } = await supabase
        .from('evaluation_templates')
        .update({ is_deleted: true, is_active: false, updated_by: staff.full_name || staff.email || staff.id, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    if (action === 'duplicate') {
      const id = cleanText(req.body?.id);
      const source = await fetchTemplate(supabase, id);
      if (!source) return res.status(404).json({ error: 'Template not found' });
      const { data: created, error } = await supabase
        .from('evaluation_templates')
        .insert([{
          name: `${source.name} (Copy)`,
          description: source.description,
          scale_min: source.scale_min,
          scale_max: source.scale_max,
          passing_score_percent: source.passing_score_percent,
          recommendation_options: source.recommendation_options,
          is_active: false,
          created_by: staff.full_name || staff.email || staff.id,
          updated_by: staff.full_name || staff.email || staff.id,
        }])
        .select('*')
        .single();
      if (error) throw error;
      const items = (source.items || []).map((item: any) => ({
        template_id: created.id,
        sort_order: item.sort_order,
        title: item.title,
        description: item.description,
        weight: item.weight,
        is_required: item.is_required,
        has_comment: item.has_comment,
        is_active: item.is_active,
      }));
      if (items.length) {
        const { error: itemError } = await supabase.from('evaluation_template_items').insert(items);
        if (itemError) throw itemError;
      }
      return res.status(200).json({ success: true, data: await fetchTemplate(supabase, created.id) });
    }

    if (action !== 'save') return res.status(400).json({ error: 'Unsupported action' });
    const payload = req.body?.template || {};
    const id = cleanText(payload.id);
    const scaleMin = cleanNumber(payload.scale_min, 1);
    const scaleMax = cleanNumber(payload.scale_max, 5);
    if (scaleMax <= scaleMin) return res.status(400).json({ error: 'Scale max must be greater than scale min' });
    const templatePayload = {
      name: cleanText(payload.name),
      description: cleanText(payload.description) || null,
      scale_min: scaleMin,
      scale_max: scaleMax,
      passing_score_percent: Math.max(0, Math.min(100, cleanNumber(payload.passing_score_percent, 70))),
      recommendation_options: Array.isArray(payload.recommendation_options) ? payload.recommendation_options : undefined,
      is_active: cleanBool(payload.is_active, true),
      updated_by: staff.full_name || staff.email || staff.id,
      updated_at: new Date().toISOString(),
    };
    if (!templatePayload.name) return res.status(400).json({ error: 'Template name is required' });

    let templateId = id;
    if (id) {
      const { error } = await supabase.from('evaluation_templates').update(templatePayload).eq('id', id);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from('evaluation_templates')
        .insert([{ ...templatePayload, created_by: staff.full_name || staff.email || staff.id }])
        .select('id')
        .single();
      if (error) throw error;
      templateId = data.id;
    }

    const items = normalizeItems(payload.items).map(item => ({ ...item, template_id: templateId }));
    await supabase.from('evaluation_template_items').delete().eq('template_id', templateId);
    if (items.length) {
      const { error } = await supabase.from('evaluation_template_items').insert(items);
      if (error) throw error;
    }

    return res.status(200).json({ success: true, data: await fetchTemplate(supabase, templateId) });
  } catch (error: any) {
    console.error('[evaluation-templates]', error?.message || error);
    return res.status(500).json({ error: error.message || 'Evaluation template operation failed' });
  }
}
