import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configureSameOrigin, getAdminSupabase, requireStaff } from '../server/security.js';

type EditPayload = {
  id?: string;
  update?: Record<string, unknown>;
  changedFields?: string[];
};

function sanitizeUnicode<T>(input: T): T {
  if (input === null || input === undefined) return input;
  if (typeof input === 'string') {
    let value = input.replace(/\0/g, '').replace(/\u0000/g, '');
    if (typeof (value as any).toWellFormed === 'function') {
      value = (value as any).toWellFormed();
    } else {
      value = value.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])|([^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g, '$1\uFFFD');
    }
    return value as T;
  }
  if (Array.isArray(input)) return input.map(item => sanitizeUnicode(item)) as T;
  if (typeof input === 'object') {
    const output: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) output[sanitizeUnicode(key)] = sanitizeUnicode(value);
    return output as T;
  }
  return input;
}

function integerOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number.parseInt(String(value).replace(/,/g, ''), 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function textOrNull(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text || null;
}

function cleanChangedFields(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 30);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!configureSameOrigin(req, res, 'POST')) return;
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const user = await requireStaff(req, res);
    if (!user) return;

    const { id, update, changedFields }: EditPayload = req.body || {};
    if (!id || typeof id !== 'string' || !/^[a-f0-9-]{20,50}$/i.test(id)) {
      return res.status(400).json({ error: 'Invalid application id' });
    }
    if (!update || typeof update !== 'object') {
      return res.status(400).json({ error: 'Missing update payload' });
    }

    const formData = sanitizeUnicode((update.form_data || {}) as Record<string, unknown>);
    const payload = sanitizeUnicode({
      position: textOrNull(update.position),
      department: textOrNull(update.department),
      phone: textOrNull(update.phone),
      email: textOrNull(update.email),
      business_unit: textOrNull(update.business_unit),
      source_channel: textOrNull(update.source_channel),
      campaign_tag: textOrNull(update.campaign_tag),
      expected_salary: integerOrNull(update.expected_salary),
      height: integerOrNull(update.height),
      weight: integerOrNull(update.weight),
      date_of_birth: textOrNull(update.date_of_birth),
      age: integerOrNull(update.age),
      photo_url: textOrNull(update.photo_url),
      full_name: textOrNull(update.full_name),
      first_name: textOrNull(update.first_name),
      last_name: textOrNull(update.last_name),
      title: textOrNull(update.title),
      form_data: formData,
    });

    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from('applications')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!data) return res.status(404).json({ error: 'Application not found or not updated' });

    const cleanedFields = cleanChangedFields(changedFields);
    if (cleanedFields.length) {
      await supabase.from('application_logs').insert([{
        application_id: id,
        action: 'edited',
        note: `แก้ไขข้อมูล: ${cleanedFields.join(', ')}`,
        performed_by: user.full_name || user.emp_id || 'HRBP Staff',
        created_at: new Date().toISOString(),
      }]);
    }

    return res.status(200).json({ success: true, data });
  } catch (error: any) {
    console.error('[application-edit]', error?.message || error);
    return res.status(500).json({ error: error.message || 'Application edit failed' });
  }
}
