
import { supabase } from '../supabaseClient';
import { ApplicationForm } from '../types';

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

// ============================================================
// File Upload Service
// ============================================================
export const api = {
  /**
   * Upload a file to Supabase Storage with progress tracking
   */
  uploadFile: async (file: File, folder: string): Promise<string | null> => {
    try {
      // Validate file size (max 10MB)
      const MAX_SIZE = 10 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        throw { message: 'File size exceeds 10MB limit.' };
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        throw { message: 'File type not allowed. Please use JPG, PNG, WebP, or PDF.' };
      }

      // Generate safe filename
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${folder}/${Date.now()}_${safeFileName}`;

      const { data, error } = await supabase.storage
        .from('applicants')
        .upload(fileName, file, {
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
   * Fetch all applications for Dashboard
   */
  getApplications: async (): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
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
  updateApplicationStatus: async (id: string, status: string, comment?: string): Promise<ApiResponse<any>> => {
    try {
      const validStatuses = ['Pending', 'Reviewing', 'Interview', 'Approved', 'Rejected', 'Hired'];
      if (!validStatuses.includes(status)) {
        return { success: false, error: { message: 'Invalid status value.' } };
      }

      // Only update status column - other columns may not exist
      const updateData: any = { status };

      const { data, error } = await supabase
        .from('applications')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) return handleError(error, 'updateApplicationStatus');
      return { success: true, data };
    } catch (error) {
      return handleError(error, 'updateApplicationStatus');
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
  // Authentication Services (Secure Version)
  // ============================================================
  auth: {
    /**
     * Sign in with email and password using Supabase Auth
     * Falls back to custom users table for backward compatibility
     */
    signIn: async (email: string, password: string): Promise<{ user: AuthUser | null; error: any }> => {
      try {
        // Validate inputs
        if (!email || !password) {
          return { user: null, error: { message: 'Email and password are required.' } };
        }

        const normalizedEmail = email.toLowerCase().trim();

        // 1. Try Supabase Auth first (preferred, secure method)
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });

        if (authData?.user) {
          // Fetch user profile from users table
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('email', normalizedEmail)
            .single();

          if (profile && profile.status !== 'Active') {
            await supabase.auth.signOut();
            return { user: null, error: { message: 'Account is pending approval. Please contact the administrator.' } };
          }

          return {
            user: profile || {
              id: authData.user.id,
              email: authData.user.email!,
              role: 'mod' as const,
              full_name: authData.user.user_metadata?.full_name || '',
              status: 'Active' as const,
              created_at: authData.user.created_at
            },
            error: null
          };
        }

        // 2. Fallback to custom table (for migration period - will be deprecated)
        // ⚠️ WARNING: This uses plaintext password comparison - should be migrated to Supabase Auth
        console.warn('Using legacy auth - please migrate users to Supabase Auth');

        const { data: legacyUser, error: legacyError } = await supabase
          .from('users')
          .select('*')
          .eq('email', normalizedEmail)
          .single();

        if (legacyUser) {
          // Simple comparison (legacy - insecure)
          if (legacyUser.password === password) {
            if (legacyUser.status !== 'Active') {
              return { user: null, error: { message: 'Account is pending approval. Please contact the administrator.' } };
            }
            return { user: legacyUser, error: null };
          }
          return { user: null, error: { message: 'Invalid email or password.' } };
        }

        return { user: null, error: authError || { message: 'Invalid email or password.' } };
      } catch (error: any) {
        console.error('Login error:', error);
        return { user: null, error: { message: 'Login failed. Please try again.' } };
      }
    },

    /**
     * Register new staff user with Supabase Auth
     */
    signUp: async (userData: { email: string; password: string; full_name: string; phone?: string; role?: string }): Promise<ApiResponse<AuthUser>> => {
      try {
        // Validate inputs
        if (!userData.email || !userData.password || !userData.full_name) {
          return { success: false, error: { message: 'Email, password, and name are required.' } };
        }

        if (userData.password.length < 6) {
          return { success: false, error: { message: 'Password must be at least 6 characters.' } };
        }

        const normalizedEmail = userData.email.toLowerCase().trim();

        // 1. Create Supabase Auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: userData.password,
          options: {
            data: {
              full_name: userData.full_name,
              role: userData.role || 'mod'
            }
          }
        });

        if (authError) return handleError(authError, 'signUp');

        // 2. Create profile in users table
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .insert([{
            id: authData.user?.id,
            email: normalizedEmail,
            full_name: userData.full_name,
            phone: userData.phone || '',
            password: userData.password, // Required by users table (NOT NULL)
            role: userData.role || 'mod',
            status: 'Pending',
            created_at: new Date().toISOString()
          }])
          .select()
          .single();

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Don't fail completely if profile creation fails
        }

        return {
          success: true,
          data: profile || {
            id: authData.user?.id || '',
            email: normalizedEmail,
            full_name: userData.full_name,
            role: (userData.role || 'mod') as 'admin' | 'mod',
            status: 'Pending',
            created_at: new Date().toISOString()
          }
        };
      } catch (error) {
        return handleError(error, 'signUp');
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
  }
};