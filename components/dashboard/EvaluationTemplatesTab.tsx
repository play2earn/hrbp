import React from 'react';
import { 
  ArrowLeft, 
  Check, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  FileCheck2, 
  Layers, 
  Plus, 
  Save, 
  Search, 
  Sliders, 
  Sparkles, 
  Trash2, 
  TrendingUp, 
  X,
  AlertCircle
} from 'lucide-react';
import { Button, Card, Input } from '../UIComponents';
import { api, EvaluationTemplate, EvaluationTemplateItem } from '../../services/api';

const recommendationDefaults = [
  { value: 'recommend', label: 'แนะนำให้รับ' },
  { value: 'recommend_with_condition', label: 'แนะนำให้รับแบบมีเงื่อนไข' },
  { value: 'hold', label: 'รอพิจารณาเพิ่มเติม' },
  { value: 'not_recommend', label: 'ไม่แนะนำให้รับ' },
];

export interface StandardRecommendationOption {
  value: string;
  label: string;
  sublabel: string;
  iconType: 'check_circle' | 'check' | 'sparkles' | 'x';
  iconBg: string;
  activeBorder: string;
  activeBg: string;
  activeText: string;
  badgeBg: string;
}

export const standardRecommendationOptions: StandardRecommendationOption[] = [
  {
    value: 'recommend',
    label: 'แนะนำให้รับ',
    sublabel: 'คุณสมบัติครบถ้วน เหมาะสมกับตำแหน่งงาน',
    iconType: 'check_circle',
    iconBg: 'bg-emerald-100 text-emerald-600',
    activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40',
    activeBg: 'bg-emerald-50/40',
    activeText: 'text-emerald-950',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    value: 'recommend_with_condition',
    label: 'แนะนำให้รับแบบมีเงื่อนไข',
    sublabel: 'รับได้แต่มีข้อสังเกต หรือมีเงื่อนไขเพิ่มเติม',
    iconType: 'check',
    iconBg: 'bg-blue-100 text-blue-600',
    activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40',
    activeBg: 'bg-blue-50/40',
    activeText: 'text-blue-950',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  {
    value: 'hold',
    label: 'รอพิจารณาเพิ่มเติม',
    sublabel: 'รอดูผู้สมัครคนอื่น หรือขอดูผลงานเพิ่มเติม',
    iconType: 'sparkles',
    iconBg: 'bg-amber-100 text-amber-600',
    activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40',
    activeBg: 'bg-amber-50/40',
    activeText: 'text-amber-950',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    value: 'not_recommend',
    label: 'ไม่แนะนำให้รับ',
    sublabel: 'คุณสมบัติยังไม่ผ่านเกณฑ์สำหรับตำแหน่งนี้',
    iconType: 'x',
    iconBg: 'bg-rose-100 text-rose-600',
    activeBorder: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/40',
    activeBg: 'bg-rose-50/40',
    activeText: 'text-rose-950',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-200',
  },
];

export const recommendationPresets = [
  {
    id: 'standard_4',
    name: 'มาตรฐาน 4 ระดับ',
    badge: 'ครบทุกเกณฑ์',
    values: ['recommend', 'recommend_with_condition', 'hold', 'not_recommend'],
  },
  {
    id: 'binary_2',
    name: 'ผ่าน / ไม่ผ่าน (2 ข้อ)',
    badge: 'กระชับ ตัดสินขาด',
    values: ['recommend', 'not_recommend'],
  },
  {
    id: 'screening_3',
    name: 'คัดกรองเบื้องต้น (3 ข้อ)',
    badge: 'Screening',
    values: ['recommend', 'hold', 'not_recommend'],
  },
];

const emptyTemplate = (): EvaluationTemplate => ({
  name: '',
  description: '',
  scale_min: 1,
  scale_max: 5,
  passing_score_percent: 70,
  recommendation_options: recommendationDefaults,
  is_active: true,
  items: [
    { sort_order: 1, title: 'ด้านบุคลิกภาพ / การแต่งกาย', description: 'ความเรียบร้อย ความพร้อม และความน่าเชื่อถือ', weight: 1, is_required: true, has_comment: false, is_active: true },
    { sort_order: 2, title: 'ด้านความรู้ความสามารถทางเทคนิค', description: 'ความรู้ในตำแหน่งงานและทักษะที่เกี่ยวข้อง', weight: 2, is_required: true, has_comment: true, is_active: true },
    { sort_order: 3, title: 'ด้านการสื่อสารและการทำงานเป็นทีม', description: 'การตอบคำถามตรงประเด็น และทัศนคติต่อการร่วมงาน', weight: 1.5, is_required: true, has_comment: false, is_active: true },
  ],
});

const normalizeEditor = (template: EvaluationTemplate): EvaluationTemplate => ({
  ...template,
  scale_min: Number(template.scale_min ?? 1),
  scale_max: Number(template.scale_max ?? 5),
  passing_score_percent: Number(template.passing_score_percent ?? 70),
  recommendation_options: template.recommendation_options?.length ? template.recommendation_options : recommendationDefaults,
  items: (template.items || []).map((item, index) => ({
    ...item,
    sort_order: item.sort_order || index + 1,
    weight: Number(item.weight || 1),
    is_required: item.is_required !== false,
    has_comment: Boolean(item.has_comment),
    is_active: item.is_active !== false,
  })),
});

const renderOptionIcon = (type: StandardRecommendationOption['iconType']) => {
  switch (type) {
    case 'check_circle':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'check':
      return <Check className="w-4 h-4" />;
    case 'sparkles':
      return <Sparkles className="w-4 h-4" />;
    case 'x':
      return <X className="w-4 h-4" />;
    default:
      return <CheckCircle2 className="w-4 h-4" />;
  }
};

export const TemplateUserAvatar: React.FC<{
  user?: { name?: string; emp_id?: string | null; avatar_url?: string | null } | null;
  name?: string;
  size?: 'xs' | 'sm' | 'md';
}> = ({ user, name, size = 'sm' }) => {
  const [imgError, setImgError] = React.useState(false);
  const displayName = user?.name || name || 'User';
  const avatarUrl = user?.avatar_url;

  const sizeClasses = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-7 h-7 text-[10px]',
    md: 'w-9 h-9 text-xs',
  }[size];

  const getInitials = (str: string) => {
    if (!str || str.toLowerCase() === 'system') return 'SY';
    const cleaned = str.replace(/\(.*?\)/g, '').trim();
    const parts = cleaned.split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return cleaned.substring(0, 2).toUpperCase();
  };

  const getGradient = (str: string) => {
    const gradients = [
      'from-indigo-500 to-purple-600',
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-amber-500 to-orange-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600',
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return gradients[Math.abs(hash) % gradients.length];
  };

  if (avatarUrl && !imgError) {
    return (
      <div className={`relative shrink-0 ${sizeClasses} rounded-full overflow-hidden border border-slate-200 shadow-xs bg-slate-100`}>
        <img
          src={avatarUrl}
          alt={displayName}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`shrink-0 ${sizeClasses} rounded-full bg-gradient-to-br ${getGradient(displayName)} text-white font-bold flex items-center justify-center border border-white shadow-xs select-none`}
      title={displayName}
    >
      {getInitials(displayName)}
    </div>
  );
};

export interface EvaluationTemplatesTabProps {
  showToast: (message: string, type?: 'success' | 'error') => void;
  onBackToHub?: () => void;
}

export const EvaluationTemplatesTab: React.FC<EvaluationTemplatesTabProps> = ({ showToast, onBackToHub }) => {
  const [templates, setTemplates] = React.useState<EvaluationTemplate[]>([]);
  const [viewMode, setViewMode] = React.useState<'list' | 'edit'>('list');
  const [editor, setEditor] = React.useState<EvaluationTemplate>(emptyTemplate());
  const [loading, setLoading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [openingId, setOpeningId] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');

  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.evaluationTemplates.list(false);
      if (result.success && result.data) {
        setTemplates(result.data);
      } else {
        showToast(result.error?.message || 'โหลดแบบประเมินไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'โหลดแบบประเมินไม่สำเร็จ', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  React.useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreateNew = () => {
    setEditor(emptyTemplate());
    setViewMode('edit');
  };

  const handleEditTemplate = async (templateId: string) => {
    setOpeningId(templateId);
    try {
      const result = await api.evaluationTemplates.get(templateId);
      if (result.success && result.data) {
        setEditor(normalizeEditor(result.data));
        setViewMode('edit');
      } else {
        showToast(result.error?.message || 'โหลดแบบประเมินไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'โหลดแบบประเมินไม่สำเร็จ', 'error');
    } finally {
      setOpeningId(null);
    }
  };

  const isOptionActive = (value: string) => {
    const current = editor.recommendation_options?.length ? editor.recommendation_options : recommendationDefaults;
    return current.some(opt => opt.value === value);
  };

  const toggleOption = (value: string) => {
    const current = editor.recommendation_options?.length ? editor.recommendation_options : recommendationDefaults;
    const exists = current.some(opt => opt.value === value);
    if (exists) {
      if (current.length <= 2) {
        showToast('ต้องมีตัวเลือกผลการประเมินเปิดใช้งานอย่างน้อย 2 ตัวเลือก', 'error');
        return;
      }
      const updated = current.filter(opt => opt.value !== value);
      setEditor(prev => ({ ...prev, recommendation_options: updated }));
    } else {
      const std = standardRecommendationOptions.find(o => o.value === value);
      if (std) {
        const updated = [...current, { value: std.value, label: std.label }];
        const ordered = standardRecommendationOptions
          .filter(s => updated.some(u => u.value === s.value))
          .map(s => ({ value: s.value, label: s.label }));
        setEditor(prev => ({ ...prev, recommendation_options: ordered }));
      }
    }
  };

  const applyPreset = (presetValues: string[]) => {
    const selected = standardRecommendationOptions
      .filter(s => presetValues.includes(s.value))
      .map(s => ({ value: s.value, label: s.label }));
    setEditor(prev => ({ ...prev, recommendation_options: selected }));
    showToast('ปรับใช้ชุดตัวเลือกเรียบร้อย');
  };

  const isPresetActive = (presetValues: string[]) => {
    const current = editor.recommendation_options?.length ? editor.recommendation_options : recommendationDefaults;
    if (current.length !== presetValues.length) return false;
    return presetValues.every(v => current.some(c => c.value === v));
  };

  const patchItem = (index: number, patch: Partial<EvaluationTemplateItem>) => {
    setEditor(prev => ({
      ...prev,
      items: (prev.items || []).map((item, idx) => idx === index ? { ...item, ...patch } : item),
    }));
  };

  const addItem = () => {
    setEditor(prev => ({
      ...prev,
      items: [
        ...(prev.items || []),
        { 
          sort_order: (prev.items || []).length + 1, 
          title: '', 
          description: '', 
          weight: 1, 
          is_required: true, 
          has_comment: false, 
          is_active: true 
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    if ((editor.items || []).length <= 1) {
      showToast('ต้องมีหัวข้อประเมินอย่างน้อย 1 หัวข้อ', 'error');
      return;
    }
    setEditor(prev => ({
      ...prev,
      items: (prev.items || []).filter((_, idx) => idx !== index).map((item, idx) => ({ ...item, sort_order: idx + 1 })),
    }));
  };

  const save = async () => {
    if (!editor.name.trim()) {
      showToast('กรุณาระบุชื่อแบบประเมิน', 'error');
      return;
    }
    const validItems = (editor.items || []).filter(item => item.title.trim());
    if (validItems.length === 0) {
      showToast('กรุณาเพิ่มหัวข้อประเมินอย่างน้อย 1 หัวข้อ', 'error');
      return;
    }
    if (editor.scale_max <= editor.scale_min) {
      showToast('คะแนนสูงสุดต้องมากกว่าคะแนนต่ำสุด', 'error');
      return;
    }

    const validRecs = (editor.recommendation_options?.length ? editor.recommendation_options : recommendationDefaults)
      .filter(r => r.value && r.label);
    if (validRecs.length < 2) {
      showToast('กรุณาเลือกตัวเลือกผลการประเมินอย่างน้อย 2 ตัวเลือก', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...editor,
        name: editor.name.trim(),
        description: editor.description?.trim() || null,
        recommendation_options: validRecs,
        items: validItems.map((item, index) => ({
          ...item,
          sort_order: index + 1,
          title: item.title.trim(),
          description: item.description?.trim() || null,
          weight: Math.max(0.1, Number(item.weight || 1)),
        })),
      };
      const result = await api.evaluationTemplates.save(payload);
      if (result.success && result.data) {
        const saved = normalizeEditor(result.data);
        setEditor(saved);
        setTemplates(prev => {
          const exists = prev.some(t => t.id === saved.id);
          if (exists) {
            return prev.map(t => (t.id === saved.id ? { ...saved, item_count: saved.items?.length || 0 } : t));
          }
          return [{ ...saved, item_count: saved.items?.length || 0 }, ...prev];
        });
        setViewMode('list');
        showToast('บันทึกแบบประเมินเรียบร้อย');
        loadTemplates();
      } else {
        showToast(result.error?.message || 'บันทึกแบบประเมินไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'บันทึกแบบประเมินไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const duplicate = async () => {
    if (!editor.id) return;
    setSaving(true);
    try {
      const result = await api.evaluationTemplates.duplicate(editor.id);
      if (result.success && result.data) {
        const duplicated = normalizeEditor(result.data);
        setEditor(duplicated);
        setTemplates(prev => [{ ...duplicated, item_count: duplicated.items?.length || 0 }, ...prev]);
        showToast('คัดลอกแบบประเมินเรียบร้อย');
        setViewMode('edit');
        loadTemplates();
      } else {
        showToast(result.error?.message || 'คัดลอกแบบประเมินไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'คัดลอกแบบประเมินไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async () => {
    if (!editor.id || !window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบแบบประเมิน "${editor.name}"?`)) return;
    const deletingId = editor.id;
    setSaving(true);
    try {
      const result = await api.evaluationTemplates.delete(deletingId);
      if (result.success) {
        setTemplates(prev => prev.filter(t => t.id !== deletingId));
        showToast('ลบแบบประเมินแล้ว');
        setViewMode('list');
        loadTemplates();
      } else {
        showToast(result.error?.message || 'ลบแบบประเมินไม่สำเร็จ', 'error');
      }
    } catch (err: any) {
      showToast(err?.message || 'ลบแบบประเมินไม่สำเร็จ', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Calculate total weight and stats
  const totalWeight = (editor.items || []).reduce((sum, it) => sum + (Number(it.weight) || 1), 0);
  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = templates.filter(t => t.is_active).length;

  return (
    <div className="space-y-6">
      {viewMode === 'list' ? (
        /* ========================================================= */
        /* VIEW 1: TEMPLATES DASHBOARD / LIST VIEW                    */
        /* ========================================================= */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              {onBackToHub && (
                <button
                  type="button"
                  onClick={onBackToHub}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> กลับหน้า Master Data Hub
                </button>
              )}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Evaluation Templates</h2>
                  <p className="text-sm text-slate-500">
                    จัดการแบบประเมินผู้สมัคร, Rubric เกณฑ์คะแนน, และผลการประเมินสำหรับกรรมการ
                  </p>
                </div>
              </div>
            </div>
            <Button onClick={handleCreateNew} className="w-full sm:w-auto shadow-md shadow-indigo-500/20">
              <Plus className="w-4 h-4 mr-2" /> สร้างแบบประเมินใหม่ (Create Template)
            </Button>
          </div>

          {/* KPI Stats Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">แบบประเมินทั้งหมด</span>
                <Layers className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">{templates.length}</div>
              <div className="text-xs text-slate-500 mt-1">Rubric Templates</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">เปิดใช้งาน (Active)</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-black text-emerald-600">{activeCount}</div>
              <div className="text-xs text-slate-500 mt-1">พร้อมใช้งานในรอบประเมิน</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">Scale มาตรฐาน</span>
                <Sliders className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-2xl font-black text-slate-900">1 - 5</div>
              <div className="text-xs text-slate-500 mt-1">ระดับคะแนนต่อหัวข้อ</div>
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider">เกณฑ์ผ่านเริ่มต้น</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-black text-indigo-600">≥ 70%</div>
              <div className="text-xs text-slate-500 mt-1">Weighted Passing Score</div>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex items-center justify-between gap-4 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="ค้นหาแบบประเมินตามชื่อ หรือคำอธิบาย..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
              />
            </div>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg bg-slate-100"
              >
                Clear
              </button>
            )}
          </div>

          {/* Templates Grid */}
          {loading && templates.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="text-sm">กำลังโหลดแบบประเมิน...</div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-16 bg-white border border-dashed border-slate-200 rounded-3xl p-8 space-y-3">
              <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="text-base font-bold text-slate-700">ไม่พบแบบประเมิน</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {searchQuery ? 'ไม่พบแบบประเมินที่ตรงกับคำค้นหา' : 'ยังไม่มีแบบประเมินที่ตรงกับการค้นหา หรือยังไม่ได้สร้างแบบประเมิน'}
              </p>
              <Button onClick={handleCreateNew} size="sm">
                <Plus className="w-4 h-4 mr-1.5" /> สร้างแบบประเมินแรก
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                        <FileCheck2 className="w-5 h-5" />
                      </div>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        template.is_active 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {template.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition">
                        {template.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                        {template.description || 'ไม่มีคำอธิบายเพิ่มเติม'}
                      </p>
                    </div>

                    {/* Meta tags */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        Scale {template.scale_min} - {template.scale_max}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                        เกณฑ์ผ่าน ≥ {template.passing_score_percent}%
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700">
                        {template.item_count || 0} หัวข้อประเมิน
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                        {(template.recommendation_options?.length ?? 4)} ตัวเลือกสรุปผล
                      </span>
                    </div>
                  </div>

                  {/* Creator / Updater Info with Avatar */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <TemplateUserAvatar user={template.updater || template.creator} name={template.updated_by || template.created_by} size="sm" />
                        <div className="min-w-0">
                          <div className="text-[10px] text-slate-400 font-medium leading-none mb-0.5">
                            {template.updated_at && template.updated_by ? 'แก้ไขล่าสุดโดย' : 'สร้างโดย'}
                          </div>
                          <div className="text-xs font-bold text-slate-700 truncate" title={template.updater?.name || template.updated_by || template.creator?.name || template.created_by || 'System'}>
                            {template.updater?.name || template.updated_by || template.creator?.name || template.created_by || 'System'}
                          </div>
                        </div>
                      </div>

                      <span className="text-[11px] text-slate-400 shrink-0 font-medium">
                        {template.updated_at
                          ? new Date(template.updated_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                          : template.created_at
                          ? new Date(template.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
                          : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {template.created_by && template.updated_by && template.created_by !== template.updated_by ? (
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>สร้างโดย:</span>
                          <TemplateUserAvatar user={template.creator} name={template.created_by} size="xs" />
                          <span className="truncate max-w-[110px]">{template.creator?.name || template.created_by}</span>
                        </div>
                      ) : (
                        <span />
                      )}

                      <button 
                        type="button"
                        disabled={openingId === template.id}
                        onClick={() => template.id && handleEditTemplate(template.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white disabled:opacity-50 border border-indigo-200/80 transition-all duration-200 shadow-xs active:scale-95"
                      >
                        {openingId === template.id ? 'กำลังเปิด...' : 'แก้ไขแบบประเมิน'} <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================= */
        /* VIEW 2: FULL-WIDTH EXPANSIVE TEMPLATE EDITOR               */
        /* ========================================================= */
        <div className="space-y-6">
          {/* Top Bar Navigation */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-sm"
                title="กลับไปหน้ารายการแบบประเมิน"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Evaluation Template Editor</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    editor.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {editor.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  {editor.id ? (editor.name || 'แก้ไขแบบประเมิน') : 'สร้างแบบประเมินใหม่'}
                </h2>

                {editor.id && (
                  <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
                    {(editor.creator || editor.created_by) && (
                      <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70 text-xs">
                        <span className="text-slate-400 text-[10px] font-medium">สร้างโดย:</span>
                        <TemplateUserAvatar user={editor.creator} name={editor.created_by} size="xs" />
                        <span className="font-bold text-slate-700">{editor.creator?.name || editor.created_by}</span>
                        {editor.created_at && (
                          <span className="text-slate-400 text-[10px]">
                            • {new Date(editor.created_at).toLocaleDateString('th-TH')}
                          </span>
                        )}
                      </div>
                    )}
                    {(editor.updater || editor.updated_by) && (
                      <div className="flex items-center gap-1.5 bg-indigo-50/80 px-2.5 py-1 rounded-lg border border-indigo-100 text-xs">
                        <span className="text-indigo-400 text-[10px] font-medium">แก้ไขล่าสุด:</span>
                        <TemplateUserAvatar user={editor.updater} name={editor.updated_by} size="xs" />
                        <span className="font-bold text-indigo-900">{editor.updater?.name || editor.updated_by}</span>
                        {editor.updated_at && (
                          <span className="text-indigo-400 text-[10px]">
                            • {new Date(editor.updated_at).toLocaleDateString('th-TH')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <Button variant="outline" onClick={() => setViewMode('list')}>
                ยกเลิก
              </Button>
              {editor.id && (
                <>
                  <Button variant="outline" onClick={duplicate} isLoading={saving}>
                    <Copy className="w-4 h-4 mr-1.5" /> Duplicate
                  </Button>
                  <Button variant="danger" onClick={deleteTemplate} isLoading={saving}>
                    <Trash2 className="w-4 h-4 mr-1.5" /> ลบ
                  </Button>
                </>
              )}
              <Button onClick={save} isLoading={saving} className="shadow-md shadow-indigo-500/20">
                <Save className="w-4 h-4 mr-1.5" /> บันทึกแบบประเมิน (Save)
              </Button>
            </div>
          </div>

          {/* Section 1: Template General Settings */}
          <Card className="p-6 space-y-5 rounded-3xl border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">ข้อมูลทั่วไปและระบบคะแนน (General & Scoring Setup)</h3>
                  <p className="text-xs text-slate-500">กำหนดชื่อแบบประเมิน, ระดับคะแนนต่ำสุด-สูงสุด, และเกณฑ์ผ่านรวม</p>
                </div>
              </div>

              <label className="inline-flex items-center gap-2 cursor-pointer bg-slate-50 hover:bg-slate-100 px-3.5 py-2 rounded-xl border border-slate-200 transition">
                <input
                  type="checkbox"
                  checked={editor.is_active}
                  onChange={e => setEditor(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-sm font-semibold text-slate-700">เปิดใช้งาน (Active)</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="ชื่อแบบประเมิน (Template Name)"
                  placeholder="เช่น แบบประเมินทั่วไป 10 ด้าน, แบบประเมินทักษะทางเทคนิค (IT)"
                  value={editor.name}
                  onChange={e => setEditor(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">คำอธิบายแบบประเมิน (Description)</label>
                <textarea
                  value={editor.description || ''}
                  onChange={e => setEditor(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="ระบุวัตถุประสงค์ คำแนะนำสำหรับกรรมการ หรือระดับตำแหน่งที่ใช้แบบประเมินนี้..."
                  rows={2}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              <div>
                <Input
                  label="คะแนนต่ำสุด (Scale Min)"
                  type="number"
                  value={editor.scale_min}
                  onChange={e => setEditor(prev => ({ ...prev, scale_min: Number(e.target.value) }))}
                />
              </div>

              <div>
                <Input
                  label="คะแนนสูงสุด (Scale Max)"
                  type="number"
                  value={editor.scale_max}
                  onChange={e => setEditor(prev => ({ ...prev, scale_max: Number(e.target.value) }))}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  เกณฑ์ผ่านขั้นต่ำ (Passing Score Threshold): <span className="text-indigo-600 font-extrabold">{editor.passing_score_percent}%</span>
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={5}
                    value={editor.passing_score_percent}
                    onChange={e => setEditor(prev => ({ ...prev, passing_score_percent: Number(e.target.value) }))}
                    className="flex-1 accent-indigo-600"
                  />
                  <div className="w-20">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={editor.passing_score_percent}
                      onChange={e => setEditor(prev => ({ ...prev, passing_score_percent: Number(e.target.value) }))}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 2: Rubric & Criteria Builder (FULL WIDTH EXPANSIVE) */}
          <Card className="p-6 space-y-4 rounded-3xl border-slate-200/80 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    หัวข้อประเมิน (Evaluation Criteria & Rubrics)
                    <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {(editor.items || []).length} หัวข้อ
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    กำหนดหัวข้อ, น้ำหนักคะแนน, ข้อบังคับ (Required), และคำอธิบาย Guideline สำหรับกรรมการ
                  </p>
                </div>
              </div>

              <button 
                type="button"
                onClick={addItem} 
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-600 hover:text-white border border-indigo-200/80 transition-all duration-200 shadow-sm active:scale-95 shrink-0"
              >
                <Plus className="w-4 h-4" /> เพิ่มหัวข้อประเมิน (Add Criterion)
              </button>
            </div>

            {/* Criteria items list */}
            <div className="space-y-4">
              {(editor.items || []).map((item, index) => {
                const weight = Number(item.weight || 1);
                const weightPercent = totalWeight > 0 ? ((weight / totalWeight) * 100).toFixed(1) : '0';

                return (
                  <div
                    key={index}
                    className="p-5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl transition space-y-3"
                  >
                    {/* Row 1: Item Index, Title, Weight, Switches, Delete */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                      {/* Badge # */}
                      <div className="md:col-span-1 flex items-center pt-2">
                        <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                          #{index + 1}
                        </span>
                      </div>

                      {/* Criterion Title */}
                      <div className="md:col-span-6">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          ชื่อหัวข้อประเมิน <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={e => patchItem(index, { title: e.target.value })}
                          placeholder="เช่น ด้านความรู้ความสามารถทางด้านเทคนิคที่เกี่ยวกับงาน"
                          className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-900"
                        />
                      </div>

                      {/* Weight */}
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          น้ำหนัก (Weight)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.25"
                            min="0.1"
                            value={item.weight}
                            onChange={e => patchItem(index, { weight: Number(e.target.value) })}
                            className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-900"
                          />
                          <span className="text-[10px] text-indigo-600 font-bold block mt-0.5">
                            ~{weightPercent}% ของรวม
                          </span>
                        </div>
                      </div>

                      {/* Checkboxes */}
                      <div className="md:col-span-2 flex flex-col gap-1.5 pt-4">
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.is_required}
                            onChange={e => patchItem(index, { is_required: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-indigo-600"
                          />
                          จำเป็น (Required)
                        </label>
                        <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.has_comment}
                            onChange={e => patchItem(index, { has_comment: e.target.checked })}
                            className="w-3.5 h-3.5 rounded text-indigo-600"
                          />
                          มีช่อง Note
                        </label>
                      </div>

                      {/* Delete */}
                      <div className="md:col-span-1 flex justify-end pt-3">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                          title="ลบหัวข้อนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Row 2: Description / Guideline full-width */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        คำอธิบาย / Guideline เกณฑ์การให้คะแนนสำหรับกรรมการ (Optional)
                      </label>
                      <textarea
                        value={item.description || ''}
                        onChange={e => patchItem(index, { description: e.target.value })}
                        placeholder="ระบุคำอธิบายหรือตัวอย่างพฤติกรรม เช่น 5 = มีความเชี่ยวชาญสูงและสามารถถ่ายทอดได้, 3 = ปานกลางตามเกณฑ์ขั้นต่ำ..."
                        rows={2}
                        className="w-full border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700"
                      />
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={addItem}
                className="w-full py-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/40 hover:bg-indigo-50 text-indigo-700 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" /> เพิ่มหัวข้อประเมินถัดไป (Add New Criterion)
              </button>
            </div>
          </Card>

          {/* Section 3: Recommendation Options */}
          <Card className="p-6 space-y-5 rounded-3xl border-slate-200/80 shadow-sm bg-white">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-base text-slate-900">ผลการประเมินเสนอแนะ (Recommendation Options)</h3>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                      เปิดใช้งาน {(editor.recommendation_options?.length ?? 4)} / {standardRecommendationOptions.length} ข้อ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    คลิกเพื่อเปิด/ปิดตัวเลือกสรุปผลสัมภาษณ์ที่ต้องการให้กรรมการเลือกใช้งานในแบบประเมินนี้ (เปิดอย่างน้อย 2 ตัวเลือก)
                  </p>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Preset:</span>
                {recommendationPresets.map(preset => {
                  const active = isPresetActive(preset.values);
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.values)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                        active
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {active && <Check className="w-3.5 h-3.5" />}
                      <span>{preset.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Toggle Option Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {standardRecommendationOptions.map((opt) => {
                const active = isOptionActive(opt.value);
                return (
                  <div
                    key={opt.value}
                    onClick={() => toggleOption(opt.value)}
                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer select-none flex flex-col justify-between group ${
                      active
                        ? `${opt.activeBorder} shadow-sm hover:shadow-md`
                        : 'bg-slate-50/50 border-dashed border-slate-300 opacity-60 hover:opacity-100 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition ${
                          active ? opt.iconBg : 'bg-slate-200/80 text-slate-400'
                        }`}>
                          {renderOptionIcon(opt.iconType)}
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition ${
                          active
                            ? opt.badgeBg
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {active ? '✓ เปิดใช้งาน' : 'ปิดอยู่'}
                        </span>
                      </div>

                      <div className={`text-sm font-bold transition ${active ? opt.activeText : 'text-slate-500'}`}>
                        {opt.label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {opt.value}
                      </div>

                      <p className={`text-xs mt-2 line-clamp-2 leading-relaxed transition ${
                        active ? 'text-slate-600' : 'text-slate-400'
                      }`}>
                        {opt.sublabel}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                      <span className={`font-medium ${active ? 'text-indigo-600 group-hover:underline' : 'text-slate-400'}`}>
                        {active ? 'คลิกเพื่อปิด' : 'คลิกเพื่อเปิดใช้งาน'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50/90 rounded-xl p-3 border border-slate-200/70">
              <AlertCircle className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                เมื่อแชร์แบบฟอร์มสัมภาษณ์ให้กรรมการ ตัวเลือกในดรอปดาวน์จะแสดงเฉพาะหัวข้อที่คุณเปิดใช้งานไว้เท่านั้น
              </span>
            </div>
          </Card>

          {/* Bottom Sticky Action Bar */}
          <div className="sticky bottom-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              รวม <span className="font-bold text-slate-900">{(editor.items || []).length}</span> หัวข้อ · 
              น้ำหนักรวม <span className="font-bold text-indigo-600">{totalWeight}</span> · 
              เกณฑ์ผ่าน <span className="font-bold text-indigo-600">{editor.passing_score_percent}%</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <Button variant="outline" onClick={() => setViewMode('list')}>
                ยกเลิก (Cancel)
              </Button>
              <Button onClick={save} isLoading={saving} className="shadow-md shadow-indigo-500/20">
                <Save className="w-4 h-4 mr-1.5" /> บันทึกแบบประเมิน (Save Template)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
