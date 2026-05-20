/**
 * Client-side Cloudflare R2 Upload, Delete, and Finalize Utilities
 * Designed to support hybrid storage architecture with Supabase fallback.
 */

/**
 * Upload a file to Cloudflare R2 drafts/permanent folders using base64 payload.
 */
export async function uploadToR2(file: File, folder: string, draftId?: string): Promise<string> {
  // Convert File to Base64 string asynchronously
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const base64Str = reader.result.split(',')[1];
        resolve(base64Str);
      } else {
        reject(new Error('Failed to read file as string'));
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const res = await fetch('/api/upload-r2', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fileBase64: base64,
      fileName: file.name,
      fileType: file.type,
      folder,
      draftId,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `R2 upload failed with status ${res.status}`);
  }

  const data = await res.json();
  if (!data.url) {
    throw new Error('R2 upload succeeded but no URL was returned');
  }

  return data.url;
}

/**
 * Delete a file from Cloudflare R2 based on its public URL.
 */
export async function deleteFromR2(url: string): Promise<boolean> {
  try {
    const res = await fetch('/api/delete-r2', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[R2 Client Delete Warning]:', err.error || `HTTP ${res.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[R2 Client Delete Error]:', error);
    return false;
  }
}

/**
 * Call the backend to finalize attachments: copying them from drafts to final application directories
 * and updating the corresponding database fields.
 */
export async function finalizeR2Attachments(draftId: string, applicationId: string): Promise<boolean> {
  try {
    const res = await fetch('/api/finalize-attachments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ draftId, applicationId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error('[R2 Client Finalize Warning]:', err.error || `HTTP ${res.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[R2 Client Finalize Error]:', error);
    return false;
  }
}

/**
 * Check if the active storage provider matches the R2 config.
 * Supports: 'supabase', 'r2', 'r2+fallback' (default fallback mode if not configured)
 */
export function getStorageProvider(): 'supabase' | 'r2' | 'r2+fallback' {
  const provider = import.meta.env.VITE_STORAGE_PROVIDER;
  if (provider === 'supabase') return 'supabase';
  if (provider === 'r2') return 'r2';
  return 'r2+fallback'; // Default fallback mode for smooth transition
}
