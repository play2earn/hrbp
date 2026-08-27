import React from 'react';
import { 
  CheckCircle, 
  FileCheck2, 
  Mail, 
  Phone, 
  Plus, 
  Search, 
  ShieldCheck, 
  Trash2, 
  Users, 
  Eye, 
  X, 
  Star, 
  ThumbsUp, 
  AlertCircle, 
  MessageSquare, 
  Clock, 
  Award,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { Button, Card, Modal } from '../UIComponents';
import { api, EvaluationReviewerProfile, EvaluationTemplate } from '../../services/api';

const recConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
  recommend: { label: 'แนะนำให้รับ', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  recommend_with_condition: { label: 'แนะนำให้รับแบบมีเงื่อนไข', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  hold: { label: 'รอพิจารณาเพิ่มเติม', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
  not_recommend: { label: 'ไม่แนะนำให้รับ', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

interface CandidateEvaluationPanelProps {
  application: any;
  showToast: (message: string, type?: 'success' | 'error') => void;
}

export const CandidateEvaluationPanel: React.FC<CandidateEvaluationPanelProps> = ({ application, showToast }) => {
  const [bundle, setBundle] = React.useState<any>(null);
  const [templates, setTemplates] = React.useState<EvaluationTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [searching, setSearching] = React.useState(false);
  const [searchResults, setSearchResults] = React.useState<EvaluationReviewerProfile[]>([]);
  const [viewingReviewer, setViewingReviewer] = React.useState<any | null>(null);

  const load = React.useCallback(async () => {
    if (!application?.id) return;
    setLoading(true);
    const [bundleResult, templateResult] = await Promise.all([
      api.candidateEvaluations.getBundle(application.id),
      api.evaluationTemplates.list(true),
    ]);
    if (bundleResult.success) setBundle(bundleResult.data);
    else showToast(bundleResult.error?.message || 'โหลดข้อมูลประเมินไม่สำเร็จ', 'error');
    if (templateResult.success && templateResult.data) {
      setTemplates(templateResult.data);
      if (!selectedTemplateId && templateResult.data[0]?.id) setSelectedTemplateId(templateResult.data[0].id);
    } else {
      showToast(templateResult.error?.message || 'โหลดแบบประเมินไม่สำเร็จ', 'error');
    }
    setLoading(false);
  }, [application?.id, selectedTemplateId, showToast]);

  React.useEffect(() => {
    load();
  }, [application?.id]);

  const session = bundle?.session;
  const reviewers = bundle?.reviewers || [];
  const summary = bundle?.summary;
  const canEditReviewers = !session || session.status !== 'closed';

  const createSession = async () => {
    if (!selectedTemplateId) {
      showToast('กรุณาเลือกแบบประเมิน', 'error');
      return;
    }
    setBusy(true);
    const result = await api.candidateEvaluations.createSession(application.id, selectedTemplateId);
    setBusy(false);
    if (result.success) {
      await load();
      showToast('สร้างรอบประเมินแล้ว');
    } else {
      showToast(result.error?.message || 'สร้างรอบประเมินไม่สำเร็จ', 'error');
    }
  };

  const search = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    const result = await api.candidateEvaluations.searchEmployee(query.trim());
    setSearching(false);
    if (result.success && result.data) setSearchResults(result.data);
    else showToast(result.error?.message || 'ค้นหากรรมการไม่สำเร็จ', 'error');
  };

  const addReviewer = async (profile: EvaluationReviewerProfile) => {
    if (!session?.id) return;
    setBusy(true);
    const result = await api.candidateEvaluations.addReviewer(application.id, session.id, profile);
    setBusy(false);
    if (result.success) {
      setSearchResults([]);
      setQuery('');
      setBundle(result.data);
      showToast(`เพิ่ม ${profile.full_name} เป็นกรรมการแล้ว`);
    } else {
      showToast(result.error?.message || 'เพิ่มกรรมการไม่สำเร็จ', 'error');
    }
  };

  const removeReviewer = async (reviewerId: string) => {
    setBusy(true);
    const result = await api.candidateEvaluations.removeReviewer(application.id, reviewerId);
    setBusy(false);
    if (result.success) {
      setBundle(result.data);
      showToast('ลบกรรมการแล้ว');
    } else {
      showToast(result.error?.message || 'ลบกรรมการไม่สำเร็จ', 'error');
    }
  };

  const setStatus = async (next: 'active' | 'closed') => {
    if (!session?.id) return;
    if (next === 'active' && reviewers.length === 0) {
      showToast('กรุณาเพิ่มกรรมการอย่างน้อย 1 คนก่อนเปิดการประเมิน', 'error');
      return;
    }
    setBusy(true);
    const result = next === 'active'
      ? await api.candidateEvaluations.activate(application.id, session.id)
      : await api.candidateEvaluations.close(application.id, session.id);
    setBusy(false);
    if (result.success) {
      setBundle(result.data);
      showToast(next === 'active' ? 'เปิดการประเมินแล้ว กรรมการจะเห็นฟอร์มใน profile link' : 'ปิดการประเมินแล้ว');
    } else {
      showToast(result.error?.message || 'อัปเดตสถานะไม่สำเร็จ', 'error');
    }
  };

  return (
    <div className="mt-6 pt-4 border-t">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-indigo-500" /> การประเมินโดยกรรมการ (Interview Evaluation)
          </h4>
          <p className="text-xs text-gray-500 mt-0.5">ใช้ profile share link เดิม เมื่อเปิดการประเมิน กรรมการจะเห็นฟอร์มในหน้านั้น</p>
        </div>
        {session && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold w-fit ${
            session.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
            session.status === 'closed' ? 'bg-slate-200 text-slate-600' :
            'bg-amber-100 text-amber-700'
          }`}>
            {session.status === 'active' ? 'Active' : session.status === 'closed' ? 'Closed' : 'Draft'}
          </span>
        )}
      </div>

      {loading ? (
        <div className="text-center py-6 text-sm text-gray-400">กำลังโหลดข้อมูลประเมิน...</div>
      ) : !session ? (
        <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
          <label className="block text-xs font-bold text-gray-700">เลือกแบบประเมิน (Evaluation Template)</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={selectedTemplateId}
              onChange={e => setSelectedTemplateId(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} · Scale {template.scale_min}-{template.scale_max} (ผ่าน ≥ {template.passing_score_percent}%)
                </option>
              ))}
            </select>
            <Button onClick={createSession} isLoading={busy} disabled={!templates.length}>
              <Plus className="w-4 h-4 mr-2" /> สร้างรอบประเมิน
            </Button>
          </div>
          {!templates.length && <p className="text-xs text-rose-500">ยังไม่มีแบบประเมินที่ active กรุณาไปที่เมนู Evaluations ก่อน</p>}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-slate-50 border rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Template</div>
              <div className="text-sm font-semibold text-slate-800 truncate" title={session.template_snapshot?.name || '-'}>
                {session.template_snapshot?.name || '-'}
              </div>
            </div>
            <div className="bg-slate-50 border rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-bold">กรรมการ</div>
              <div className="text-sm font-semibold text-slate-800">{summary?.reviewer_count || 0} คน</div>
            </div>
            <div className="bg-slate-50 border rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-bold">ส่งแล้ว</div>
              <div className="text-sm font-semibold text-slate-800">
                <span className="text-emerald-600 font-bold">{summary?.submitted_count || 0}</span> / {summary?.reviewer_count || 0}
              </div>
            </div>
            <div className="bg-slate-50 border rounded-xl p-3">
              <div className="text-[10px] text-slate-400 uppercase font-bold">คะแนนเฉลี่ย</div>
              <div className="text-sm font-bold text-indigo-600">
                {summary?.submitted_count ? `${summary.average_percent}%` : '-'}
              </div>
            </div>
          </div>

          {canEditReviewers && (
            <form onSubmit={search} className="rounded-xl border bg-white p-3 space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="ค้นหากรรมการด้วยชื่อ เบอร์โทร email หรือรหัสพนักงาน"
                    className="w-full border rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <Button type="submit" variant="outline" isLoading={searching}>ค้นหา</Button>
              </div>
              {searchResults.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {searchResults.map(person => (
                    <div key={person.emp_id} className="border rounded-xl p-3 flex items-start gap-3 bg-slate-50">
                      <img src={person.avatar_url || ''} alt="" className="w-9 h-9 rounded-full object-cover bg-indigo-100" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">{person.full_name}</div>
                        <div className="text-xs text-slate-500 truncate">{person.position || '-'} · {person.department || '-'}</div>
                        <div className="text-[10px] text-slate-400 font-mono truncate">{person.emp_id}</div>
                      </div>
                      <Button size="sm" onClick={() => addReviewer(person)} disabled={busy}>เพิ่ม</Button>
                    </div>
                  ))}
                </div>
              )}
            </form>
          )}

          <div className="border rounded-xl overflow-hidden">
            <div className="px-3 py-2 bg-slate-50 border-b flex items-center justify-between text-xs font-bold text-slate-600">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" /> รายชื่อกรรมการ ({reviewers.length})
              </span>
              <span className="text-[11px] text-slate-400 font-normal">คลิกที่กรรมการเพื่อดูรายละเอียดคะแนน</span>
            </div>
            <div className="divide-y">
              {reviewers.map((reviewer: any) => {
                const isSubmitted = Boolean(reviewer.evaluation);
                const rec = reviewer.evaluation?.recommendation ? recConfig[reviewer.evaluation.recommendation] : null;

                return (
                  <div key={reviewer.id} className="p-3 flex flex-col sm:flex-row sm:items-center gap-3 justify-between hover:bg-slate-50/70 transition">
                    <div className="flex items-center gap-3 min-w-0">
                      <img src={reviewer.avatar_url || ''} alt="" className="w-10 h-10 rounded-full object-cover bg-indigo-100 shrink-0" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-slate-900 truncate flex items-center gap-2">
                          {reviewer.full_name || reviewer.emp_id}
                          {reviewer.emp_id && <span className="text-[11px] text-slate-400 font-mono font-normal">({reviewer.emp_id})</span>}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{reviewer.position || '-'} · {reviewer.department || '-'}</div>
                        <div className="flex flex-wrap gap-3 text-[10px] text-slate-400 mt-0.5">
                          {reviewer.email && <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3" />{reviewer.email}</span>}
                          {reviewer.phone && <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{reviewer.phone}</span>}
                          {reviewer.submitted_at && (
                            <span className="inline-flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" />
                              {new Date(reviewer.submitted_at).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {isSubmitted ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setViewingReviewer(reviewer)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-sm transition active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5" /> ดูผลประเมิน ({reviewer.evaluation.total_percent}%)
                          </button>
                          {rec && (
                            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border ${rec.bg} ${rec.color} ${rec.border} hidden md:inline-block`}>
                              {rec.label}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg inline-flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" /> รอประเมิน
                        </span>
                      )}
                      {session.status === 'draft' && (
                        <button type="button" onClick={() => removeReviewer(reviewer.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition" title="ลบกรรมการ">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              {reviewers.length === 0 && <div className="p-6 text-center text-sm text-gray-400">ยังไม่ได้เพิ่มกรรมการ</div>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-1">
            {session.status === 'draft' && (
              <Button onClick={() => setStatus('active')} isLoading={busy}>
                <ShieldCheck className="w-4 h-4 mr-2" /> เปิดการประเมิน
              </Button>
            )}
            {session.status === 'active' && (
              <Button variant="outline" onClick={() => setStatus('closed')} isLoading={busy}>
                ปิดการประเมิน (Close Session)
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Reviewer Evaluation Detail Modal */}
      {viewingReviewer && viewingReviewer.evaluation && (
        <Modal
          isOpen={Boolean(viewingReviewer)}
          onClose={() => setViewingReviewer(null)}
          title="ผลการประเมินรายบุคคล (Reviewer Scorecard)"
          size="lg"
        >
          <div className="space-y-6">
            {/* Reviewer Header Profile */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-3">
                <img
                  src={viewingReviewer.avatar_url || ''}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover bg-indigo-100 shrink-0 border-2 border-white shadow-sm"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                />
                <div>
                  <h4 className="font-bold text-base text-slate-900">
                    {viewingReviewer.full_name || viewingReviewer.emp_id}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {viewingReviewer.position || '-'} · {viewingReviewer.department || '-'}
                  </p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    รหัสพนักงาน: {viewingReviewer.emp_id}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right shrink-0">
                <div className="text-[10px] text-slate-400 uppercase font-bold">วันที่ส่งผลประเมิน</div>
                <div className="text-xs font-semibold text-slate-700 mt-0.5">
                  {viewingReviewer.submitted_at 
                    ? new Date(viewingReviewer.submitted_at).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
                    : '-'}
                </div>
              </div>
            </div>

            {/* Score & Recommendation KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 flex flex-col justify-between">
                <div className="text-xs font-bold text-indigo-900 uppercase">คะแนนรวม (Total Score)</div>
                <div className="my-2 flex items-baseline gap-2">
                  <span className="text-3xl font-black text-indigo-700">
                    {viewingReviewer.evaluation.total_percent}%
                  </span>
                  <span className="text-xs font-medium text-slate-500">
                    ({viewingReviewer.evaluation.total_score} คะแนน)
                  </span>
                </div>
                <div>
                  {viewingReviewer.evaluation.is_passed ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <CheckCircle2 className="w-3.5 h-3.5" /> ผ่านเกณฑ์
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      <XCircle className="w-3.5 h-3.5" /> ไม่ผ่านเกณฑ์
                    </span>
                  )}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 sm:col-span-2 flex flex-col justify-between">
                <div className="text-xs font-bold text-slate-600 uppercase">ผลเสนอแนะ (Recommendation)</div>
                <div className="my-2">
                  {(() => {
                    const rec = recConfig[viewingReviewer.evaluation.recommendation] || {
                      label: viewingReviewer.evaluation.recommendation,
                      color: 'text-slate-800',
                      bg: 'bg-white',
                      border: 'border-slate-200'
                    };
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-bold border ${rec.bg} ${rec.color} ${rec.border} shadow-sm`}>
                        <Award className="w-4 h-4" /> {rec.label}
                      </span>
                    );
                  })()}
                </div>
                <p className="text-xs text-slate-500">
                  แบบประเมิน: <span className="font-semibold text-slate-700">{session.template_snapshot?.name || '-'}</span> (เกณฑ์ผ่าน ≥ {session.template_snapshot?.passing_score_percent || 70}%)
                </p>
              </div>
            </div>

            {/* Qualitative Feedback Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                <div className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  <ThumbsUp className="w-4 h-4 text-emerald-600" /> จุดแข็ง (Strengths)
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingReviewer.evaluation.strengths || <span className="text-slate-400 italic">ไม่ได้ระบุ</span>}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100 space-y-1.5">
                <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600" /> ข้อกังวล (Concerns)
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingReviewer.evaluation.concerns || <span className="text-slate-400 italic">ไม่ได้ระบุ</span>}
                </p>
              </div>
            </div>

            {viewingReviewer.evaluation.comments && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-slate-500" /> ความคิดเห็นเพิ่มเติม (Additional Notes)
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {viewingReviewer.evaluation.comments}
                </p>
              </div>
            )}

            {/* Criteria Breakdown Table */}
            <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
                <span>คะแนนรายหัวข้อ (Criteria Breakdown)</span>
                <span>Scale {session.template_snapshot?.scale_min || 1} - {session.template_snapshot?.scale_max || 5}</span>
              </div>
              <div className="divide-y divide-slate-100">
                {(session.template_snapshot?.items || []).map((item: any, idx: number) => {
                  const itemId = String(item.id);
                  const scoreObj = viewingReviewer.evaluation.scores_json?.[itemId] || {};
                  const givenScore = scoreObj.score;
                  const maxScore = Number(session.template_snapshot?.scale_max || 5);

                  return (
                    <div key={item.id || idx} className="p-3.5 hover:bg-slate-50/80 transition flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="text-sm font-semibold text-slate-900 flex items-baseline gap-2">
                          <span className="text-xs text-indigo-600 font-bold">#{idx + 1}</span>
                          <span>{item.title}</span>
                          {item.weight && item.weight !== 1 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                              ค่าน้ำหนัก ×{item.weight}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                        )}
                        {scoreObj.comment && (
                          <div className="text-xs text-slate-600 bg-amber-50 border border-amber-100 p-2 rounded-lg mt-1 inline-block">
                            <span className="font-semibold text-amber-800">Note: </span>{scoreObj.comment}
                          </div>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2 self-end sm:self-center">
                        <div className="text-right">
                          <span className="text-lg font-extrabold text-slate-900">
                            {Number.isFinite(givenScore) ? givenScore : '-'}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">/{maxScore}</span>
                        </div>
                        <div className="flex gap-0.5">
                          {Array.from({ length: maxScore }).map((_, sIdx) => (
                            <div
                              key={sIdx}
                              className={`w-2.5 h-6 rounded-sm ${
                                sIdx < Number(givenScore)
                                  ? 'bg-indigo-600'
                                  : 'bg-slate-200'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setViewingReviewer(null)}>
                ปิดหน้าต่าง
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
