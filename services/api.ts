
import { supabase } from '../supabaseClient';
import { ApplicationForm } from '../types';

export const api = {
  /**
   * Upload a file to Supabase Storage
   */
  uploadFile: async (file: File, folder: string): Promise<string | null> => {
    try {
      // 1. Check if bucket exists/is accessible by trying to list it (optional check, but good for debugging)
      const { error: bucketError } = await supabase.storage.getBucket('applicants');

      if (bucketError) {
        console.error("Storage Bucket Error: The 'applicants' bucket might not exist or isn't public. Run the schema.sql in Supabase SQL Editor.");
      }

      const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '-')}`;

      const { data, error } = await supabase.storage
        .from('applicants')
        .upload(fileName, file);

      if (error) {
        console.error('Upload Error:', error);
        throw error;
      }

      // Get Public URL
      const { data: urlData } = supabase.storage
        .from('applicants')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error('File upload failed:', error);
      alert("Upload failed. Please ensure you have run the schema.sql script in your Supabase Dashboard.");
      return null;
    }
  },

  /**
   * Submit the full application to the database
   */
  submitApplication: async (formData: ApplicationForm) => {
    try {
      // flattening essential fields for sorting/filtering, storing the rest in jsonb
      // flattening essential fields for sorting/filtering, storing the rest in jsonb
      const payload = {
        position: formData.position,
        department: formData.department,
        business_unit: formData.businessUnit,
        full_name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        status: 'Pending',
        form_data: formData, // JSONB contains ALL data
        created_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from('applications')
        .insert([payload])
        .select();

      if (error) {
        if (error.code === '42P01') {
          console.error("Missing Table Error: The table 'applications' does not exist. Please run schema.sql in Supabase.");
          alert("System Error: Database table not found. Please contact administrator (Run schema.sql).");
        }
        throw error;
      }
      return { success: true, data };
    } catch (error) {
      console.error('Submission failed:', error);
      return { success: false, error };
    }
  },

  /**
   * Application Tracking
   */
  trackApplication: async (trackingId: string) => {
    const { data, error } = await supabase.rpc('get_application_status', { app_id: trackingId });
    return { data, error };
  },

  /**
   * Fetch applications for Dashboard
   */
  getApplications: async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Fetch Apps Error:", error);
      return [];
    }
    return data || [];
  },

  updateApplicationStatus: async (id: string, status: string) => {
    const { data, error } = await supabase
      .from('applications')
      .update({ status })
      .eq('id', id)
      .select();
    return { success: !error, data, error };
  },

  /**
   * Auth Services
   */
  auth: {
    signIn: async (email: string, password: string) => {
      // 1. Try Custom Table first
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .single();

      if (data) {
        if (data.status !== 'Active') {
          return { user: null, error: { message: 'Account is pending approval. Please contact the administrator.' } };
        }
        return { user: data, error: null };
      }

      // 2. Fallback to Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { user: authData.user, error: authError || error };
    },
    signUp: async (userData: any) => {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          ...userData,
          created_at: new Date().toISOString(),
          status: 'Pending' // Default to Pending
        }])
        .select()
        .single();

      return { data, error };
    },
    getPendingUsers: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .in('status', ['Pending', 'Inactive'])
        .order('created_at', { ascending: false });
      return { data, error };
    },
    updateUserStatus: async (id: string, status: 'Active' | 'Rejected' | 'Inactive') => {
      const { data, error } = await supabase
        .from('users')
        .update({ status })
        .eq('id', id)
        .select();
      return { data, error };
    },
    getActiveUsers: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('status', 'Active')
        .order('created_at', { ascending: false });
      return { data, error };
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
  },

  /**
   * Master Data Services
   */
  master: {
    // --- Public Fetchers (Active Only) ---
    getDepartments: async () => {
      const { data } = await supabase.from('departments').select('*').eq('is_active', true).order('name_en');
      return data || [];
    },
    getPositions: async (departmentId: number) => {
      const { data } = await supabase.from('positions').select('*').eq('department_id', departmentId).eq('is_active', true).order('name_en');
      return data || [];
    },
    getBusinessUnits: async () => {
      const { data } = await supabase.from('business_units').select('*').eq('is_active', true).order('name');
      return data || [];
    },
    getChannels: async () => {
      // Decoupled: Return all active channels sorted by name
      const { data } = await supabase.from('channels').select('*').eq('is_active', true).order('name');
      return data || [];
    },
    getUniversities: async () => {
      const { data } = await supabase.from('universities').select('*').eq('is_active', true).order('name');
      return data || [];
    },
    getFaculties: async () => {
      const { data } = await supabase.from('faculties').select('*').eq('is_active', true).order('name');
      return data || [];
    },
    getProvinces: async () => {
      const { data } = await supabase.from('provinces').select('*').eq('is_active', true).order('name_th');
      return data || [];
    },
    getDistricts: async (provinceId: number) => {
      const { data } = await supabase.from('districts').select('*').eq('province_id', provinceId).eq('is_active', true).order('name_th');
      return data || [];
    },
    getSubdistricts: async (districtId: number) => {
      const { data } = await supabase.from('subdistricts').select('*').eq('district_id', districtId).eq('is_active', true).order('name_th');
      return data || [];
    },

    // --- Admin Management (CRUD) ---
    // Generic Fetch All (for Admin List)
    getAll: async (table: string) => {
      const { data, error } = await supabase.from(table).select('*').order('id');
      return { data, error };
    },
    // Generic Add
    addItem: async (table: string, payload: any) => {
      const { data, error } = await supabase.from(table).insert([payload]).select();
      return { data, error };
    },
    // Generic Update
    updateItem: async (table: string, id: number, payload: any) => {
      const { data, error } = await supabase.from(table).update(payload).eq('id', id).select();
      return { data, error };
    },
    // Specific: Delete/Toggle (Soft Delete)
    toggleActive: async (table: string, id: number, currentState: boolean) => {
      const { data, error } = await supabase.from(table).update({ is_active: !currentState }).eq('id', id).select();
      return { data, error };
    }
  }
};