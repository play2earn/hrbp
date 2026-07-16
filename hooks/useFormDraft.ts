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
  savedAt: number;
  draftKey: string;
}

interface UseFormDraftOptions {
  scopeKey?: string;
  lang?: 'th' | 'en';
}

interface UseFormDraftReturn {
  showRestoreBanner: boolean;
  restoreDraft: () => { formData: ApplicationForm; currentStep: number } | null;
  dismissDraft: () => void;
  saveDraft: (formData: ApplicationForm, currentStep: number) => void;
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
  const { scopeKey, lang = 'th' } = options;
  const draftKey = getDraftKey(scopeKey);

  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [lastSavedText, setLastSavedText] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDirtyRef = useRef(false);

  /**
   * KEY FIX: isReadyToSaveRef
   * - เริ่มต้นเป็น false เสมอ
   * - เป็น true หลังจาก:
   *   (a) ไม่พบ draft ตอน mount → เริ่ม save ได้ทันที
   *   (b) ผู้ใช้กด Restore → restore แล้วค่อย save ต่อ
   *   (c) ผู้ใช้กด Start fresh / Dismiss → ลบ draft แล้วค่อย save ต่อ
   * ป้องกัน auto-save เขียนทับ draft เก่าก่อนที่ผู้ใช้จะตัดสินใจ
   */
  const isReadyToSaveRef = useRef(false);

  // ---- Check draft on mount ----
  useEffect(() => {
    try {
      const raw = localStorage.getItem(draftKey);

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
      const hasData = payload.formData?.firstName ||
        payload.formData?.department ||
        payload.currentStep > 1;

      if (hasData) {
        // มี draft → แสดง banner, ยัง BLOCK การ save จนกว่าผู้ใช้จะตัดสินใจ
        isReadyToSaveRef.current = false;
        setShowRestoreBanner(true);
        setLastSavedAt(payload.savedAt);
        setLastSavedText(timeAgo(payload.savedAt, lang));
      } else {
        // draft ว่างเปล่า → เริ่ม save ได้เลย
        isReadyToSaveRef.current = true;
      }
    } catch {
      localStorage.removeItem(draftKey);
      isReadyToSaveRef.current = true;
    }
  }, [draftKey, lang]);

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
  const saveDraft = useCallback((formData: ApplicationForm, currentStep: number) => {
    // ยังไม่พร้อม save (รอผู้ใช้ตัดสินใจ Restore/Dismiss)
    if (!isReadyToSaveRef.current) return;

    isDirtyRef.current = true;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    debounceTimer.current = setTimeout(() => {
      try {
        const payload: DraftPayload = {
          formData,
          currentStep,
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
  const restoreDraft = useCallback((): { formData: ApplicationForm; currentStep: number } | null => {
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return null;
      const payload: DraftPayload = JSON.parse(raw);
      setShowRestoreBanner(false);
      isDirtyRef.current = true;
      // Restore เสร็จแล้ว → เปิด save ได้ต่อ
      isReadyToSaveRef.current = true;
      return { formData: payload.formData, currentStep: payload.currentStep };
    } catch {
      isReadyToSaveRef.current = true;
      return null;
    }
  }, [draftKey]);

  // ---- dismissDraft (Start fresh) ----
  const dismissDraft = useCallback(() => {
    localStorage.removeItem(draftKey);
    setShowRestoreBanner(false);
    // Dismiss เสร็จแล้ว → เปิด save ได้ต่อ
    isReadyToSaveRef.current = true;
  }, [draftKey]);

  // ---- clearDraft (หลัง submit) ----
  const clearDraft = useCallback(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    localStorage.removeItem(draftKey);
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
