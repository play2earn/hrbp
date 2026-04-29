// Dashboard shared constants, color maps, status utilities
// Extracted from Dashboard.tsx for reuse across sub-components

export const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

// Brand-specific BU color map (for charts)
export const BU_COLOR_MAP: Record<string, string> = {
    'ดั๊บเบิ้ล เอ': '#2563EB',   // Blue
    'Double A': '#2563EB',     // Blue
    'DoubleA': '#2563EB',      // Blue
    'NPS': '#EAB308',          // Yellow
    'ReLo': '#16A34A',         // Green
    'Head Office': '#8B5CF6',   // Purple
    'Technology': '#6366F1',    // Indigo
};
export const BU_FALLBACK_COLORS = ['#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#EF4444', '#0EA5E9'];

export const getBuChartColor = (buName: string, index: number): string => {
    return BU_COLOR_MAP[buName] || BU_FALLBACK_COLORS[index % BU_FALLBACK_COLORS.length];
};

// BU color mapping (for CSS badge classes)
export const BU_COLORS: Record<string, string> = {
    'ดั๊บเบิ้ล เอ': 'bg-blue-100 text-blue-700 border-blue-200',
    'Double A': 'bg-blue-100 text-blue-700 border-blue-200',
    'DoubleA': 'bg-blue-100 text-blue-700 border-blue-200',
    'NPS': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'ReLo': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Head Office': 'bg-purple-100 text-purple-700 border-purple-200',
    'Technology': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Other': 'bg-gray-100 text-gray-600 border-gray-200',
};
export const getBuColor = (bu: string) => BU_COLORS[bu] || 'bg-indigo-50 text-indigo-700 border-indigo-100';

// Log action labels
export const LOG_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    'submitted': { label: 'ส่งใบสมัคร', icon: '🟢', color: 'text-green-600' },
    'claimed': { label: 'รับเคส', icon: '🔵', color: 'text-blue-600' },
    'status_change': { label: 'เปลี่ยนสถานะ', icon: '🟡', color: 'text-yellow-600' },
    'transferred': { label: 'โอนเคส', icon: '🔄', color: 'text-purple-600' },
    'unassigned': { label: 'ยกเลิกการรับเคส', icon: '⚪', color: 'text-gray-500' },
    'edited': { label: 'แก้ไขข้อมูล', icon: '✏️', color: 'text-indigo-600' },
    'comment': { label: 'หมายเหตุ', icon: '💬', color: 'text-slate-600' },
};

// Status labels and utilities
export const STATUS_LABELS: Record<string, string> = {
    Pending: 'รอดำเนินการ',
    Reviewing: 'กำลังพิจารณา',
    Interview: 'นัดสัมภาษณ์',
    InterviewScheduled: 'นัดสัมภาษณ์',
    Interviewed: 'สัมภาษณ์แล้ว',
    Offer: 'เสนอจ้าง',
    Hired: 'รับแล้ว',
    Rejected: 'ไม่ผ่าน',
    Withdrawn: 'ผู้สมัครยกเลิก',
    NoShow: 'ไม่มาตามนัด',
};

export const getStatusLabel = (status: string) => STATUS_LABELS[status] || status || '-';
export const isInterviewScheduledStatus = (status: string) => status === 'Interview' || status === 'InterviewScheduled';
export const isClosedStatus = (status: string) => ['Hired', 'Rejected', 'Withdrawn', 'NoShow'].includes(status);
export const getStatusBadgeClass = (status: string) => {
    if (status === 'Hired') return 'bg-green-100 text-green-800';
    if (status === 'Rejected' || status === 'Withdrawn' || status === 'NoShow') return 'bg-red-100 text-red-800';
    if (isInterviewScheduledStatus(status)) return 'bg-orange-100 text-orange-800';
    if (status === 'Interviewed' || status === 'Offer') return 'bg-emerald-100 text-emerald-800';
    if (status === 'Reviewing') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
};

// Military status Thai-only mapping
export const MILITARY_STATUS_MAP: Record<string, string> = {
    'Completed': 'ผ่านการเกณฑ์ทหารแล้ว',
    'Exempted': 'ได้รับการยกเว้น',
    'Conscripted': 'ผ่านการเกณฑ์ทหารแล้ว',
    'Reserved': 'นักศึกษาวิชาทหาร (รด.)',
    'Pending': 'อยู่ระหว่างการผ่อนผัน',
    'Awaiting Selection': 'จะเข้ารับการตรวจเลือกเร็วๆ นี้',
    'Female': 'ได้รับการยกเว้น - เพศหญิง',
    'Not Yet': 'ยังไม่เกณฑ์ทหาร',
    'N/A (Female)': 'ได้รับการยกเว้น - เพศหญิง',
    'ได้รับการยกเว้น': 'ได้รับการยกเว้น',
    'ผ่านการเกณฑ์ทหารแล้ว': 'ผ่านการเกณฑ์ทหารแล้ว',
    'นักศึกษาวิชาทหาร': 'นักศึกษาวิชาทหาร (รด.)',
    'อยู่ระหว่างการผ่อนผัน': 'อยู่ระหว่างการผ่อนผัน',
    'เพศหญิง (ได้รับการยกเว้น)': 'ได้รับการยกเว้น - เพศหญิง',
    'ROTC': 'จบหลักสูตร รด.',
    'ExemptFemale': 'ได้รับการยกเว้น - เพศหญิง',
    'ExemptLaw': 'ได้รับการยกเว้น - ตามกฎหมาย',
};

export const getMilitaryStatusLabel = (status: string | undefined): string => {
    if (!status) return '-';
    return MILITARY_STATUS_MAP[status] || status;
};
