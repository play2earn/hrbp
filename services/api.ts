
import { supabase } from '../supabaseClient';
import { ApplicationForm, BlacklistEntry, BlacklistAuditLog, WorkLocation, MasterPosition } from '../types';
import md5 from 'js-md5';
import { uploadToR2, getStorageProvider } from '../utils/r2-upload';
import { getIdmsErrorMessage } from '../utils/idms-response';
import { sanitizeUnicode } from './utils';

// ============================================================
// API Response Types
// ============================================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'mod';
  full_name: string;
  phone?: string;
  status: 'Active' | 'Pending' | 'Inactive' | 'Rejected';
  created_at: string;
  emp_id?: string;
  hrms_username?: string;
  position_name?: string;
  company_name?: string;
  department_name?: string;
  is_hr_team?: boolean;
  allow_non_hr_access?: boolean;
  approved_department_name?: string;
  approved_position_name?: string;
  approved_at?: string;
  approved_by?: string;
  last_login_at?: string;
  last_active_at?: string;
  last_synced_at?: string;
}

export type ApplicationStatus =
  | 'Pending'
  | 'Reviewing'
  | 'Interview'
  | 'InterviewScheduled'
  | 'Interviewed'
  | 'Offer'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn'
  | 'NoShow';

export interface WorkflowStatusOptions {
  comment?: string;
  performedByUserId?: string | null;
  performedByName?: string;
  rejectionReason?: string;
  interviewDate?: string;
  interviewStartTime?: string;
  interviewEndTime?: string;
  teamsMeetingUrl?: string;
}

export interface GetApplicationsParams {
  page: number;
  limit: number;
  search: string;
  status: string;
  position: string;
  department: string;
  bu: string;
  channel: string;
  assignment: string;
  currentUserId: string | null;
  blacklist: string;
  blacklistEntries: any[];
  hrms?: string;
  duplicate?: string;
  duplicateAppIds?: string[];
}

export interface EvaluationTemplateItem {
  id?: string;
  template_id?: string;
  sort_order: number;
  title: string;
  description?: string | null;
  weight: number;
  is_required: boolean;
  has_comment: boolean;
  is_active?: boolean;
}

export interface EvaluationTemplateUser {
  name: string;
  emp_id?: string | null;
  email?: string | null;
  avatar_url?: string | null;
}

export interface EvaluationTemplate {
  id?: string;
  name: string;
  description?: string | null;
  scale_min: number;
  scale_max: number;
  passing_score_percent: number;
  recommendation_options?: Array<{ value: string; label: string }>;
  is_active: boolean;
  item_count?: number;
  items?: EvaluationTemplateItem[];
  created_by?: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
  creator?: EvaluationTemplateUser | null;
  updater?: EvaluationTemplateUser | null;
}

export interface EvaluationReviewerProfile {
  id?: string;
  emp_id: string;
  full_name: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  company_name?: string | null;
  avatar_url?: string | null;
}


// ============================================================
// Error Handler Utility
// ============================================================
const handleError = (error: any, context: string): ApiResponse<never> => {
  console.error(`[API Error - ${context}]:`, error);

  // Map common Supabase errors to user-friendly messages
  const errorMessages: Record<string, string> = {
    '42P01': 'Database table not found. Please contact administrator.',
    '23505': 'This record already exists.',
    '23503': 'Related record not found.',
    'PGRST116': 'Record not found.',
    'invalid_credentials': 'Invalid email or password.',
    'user_not_found': 'No account found with this email.',
  };

  const code = error?.code || error?.message || 'unknown';
  const message = errorMessages[code] || error?.message || 'An unexpected error occurred.';

  return {
    success: false,
    error: { message, code }
  };
};

import imageCompression from 'browser-image-compression';

// ============================================================
// File Upload Service
// ============================================================
export const api = {
  /**
   * Upload a file to Supabase Storage with progress tracking
   */
  uploadFile: async (file: File, folder: string, draftId?: string): Promise<string | null> => {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw { message: 'ประเภทไฟล์ไม่รองรับ กรุณาใช้ JPG, PNG, WebP หรือ PDF' };
      }

      // Validate file size (different limits by type)
      const isPDF = file.type === 'application/pdf';
      const MAX_SIZE = isPDF ? 5 * 1024 * 1024 : 10 * 1024 * 1024; // 5MB for PDF, 10MB for images
      if (file.size > MAX_SIZE) {
        throw { message: isPDF
          ? `ไฟล์ PDF ขนาดเกิน 5MB (${(file.size / 1024 / 1024).toFixed(1)}MB) กรุณาลดขนาดไฟล์ก่อนอัพโหลด`
          : `ไฟล์ขนาดเกิน 10MB กรุณาลดขนาดไฟล์ก่อนอัพโหลด`
        };
      }

      let fileToUpload = file;

      // Compress image files
      if (file.type.startsWith('image/')) {
        const originalSize = file.size;
        const options = {
          maxSizeMB: 0.8, // Compress to max 800KB (tighter for faster loads)
          maxWidthOrHeight: 1600, // Max dimension 1600px (sufficient for viewing)
          useWebWorker: true,
          fileType: 'image/jpeg' as const, // Convert all images to JPEG for smaller size
        };
        try {
          fileToUpload = await imageCompression(file, options);
          console.log(`📷 Image compressed: ${(originalSize / 1024).toFixed(0)}KB → ${(fileToUpload.size / 1024).toFixed(0)}KB (${Math.round((1 - fileToUpload.size / originalSize) * 100)}% reduction)`);
        } catch (error) {
          console.error('Image compression failed. Proceeding with original file.', error);
        }
      }

      // ------------------------------------------------------------
      // HYBRID STORAGE: TRY CLOUDFLARE R2 FIRST (unless disabled)
      // ------------------------------------------------------------
      const provider = getStorageProvider();
      if (provider !== 'supabase') {
        try {
          console.log(`[Upload] Attempting R2 upload (folder: ${folder}, draftId: ${draftId || 'none'})`);
          const r2Url = await uploadToR2(fileToUpload, folder, draftId);
          console.log('[Upload] Successfully uploaded to R2:', r2Url);
          return r2Url;
        } catch (r2Error) {
          console.warn('[Upload] R2 upload failed:', r2Error);
          if (provider === 'r2') {
            // Strict R2 mode: do not fall back, throw the error
            throw new Error(`R2 upload failed and fallback is disabled: ${r2Error instanceof Error ? r2Error.message : 'Unknown error'}`);
          }
          console.warn('[Upload] Falling back to Supabase Storage...');
        }
      }

      // ------------------------------------------------------------
      // FALLBACK / LEGACY: SUPABASE STORAGE
      // ------------------------------------------------------------
      // Generate safe filename
      const safeFileName = fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${folder}/${Date.now()}_${safeFileName}`;

      const { data, error } = await supabase.storage
        .from('applicants')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        // Provide user-friendly error messages
        if (error.message?.includes('Bucket not found')) {
          throw { message: 'Storage bucket not found. Please contact administrator.' };
        }
        if (error.message?.includes('row-level security')) {
          throw { message: 'Storage permission denied. Please contact administrator.' };
        }
        throw error;
      }

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('applicants')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('File upload failed:', error);
      throw new Error(error.message || 'Upload failed. Please try again.');
    }
  },

  // ============================================================
  // Application Services
  // ============================================================

  /**
   * Submit the full application to the database
   */
  submitApplication: async (rawFormData: ApplicationForm): Promise<ApiResponse<{ id: string }>> => {
    try {
      // Sanitize input to strip null bytes (\u0000) & broken unicode surrogates from copy-pasting
      const formData = sanitizeUnicode(rawFormData);

      // Validate required fields
      const hasThaiName = formData.firstName && formData.lastName;
      const hasEnglishName = formData.firstNameEn && formData.lastNameEn;
      
      if (!hasThaiName && !hasEnglishName) {
        return { success: false, error: { message: 'Please fill in all required name fields.' } };
      }
      if (!formData.email) {
        return { success: false, error: { message: 'Please fill in all required fields.' } };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return { success: false, error: { message: 'Please enter a valid email address.' } };
      }

      const fullName = formData.isThaiNational && hasThaiName
        ? `${formData.firstName} ${formData.lastName}`.trim()
        : `${formData.firstNameEn} ${formData.lastNameEn}`.trim();

      const payload = {
        position: formData.position,
        department: formData.department,
        business_unit: formData.businessUnit,
        source_channel: formData.sourceChannel,
        campaign_tag: formData.campaignTag,
        full_name: fullName,
        email: formData.email.toLowerCase().trim(),
        phone: formData.phone,
        status: 'Pending',
        form_data: formData,
        created_at: new Date().toISOString(),
      };


      const { data, error } = await supabase
        .from('applications')
        .insert([payload])
        .select('id')
        .single();

      if (error) return handleError(error, 'submitApplication');

      // Auto-log submission
      await api.addApplicationLog({
        application_id: data.id,
        action: 'submitted',
        new_value: 'Pending',
        performed_by: fullName || 'ผู้สมัคร',
      });

      return { success: true, data: { id: data.id } };
    } catch (error) {
      return handleError(error, 'submitApplication');
    }
  },

  /**
   * Track application status by ID
   * Also returns active resubmit token info so TrackingSystem can show the resubmit banner.
   */
  trackApplication: async (trackingId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch('/api/tracking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'tracking-id', value: trackingId }),
      });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'Application not found.' } };
    } catch (error) {
      return handleError(error, 'trackApplication');
    }
  },

  /**
   * Track application(s) by National ID or Passport Number (searches in form_data JSONB)
   * Also returns active resubmit token info for each result.
   */
  trackByIdOrPassport: async (searchValue: string): Promise<ApiResponse<any[]>> => {
    try {
      const response = await fetch('/api/tracking', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'identity', value: searchValue.trim() }),
      });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'No applications found.' } };
    } catch (error) {
      return handleError(error, 'trackByIdOrPassport');
    }
  },

  /**
   * Fetch all applications for Dashboard
   */
  getApplications: async (): Promise<any[]> => {
    try {
      // Check for session validity before fetching
      const sessionResult = await api.auth.verifySession();
      if (!sessionResult.success) {
        console.warn("Session invalid");
        return [];
      }

      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            created_at,
            full_name,
            phone,
            position,
            department,
            status,
            assigned_to,
            assigned_user:users!applications_assigned_to_fkey(id, full_name, emp_id),
            business_unit,
            source_channel,
            campaign_tag,
            interview_date,
            interview_start_time,
            interview_end_time,
            teams_meeting_url,
            updated_at,
            nickname:form_data->>nickname,
            photoUrl:form_data->>photoUrl,
            age:form_data->>age,
            nationalId:form_data->>nationalId,
            passportNo:form_data->>passportNo,
            isThaiNational:form_data->>isThaiNational,
            prefix:form_data->>prefix,
            firstName:form_data->>firstName,
            lastName:form_data->>lastName,
            departmentEn:form_data->>departmentEn,
            positionEn:form_data->>positionEn,
            height:form_data->>height,
            weight:form_data->>weight,
            education:form_data->education,
            englishSkill:form_data->>englishSkill,
            englishScore:form_data->>englishScore,
            chineseSkill:form_data->>chineseSkill,
            chineseScore:form_data->>chineseScore,
            otherLang:form_data->>otherLang,
            availability:form_data->>availability,
            isAvailableImmediately:form_data->>isAvailableImmediately,
            expectedSalary:form_data->>expectedSalary
          `)
          .order('created_at', { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error("Fetch Apps Error:", error);
          break;
        }

        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        page++;
      }

      return allData.map((app: any) => {
        const {
          nickname, photoUrl, age, nationalId, passportNo, isThaiNational,
          prefix, firstName, lastName, departmentEn, positionEn,
          height, weight, education,
          englishSkill, englishScore, chineseSkill, chineseScore, otherLang,
          availability, isAvailableImmediately, expectedSalary,
          ...rest
        } = app;
        return {
          ...rest,
          form_data: {
            nickname,
            photoUrl,
            age,
            nationalId,
            passportNo,
            isThaiNational: isThaiNational === 'true' ? true : isThaiNational === 'false' ? false : isThaiNational,
            prefix,
            firstName,
            lastName,
            departmentEn,
            positionEn,
            height,
            weight,
            education,
            englishSkill,
            englishScore,
            chineseSkill,
            chineseScore,
            otherLang,
            availability,
            isAvailableImmediately: isAvailableImmediately === 'true' ? true : isAvailableImmediately === 'false' ? false : isAvailableImmediately,
            expectedSalary,
            businessUnit: rest.business_unit,
            sourceChannel: rest.source_channel,
            campaignTag: rest.campaign_tag
          }
        };
      });
    } catch (error) {
      console.error("Fetch Apps Error:", error);
      return [];
    }
  },

  /**
   * Fetch all applications with server-side pagination, filtering, and sorting
   */
  getApplicationsPaginated: async (params: GetApplicationsParams): Promise<{ data: any[]; count: number }> => {
    try {
      const sessionResult = await api.auth.verifySession();
      if (!sessionResult.success) return { data: [], count: 0 };

      let query = supabase
        .from('applications')
        .select(`
          id,
          created_at,
          full_name,
          phone,
          position,
          department,
          status,
          assigned_to,
          assigned_user:users!applications_assigned_to_fkey(id, full_name, emp_id),
          business_unit,
          source_channel,
          campaign_tag,
          interview_date,
          interview_start_time,
          interview_end_time,
          teams_meeting_url,
          updated_at,
          hrms_sync_status,
          hrms_ready_at,
          hrms_ready_by,
          hrms_synced_at,
          hrms_employee_id,
          hrms_sync_notes,
          nickname:form_data->>nickname,
          photoUrl:form_data->>photoUrl,
          isThaiNational:form_data->>isThaiNational,
          nationalId:form_data->>nationalId,
          passportNo:form_data->>passportNo,
          prefix:form_data->>prefix,
          firstName:form_data->>firstName,
          lastName:form_data->>lastName,
          departmentEn:form_data->>departmentEn,
          positionEn:form_data->>positionEn
        `, { count: 'exact' });

      // 1. Status Filter
      if (params.status && params.status !== 'all') {
        if (params.status === 'InterviewScheduled') {
          query = query.eq('status', 'InterviewScheduled');
        } else {
          query = query.eq('status', params.status);
        }
      }

      // 2. Assignment Filter
      if (params.assignment === 'me' && params.currentUserId) {
        query = query.eq('assigned_to', params.currentUserId);
      } else if (params.assignment === 'unassigned') {
        query = query.is('assigned_to', null);
      }

      // 3. Position Filter
      if (params.position) {
        if (params.position === '__unassigned__') {
          query = query.or('position.is.null,position.eq.');
        } else {
          query = query.eq('position', params.position);
        }
      }

      // 4. Department Filter
      if (params.department) {
        if (params.department === '__unassigned__') {
          query = query.or('department.is.null,department.eq.');
        } else {
          query = query.eq('department', params.department);
        }
      }

      // 5. Business Unit (BU) Filter
      if (params.bu) {
        query = query.eq('business_unit', params.bu);
      }

      // 6. Source Channel Filter
      if (params.channel) {
        query = query.eq('source_channel', params.channel);
      }

      // 7. Blacklist Filter (using client-provided blacklist entries)
      if (params.blacklist && params.blacklist !== 'all' && params.blacklistEntries && params.blacklistEntries.length > 0) {
        const activeIds = params.blacklistEntries.map(e => e.national_id).filter(Boolean).map(x => `"${x}"`);
        const activePassports = params.blacklistEntries.map(e => e.passport_no).filter(Boolean).map(x => `"${x.toUpperCase()}"`);
        
        if (params.blacklist === 'yes') {
          const orConditions: string[] = [];
          if (activeIds.length > 0) orConditions.push(`form_data->>nationalId.in.(${activeIds.join(',')})`);
          if (activePassports.length > 0) orConditions.push(`form_data->>passportNo.in.(${activePassports.join(',')})`);
          
          if (orConditions.length > 0) {
            query = query.or(orConditions.join(','));
          } else {
            // Force return empty if yes selected but no active blacklists exist
            query = query.eq('id', '00000000-0000-0000-0000-000000000000');
          }
        } else if (params.blacklist === 'no') {
          if (activeIds.length > 0) {
            query = query.not('form_data->>nationalId', 'in', `(${activeIds.join(',')})`);
          }
          if (activePassports.length > 0) {
            query = query.not('form_data->>passportNo', 'in', `(${activePassports.join(',')})`);
          }
        }
      }

      // 8. Search Filter
      if (params.search) {
        const q = `%${params.search.trim().toLowerCase()}%`;
        query = query.or(`full_name.ilike.${q},phone.ilike.${q},form_data->>nickname.ilike.${q}`);
      }

      // 9. HRMS Filter
      if (params.hrms && params.hrms !== 'all') {
        if (params.hrms === 'READY_TO_SYNC') {
          query = query.eq('hrms_sync_status', 'READY_TO_SYNC');
        } else if (params.hrms === 'SYNCED') {
          query = query.eq('hrms_sync_status', 'SYNCED');
        } else if (params.hrms === 'none') {
          query = query.or('hrms_sync_status.is.null,hrms_sync_status.eq.NOT_READY');
        }
      }

      // 10. Duplicate Filter
      if (params.duplicate && params.duplicate !== 'all') {
        if (params.duplicateAppIds && params.duplicateAppIds.length > 0) {
          query = query.in('id', params.duplicateAppIds);
        } else {
          // Force return empty if duplicate selected but no duplicates exist
          query = query.eq('id', '00000000-0000-0000-0000-000000000000');
        }
      }

      // Order by created_at desc
      query = query.order('created_at', { ascending: false });

      // Range selection
      const from = (params.page - 1) * params.limit;
      const to = from + params.limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error("Fetch Apps Paginated Error:", error);
        return { data: [], count: 0 };
      }

      const mappedData = (data || []).map((app: any) => {
        const {
          nickname, photoUrl, nationalId, passportNo, isThaiNational,
          prefix, firstName, lastName, departmentEn, positionEn, ...rest
        } = app;
        return {
          ...rest,
          form_data: {
            nickname,
            photoUrl,
            nationalId,
            passportNo,
            isThaiNational: isThaiNational === 'true' ? true : isThaiNational === 'false' ? false : isThaiNational,
            prefix,
            firstName,
            lastName,
            departmentEn,
            positionEn,
            businessUnit: rest.business_unit,
            sourceChannel: rest.source_channel,
            campaignTag: rest.campaign_tag
          }
        };
      });

      return { data: mappedData, count: count || 0 };
    } catch (error) {
      console.error("Fetch Apps Paginated Error:", error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Fetch only applications that have interview dates scheduled
   */
  getCalendarInterviews: async (): Promise<any[]> => {
    try {
      const sessionResult = await api.auth.verifySession();
      if (!sessionResult.success) return [];

      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            created_at,
            full_name,
            phone,
            position,
            department,
            status,
            assigned_to,
            assigned_user:users!applications_assigned_to_fkey(id, full_name, emp_id),
            business_unit,
            source_channel,
            campaign_tag,
            interview_date,
            interview_start_time,
            interview_end_time,
            teams_meeting_url,
            updated_at,
            nickname:form_data->>nickname,
            photoUrl:form_data->>photoUrl
          `)
          .not('interview_date', 'is', null)
          .order('interview_date', { ascending: true })
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error("Fetch Calendar Interviews Error:", error);
          break;
        }

        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        page++;
      }

      return allData.map((app: any) => {
        const { nickname, photoUrl, ...rest } = app;
        return {
          ...rest,
          form_data: {
            nickname,
            photoUrl,
            businessUnit: rest.business_unit,
            sourceChannel: rest.source_channel,
            campaignTag: rest.campaign_tag
          }
        };
      });
    } catch (error) {
      console.error("Fetch Calendar Interviews Error:", error);
      return [];
    }
  },

  /**
   * Fetch lightweight fields of all applications for charts/stats calculation
   */
  getApplicationsStats: async (): Promise<any[]> => {
    try {
      const sessionResult = await api.auth.verifySession();
      if (!sessionResult.success) return [];

      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;
      while (true) {
        const { data, error } = await supabase
          .from('applications')
          .select('id, created_at, status, business_unit, department, position, full_name, phone, nationalId:form_data->>nationalId, passportNo:form_data->>passportNo')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) {
          console.error("Fetch Stats Error:", error);
          break;
        }

        if (!data || data.length === 0) break;
        allData.push(...data);
        if (data.length < pageSize) break;
        page++;
      }
      return allData;
    } catch (error) {
      console.error("Fetch Stats Error:", error);
      return [];
    }
  },


  /**
   * Fetch a single application by ID with full details (including complete form_data)
   */
  getApplicationById: async (id: string): Promise<any | null> => {
    try {
      // Check for session validity before fetching
      const sessionResult = await api.auth.verifySession();
      if (!sessionResult.success) {
        console.warn("Session invalid");
        return null;
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*, assigned_user:users!applications_assigned_to_fkey(id, full_name, emp_id)')
        .eq('id', id)
        .single();

      if (error) {
        console.error("Fetch App By ID Error:", error);
        return null;
      }
      return data;
    } catch (error) {
      console.error("Fetch App By ID Error:", error);
      return null;
    }
  },

  /**
   * Update application status with optional comment
   */
  updateApplicationStatus: async (id: string, status: ApplicationStatus, options: WorkflowStatusOptions = {}): Promise<ApiResponse<any>> => {
    try {
      const validStatuses: ApplicationStatus[] = ['Pending', 'Reviewing', 'Interview', 'InterviewScheduled', 'Interviewed', 'Offer', 'Rejected', 'Hired', 'Withdrawn', 'NoShow'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: { message: 'Invalid status value.' } };
      }

      if (!options.performedByUserId) {
        return { success: false, error: { message: 'Current user is required for workflow updates.' } };
      }

      const { data, error } = await supabase.rpc('update_application_workflow_status', {
        p_app_id: id,
        p_status: status,
        p_performed_by_user_id: options.performedByUserId,
        p_note: options.comment || null,
        p_rejection_reason: options.rejectionReason || null,
        p_interview_date: options.interviewDate || null,
        p_interview_start_time: options.interviewStartTime || null,
        p_interview_end_time: options.interviewEndTime || null,
        p_teams_meeting_url: options.teamsMeetingUrl || null,
      });

      if (error) return handleError(error, 'updateApplicationStatus');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'updateApplicationStatus');
    }
  },

  updateApplicationDetails: async (
    id: string,
    update: Record<string, any>,
    changedFields: string[] = []
  ): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch('/api/application-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id, update, changedFields }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        return { success: false, error: { message: result.error || 'Application update failed' } };
      }
      return { success: true, data: result.data };
    } catch (error) {
      return handleError(error, 'updateApplicationDetails');
    }
  },

  /**
   * Delete application and associated files in storage
   */
  deleteApplication: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch('/api/application-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ id }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) {
        return { success: false, error: { message: result.error || 'Application delete failed' } };
      }
      return { success: true, data: result };
    } catch (error: any) {
      return handleError(error, 'deleteApplication');
    }
  },

  // ============================================================
  // Application Assignment Services
  // ============================================================

  /**
   * Claim an application (self-assign)
   */
  claimApplication: async (appId: string, userId: string): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase.rpc('claim_application', {
        p_app_id: appId,
        p_user_id: userId,
      });

      if (error) return handleError(error, 'claimApplication');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'claimApplication');
    }
  },

  /**
   * Unassign an application
   */
  unassignApplication: async (appId: string, performedByUserId: string): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase.rpc('unassign_application', {
        p_app_id: appId,
        p_performed_by_user_id: performedByUserId,
      });

      if (error) return handleError(error, 'unassignApplication');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'unassignApplication');
    }
  },

  /**
   * Transfer an application to another recruiter (admin only)
   */
  transferApplication: async (appId: string, newUserId: string, performedByUserId: string): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase.rpc('transfer_application', {
        p_app_id: appId,
        p_new_user_id: newUserId,
        p_performed_by_user_id: performedByUserId,
      });

      if (error) return handleError(error, 'transferApplication');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'transferApplication');
    }
  },

  // ============================================================
  // Application Activity Log Services
  // ============================================================

  /**
   * Add a log entry for an application
   */
  addApplicationLog: async (log: {
    application_id: string;
    action: string;
    old_value?: string | null;
    new_value?: string | null;
    note?: string | null;
    performed_by: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const payload = {
        application_id: log.application_id,
        action: log.action,
        old_value: log.old_value || null,
        new_value: log.new_value || null,
        note: log.note || null,
        performed_by: log.performed_by,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('application_logs')
        .insert([payload])
        .select()
        .single();

      if (error) {
        console.error('[Log Error]:', error);
        // Fallback to anonymous log if policy fails (might be useful for some cases)
        return handleError(error, 'addApplicationLog');
      }
      return { success: true, data };
    } catch (error) {
      console.error('[Log Error]:', error);
      return handleError(error, 'addApplicationLog');
    }
  },

  /**
   * Get all logs for an application (admin/recruiter view — full detail)
   */
  getApplicationLogs: async (appId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('application_logs')
        .select('*')
        .eq('application_id', appId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch App Logs Error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Fetch App Logs Error:', error);
      return [];
    }
  },

  /**
   * Get public-safe timeline for tracking (only status-related events, no recruiter names)
   */
  getApplicationTimeline: async (appId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('application_logs')
        .select('id, action, new_value, created_at')
        .eq('application_id', appId)
        .in('action', ['submitted', 'status_change'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Fetch Timeline Error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Fetch Timeline Error:', error);
      return [];
    }
  },

  // ============================================================
  // QR Log Services
  // ============================================================

  /**
   * Log a QR code generation
   */
  logQrGeneration: async (logData: {
    business_unit?: string;
    channel?: string;
    campaign_tag?: string;
    generated_url: string;
    created_by: string;
  }): Promise<ApiResponse<any>> => {
    try {
      const { data, error } = await supabase
        .from('qr_logs')
        .insert([{
          business_unit: logData.business_unit || null,
          channel: logData.channel || null,
          campaign_tag: logData.campaign_tag || null,
          generated_url: logData.generated_url,
          created_by: logData.created_by,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) return handleError(error, 'logQrGeneration');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'logQrGeneration');
    }
  },

  /**
   * Get recent QR generation logs with pagination and optional creator filter
   */
  getQrLogs: async (page: number = 1, limit: number = 30, createdBy: string = 'all'): Promise<{ data: any[]; count: number }> => {
    try {
      let query = supabase
        .from('qr_logs')
        .select('*', { count: 'exact' });

      if (createdBy && createdBy !== 'all') {
        query = query.eq('created_by', createdBy);
      }

      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      if (error) {
        console.error('Fetch QR Logs Error:', error);
        return { data: [], count: 0 };
      }
      return { data: data || [], count: count || 0 };
    } catch (error) {
      console.error('Fetch QR Logs Error:', error);
      return { data: [], count: 0 };
    }
  },

  /**
   * Get unique creator strings from QR logs
   */
  getQrLogCreators: async (): Promise<string[]> => {
    try {
      const { data, error } = await supabase
        .from('qr_logs')
        .select('created_by');

      if (error) {
        console.error('Fetch QR Log Creators Error:', error);
        return [];
      }
      return Array.from(new Set(data?.map((d: any) => d.created_by).filter(Boolean) || []));
    } catch (error) {
      console.error('Fetch QR Log Creators Error:', error);
      return [];
    }
  },

  // ============================================================
  // Share Link Services
  // ============================================================

  /**
   * Generate (or reuse existing) a 7-day share token for an application
   */
  generateShareToken: async (applicationId: string, createdBy: string): Promise<ApiResponse<{ token: string; url: string; expires_at: string }>> => {
    try {
      void createdBy;
      const response = await fetch('/api/share-tokens', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-share', applicationId }),
      });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'สร้างลิงก์ไม่สำเร็จ' } };
    } catch (error) {
      return handleError(error, 'generateShareToken');
    }
  },

  /**
   * Fetch existing active share token without creating a new one
   */
  getExistingShareToken: async (applicationId: string): Promise<ApiResponse<{ token: string; url: string; expires_at: string } | null>> => {
    try {
      const response = await fetch(`/api/share-tokens?applicationId=${encodeURIComponent(applicationId)}&type=share`, { credentials: 'same-origin' });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'โหลดลิงก์ไม่สำเร็จ' } };
    } catch (error) {
      return handleError(error, 'getExistingShareToken');
    }
  },
  /**
   * Fetch application data via a share token (public endpoint)
   */
  getApplicationByShareToken: async (token: string): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`/api/share-tokens?token=${encodeURIComponent(token)}`, { credentials: 'same-origin' });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' } };
    } catch (error) {
      return handleError(error, 'getApplicationByShareToken');
    }
  },

  /**
   * Revoke a share token
   */
  revokeShareToken: async (token: string): Promise<ApiResponse<void>> => {
    try {
      const response = await fetch('/api/share-tokens', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'revoke', token }),
      });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'ยกเลิกลิงก์ไม่สำเร็จ' } };
    } catch (error) {
      return handleError(error, 'revokeShareToken');
    }
  },

  // ============================================================
  // Resubmit Token Services (Applicant Self-Service)
  // ============================================================

  /**
   * HR: Generate a 7-day resubmit token for an application.
   * PIN hash is computed here on the client using SubtleCrypto before inserting to DB
   * so that raw PIN values (last4 ID + last4 phone) never leave the browser unencrypted.
   */
  generateResubmitToken: async (
    applicationId: string,
    allowedFields: string[],
    createdBy: string
  ): Promise<ApiResponse<{ token: string; url: string; expires_at: string }>> => {
    try {
      void createdBy;
      const response = await fetch('/api/share-tokens', {
        method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-resubmit', applicationId, allowedFields }),
      });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'สร้างลิงก์อัปโหลดใหม่ไม่สำเร็จ' } };
    } catch (error) {
      return handleError(error, 'generateResubmitToken');
    }
  },

  /**
   * HR: Get existing active (unused, non-expired) resubmit token for an application.
   */
  getExistingResubmitToken: async (
    applicationId: string
  ): Promise<ApiResponse<{ token: string; url: string; expires_at: string; allowed_fields: string[] } | null>> => {
    try {
      const response = await fetch(`/api/share-tokens?applicationId=${encodeURIComponent(applicationId)}&type=resubmit`, { credentials: 'same-origin' });
      const result = await response.json();
      return response.ok ? result : { success: false, error: { message: result.error || 'โหลดลิงก์อัปโหลดใหม่ไม่สำเร็จ' } };
    } catch (error) {
      return handleError(error, 'getExistingResubmitToken');
    }
  },

  // ============================================================
  // Authentication Services (Secure Version)
  // ============================================================
  auth: {
    /**
     * Verify if the local session user still exists and is active in the database
     */
    verifySession: async (): Promise<ApiResponse<AuthUser>> => {
      try {
        const response = await fetch('/api/session', { credentials: 'same-origin' });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.user) {
          return { success: false, error: { message: 'Session expired or user inactive' } };
        }
        return { success: true, data: result.user };
      } catch (err) {
        return { success: false, error: { message: 'Session verification failed' } };
      }
    },

    /**
     * Sign in via HRMS IDMS endpoint
     */
    signIn: async (username: string, password: string): Promise<{ user: AuthUser | null; error: any, needsRegistration?: boolean, empId?: string }> => {
      try {
        if (!username || !password) {
          return { user: null, error: { message: 'Username and password are required.' } };
        }

        const normalizedUsername = username.trim();

        // Hash password with MD5
        let passwordMd5: string;
        try {
          passwordMd5 = md5(password);
        } catch (hashErr) {
          console.error('MD5 hashing failed:', hashErr);
          return { user: null, error: { message: 'Internal error: password hashing failed.' } };
        }

        // 1. Call IDMS API via server-side proxy (avoids CORS issues)
        let response: Response;
        try {
          response = await fetch('/api/idms-auth', {
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({ account: normalizedUsername, password: passwordMd5 }),
          });
        } catch (fetchErr: any) {
          console.error('IDMS proxy fetch failed:', fetchErr);
          return { user: null, error: { message: `ไม่สามารถเชื่อมต่อระบบ IDMS ได้: ${fetchErr.message || 'Network error'}` } };
        }
        
        let data: any;
        try {
          const textBody = await response.text();
          data = JSON.parse(textBody);
        } catch (parseErr) {
          console.error('IDMS response parse failed:', parseErr);
          return { user: null, error: { message: 'ระบบ IDMS ตอบกลับข้อมูลผิดรูปแบบ กรุณาลองใหม่' } };
        }

        if (!response.ok || !data || data.Result !== 'OK') {
          return { user: null, error: { message: getIdmsErrorMessage(response.ok, response.status, data) } };
        }

        const empId = data.EmpId;
        const activation = await fetch('/api/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({}),
        });
        const activationResult = await activation.json().catch(() => ({}));
        if (activation.status === 404 && activationResult.needsRegistration) {
          return { user: null, error: { message: 'Not registered' }, needsRegistration: true, empId };
        }
        if (!activation.ok || !activationResult.user) {
          return { user: null, error: { message: activationResult.error || 'Account is pending approval. Please contact the administrator.' } };
        }
        return { user: activationResult.user, error: null };
      } catch (error: any) {
        console.error('Login error:', error);
        return { user: null, error: { message: `Login failed: ${error.message || 'Unknown error'}` } };
      }
    },

    /**
     * Register new staff user (Complete Profile for IDMS)
     */
    registerHrmsUser: async (userData: { email: string; full_name: string; phone?: string; role?: string; emp_id: string; hrms_username: string }): Promise<ApiResponse<AuthUser>> => {
      try {
        if (!userData.email || !userData.full_name) {
          return { success: false, error: { message: 'All fields are required.' } };
        }
        const response = await fetch('/api/register-hrms-user', {
          method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: userData.email, full_name: userData.full_name, phone: userData.phone || '' }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'Registration failed' } };
      } catch (error) {
        return handleError(error, 'registerHrmsUser');
      }
    },

    /**
     * Re-sync user info from Worklog-NewGen API (Admin trigger)
     */
    syncUserWorklogDetails: async (userId: string, empId: string): Promise<ApiResponse<AuthUser>> => {
      try {
        let orgDetails: any = null;

        try {
          const res = await fetch(`/api/worklog-emp-info?emp_id=${encodeURIComponent(empId)}`);
          if (res.ok) {
            const resData = await res.json();
            if (resData.success) {
              orgDetails = {
                full_name: resData.full_name,
                name_th: resData.name_th,
                name_en: resData.name_en,
                position_name: resData.position_name,
                department_name: resData.department_name,
                company_name: resData.company_name,
                is_hr_team: resData.is_hr_team
              };
            }
          }
        } catch (fetchErr) {
          console.warn('Worklog resync fetch warning:', fetchErr);
        }

        if (!orgDetails) {
          return { success: false, error: { message: 'Unable to verify current employee organization from HRMS/Worklog.' } };
        }

        const nowIso = new Date().toISOString();
        const updatePayload: any = {
          position_name: orgDetails.position_name,
          department_name: orgDetails.department_name,
          company_name: orgDetails.company_name,
          is_hr_team: orgDetails.is_hr_team,
          last_synced_at: nowIso
        };

        if (orgDetails.full_name) updatePayload.full_name = orgDetails.full_name;
        if (orgDetails.name_th) updatePayload.name_th = orgDetails.name_th;
        if (orgDetails.name_en) updatePayload.name_en = orgDetails.name_en;

        const { data: updated, error } = await supabase
          .from('users')
          .update(updatePayload)
          .eq('id', userId)
          .select()
          .single();

        if (error) return handleError(error, 'syncUserWorklogDetails');
        return { success: true, data: updated };
      } catch (err) {
        return handleError(err, 'syncUserWorklogDetails');
      }
    },

    /**
     * Touch user active timestamp when user is actively using the app (Heartbeat / Session Touch)
     */
    touchUserActivity: async (userId: string): Promise<void> => {
      try {
        if (!userId) return;
        const nowIso = new Date().toISOString();
        await supabase
          .from('users')
          .update({ last_active_at: nowIso })
          .eq('id', userId);
      } catch (err) {
        console.warn('Failed to update user last active timestamp:', err);
      }
    },

    /**
     * Get pending users for admin approval
     */
    getPendingUsers: async (): Promise<{ data: AuthUser[] | null; error: any }> => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .in('status', ['Pending', 'Inactive'])
          .order('created_at', { ascending: false });

        return { data: data || [], error };
      } catch (error) {
        return { data: null, error };
      }
    },

    /**
     * Update user status (Admin only)
     * Uses the admin_update_user_status RPC (SECURITY DEFINER) to bypass
     * the protect_user_roles trigger. Passes caller_user_id explicitly
     * because this system uses custom HRMS auth — auth.uid() is always null.
     */
    updateUserStatus: async (
      id: string, 
      status: 'Active' | 'Rejected' | 'Inactive',
      overrideOptions?: { allow_non_hr_access?: boolean; approved_department_name?: string; approved_position_name?: string }
    ): Promise<ApiResponse<AuthUser>> => {
      try {
        const sessionResult = await api.auth.verifySession();
        const callerUserId = sessionResult.data?.id;
        if (!callerUserId) {
          return { success: false, error: { message: 'Invalid session. Please log in again.' } };
        }

        const { data: rpcData, error: rpcError } = await supabase
          .rpc('admin_update_user_status', {
            target_user_id: id,
            new_status: status,
            caller_user_id: callerUserId,
            p_allow_non_hr_access: overrideOptions?.allow_non_hr_access ?? null,
            p_approved_dept: overrideOptions?.approved_department_name ?? null,
            p_approved_pos: overrideOptions?.approved_position_name ?? null
          });

        if (rpcError) return handleError(rpcError, 'updateUserStatus');

        const result = rpcData as { success: boolean; error?: string };
        if (!result.success) {
          return { success: false, error: { message: result.error || 'Failed to update user status' } };
        }

        // Fetch the updated user to return to the caller
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (error) return handleError(error, 'updateUserStatus');
        return { success: true, data };
      } catch (error) {
        return handleError(error, 'updateUserStatus');
      }
    },

    /**
     * Get all active users
     */
    getActiveUsers: async (): Promise<{ data: AuthUser[] | null; error: any }> => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('status', 'Active')
          .order('created_at', { ascending: false });

        return { data: data || [], error };
      } catch (error) {
        return { data: null, error };
      }
    },

    /**
     * Sign out current user
     */
    signOut: async (): Promise<void> => {
      await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' });
    },

    /**
     * Get current session
     */
    getSession: async () => {
      const result = await api.auth.verifySession();
      return result.success ? result.data : null;
    },

    /**
     * Subscribe to auth state changes
     */
    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      return supabase.auth.onAuthStateChange(callback);
    }
  },

  // ============================================================
  // Master Data Services
  // ============================================================
  master: {
    // Cache for master data
    _cache: new Map<string, { data: any; timestamp: number }>(),
    _cacheTimeout: 5 * 60 * 1000, // 5 minutes

    /**
     * Get data with caching
     */
    _getCached: async function <T>(key: string, fetcher: () => Promise<T>): Promise<T> {
      const cached = this._cache.get(key);
      if (cached && Date.now() - cached.timestamp < this._cacheTimeout) {
        return cached.data as T;
      }
      const data = await fetcher();
      this._cache.set(key, { data, timestamp: Date.now() });
      return data;
    },

    /**
     * Clear cache
     */
    clearCache: function () {
      this._cache.clear();
    },

    // --- Public Fetchers (Active Only) ---
    getDepartments: async function () {
      return this._getCached('departments', async () => {
        const { data } = await supabase.from('departments').select('*').eq('is_active', true).order('name_en');
        return data || [];
      });
    },

    getPositions: async (departmentId: number) => {
      const { data } = await supabase.from('positions').select('*, work_locations(*)').eq('department_id', departmentId).eq('is_active', true).order('name_en');
      return data || [];
    },

    getAllPositions: async function (activeOnly = true) {
      return this._getCached(`all_positions_${activeOnly}`, async () => {
        let query = supabase.from('positions').select('*, departments(id, name_th, name_en), work_locations(*)').order('name_th');
        if (activeOnly) query = query.eq('is_active', true);
        const { data } = await query;
        return (data || []) as MasterPosition[];
      });
    },

    getWorkLocations: async function (activeOnly = true) {
      return this._getCached(`work_locations_${activeOnly}`, async () => {
        let query = supabase.from('work_locations').select('*').order('id');
        if (activeOnly) query = query.eq('is_active', true);
        const { data } = await query;
        return (data || []) as WorkLocation[];
      });
    },

    getBusinessUnits: async function () {
      return this._getCached('business_units', async () => {
        const { data } = await supabase.from('business_units').select('*').eq('is_active', true).order('name');
        return data || [];
      });
    },

    getChannels: async function () {
      return this._getCached('channels', async () => {
        const { data } = await supabase.from('channels').select('*').eq('is_active', true).order('name');
        return data || [];
      });
    },

    getUniversities: async function () {
      return this._getCached('universities', async () => {
        const { data } = await supabase.from('universities').select('*').eq('is_active', true).order('name');
        return data || [];
      });
    },

    getColleges: async function () {
      return this._getCached('colleges', async () => {
        const { data } = await supabase.from('colleges').select('*').eq('is_active', true).order('name');
        return data || [];
      });
    },

    getFaculties: async function () {
      return this._getCached('faculties', async () => {
        const { data } = await supabase.from('faculties').select('*').eq('is_active', true).order('name');
        return data || [];
      });
    },

    getProvinces: async function () {
      return this._getCached('provinces', async () => {
        const { data } = await supabase.from('provinces').select('*').eq('is_active', true).order('name_th');
        return data || [];
      });
    },

    getAllDistricts: async function () {
      return this._getCached('all_districts', async () => {
        const { data } = await supabase.from('districts').select('*').order('name_th');
        return data || [];
      });
    },

    getAllSubdistricts: async function () {
      return this._getCached('all_subdistricts', async () => {
        // Fetch all subdistricts using pagination to bypass 1000 row limit
        let allData: any[] = [];
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
          const { data } = await supabase
            .from('subdistricts')
            .select('*')
            .range(offset, offset + limit - 1)
            .order('name_th');

          if (data && data.length > 0) {
            allData = [...allData, ...data];
            offset += limit;
            hasMore = data.length === limit;
          } else {
            hasMore = false;
          }
        }

        console.log('Fetched total subdistricts:', allData.length);
        return allData;
      });
    },

    getDistricts: async (provinceId: number) => {
      const { data } = await supabase.from('districts').select('*').eq('province_id', provinceId).order('name_th');
      return data || [];
    },

    getSubdistricts: async (districtId: number) => {
      const { data } = await supabase.from('subdistricts').select('*').eq('district_id', districtId).order('name_th');
      return data || [];
    },

    // --- Admin Management (CRUD) ---
    getAll: async (table: string): Promise<ApiResponse<any[]>> => {
      try {
        const { data, error } = await supabase.from(table).select('*').order('id');
        if (error) return handleError(error, `getAll:${table}`);
        return { success: true, data: data || [] };
      } catch (error) {
        return handleError(error, `getAll:${table}`);
      }
    },

    addItem: async (table: string, payload: any): Promise<ApiResponse<any>> => {
      try {
        const { data, error } = await supabase.from(table).insert([payload]).select().single();
        if (error) return handleError(error, `addItem:${table}`);
        api.master.clearCache();
        return { success: true, data };
      } catch (error) {
        return handleError(error, `addItem:${table}`);
      }
    },

    updateItem: async (table: string, id: number, payload: any): Promise<ApiResponse<any>> => {
      try {
        const { data, error } = await supabase.from(table).update(payload).eq('id', id).select().single();
        if (error) return handleError(error, `updateItem:${table}`);
        api.master.clearCache();
        return { success: true, data };
      } catch (error) {
        return handleError(error, `updateItem:${table}`);
      }
    },

    toggleItem: async (table: string, id: number, isActive: boolean): Promise<ApiResponse<any>> => {
      try {
        const { data, error } = await supabase.from(table).update({ is_active: isActive }).eq('id', id).select().single();
        if (error) return handleError(error, `toggleItem:${table}`);
        api.master.clearCache();
        return { success: true, data };
      } catch (error) {
        return handleError(error, `toggleItem:${table}`);
      }
    },

    toggleActive: async (table: string, id: number, currentState: boolean): Promise<ApiResponse<any>> => {
      return api.master.toggleItem(table, id, !currentState);
    }
  },

  // ------------------------------------------------------------------
  // Blacklist API
  // ------------------------------------------------------------------
  blacklist: {
    getEntries: async (): Promise<ApiResponse<BlacklistEntry[]>> => {
      try {
        const response = await fetch('/api/blacklist?action=entries');
        const result = await response.json();
        return response.ok ? result : handleError(result, 'blacklist.getEntries');
      } catch (error) {
        return handleError(error, 'blacklist.getEntries');
      }
    },

    addEntry: async (entry: Omit<BlacklistEntry, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<BlacklistEntry>> => {
      try {
        const response = await fetch('/api/blacklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'add', entry }) });
        const result = await response.json();
        return response.ok ? result : handleError(result, 'blacklist.addEntry');
      } catch (error) {
        return handleError(error, 'blacklist.addEntry');
      }
    },

    updateEntry: async (id: string, entry: Partial<BlacklistEntry>): Promise<ApiResponse<BlacklistEntry>> => {
      try {
        const response = await fetch('/api/blacklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update', id, entry }) });
        const result = await response.json();
        return response.ok ? result : handleError(result, 'blacklist.updateEntry');
      } catch (error) {
        return handleError(error, 'blacklist.updateEntry');
      }
    },

    deleteEntry: async (id: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/blacklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
        const result = await response.json();
        return response.ok ? result : handleError(result, 'blacklist.deleteEntry');
      } catch (error) {
        return handleError(error, 'blacklist.deleteEntry');
      }
    },

    getAuditLogs: async (): Promise<ApiResponse<BlacklistAuditLog[]>> => {
      try {
        const response = await fetch('/api/blacklist?action=audit');
        const result = await response.json();
        return response.ok ? result : handleError(result, 'blacklist.getAuditLogs');
      } catch (error) {
        return handleError(error, 'blacklist.getAuditLogs');
      }
    },

    addAuditLog: async (log: Omit<BlacklistAuditLog, 'id' | 'created_at'>): Promise<ApiResponse<BlacklistAuditLog>> => {
      try {
        const response = await fetch('/api/blacklist', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'addAudit', log }) });
        const result = await response.json();
        return response.ok ? result : handleError(result, 'blacklist.addAuditLog');
      } catch (error) {
        return handleError(error, 'blacklist.addAuditLog');
      }
    },

    checkMatches: async (candidate: {
      nationalId?: string;
      passportNo?: string;
    }): Promise<BlacklistEntry[]> => {
      try {
        const result = await api.blacklist.getEntries();
        const data = result.success && result.data ? result.data.filter(entry => entry.status === 'active') : [];

        const matches: BlacklistEntry[] = [];

        for (const entry of data) {
          let matched = false;

          if (entry.national_id && candidate.nationalId && entry.national_id.trim() === candidate.nationalId.trim()) {
            matched = true;
          } else if (entry.passport_no && candidate.passportNo && entry.passport_no.trim().toUpperCase() === candidate.passportNo.trim().toUpperCase()) {
            matched = true;
          }

          if (matched) {
            matches.push(entry);
          }
        }

        return matches;
      } catch (error) {
        console.error('Error checking blacklist matches:', error);
        return [];
      }
    }
  },

  // ------------------------------------------------------------------
  // Reports API
  // ------------------------------------------------------------------
  reports: {
    getExecutiveSummary: async (): Promise<any[]> => {
      try {
        const { data, error } = await supabase.from('report_executive_summary').select('*');
        if (error) { console.error(error); return []; }
        return data || [];
      } catch (e) { console.error(e); return []; }
    },
    getRecruiterKpi: async (): Promise<any[]> => {
      try {
        const { data, error } = await supabase.from('report_recruiter_kpi').select('*');
        if (error) { console.error(error); return []; }
        return data || [];
      } catch (e) { console.error(e); return []; }
    },
    getRejectionReasons: async (): Promise<any[]> => {
      try {
        const { data, error } = await supabase.from('report_rejection_reasons').select('*');
        if (error) { console.error(error); return []; }
        return data || [];
      } catch (e) { console.error(e); return []; }
    },
    getCloseReasons: async (): Promise<any[]> => {
      try {
        const { data, error } = await supabase
          .from('rejection_reasons')
          .select('*')
          .eq('is_active', true)
          .order('sort_order');
        if (error) { console.error(error); return []; }
        return data || [];
      } catch (e) { console.error(e); return []; }
    }
  },

  // ============================================================
  // Candidate Evaluation Templates / Panel Review Services
  // ============================================================
  evaluationTemplates: {
    list: async (activeOnly = false): Promise<ApiResponse<EvaluationTemplate[]>> => {
      try {
        const response = await fetch(`/api/evaluation-templates${activeOnly ? '?activeOnly=true' : ''}`, { credentials: 'same-origin' });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'โหลดแบบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'evaluationTemplates.list');
      }
    },

    get: async (id: string): Promise<ApiResponse<EvaluationTemplate>> => {
      try {
        const response = await fetch(`/api/evaluation-templates?id=${encodeURIComponent(id)}`, { credentials: 'same-origin' });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'โหลดแบบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'evaluationTemplates.get');
      }
    },

    save: async (template: EvaluationTemplate): Promise<ApiResponse<EvaluationTemplate>> => {
      try {
        const response = await fetch('/api/evaluation-templates', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'save', template }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'บันทึกแบบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'evaluationTemplates.save');
      }
    },

    duplicate: async (id: string): Promise<ApiResponse<EvaluationTemplate>> => {
      try {
        const response = await fetch('/api/evaluation-templates', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'duplicate', id }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'คัดลอกแบบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'evaluationTemplates.duplicate');
      }
    },

    delete: async (id: string): Promise<ApiResponse<void>> => {
      try {
        const response = await fetch('/api/evaluation-templates', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'ลบแบบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'evaluationTemplates.delete');
      }
    },
  },

  candidateEvaluations: {
    getBundle: async (applicationId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch(`/api/candidate-evaluations?applicationId=${encodeURIComponent(applicationId)}`, { credentials: 'same-origin' });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'โหลดข้อมูลประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.getBundle');
      }
    },

    searchEmployee: async (query: string): Promise<ApiResponse<EvaluationReviewerProfile[]>> => {
      try {
        const response = await fetch(`/api/candidate-evaluations?action=search-employee&query=${encodeURIComponent(query)}`, { credentials: 'same-origin' });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'ค้นหากรรมการไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.searchEmployee');
      }
    },

    createSession: async (applicationId: string, templateId: string, expiresAt?: string | null): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/candidate-evaluations', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'create-session', applicationId, templateId, expiresAt }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'สร้างรอบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.createSession');
      }
    },

    activate: async (applicationId: string, sessionId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/candidate-evaluations', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'activate', applicationId, sessionId }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'เปิดการประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.activate');
      }
    },

    close: async (applicationId: string, sessionId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/candidate-evaluations', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'close', applicationId, sessionId }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'ปิดการประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.close');
      }
    },

    addReviewer: async (applicationId: string, sessionId: string, profile: EvaluationReviewerProfile): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/candidate-evaluations', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add-reviewer', applicationId, sessionId, empId: profile.emp_id, profile }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'เพิ่มกรรมการไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.addReviewer');
      }
    },

    removeReviewer: async (applicationId: string, reviewerId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/candidate-evaluations', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'remove-reviewer', applicationId, reviewerId }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'ลบกรรมการไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.removeReviewer');
      }
    },

    getPublic: async (shareToken: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch(`/api/candidate-evaluations?shareToken=${encodeURIComponent(shareToken)}`, { credentials: 'same-origin' });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'โหลดแบบประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.getPublic');
      }
    },

    submitPublic: async (payload: Record<string, unknown>): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api/candidate-evaluations', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'submit-public', ...payload }),
        });
        const result = await response.json();
        return response.ok ? result : { success: false, error: { message: result.error || 'ส่งผลประเมินไม่สำเร็จ' } };
      } catch (error) {
        return handleError(error, 'candidateEvaluations.submitPublic');
      }
    },
  },

  // ============================================================
  // Legacy Interview Evaluation / Scorecard Services
  // ============================================================
  evaluations: {
    getByApplicationId: async (appId: string): Promise<any[]> => {
      try {
        const { data, error } = await supabase
          .from('interview_evaluations')
          .select(`
            *,
            interviewer:users!interview_evaluations_interviewer_id_fkey(id, full_name, emp_id)
          `)
          .eq('application_id', appId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error("Fetch Evaluations Error:", error);
          return [];
        }
        return data || [];
      } catch (error) {
        console.error("Fetch Evaluations Error:", error);
        return [];
      }
    },

    submit: async (payload: {
      application_id: string;
      interviewer_id: string;
      interview_round?: number;
      rating_skills: number;
      rating_attitude: number;
      rating_cultural_fit: number;
      overall_recommendation: string;
      comments?: string;
    }): Promise<ApiResponse<any>> => {
      try {
        const { data, error } = await supabase
          .from('interview_evaluations')
          .insert([payload])
          .select()
          .single();

        if (error) return handleError(error, 'submitEvaluation');
        return { success: true, data };
      } catch (error) {
        return handleError(error, 'submitEvaluation');
      }
    }
  },

  // ============================================================
  // System Activity Logs Services
  // ============================================================
  systemLogs: {
    addLog: async (log: {
      user_id?: string;
      user_name: string;
      user_role?: string;
      action: string;
      target_id?: string;
      target_name?: string;
      metadata?: any;
    }): Promise<ApiResponse<any>> => {
      try {
        const { error } = await supabase
          .from('system_activity_logs')
          .insert([log]);
        if (error) return handleError(error, 'systemLogs.addLog');
        return { success: true };
      } catch (error) {
        return handleError(error, 'systemLogs.addLog');
      }
    },

    getLogs: async (params: {
      page?: number;
      limit?: number;
      userFilter?: string;
      actionFilter?: string;
      startDate?: string;
      endDate?: string;
    }): Promise<ApiResponse<{ logs: any[]; count: number }>> => {
      try {
        const page = params.page || 1;
        const limit = params.limit || 30;
        const from = (page - 1) * limit;
        const to = from + limit - 1;

        let query = supabase
          .from('system_activity_logs')
          .select('*', { count: 'exact' });

        if (params.userFilter) {
          query = query.ilike('user_name', `%${params.userFilter}%`);
        }
        if (params.actionFilter && params.actionFilter !== 'all') {
          query = query.eq('action', params.actionFilter);
        }
        if (params.startDate) {
          query = query.gte('created_at', params.startDate);
        }
        if (params.endDate) {
          query = query.lte('created_at', params.endDate);
        }

        const { data, error, count } = await query
          .order('created_at', { ascending: false })
          .range(from, to);

        if (error) return handleError(error, 'systemLogs.getLogs');
        return { success: true, data: { logs: data || [], count: count || 0 } };
      } catch (error) {
        return handleError(error, 'systemLogs.getLogs');
      }
    },

    getUserLogs: async (userId?: string, userName?: string, limit: number = 50): Promise<ApiResponse<any[]>> => {
      try {
        let query = supabase
          .from('system_activity_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (userId && userName) {
          query = query.or(`user_id.eq.${userId},user_name.ilike.%${userName}%`);
        } else if (userId) {
          query = query.eq('user_id', userId);
        } else if (userName) {
          query = query.ilike('user_name', `%${userName}%`);
        }

        const { data, error } = await query;
        if (error) return handleError(error, 'systemLogs.getUserLogs');
        return { success: true, data: data || [] };
      } catch (error) {
        return handleError(error, 'systemLogs.getUserLogs');
      }
    },

    getStorageStats: async (): Promise<ApiResponse<{
      system_activity_logs: number;
      system_api_key_logs: number;
      application_logs: number;
      qr_logs: number;
      total_log_rows: number;
      checked_at: string;
    }>> => {
      try {
        const res = await fetch('/api?route=clean-logs', {
          method: 'GET',
          credentials: 'same-origin',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to fetch log statistics' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return handleError(error, 'systemLogs.getStorageStats');
      }
    },

    cleanupOldLogs: async (params?: {
      apiKeyDays?: number;
      activityDays?: number;
      appLogDays?: number;
      qrDays?: number;
    }): Promise<ApiResponse<{
      deleted_api_key_logs: number;
      deleted_activity_logs: number;
      deleted_application_logs: number;
      deleted_qr_logs: number;
      total_deleted: number;
      retention_applied: any;
      cleaned_at: string;
    }>> => {
      try {
        const res = await fetch('/api?route=clean-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify(params || {}),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to execute log cleanup' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return handleError(error, 'systemLogs.cleanupOldLogs');
      }
    }
  },

  // HRMS / IDMS Integration
  hrms: {
    getQueue: async (): Promise<ApiResponse<any[]>> => {
      try {
        const { data, error } = await supabase
          .from('applications')
          .select(`
            id,
            created_at,
            full_name,
            phone,
            position,
            department,
            status,
            business_unit,
            source_channel,
            campaign_tag,
            hrms_sync_status,
            hrms_ready_at,
            hrms_ready_by,
            hrms_synced_at,
            hrms_employee_id,
            hrms_sync_notes,
            national_id,
            form_data
          `)
          .in('hrms_sync_status', ['READY_TO_SYNC', 'SYNCED', 'FAILED'])
          .order('hrms_ready_at', { ascending: false, nullsFirst: false });

        if (error) return handleError(error, 'hrms.getQueue');
        return { success: true, data: data || [] };
      } catch (error: any) {
        return handleError(error, 'hrms.getQueue');
      }
    },

    markReadyToSync: async (applicationId: string, readyByEmail: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api?route=hrms-ack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            application_id: applicationId,
            sync_status: 'READY_TO_SYNC',
            ready_by: readyByEmail,
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          return { success: false, error: { message: result.error || 'Failed to update HRMS sync status' } };
        }
        return { success: true, data: result.data };
      } catch (error: any) {
        return handleError(error, 'hrms.markReadyToSync');
      }
    },

    cancelReadyToSync: async (applicationId: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api?route=hrms-ack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            application_id: applicationId,
            sync_status: 'NOT_READY',
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          return { success: false, error: { message: result.error || 'Failed to cancel HRMS sync status' } };
        }
        return { success: true, data: result.data };
      } catch (error: any) {
        return handleError(error, 'hrms.cancelReadyToSync');
      }
    },

    simulateAck: async (applicationId: string, employeeId: string, notes?: string): Promise<ApiResponse<any>> => {
      try {
        const response = await fetch('/api?route=hrms-ack', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            application_id: applicationId,
            hrms_employee_id: employeeId,
            sync_status: 'SYNCED',
            notes: notes || 'Simulated ACK from HRBP Dashboard Sandbox',
          }),
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          return { success: false, error: { message: result.error || 'Failed to send HRMS ACK' } };
        }
        return { success: true, data: result.data };
      } catch (error: any) {
        return handleError(error, 'hrms.simulateAck');
      }
    },

    previewExport: async (applicationId: string): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch(`/api?route=hrms-export&application_id=${encodeURIComponent(applicationId)}`, {
          credentials: 'same-origin',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to fetch HRMS preview' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return { success: false, error: { message: error.message || 'Failed to fetch HRMS preview' } };
      }
    }
  },

  // Dynamic API Keys Management
  apiKeys: {
    list: async (): Promise<ApiResponse<any[]>> => {
      try {
        const res = await fetch('/api?route=api-keys', {
          method: 'GET',
          credentials: 'same-origin',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to fetch API keys' } };
        }
        return { success: true, data: json.data || [] };
      } catch (error: any) {
        return handleError(error, 'apiKeys.list');
      }
    },

    generate: async (name: string, notes?: string): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch('/api?route=api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ action: 'generate', name, notes }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to generate API key' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return handleError(error, 'apiKeys.generate');
      }
    },

    toggle: async (id: string, isActive: boolean): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch('/api?route=api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ action: 'toggle', id, is_active: isActive }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to toggle API key' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return handleError(error, 'apiKeys.toggle');
      }
    },

    delete: async (id: string): Promise<ApiResponse<any>> => {
      try {
        const res = await fetch('/api?route=api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ action: 'delete', id }),
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to delete API key' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return handleError(error, 'apiKeys.delete');
      }
    },

    getLogs: async (params?: {
      keyId?: string;
      status?: string;
      page?: number;
      limit?: number;
    }): Promise<ApiResponse<{
      logs: any[];
      total_count: number;
      stats: {
        total_7d: number;
        total_24h: number;
        success_count: number;
        error_count: number;
        success_rate: number;
        avg_latency_ms: number;
      };
    }>> => {
      try {
        const query = new URLSearchParams();
        query.set('action', 'logs');
        if (params?.keyId) query.set('key_id', params.keyId);
        if (params?.status) query.set('status', params.status);
        if (params?.page) query.set('page', String(params.page));
        if (params?.limit) query.set('limit', String(params.limit));

        const res = await fetch(`/api?route=api-keys&${query.toString()}`, {
          method: 'GET',
          credentials: 'same-origin',
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || !json.success) {
          return { success: false, error: { message: json.error || 'Failed to fetch API key logs' } };
        }
        return { success: true, data: json.data };
      } catch (error: any) {
        return handleError(error, 'apiKeys.getLogs');
      }
    }
  }
};
