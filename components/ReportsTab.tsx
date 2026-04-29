import React, { useState, useEffect } from 'react';
import { Card } from './UIComponents';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { api } from '../services/api';
import { BarChart2, PieChart as PieChartIcon, Activity } from 'lucide-react';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

// Brand-specific BU color map
const BU_COLOR_MAP: Record<string, string> = {
  'ดั๊บเบิ้ล เอ': '#2563EB',   // Blue
  'Double A': '#2563EB',      // Support legacy data
  'NPS': '#EAB308',           // Yellow
  'ReLo': '#16A34A',          // Green
};
const FALLBACK_COLORS = ['#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#EF4444', '#0EA5E9'];

const getBuColor = (buName: string, index: number): string => {
  return BU_COLOR_MAP[buName] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
};

export const ReportsTab: React.FC = () => {
  const [executiveSummary, setExecutiveSummary] = useState<any[]>([]);
  const [recruiterKpi, setRecruiterKpi] = useState<any[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [execData, kpiData, rejectData] = await Promise.all([
        api.reports.getExecutiveSummary(),
        api.reports.getRecruiterKpi(),
        api.reports.getRejectionReasons()
      ]);
      setExecutiveSummary(execData);
      setRecruiterKpi(kpiData);
      setRejectionReasons(rejectData);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
          <Activity className="w-6 h-6 text-indigo-600" />
          Analytics Dashboard
        </h2>
        <p className="text-slate-500 mt-1">ภาพรวมการสรรหาและประสิทธิภาพการทำงาน (อัปเดตแบบเรียลไทม์)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Executive Summary by BU */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-indigo-500" />
            ภาพรวมการสรรหา (ตาม BU)
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={executiveSummary} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="business_unit" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="total_applications" name="ผู้สมัครทั้งหมด" radius={[4, 4, 0, 0]}>
                  {executiveSummary.map((entry: any, index: number) => (
                    <Cell key={`total-${index}`} fill={getBuColor(entry.business_unit, index)} />
                  ))}
                </Bar>
                <Bar dataKey="hired_count" name="รับเข้าทำงาน" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="rejected_count" name="ไม่ผ่าน/ปฏิเสธ" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending_count" name="รอดำเนินการ" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="interview_scheduled_count" name="นัดสัมภาษณ์" fill="#F97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Rejection Reasons */}
        <Card className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <PieChartIcon className="w-5 h-5 text-pink-500" />
            สัดส่วนสาเหตุที่ไม่รับเข้าทำงาน
          </h3>
          <div className="h-80">
            {rejectionReasons.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <Pie
                    data={rejectionReasons}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="rejection_reason"
                  >
                    {rejectionReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number, name: string, props: any) => {
                      const total = rejectionReasons.reduce((sum, entry) => sum + entry.count, 0);
                      const percent = ((value / total) * 100).toFixed(0);
                      return [`${value} รายการ (${percent}%)`, name];
                    }}
                  />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400">
                ไม่มีข้อมูลสาเหตุการปฏิเสธ
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Recruiter KPI Table */}
      <Card className="p-6 overflow-hidden">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Recruiter KPI & Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold rounded-tl-lg">ผู้รับผิดชอบ (Assigned To)</th>
                <th className="py-3 px-4 font-semibold text-center">เคสที่รับผิดชอบ</th>
                <th className="py-3 px-4 font-semibold text-center">เคส Active</th>
                <th className="py-3 px-4 font-semibold text-center text-red-600">เกิน SLA</th>
                <th className="py-3 px-4 font-semibold text-center">สัมภาษณ์แล้ว</th>
                <th className="py-3 px-4 font-semibold text-center text-emerald-600">รับเข้าทำงาน</th>
                <th className="py-3 px-4 font-semibold text-center text-amber-600">Time-to-Hire เฉลี่ย (วัน)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recruiterKpi.length > 0 ? (
                recruiterKpi.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-medium text-slate-800">{row.assigned_to || 'ไม่ได้ระบุผู้รับผิดชอบ'}</td>
                    <td className="py-3 px-4 text-center">{row.assigned_count}</td>
                    <td className="py-3 px-4 text-center">{row.active_count ?? '-'}</td>
                    <td className="py-3 px-4 text-center text-red-600 font-medium">{row.overdue_active_count ?? '-'}</td>
                    <td className="py-3 px-4 text-center">{row.interviewed_count}</td>
                    <td className="py-3 px-4 text-center text-emerald-600 font-medium">{row.hired_count}</td>
                    <td className="py-3 px-4 text-center font-medium">
                      {row.avg_days_to_hire !== null ? Math.round(row.avg_days_to_hire) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-500">
                    ไม่มีข้อมูล KPI ในขณะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
