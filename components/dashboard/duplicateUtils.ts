// components/dashboard/duplicateUtils.ts
// Intelligent Duplicate Detection Engine using Union-Find Graph Algorithm

export interface DuplicateGroupItem {
  id: string;
  created_at: string;
  full_name?: string;
  position?: string;
  department?: string;
  business_unit?: string;
  status?: string;
  phone?: string;
  nationalId?: string;
  passportNo?: string;
  photoUrl?: string;
  form_data?: any;
}

export interface DuplicateInfo {
  count: number;
  groupAppIds: string[];
  matchReasons: string[];
}

export interface DuplicateDetectionResult {
  duplicateGroups: any[][];
  duplicateAppIds: Set<string>;
  duplicateMap: Map<string, DuplicateInfo>;
  totalDuplicateGroups: number;
  totalDuplicateApps: number;
}

/**
 * Normalizes a phone number for comparison (removes spaces, dashes, country code +66 -> 0)
 */
export function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  let digits = rawPhone.replace(/[^0-9]/g, '');
  if (digits.startsWith('66') && digits.length >= 11) {
    digits = '0' + digits.slice(2);
  }
  return digits;
}

/**
 * Normalizes national ID / citizen ID
 */
export function normalizeNationalId(rawNid?: string | null): string {
  if (!rawNid) return '';
  return rawNid.replace(/[^0-9]/g, '').trim();
}

/**
 * Normalizes passport number
 */
export function normalizePassport(rawPassport?: string | null): string {
  if (!rawPassport) return '';
  return rawPassport.trim().toUpperCase();
}

/**
 * Detects duplicate applications across a list of application records
 * Uses Disjoint-Set Union (Union-Find) to connect records sharing:
 * 1. National ID (13 digits)
 * 2. Passport No. (>= 6 chars)
 * 3. Phone (>= 9 digits)
 */
export function findDuplicates(apps: any[]): DuplicateDetectionResult {
  if (!apps || apps.length === 0) {
    return {
      duplicateGroups: [],
      duplicateAppIds: new Set<string>(),
      duplicateMap: new Map<string, DuplicateInfo>(),
      totalDuplicateGroups: 0,
      totalDuplicateApps: 0
    };
  }

  const parent = new Map<string, string>();

  function find(id: string): string {
    if (!parent.has(id)) parent.set(id, id);
    if (parent.get(id) !== id) {
      parent.set(id, find(parent.get(id)!));
    }
    return parent.get(id)!;
  }

  function union(idA: string, idB: string) {
    const rootA = find(idA);
    const rootB = find(idB);
    if (rootA !== rootB) {
      parent.set(rootA, rootB);
    }
  }

  const nidMap = new Map<string, string>();
  const passportMap = new Map<string, string>();
  const phoneMap = new Map<string, string>();

  // Map to store match reasons between nodes
  const matchReasonMap = new Map<string, Set<string>>();

  function addReason(idA: string, idB: string, reason: string) {
    if (!matchReasonMap.has(idA)) matchReasonMap.set(idA, new Set());
    if (!matchReasonMap.has(idB)) matchReasonMap.set(idB, new Set());
    matchReasonMap.get(idA)!.add(reason);
    matchReasonMap.get(idB)!.add(reason);
  }

  for (const app of apps) {
    const fd = app.form_data || {};
    const nid = normalizeNationalId(app.nationalId || fd.nationalId);
    const passport = normalizePassport(app.passportNo || fd.passportNo);
    const phone = normalizePhone(app.phone || fd.phone);

    // 1. Match by National ID (13 digits)
    if (nid && nid.length >= 10) {
      if (nidMap.has(nid)) {
        const prevId = nidMap.get(nid)!;
        union(app.id, prevId);
        addReason(app.id, prevId, 'เลขบัตรประชาชน');
      } else {
        nidMap.set(nid, app.id);
      }
    }

    // 2. Match by Passport No
    if (passport && passport.length >= 6) {
      if (passportMap.has(passport)) {
        const prevId = passportMap.get(passport)!;
        union(app.id, prevId);
        addReason(app.id, prevId, 'เลขพาสปอร์ต');
      } else {
        passportMap.set(passport, app.id);
      }
    }

    // 3. Match by Phone Number (at least 9 digits)
    if (phone && phone.length >= 9) {
      if (phoneMap.has(phone)) {
        const prevId = phoneMap.get(phone)!;
        union(app.id, prevId);
        addReason(app.id, prevId, 'เบอร์โทรศัพท์');
      } else {
        phoneMap.set(phone, app.id);
      }
    }
  }

  // Group applications by disjoint-set root
  const groupsByRoot = new Map<string, any[]>();
  for (const app of apps) {
    const root = find(app.id);
    if (!groupsByRoot.has(root)) {
      groupsByRoot.set(root, []);
    }
    groupsByRoot.get(root)!.push(app);
  }

  // Filter out singleton groups (groups with only 1 application)
  const duplicateGroups: any[][] = [];
  const duplicateAppIds = new Set<string>();
  const duplicateMap = new Map<string, DuplicateInfo>();

  for (const group of groupsByRoot.values()) {
    if (group.length > 1) {
      // Sort group items newest first
      group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      duplicateGroups.push(group);

      const groupIds = group.map(a => a.id);
      
      // Combine match reasons for the group
      const allReasons = new Set<string>();
      for (const a of group) {
        const reasons = matchReasonMap.get(a.id);
        if (reasons) {
          reasons.forEach(r => allReasons.add(r));
        }
      }
      const matchReasons = Array.from(allReasons);
      if (matchReasons.length === 0) matchReasons.push('ข้อมูลส่วนบุคคลซ้ำ');

      for (const a of group) {
        duplicateAppIds.add(a.id);
        duplicateMap.set(a.id, {
          count: group.length,
          groupAppIds: groupIds,
          matchReasons
        });
      }
    }
  }

  return {
    duplicateGroups,
    duplicateAppIds,
    duplicateMap,
    totalDuplicateGroups: duplicateGroups.length,
    totalDuplicateApps: duplicateAppIds.size
  };
}
