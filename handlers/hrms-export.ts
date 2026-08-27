import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'crypto';
import { getAdminSupabase, getActiveStaff, safeEqual } from '../server/security.js';

function getHeaderApiKey(req: VercelRequest): string {
  const xApiKey = req.headers['x-api-key'];
  if (xApiKey && typeof xApiKey === 'string') return xApiKey.trim();

  const authHeader = req.headers.authorization;
  if (authHeader && typeof authHeader === 'string') {
    const match = authHeader.match(/^Bearer\s+(.*)$/i);
    if (match) return match[1].trim();
  }

  const queryKey = req.query.api_key || req.query.apiKey;
  if (queryKey && typeof queryKey === 'string') return queryKey.trim();

  return '';
}

async function verifyIntegrationAuthAsync(req: VercelRequest): Promise<boolean> {
  const providedKey = getHeaderApiKey(req);
  if (!providedKey) return false;

  // 1. Check against dynamic database API keys in system_api_keys
  try {
    const keyHash = crypto.createHash('sha256').update(providedKey.trim()).digest('hex');
    const supabase = getAdminSupabase();
    const { data: matchedKey } = await supabase
      .from('system_api_keys')
      .select('id, is_active')
      .eq('key_hash', keyHash)
      .eq('is_active', true)
      .maybeSingle();

    if (matchedKey) {
      // Update last_used_at asynchronously
      supabase
        .from('system_api_keys')
        .update({ last_used_at: new Date().toISOString() })
        .eq('id', matchedKey.id)
        .then(() => {})
        .catch(() => {});
      return true;
    }
  } catch (err) {
    console.error('[Verify DB API Key Error]:', err);
  }

  // 2. Fallback to environment variables
  const validKeys = [
    process.env.HRMS_SYNC_API_KEY,
    process.env.HRMS_SECRET_KEY,
    process.env.HRBP_SESSION_SECRET,
  ].filter(Boolean) as string[];

  if (validKeys.length === 0) return false;

  return validKeys.some(validKey => {
    try {
      return safeEqual(providedKey, validKey.trim());
    } catch {
      return false;
    }
  });
}

function generateSecureFileUrl(req: VercelRequest, rawUrl?: string | null): { url: string; file_name: string; expires_in_seconds: number } | null {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  const clean = rawUrl.trim();
  if (!clean) return null;

  // Extract file name
  const fileName = clean.split('/').pop()?.split('?')[0] || 'attachment';

  // Build proxy url
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const proxyUrl = `${protocol}://${host}/api?route=files&url=${encodeURIComponent(clean)}&download=true`;

  return {
    url: proxyUrl,
    file_name: decodeURIComponent(fileName),
    expires_in_seconds: 7200, // 2 hours
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // 1. Authenticate Request
  const isStaff = await getActiveStaff(req);
  const isApiKeyValid = await verifyIntegrationAuthAsync(req);

  if (!isStaff && !isApiKeyValid) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized. Provide a valid X-API-Key header or staff session.',
      code: 'AUTH_REQUIRED',
    });
  }

  const { application_id, national_id, status, limit = '50' } = req.query;
  const parsedLimit = Math.min(100, Math.max(1, parseInt(String(limit), 10) || 50));

  try {
    const supabase = getAdminSupabase();
    let query = supabase.from('applications').select('*');

    if (application_id && typeof application_id === 'string') {
      query = query.eq('id', application_id.trim());
    } else if (national_id && typeof national_id === 'string') {
      const cleanNationalId = national_id.trim().replace(/\D/g, '');
      query = query.eq('national_id', cleanNationalId).order('created_at', { ascending: false });
      if (status && typeof status === 'string') {
        query = query.eq('hrms_sync_status', status.trim().toUpperCase());
      }
    } else if (status && typeof status === 'string') {
      query = query.eq('hrms_sync_status', status.trim().toUpperCase()).order('created_at', { ascending: false });
    } else {
      // Default: fetch items marked as READY_TO_SYNC
      query = query.eq('hrms_sync_status', 'READY_TO_SYNC').order('created_at', { ascending: false });
    }

    query = query.limit(parsedLimit);

    const { data: records, error } = await query;

    if (error) {
      console.error('[HRMS Export Error]:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!records || records.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        message: 'No matching application records found for export.',
        data: [],
      });
    }

    // 2. Process Records and Attachments
    const allNationalIds = records.map(r => r.national_id).filter(Boolean);
    let nationalIdCounts: Record<string, number> = {};

    if (allNationalIds.length > 0) {
      const { data: countData } = await supabase
        .from('applications')
        .select('national_id')
        .in('national_id', allNationalIds);

      if (countData) {
        countData.forEach((row: any) => {
          if (row.national_id) {
            nationalIdCounts[row.national_id] = (nationalIdCounts[row.national_id] || 0) + 1;
          }
        });
      }
    }

    const payload = records.map((rec: any) => {
      const formData = rec.form_data || {};
      const count = rec.national_id ? (nationalIdCounts[rec.national_id] || 1) : 1;
      const isRehire = count > 1;

      return {
        application_id: rec.id,
        created_at: rec.created_at,
        status: rec.status,
        
        // HRMS Sync Metadata
        hrms_sync: {
          status: rec.hrms_sync_status || 'NOT_READY',
          ready_at: rec.hrms_ready_at || null,
          ready_by: rec.hrms_ready_by || null,
          synced_at: rec.hrms_synced_at || null,
          employee_id: rec.hrms_employee_id || null,
          notes: rec.hrms_sync_notes || null,
        },

        // Re-hire detection metadata
        rehire_meta: {
          is_rehire: isRehire,
          total_applications_in_system: count,
          note: isRehire ? 'Candidate has multiple application records in HRBP.' : 'First-time applicant record.',
        },

        // Job Details
        applied_position: {
          position_th: rec.position || formData.position || '',
          position_en: formData.positionEn || '',
          department_th: rec.department || formData.department || '',
          department_en: formData.departmentEn || '',
          business_unit: rec.business_unit || formData.businessUnit || '',
          expected_salary: rec.expected_salary || formData.expectedSalary || '',
          is_salary_negotiable: rec.is_salary_negotiable ?? formData.isSalaryNegotiable ?? false,
          availability: rec.availability || formData.availability || '',
          source_channel: rec.source_channel || formData.sourceChannel || '',
          campaign_tag: rec.campaign_tag || formData.campaignTag || '',
        },

        // Personal Information
        personal_info: {
          is_thai_national: rec.is_thai_national ?? formData.isThaiNational ?? true,
          national_id: rec.national_id || formData.nationalId || '',
          passport_no: rec.passport_no || formData.passportNo || '',
          title_th: rec.title || formData.title || '',
          first_name_th: rec.first_name || formData.firstName || '',
          last_name_th: rec.last_name || formData.lastName || '',
          title_en: formData.titleEn || '',
          first_name_en: formData.firstNameEn || '',
          last_name_en: formData.lastNameEn || '',
          full_name: rec.full_name || `${rec.first_name || ''} ${rec.last_name || ''}`.trim(),
          nickname: rec.nickname || formData.nickname || '',
          nickname_en: formData.nicknameEn || '',
          date_of_birth: rec.date_of_birth || formData.dateOfBirth || '',
          age: rec.age || formData.age || '',
          weight_kg: rec.weight || formData.weight || '',
          height_cm: rec.height || formData.height || '',
          military_status: rec.military_status || formData.militaryStatus || '',
          marital_status: rec.marital_status || formData.maritalStatus || '',
        },

        // Contact Information
        contact_info: {
          phone: rec.phone || formData.phone || '',
          email: rec.email || formData.email || '',
          current_address: {
            address_line: rec.current_address || formData.currentAddress || '',
            subdistrict: rec.current_sub_district || formData.currentSubDistrict || '',
            district: rec.current_district || formData.currentDistrict || '',
            province: rec.current_province || formData.currentProvince || '',
            postcode: formData.currentPostcode || '',
          },
          registered_address: {
            address_line: rec.registered_address || formData.registeredAddress || '',
            subdistrict: rec.registered_sub_district || formData.registeredSubDistrict || '',
            district: rec.registered_district || formData.registeredDistrict || '',
            province: rec.registered_province || formData.registeredProvince || '',
            postcode: formData.registeredPostcode || '',
          },
        },

        // Family Information
        family_info: {
          children_count: rec.children_count ?? formData.childrenCount ?? 0,
          sibling_count: rec.sibling_count ?? formData.siblingCount ?? 0,
          spouse: {
            name: rec.spouse_name || formData.spouseName || '',
            age: rec.spouse_age || formData.spouseAge || '',
            occupation: rec.spouse_occupation || formData.spouseOccupation || '',
          },
          father: {
            name: rec.father_name || formData.fatherName || '',
            age: rec.father_age || formData.fatherAge || '',
            occupation: rec.father_occupation || formData.fatherOccupation || '',
          },
          mother: {
            name: rec.mother_name || formData.motherName || '',
            age: rec.mother_age || formData.motherAge || '',
            occupation: rec.mother_occupation || formData.motherOccupation || '',
          },
        },

        // Education History
        education: rec.education || formData.education || [],

        // Work Experience
        work_experience: rec.experience || formData.workExperience || [],

        // Languages & Skills
        skills_and_competencies: {
          english: {
            level: rec.english_skill || formData.englishSkill || '',
            score: rec.english_score || formData.englishScore || '',
          },
          chinese: {
            level: rec.chinese_skill || formData.chineseSkill || '',
            score: rec.chinese_score || formData.chineseScore || '',
          },
          computer_skills: rec.computer_skills || formData.computerSkills || [],
          graphics_skills: rec.graphics_skills || formData.graphicsSkills || [],
          driving_licenses: rec.driving || formData.driving || [],
          upcountry_locations: rec.upcountry_locations || formData.upcountryLocations || [],
        },

        // Emergency Contact
        emergency_contact: {
          name: rec.emergency_contact_name || formData.emergencyContactName || '',
          relation: rec.emergency_contact_relation || formData.emergencyContactRelation || '',
          phone: rec.emergency_contact_phone || formData.emergencyContactPhone || '',
          company: rec.emergency_contact_company || formData.emergencyContactCompany || '',
          position: rec.emergency_contact_position || formData.emergencyContactPosition || '',
        },

        // Health & Medical Records
        health_and_medical: {
          has_chronic_disease: rec.has_chronic_disease ?? formData.hasChronicDisease ?? false,
          chronic_disease_detail: rec.chronic_disease_detail || formData.chronicDiseaseDetail || '',
          has_surgery: rec.has_surgery ?? formData.hasSurgery ?? false,
          surgery_detail: rec.surgery_detail || formData.surgeryDetail || '',
          has_medical_record: rec.has_medical_record ?? formData.hasMedicalRecord ?? false,
          medical_record_detail: rec.medical_record_detail || formData.medicalRecordDetail || '',
        },

        // Questionnaire Answers
        questionnaire: {
          strength: rec.strength || formData.strength || '',
          weakness: rec.weakness || formData.weakness || '',
          less_fit_task: rec.less_fit_task || formData.lessFitTask || '',
          principles: rec.principles || formData.principles || '',
          trouble_resolve: rec.trouble_resolve || formData.troubleResolve || '',
          job_criteria: rec.job_criteria || formData.jobCriteria || '',
          interests: rec.interests || formData.interests || '',
          digital_transform_opinion: rec.digital_transform_opinion || formData.digitalTransformOpinion || '',
          special_ability: rec.special_ability || formData.specialAbility || '',
          hobbies: rec.hobbies || formData.hobbies || '',
        },

        // Secure Attachments Download Links (Presigned with Expiration)
        attachments: {
          profile_photo: generateSecureFileUrl(req, rec.photo_url || formData.photoUrl),
          resume: generateSecureFileUrl(req, rec.resume_url || formData.resumeUrl),
          transcript: generateSecureFileUrl(req, formData.transcriptUrl),
          certificate: generateSecureFileUrl(req, rec.certificate_url || formData.certificateUrl),
          other_documents: generateSecureFileUrl(req, rec.other_docs_url || formData.otherDocsUrl),
          id_card: generateSecureFileUrl(req, formData.idCardUrl),
          house_registration: generateSecureFileUrl(req, formData.houseRegUrl),
          educational_certificate: generateSecureFileUrl(req, formData.eduCertificateUrl),
          military_certificate: generateSecureFileUrl(req, formData.militaryCertUrl),
          toeic_certificate: generateSecureFileUrl(req, formData.toeicCertUrl),
          bank_book: generateSecureFileUrl(req, formData.bankBookUrl),
        },
      };
    });

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      count: payload.length,
      data: application_id && payload.length === 1 ? payload[0] : payload,
    });
  } catch (err: any) {
    console.error('[HRMS Export Exception]:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during HRMS export',
    });
  }
}
