// constants/changelogData.ts

export type ChangelogCategoryType = 'feature' | 'improvement' | 'security' | 'fix';

export interface ChangelogCategory {
  type: ChangelogCategoryType;
  label: string;
  items: string[];
}

export interface ChangelogItem {
  version: string;
  date: string;
  title: string;
  badge?: string;
  description?: string;
  categories: ChangelogCategory[];
}

export const CHANGELOG_DATA: ChangelogItem[] = [
  {
    version: 'v2.4.1',
    date: '4 กันยายน 2569',
    title: 'แบบฟอร์มขออนุมัติจ้างงานระดับผู้บริหาร (Executive Memo) & ความปลอดภัย',
    badge: 'ล่าสุด',
    description: 'เพิ่มแบบฟอร์มขออนุมัติจ้างงานระดับผู้บริหาร/ผู้มีประสบการณ์ ปรับปรุงระบบบันทึกรูปภาพคุณภาพสูง และจำกัดสิทธิ์ความปลอดภัยในระบบตรวจสอบใบสมัครซ้ำ',
    categories: [
      {
        type: 'feature',
        label: 'ฟีเจอร์ใหม่',
        items: [
          'เพิ่มแบบฟอร์มขออนุมัติจ้างงานระดับผู้บริหาร / ผู้มีประสบการณ์ (Executive & Experienced Hire Memo)',
          'ตารางสิทธิประโยชน์พนักงานต่างชาติ (Others Benefit / Expat Clause) 10 หัวข้อหลัก พร้อมระบบ Default ปิด และ Auto-Detect ตามสัญชาติผู้สมัคร',
          'ระบบคำนวณอายุงานอัตโนมัติในตารางประวัติการทำงาน พร้อมแถบสรุปรวมประสบการณ์ทำงานทั้งหมด (ปีและเดือน)'
        ]
      },
      {
        type: 'improvement',
        label: 'ปรับปรุงประสิทธิภาพ',
        items: [
          'ปรับปรุงระบบ Save as Image (PNG) ตัดขอบรูปถ่ายผู้สมัครสัดส่วน 7:9 อัตโนมัติ (Retina 4x) คมชัดสมส่วน ไม่โดนบีบแบน',
          'แยกการแสดงผลภาษาไทย (TH) และอังกฤษ (EN) สะอาดตา 100% ปราศจากคำภาษาอังกฤษปะปนในโหมดภาษาไทย',
          'สถานที่ปฏิบัติงาน / Work Location เชื่อมโยงฐานข้อมูลส่วนกลาง (DDL) พร้อมระบบ Auto-Sync สองทาง'
        ]
      },
      {
        type: 'security',
        label: 'ความปลอดภัย',
        items: [
          'จำกัดสิทธิ์ปุ่มลบใบสมัครในระบบตรวจสอบใบสมัครซ้ำ (Duplicate Candidate Resolution) ให้ใช้งานได้เฉพาะผู้ดูแลระบบ (Admin) เท่านั้น'
        ]
      }
    ]
  },
  {
    version: 'v2.4.0',
    date: '3 กันยายน 2569',
    title: 'ระบบเปรียบเทียบและจัดการใบสมัครซ้ำ (Duplicate Candidate Resolution)',
    description: 'พัฒนาระบบตรวจสอบและแก้ไขปัญหาผู้สมัครส่งใบสมัครซ้ำซ้อน ช่วยให้ HR ทำงานได้อย่างถูกต้องและรวดเร็ว',
    categories: [
      {
        type: 'feature',
        label: 'ฟีเจอร์ใหม่',
        items: [
          'ระบบตรวจจับใบสมัครซ้ำซ้อนอัตโนมัติ (ตรวจจากเลขบัตรประชาชน, เบอร์โทรศัพท์, และชื่อ-นามสกุล)',
          'หน้าต่าง Modal เปรียบเทียบใบสมัครซ้ำแบบเคียงข้าง (Side-by-side Comparison) พร้อมไฮไลท์ใบล่าสุดและประวัติเดิม',
          'ฟังก์ชันลบใบสมัครซ้ำที่ปลอดภัย พร้อมระบบลบไฟล์แนบที่ไม่ได้ใช้ใน S3/R2 Storage อัตโนมัติ'
        ]
      },
      {
        type: 'improvement',
        label: 'ปรับปรุงการทำงาน',
        items: [
          'ปรับปรุงระบบค้นหาตำแหน่งงานแบบ 2 ภาษา (Bilingual Search) และมาตรฐานตัวเลือก General Application',
          'ปรับปรุง Contrast สีปุ่มใน Dark Banner และแท็บคัดกรองในกล่องค้นหา'
        ]
      }
    ]
  },
  {
    version: 'v2.3.5',
    date: '2 กันยายน 2569',
    title: 'การเชื่อมโยงระบบจัดเก็บไฟล์ S3 / Cloudflare R2 & เอกสาร PDF',
    description: 'เพิ่มประสิทธิภาพการจัดเก็บไฟล์เอกสารและระบบส่งต่อข้อมูล',
    categories: [
      {
        type: 'feature',
        label: 'ฟีเจอร์ใหม่',
        items: [
          'ระบบดาวน์โหลดและแยกไฟล์เอกสาร PDF พร้อมระบบ Preview เอกสารแนบความเร็วสูง',
          'หน้าต่างตรวจสอบ Traffic และ History การใช้งาน API Key แบบ 2XL Widescreen'
        ]
      },
      {
        type: 'security',
        label: 'ความปลอดภัย',
        items: [
          'ระบบ Signed URL และ Proxy ป้องกันการเข้าถึงไฟล์แนบโดยไม่ได้รับอนุญาต',
          'บันทึก System Activity Logs ตรวจสอบประวัติการเข้าถึงข้อมูลตามเกณฑ์ PDPA'
        ]
      }
    ]
  }
];

export const LATEST_CHANGELOG_VERSION = CHANGELOG_DATA[0]?.version || 'v2.4.1';
const CHANGELOG_STORAGE_KEY = 'hrbp_last_seen_changelog';

export function hasUnreadChangelog(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const lastSeen = localStorage.getItem(CHANGELOG_STORAGE_KEY);
    return lastSeen !== LATEST_CHANGELOG_VERSION;
  } catch {
    return false;
  }
}

export function markChangelogAsRead(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CHANGELOG_STORAGE_KEY, LATEST_CHANGELOG_VERSION);
  } catch (e) {
    console.warn('Failed to mark changelog as read', e);
  }
}
