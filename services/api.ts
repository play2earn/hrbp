
import { supabase } from '../supabaseClient';
import { ApplicationForm } from '../types';
import md5 from 'js-md5';

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
  uploadFile: async (file: File, folder: string): Promise<string | null> => {
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
  submitApplication: async (formData: ApplicationForm): Promise<ApiResponse<{ id: string }>> => {
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email) {
        return { success: false, error: { message: 'Please fill in all required fields.' } };
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        return { success: false, error: { message: 'Please enter a valid email address.' } };
      }

      const payload = {
        position: formData.position,
        department: formData.department,
        business_unit: formData.businessUnit,
        source_channel: formData.sourceChannel,
        campaign_tag: formData.campaignTag,
        full_name: `${formData.firstName} ${formData.lastName}`.trim(),
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
        performed_by: `${formData.firstName} ${formData.lastName}`.trim() || 'ผู้สมัคร',
      });

      return { success: true, data: { id: data.id } };
    } catch (error) {
      return handleError(error, 'submitApplication');
    }
  },

  /**
   * Track application status by ID
   */
  trackApplication: async (trackingId: string): Promise<ApiResponse<any>> => {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(trackingId)) {
        return { success: false, error: { message: 'Invalid tracking ID format.' } };
      }

      const { data, error } = await supabase.rpc('get_application_status', { app_id: trackingId });

      if (error) return handleError(error, 'trackApplication');
      if (!data) return { success: false, error: { message: 'Application not found.' } };

      return { success: true, data };
    } catch (error) {
      return handleError(error, 'trackApplication');
    }
  },

  /**
   * Track application(s) by National ID or Passport Number (searches in form_data JSONB)
   */
  trackByIdOrPassport: async (searchValue: string): Promise<ApiResponse<any[]>> => {
    try {
      const trimmed = searchValue.trim();
      if (!trimmed) {
        return { success: false, error: { message: 'Please enter a National ID or Passport number.' } };
      }

      // Search by nationalId OR passportNo in form_data
      const { data: byNationalId } = await supabase
        .from('applications')
        .select('id, full_name, position, department, status, created_at')
        .eq('form_data->>nationalId', trimmed)
        .order('created_at', { ascending: false });

      const { data: byPassport } = await supabase
        .from('applications')
        .select('id, full_name, position, department, status, created_at')
        .eq('form_data->>passportNo', trimmed)
        .order('created_at', { ascending: false });

      // Merge and deduplicate by id
      const all = [...(byNationalId || []), ...(byPassport || [])];
      const unique = Array.from(new Map(all.map(item => [item.id, item])).values());

      if (unique.length === 0) {
        return { success: false, error: { message: 'No applications found.' } };
      }

      return { success: true, data: unique };
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
        console.warn("Session invalid, clearing localStorage");
        localStorage.removeItem('currentUser');
        return [];
      }

      const { data, error } = await supabase
        .from('applications')
        .select('*, assigned_user:users!applications_assigned_to_fkey(id, full_name, emp_id)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Fetch Apps Error:", error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error("Fetch Apps Error:", error);
      return [];
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
      });

      if (error) return handleError(error, 'updateApplicationStatus');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'updateApplicationStatus');
    }
  },

  /**
   * Delete application and associated files in storage
   */
  deleteApplication: async (id: string): Promise<ApiResponse<any>> => {
    try {
      const { data: appData, error: fetchError } = await supabase
        .from('applications')
        .select('form_data')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const filesToDelete: string[] = [];
      const formData = appData?.form_data;

      if (formData) {
        const extractPathFromUrl = (url: string | undefined | null) => {
          if (!url) return null;
          const matches = url.match(/\/public\/applicants\/(.+)$/);
          return matches ? matches[1] : null;
        };

        const photoPath = extractPathFromUrl(formData.photoUrl);
        const resumePath = extractPathFromUrl(formData.resumeUrl);
        const certPath = extractPathFromUrl(formData.certificateUrl);

        if (photoPath) filesToDelete.push(photoPath);
        if (resumePath) filesToDelete.push(resumePath);
        if (certPath) filesToDelete.push(certPath);
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('applicants')
          .remove(filesToDelete);

        if (storageError) {
          console.error("Warning: Failed to delete some storage files:", storageError);
        }
      }

      const { error: deleteError } = await supabase
        .from('applications')
        .delete()
        .eq('id', id);

      if (deleteError) return handleError(deleteError, 'deleteApplication');

      return { success: true };
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
   * Get recent QR generation logs
   */
  getQrLogs: async (limit: number = 25): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('qr_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Fetch QR Logs Error:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Fetch QR Logs Error:', error);
      return [];
    }
  },

  // ============================================================
  // Share Link Services
  // ============================================================

  /**
   * Generate (or reuse existing) a 30-day share token for an application
   */
  generateShareToken: async (applicationId: string, createdBy: string): Promise<ApiResponse<{ token: string; url: string; expires_at: string }>> => {
    try {
      // Check for existing non-expired, non-revoked token
      const { data: existing } = await supabase
        .from('application_share_tokens')
        .select('token, expires_at')
        .eq('application_id', applicationId)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        const url = `${window.location.origin}/share/${existing.token}`;
        return { success: true, data: { token: existing.token, url, expires_at: existing.expires_at } };
      }

      // Generate new token: crypto-safe 32-byte hex
      const token = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, '0')).join('');
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('application_share_tokens')
        .insert([{
          application_id: applicationId,
          token,
          created_by: createdBy,
          expires_at: expiresAt,
        }])
        .select('token, expires_at')
        .single();

      if (error) return handleError(error, 'generateShareToken');

      const url = `${window.location.origin}/share/${data.token}`;
      return { success: true, data: { token: data.token, url, expires_at: data.expires_at } };
    } catch (error) {
      return handleError(error, 'generateShareToken');
    }
  },

  /**
   * Fetch existing active share token without creating a new one
   */
  getExistingShareToken: async (applicationId: string): Promise<ApiResponse<{ token: string; url: string; expires_at: string } | null>> => {
    try {
      const { data, error } = await supabase
        .from('application_share_tokens')
        .select('token, expires_at')
        .eq('application_id', applicationId)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return handleError(error, 'getExistingShareToken');
      if (!data) return { success: true, data: null };

      const url = `${window.location.origin}/share/${data.token}`;
      return { success: true, data: { token: data.token, url, expires_at: data.expires_at } };
    } catch (error) {
      return handleError(error, 'getExistingShareToken');
    }
  },
  /**
   * Fetch application data via a share token (public endpoint)
   */
  getApplicationByShareToken: async (token: string): Promise<ApiResponse<any>> => {
    try {
      // Validate token and get application_id
      const { data: tokenRow, error: tokenError } = await supabase
        .from('application_share_tokens')
        .select('id, application_id, expires_at, is_revoked')
        .eq('token', token)
        .eq('is_revoked', false)
        .gt('expires_at', new Date().toISOString())
        .maybeSingle();

      if (tokenError || !tokenRow) {
        return { success: false, error: { message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว' } };
      }

      // Fetch application
      const { data: app, error: appError } = await supabase
        .from('applications')
        .select('id, full_name, position, department, form_data, created_at, status, photo_url')
        .eq('id', tokenRow.application_id)
        .single();

      if (appError || !app) {
        return { success: false, error: { message: 'ไม่พบข้อมูลผู้สมัคร' } };
      }

      // Update access stats (fire-and-forget)
      supabase.from('application_share_tokens').update({
        last_accessed_at: new Date().toISOString(),
        access_count: (tokenRow as any).access_count + 1,
      }).eq('id', tokenRow.id).then(() => {});

      return { success: true, data: app };
    } catch (error) {
      return handleError(error, 'getApplicationByShareToken');
    }
  },

  /**
   * Revoke a share token
   */
  revokeShareToken: async (token: string): Promise<ApiResponse<void>> => {
    try {
      const { error } = await supabase
        .from('application_share_tokens')
        .update({ is_revoked: true })
        .eq('token', token);

      if (error) return handleError(error, 'revokeShareToken');
      return { success: true };
    } catch (error) {
      return handleError(error, 'revokeShareToken');
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
        const storedUser = localStorage.getItem('currentUser');
        if (!storedUser) return { success: false, error: { message: 'No session' } };

        const user = JSON.parse(storedUser);
        if (!user || !user.id) return { success: false, error: { message: 'Invalid session data' } };

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .eq('status', 'Active')
          .single();

        if (error || !data) {
          return { success: false, error: { message: 'Session expired or user inactive' } };
        }

        return { success: true, data };
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
        const proxyUrl = `/api/idms-auth?account=${encodeURIComponent(normalizedUsername)}&password=${encodeURIComponent(passwordMd5)}`;
        
        let response: Response;
        try {
          response = await fetch(proxyUrl, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
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

        if (!data || data.Result !== 'OK') {
            const msg = data?.Result?.replace('Error : ', '') || 'Invalid HRMS credentials';
            return { user: null, error: { message: msg } };
        }

        const empId = data.EmpId;

        // 2. Check in our Supabase users table
        const { data: profile, error: dbError } = await supabase
          .from('users')
          .select('*')
          .or(`hrms_username.eq.${normalizedUsername},emp_id.eq.${empId}`)
          .single();

        if (profile) {
          if (profile.status !== 'Active') {
            return { user: null, error: { message: 'Account is pending approval. Please contact the administrator.' } };
          }
          return { user: profile, error: null };
        }

        // 3. Not found - needs registration
        return { 
          user: null, 
          error: { message: 'Not registered' }, 
          needsRegistration: true, 
          empId 
        };
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
        // Validate inputs
        if (!userData.email || !userData.full_name || !userData.emp_id || !userData.hrms_username) {
          return { success: false, error: { message: 'All fields are required.' } };
        }

        const normalizedEmail = userData.email.toLowerCase().trim();

        // Check if email already exists
        const { data: existingUser } = await supabase
           .from('users')
           .select('id')
           .eq('email', normalizedEmail)
           .maybeSingle();

        if (existingUser) {
           return { success: false, error: { message: 'This email is already in use.' } };
        }

        // Create profile in users table (No passwords needed anymore)
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([{
            email: normalizedEmail,
            full_name: userData.full_name,
            phone: userData.phone || '',
            role: userData.role || 'mod',
            status: 'Pending',
            emp_id: userData.emp_id,
            hrms_username: userData.hrms_username,
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (profileError) return handleError(profileError, 'registerHrmsUser');

        return {
          success: true,
          data: profile
        };
      } catch (error) {
        return handleError(error, 'registerHrmsUser');
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
     */
    updateUserStatus: async (id: string, status: 'Active' | 'Rejected' | 'Inactive'): Promise<ApiResponse<AuthUser>> => {
      try {
        const { data, error } = await supabase
          .from('users')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
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
      await supabase.auth.signOut();
    },

    /**
     * Get current session
     */
    getSession: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      return session;
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
      const { data } = await supabase.from('positions').select('*').eq('department_id', departmentId).eq('is_active', true).order('name_en');
      return data || [];
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

    toggleActive: async (table: string, id: number, currentState: boolean): Promise<ApiResponse<any>> => {
      try {
        const { data, error } = await supabase.from(table).update({ is_active: !currentState }).eq('id', id).select().single();
        if (error) return handleError(error, `toggleActive:${table}`);
        api.master.clearCache();
        return { success: true, data };
      } catch (error) {
        return handleError(error, `toggleActive:${table}`);
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
  }
};
