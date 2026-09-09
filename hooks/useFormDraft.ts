/**
 * useFormDraft — Auto-save applicant form to localStorage
 *
 * Features:
 * - Auto-saves formData + currentStep ทุกครั้งที่เปลี่ยน (debounced 800ms)
 * - Restore ข้อมูลเมื่อเปิดหน้าใหม่ พร้อม banner ถามผู้ใช้
 * - beforeunload warning เมื่อมีข้อมูลที่ยังไม่ submit
 * - Clear draft เมื่อ submit สำเร็จ
 * - รองรับ URL params (bu/ch/tag) เป็น draft key เฉพาะ
 *
 * FIX: isReadyToSaveRef ป้องกัน auto-save ทับ draft เก่าตอน mount
 * (Race condition: useEffect auto-save จะไม่ทำงานจนกว่าผู้ใช้จะ Restore หรือ Dismiss)
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { ApplicationForm } from '../types';

const DRAFT_KEY_PREFIX = 'applicant_form_draft';
const DRAFT_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 วัน

interface DraftPayload {
  formData: ApplicationForm;
  currentStep: number;
  draftId?: string;
  savedAt: number;
  draftKey: string;
}

interface UseFormDraftOptions {
  scopeKey?: string;
  lang?: 'th' | 'en';
  autoRestore?: boolean;
  onAutoRestored?: (draft: { formData: ApplicationForm; currentStep: number; draftId?: string }) => void;
}

interface UseFormDraftReturn {
  showRestoreBanner: boolean;
  restoreDraft: () => { formData: ApplicationForm; currentStep: number; draftId?: string } | null;
  dismissDraft: () => void;
  saveDraft: (formData: ApplicationForm, currentStep: number, draftId?: string) => void;
  clearDraft: () => void;
  lastSavedText: string;
}

function getDraftKey(scopeKey?: string): string {
  return scopeKey
    ? `${DRAFT_KEY_PREFIX}__${scopeKey}`
    : DRAFT_KEY_PREFIX;
}

function timeAgo(ts: number, lang: 'th' | 'en' = 'th'): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (lang === 'th') {
    if (diff < 60000) return 'เมื่อกี้';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    return `${Math.floor(hours / 24)} วันที่แล้ว`;
  } else {
    if (diff < 60000) return 'just now';
    if (mins < 60) return `${mins} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    return `${Math.floor(hours / 24)} days ago`;
  }
}

export function useFormDraft(options: UseFormDraftOptions = {}): UseFormDraftReturn {
  const { scopeKey, lang = 'th', autoRestore = true, onAutoRestored } = options;
  const draftKey = getDraftKey(scopeKey);

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [lastSavedText, setLastSavedText] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

  const isReadyToSaveRef = useRef(false);

  // ---- Check draft on mount ----
  useEffect(() => {
    try {
      let raw = localStorage.getItem(draftKey);

      // Fallback: If not found under specific scopeKey, find any recent valid draft
      if (!raw) {
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(DRAFT_KEY_PREFIX)) {
            const candidate = localStorage.getItem(k);
            if (candidate) {
              try {
                const parsed = JSON.parse(candidate);
                if (Date.now() - parsed.savedAt <= DRAFT_TTL_MS) {
                  raw = candidate;
                  break;
                }
              } catch {}
            }
          }
        }
      }

      if (!raw) {
        // ไม่มี draft → เริ่ม save ได้ทันที
        isReadyToSaveRef.current = true;
        return;
      }

      const payload: DraftPayload = JSON.parse(raw);

      // ลบ draft เก่าเกิน TTL
      if (Date.now() - payload.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(draftKey);
        isReadyToSaveRef.current = true;
        return;
      }

      // มีข้อมูลจริง (ไม่ใช่แค่ initial state ว่าง)
      const hasData = Boolean(
        payload.formData?.firstName ||
        payload.formData?.department ||
        payload.formData?.position ||
        payload.currentStep > 1
      );

      if (hasData) {
        setLastSavedAt(payload.savedAt);
        setLastSavedText(timeAgo(payload.savedAt, lang));

        if (autoRestore) {
          // Auto-restore immediately so the user never encounters a blank form or data loss
          isReadyToSaveRef.current = true;
          isDirtyRef.current = true;
          setShowRestoreBanner(true);
          onAutoRestored?.({
            formData: payload.formData,
            currentStep: payload.currentStep,
            draftId: payload.draftId
          });
        } else {
          // Manual restore mode
          isReadyToSaveRef.current = false;
          setShowRestoreBanner(true);
        }
      } else {
        isReadyToSaveRef.current = true;
      }
    } catch {
      try {
        localStorage.removeItem(draftKey);
      } catch {}
      isReadyToSaveRef.current = true;
    }
  }, [draftKey, lang, autoRestore]); // eslint-disable-line react-hooks/exhaustive-deps

  // ---- Update lastSavedText ทุก 30 วินาที ----
  useEffect(() => {
    if (!lastSavedAt) return;
    const interval = setInterval(() => {
      setLastSavedText(timeAgo(lastSavedAt, lang));
    }, 30000);
    return () => clearInterval(interval);
  }, [lastSavedAt, lang]);

  // ---- beforeunload warning ----
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirtyRef.current) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // ---- saveDraft (debounced 800ms) ----
  const saveDraft = useCallback((formData: ApplicationForm, currentStep: number, draftId?: string) => {
    // ยังไม่พร้อม save (กรณีรอผู้ใช้ตัดสินใจใน manual mode)
    if (!isReadyToSaveRef.current) return;

    isDirtyRef.current = true;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      try {
        const payload: DraftPayload = {
          formData,
          currentStep,
          draftId: draftId || '',
          savedAt: Date.now(),
          draftKey,
        };
        localStorage.setItem(draftKey, JSON.stringify(payload));
        setLastSavedAt(payload.savedAt);
        setLastSavedText(timeAgo(payload.savedAt, lang));
      } catch (err) {
        console.warn('[useFormDraft] Could not save draft:', err);
      }
    }, 800);
  }, [draftKey, lang]);

  // ---- restoreDraft ----
  const restoreDraft = useCallback((): { formData: ApplicationForm; currentStep: number; draftId?: string } | null => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const payload: DraftPayload = JSON.parse(raw);
      setShowRestoreBanner(false);
      isDirtyRef.current = true;
      isReadyToSaveRef.current = true;
      return { formData: payload.formData, currentStep: payload.currentStep, draftId: payload.draftId };
    } catch {
      isReadyToSaveRef.current = true;
      return null;
    }
  }, [draftKey]);

  // ---- dismissDraft (Start fresh) ----
  const dismissDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(DRAFT_KEY_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
    setShowRestoreBanner(false);
    isReadyToSaveRef.current = true;
  }, [draftKey]);

  // ---- clearDraft (หลัง submit) ----
  const clearDraft = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    try {
      localStorage.removeItem(draftKey);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.startsWith(DRAFT_KEY_PREFIX)) {
          localStorage.removeItem(k);
        }
      }
    } catch {}
    isDirtyRef.current = false;
    isReadyToSaveRef.current = false;
    setShowRestoreBanner(false);
    setLastSavedAt(null);
    setLastSavedText('');
  }, [draftKey]);

  return {
    showRestoreBanner,
    restoreDraft,
    dismissDraft,
    saveDraft,
    clearDraft,
    lastSavedText,
  };
}
