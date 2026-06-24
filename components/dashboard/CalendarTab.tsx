import React, { useState, useMemo } from 'react';
import { Card, Button, Input, Select, Modal } from '../UIComponents';
import { 
  ChevronLeft, ChevronRight, Search, Calendar, Filter, 
  ExternalLink, User, Building2, AlertTriangle, Users
} from 'lucide-react';
import { getBuColor } from './dashboardConstants';
import { api } from '../../services/api';

interface CalendarTabProps {
  applications: any[];
  activeUsers: any[];
  businessUnits: any[];
  setViewingApp: (app: any | null) => void;
  currentUser: any;
}

const MONTHS_TH = [
  'มกราคม', 'กุมภาพณ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const WEEKDAYS_TH = ['จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.'];

export const CalendarTab: React.FC<CalendarTabProps> = ({
  applications,
  activeUsers,
  businessUnits,
  setViewingApp,
  currentUser
}) => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [buFilter, setBuFilter] = useState('all');
  const [recruiterFilter, setRecruiterFilter] = useState('all');
  const [scheduleMode, setScheduleMode] = useState<'all' | 'mine'>('mine');

  // Calendar confirmation modal state
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [calendarTargetApp, setCalendarTargetApp] = useState<any | null>(null);
  const [calendarHasShareLink, setCalendarHasShareLink] = useState(false);
  const [calendarCreateShareLink, setCalendarCreateShareLink] = useState(true);
  const [calendarShareLinkUrl, setCalendarShareLinkUrl] = useState<string | null>(null);
  const [isProcessingCalendar, setIsProcessingCalendar] = useState(false);

  // Month navigation
  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const resetToToday = () => {
    setCurrentMonth(new Date().getMonth());
    setCurrentYear(new Date().getFullYear());
  };

  // Outlook calendar deeplink URL generator
  const generateOutlookCalendarUrl = (app: any, shareUrl?: string | null) => {
    const candidateName = app.full_name || app.form_data?.firstName || 'ผู้สมัคร';
    const position = app.position || app.form_data?.position || '-';
    const phone = app.phone || app.form_data?.phone || '-';
    const email = app.email || app.form_data?.email || '-';
    const teamsLink = app.teams_meeting_url || '';

    let startStr = '';
    let endStr = '';
    if (app.interview_start_time) {
      startStr = new Date(app.interview_start_time).toISOString();
    } else if (app.interview_date) {
      startStr = new Date(`${app.interview_date}T10:00:00`).toISOString();
    } else {
      startStr = new Date().toISOString();
    }

    if (app.interview_end_time) {
      endStr = new Date(app.interview_end_time).toISOString();
    } else if (app.interview_start_time) {
      const end = new Date(app.interview_start_time);
      end.setHours(end.getHours() + 1);
      endStr = end.toISOString();
    } else if (app.interview_date) {
      endStr = new Date(`${app.interview_date}T11:00:00`).toISOString();
    } else {
      const end = new Date();
      end.setHours(end.getHours() + 1);
      endStr = end.toISOString();
    }

    const subject = `สัมภาษณ์คุณ ${candidateName} - ตำแหน่ง ${position}`;
    
    // Note: Outlook Web Calendar requires CRLF (\r\n) for compose body breaks, standard \n will be lost.
    const bodyText = `เรียนผู้บริหารและคณะกรรมการ,\r\n\r\n` +
      `นัดหมายสัมภาษณ์ผู้สมัครงาน:\r\n` +
      `- ผู้สมัคร: คุณ ${candidateName} (${app.form_data?.nickname ? `ชื่อเล่น: ${app.form_data.nickname}` : ''})\r\n` +
      `- ตำแหน่ง: ${position}\r\n` +
      `- เบอร์โทรศัพท์: ${phone}\r\n` +
      `- อีเมล: ${email}\r\n` +
      `- ลิงก์โปรไฟล์ผู้สมัคร: ${shareUrl || `${window.location.origin}/dashboard?appId=${app.id}`}\r\n\r\n` +
      `ขอบคุณครับ/ค่ะ\r\n` +
      `ฝ่ายบริหารทรัพยากรบุคคล (HR Recruitment)`;

    const url = new URL('https://outlook.office.com/calendar/0/deeplink/compose');
    url.searchParams.append('path', '/calendar/action/compose');
    url.searchParams.append('rru', 'addevent');
    url.searchParams.append('subject', subject);
    url.searchParams.append('startdt', startStr);
    url.searchParams.append('enddt', endStr);
    url.searchParams.append('body', bodyText);
    if (teamsLink) {
      url.searchParams.append('location', teamsLink);
    } else {
      url.searchParams.append('location', 'Microsoft Teams Meeting');
    }

    return url.toString();
  };

  const handleCalendarClick = async (app: any) => {
    try {
      setCalendarTargetApp(app);
      setIsProcessingCalendar(true);
      
      const checkTokenRes = await api.getExistingShareToken(app.id);
      const exists = !!(checkTokenRes.success && checkTokenRes.data);
      const shareUrl = exists ? checkTokenRes.data.url : null;
      
      setCalendarHasShareLink(exists);
      setCalendarShareLinkUrl(shareUrl);
      setCalendarCreateShareLink(!exists);
      setIsProcessingCalendar(false);
      setCalendarModalOpen(true);
    } catch (error) {
      console.error("Error checking share token:", error);
      setIsProcessingCalendar(false);
      setCalendarTargetApp(app);
      setCalendarHasShareLink(false);
      setCalendarShareLinkUrl(null);
      setCalendarCreateShareLink(true);
      setCalendarModalOpen(true);
    }
  };

  const executeCalendarOpen = async () => {
    if (!calendarTargetApp) return;
    setIsProcessingCalendar(true);
    try {
      let finalShareUrl = calendarShareLinkUrl;

      if (!finalShareUrl && calendarCreateShareLink) {
        const createdBy = currentUser?.full_name || currentUser?.email || 'ระบบ';
        const res = await api.generateShareToken(calendarTargetApp.id, createdBy);
        if (res.success && res.data?.url) {
          finalShareUrl = res.data.url;
        }
      }

      const composeUrl = generateOutlookCalendarUrl(calendarTargetApp, finalShareUrl);
      window.open(composeUrl, '_blank');
      setCalendarModalOpen(false);
    } catch (err) {
      console.error("Failed to process calendar launch:", err);
    } finally {
      setIsProcessingCalendar(false);
    }
  };

  // Stale detection helper (>7 days inactive in Interview state)
  const isStale = (app: any) => {
    const isScheduled = ['InterviewScheduled', 'Interview'].includes(app.status);
    if (!isScheduled) return false;
    const lastUpdate = app.updated_at ? new Date(app.updated_at) : new Date(app.created_at);
    const diffTime = Math.abs(new Date().getTime() - lastUpdate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 7;
  };

  // Filtering applications
  const filteredInterviews = useMemo(() => {
    return applications.filter(app => {
      // 1. Must be in Interview or InterviewScheduled status
      const isInterview = app.status === 'Interview' || app.status === 'InterviewScheduled';
      if (!isInterview) return false;

      // 2. Search box query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const nameMatch = app.full_name?.toLowerCase().includes(query);
        const nicknameMatch = app.form_data?.nickname?.toLowerCase().includes(query);
        const posMatch = app.position?.toLowerCase().includes(query);
        if (!nameMatch && !nicknameMatch && !posMatch) return false;
      }

      // 3. BU Filter
      if (buFilter !== 'all' && app.business_unit !== buFilter) {
        return false;
      }

      // 4. Recruiter Filter
      if (recruiterFilter !== 'all' && app.assigned_to !== recruiterFilter) {
        return false;
      }

      // 5. Schedule Mode
      if (scheduleMode === 'mine' && currentUser && app.assigned_to !== currentUser.id) {
        return false;
      }

      return true;
    });
  }, [applications, searchQuery, buFilter, recruiterFilter, scheduleMode, currentUser]);

  // Construct Calendar days grid (Monday - Friday only)
  const calendarDays = useMemo(() => {
    const firstOfMonth = new Date(currentYear, currentMonth, 1);
    const dayOfWeek = firstOfMonth.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Calculate offset to Monday of the starting week
    // If Sunday (0), offset is -6 (previous Monday)
    // If Monday (1), offset is 0
    // Otherwise, offset is 1 - dayOfWeek (previous Monday)
    const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const startDate = new Date(firstOfMonth);
    startDate.setDate(startDate.getDate() + offset);

    const days = [];
    const tempDate = new Date(startDate);

    // Render 6 rows of 5 weekdays = 30 days total
    while (days.length < 30) {
      const currentDayOfWeek = tempDate.getDay();
      if (currentDayOfWeek >= 1 && currentDayOfWeek <= 5) {
        days.push({
          dayNum: tempDate.getDate(),
          isCurrentMonth: tempDate.getMonth() === currentMonth,
          year: tempDate.getFullYear(),
          month: tempDate.getMonth()
        });
      }
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return days;
  }, [currentYear, currentMonth]);

  return (
    <div className="space-y-6 form-step-enter">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Calendar className="text-indigo-600" /> ตารางสัมภาษณ์ (Interview Calendar)
          </h2>
          <p className="text-gray-500">จัดการ ตรวจสอบนัดหมาย และเพิ่มการแจ้งเตือนปฏิทินผู้สมัครของทีมสรรหา</p>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm border p-1 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setScheduleMode('all')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              scheduleMode === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Users className="w-3.5 h-3.5 inline mr-1.5" /> งานของทีมทั้งหมด
          </button>
          <button
            onClick={() => setScheduleMode('mine')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              scheduleMode === 'mine'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="w-3.5 h-3.5 inline mr-1.5" /> งานของฉัน
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <Card className="bg-white p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้สมัคร, ตำแหน่ง..."
              className="w-full border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-700"
              value={buFilter}
              onChange={(e) => setBuFilter(e.target.value)}
            >
              <option value="all">🏢 ทุกหน่วยธุรกิจ (All Business Units)</option>
              {businessUnits.map(bu => (
                <option key={bu.id || bu.name} value={bu.name}>{bu.name}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              className="w-full border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium text-gray-700"
              value={recruiterFilter}
              onChange={(e) => setRecruiterFilter(e.target.value)}
            >
              <option value="all">👤 สรรหาทุกคน (All Recruiters)</option>
              {activeUsers.map(u => (
                <option key={u.id} value={u.id}>{u.full_name} ({u.role})</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            {(searchQuery || buFilter !== 'all' || recruiterFilter !== 'all' || scheduleMode !== 'all') && (
              <Button
                variant="outline"
                className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                onClick={() => {
                  setSearchQuery('');
                  setBuFilter('all');
                  setRecruiterFilter('all');
                  setScheduleMode('all');
                }}
              >
                ล้างตัวกรอง
              </Button>
            )}
            <Button variant="secondary" className="text-xs pointer-events-none opacity-70">
              <Filter className="w-3.5 h-3.5 mr-1" /> ตัวกรองเปิดใช้งาน
            </Button>
          </div>
        </div>
      </Card>

      {/* Calendar Grid card */}
      <Card className="bg-white p-6 shadow-md border border-gray-100 rounded-2xl">
        {/* Month Header Controller */}
        <div className="flex items-center justify-between pb-5 border-b border-gray-100 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold text-gray-800">
              {MONTHS_TH[currentMonth]} {currentYear + 543}
            </h3>
            <span className="text-sm font-medium text-slate-400 font-mono">
              ({currentYear})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={prevMonth}
              className="p-2 border rounded-xl hover:bg-gray-50 transition-colors shadow-sm bg-white"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={resetToToday}
              className="px-4 py-2 border rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold shadow-sm bg-white text-indigo-600"
            >
              วันนี้
            </button>
            <button
              onClick={nextMonth}
              className="p-2 border rounded-xl hover:bg-gray-50 transition-colors shadow-sm bg-white"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Day Name headers */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {WEEKDAYS_TH.map((wd) => (
            <div
              key={wd}
              className="text-center text-xs font-bold uppercase tracking-wider py-2.5 rounded-lg text-gray-500 bg-slate-50"
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Monthly Grid */}
        <div className="grid grid-cols-5 gap-2 grid-rows-6 min-h-[500px]">
          {calendarDays.map((cell, idx) => {
            const dateStr = `${cell.year}-${String(cell.month + 1).padStart(2, '0')}-${String(cell.dayNum).padStart(2, '0')}`;
            
            // Get interviews on this specific date
            const dayInterviews = filteredInterviews.filter(app => {
              let appDate = app.interview_date;
              if (!appDate && app.interview_start_time) {
                appDate = app.interview_start_time.split('T')[0];
              }
              return appDate === dateStr;
            });

            // Check if cell represents today
            const isToday = 
              new Date().getDate() === cell.dayNum && 
              new Date().getMonth() === cell.month && 
              new Date().getFullYear() === cell.year;

            return (
              <div
                key={idx}
                className={`border rounded-xl p-2 flex flex-col group/day relative bg-white transition-all h-[110px] sm:h-auto overflow-y-auto ${
                  cell.isCurrentMonth
                    ? 'border-gray-200'
                    : 'border-gray-100 bg-slate-50/50 opacity-40'
                } ${isToday ? 'ring-2 ring-indigo-500/70 border-transparent bg-indigo-50/10' : ''} hover:border-indigo-200 hover:shadow-sm`}
              >
                {/* Day number header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center font-mono ${
                      isToday
                        ? 'bg-indigo-600 text-white font-bold'
                        : cell.isCurrentMonth
                        ? 'text-gray-700'
                        : 'text-gray-300'
                    }`}
                  >
                    {cell.dayNum}
                  </span>
                  {dayInterviews.length > 0 && cell.isCurrentMonth && (
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md">
                      {dayInterviews.length} นัด
                    </span>
                  )}
                </div>

                {/* Day interview cards list */}
                <div className="space-y-1.5 flex-1 select-none overflow-y-auto">
                  {cell.isCurrentMonth && dayInterviews.map((app) => {
                    const candidateName = app.full_name || app.form_data?.firstName || 'ผู้สมัคร';
                    const nickname = app.form_data?.nickname || '';
                    const photo = app.form_data?.photoUrl;
                    const recruiterName = app.assigned_user?.full_name || app.assigned_by || '';
                    const buColor = getBuColor(app.business_unit || app.form_data?.businessUnit);
                    const position = app.position || app.form_data?.position || '';
                    const stale = isStale(app);

                    // Parse start time
                    let timeText = 'ไม่ระบุเวลา';
                    if (app.interview_start_time) {
                      timeText = new Date(app.interview_start_time).toLocaleTimeString('th-TH', {
                        hour: '2-digit',
                        minute: '2-digit',
                        timeZone: 'Asia/Bangkok'
                      });
                    }

                    return (
                      <div
                        key={app.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setViewingApp(app);
                        }}
                        className={`group/card relative flex flex-col p-1.5 border rounded-lg hover:shadow cursor-pointer transition-all ${
                          stale 
                            ? 'bg-red-50/50 border-red-200 hover:border-red-300' 
                            : 'bg-white border-gray-150 hover:border-indigo-300'
                        }`}
                      >
                        {/* Top row: time & Outlook calendar button */}
                        <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500 mb-1 border-b border-gray-100 pb-0.5">
                          <span className="font-mono text-indigo-600">{timeText}</span>
                           <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCalendarClick(app);
                            }}
                            className="text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1 py-0.5 rounded transition-colors shadow-sm flex items-center gap-0.5 shrink-0 font-sans cursor-pointer border-none outline-none"
                            title="Add to Outlook Calendar (MS Teams)"
                          >
                            <Calendar className="w-2.5 h-2.5" />
                            <span className="text-[7.5px] font-bold">ปฏิทิน</span>
                          </button>
                        </div>

                        {/* Mid row: Candidate Photo & Name */}
                        <div className="flex items-center gap-1.5 min-w-0">
                          {photo ? (
                            <img
                              src={photo}
                              alt={candidateName}
                              className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-indigo-100"
                            />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 font-bold text-[8px] flex items-center justify-center flex-shrink-0">
                              {candidateName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0 flex-1 leading-tight">
                            <div className="text-[10px] font-bold text-gray-800 truncate flex items-center gap-0.5">
                              {stale && (
                                <span title="เคสค้างนัดเกิน 7 วัน" className="inline-flex flex-shrink-0">
                                  <AlertTriangle className="w-3 h-3 text-red-500" />
                                </span>
                              )}
                              {candidateName} {nickname && <span className="text-[8px] font-normal text-gray-500 font-sans">({nickname})</span>}
                            </div>
                            <div className="text-[8px] text-gray-400 truncate">{position}</div>
                          </div>
                        </div>

                        {/* Bottom Row: BU Tag & Recruiter Initials */}
                        <div className="flex items-center justify-between gap-1 mt-1">
                          <span className={`px-1 rounded text-[7px] font-bold tracking-wide uppercase border ${buColor} truncate scale-95 origin-left`}>
                            {app.business_unit || 'ไม่ระบุ BU'}
                          </span>
                          {recruiterName && (
                            <span 
                              className="text-[8px] font-semibold text-indigo-700 bg-indigo-50 px-1 rounded truncate max-w-[50px]"
                              title={`ผู้สรรหา: ${recruiterName}`}
                            >
                              {recruiterName.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Outlook Calendar Confirmation Modal */}
      <Modal
        isOpen={calendarModalOpen}
        onClose={() => setCalendarModalOpen(false)}
        title="เพิ่มนัดลงในปฏิทิน (Outlook Calendar)"
        size="md"
        footer={null}
      >
        {calendarTargetApp && (
          <div className="space-y-4 text-slate-700">
            {/* Header / Icon */}
            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  รายละเอียดนัดหมายปฏิทิน
                </h4>
                <p className="text-xs text-slate-500">
                  เตรียมข้อมูลผู้สมัครเพื่อเปิดหน้าจอบันทึกปฏิทินของ Outlook Web
                </p>
              </div>
            </div>

            {/* Candidate Summary Card */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block">ผู้สมัคร (Candidate)</span>
                  <span className="font-bold text-slate-800">{calendarTargetApp.full_name || calendarTargetApp.form_data?.firstName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">ตำแหน่ง (Position)</span>
                  <span className="font-bold text-slate-800">{calendarTargetApp.position || '-'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block">วันเวลาสัมภาษณ์ (Date & Time)</span>
                  <span className="font-bold text-slate-800">
                    {calendarTargetApp.interview_start_time ? (
                      new Date(calendarTargetApp.interview_start_time).toLocaleString('th-TH', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) + ' น.'
                    ) : calendarTargetApp.interview_date ? (
                      `${new Date(calendarTargetApp.interview_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })} (เวลา 10:00 น.)`
                    ) : '-'}
                  </span>
                </div>
                {calendarTargetApp.teams_meeting_url && (
                  <div className="col-span-2 truncate">
                    <span className="text-slate-400 block">ลิงก์การสัมภาษณ์ (Microsoft Teams Link)</span>
                    <span className="font-semibold text-blue-600 underline font-mono text-[10px] break-all">{calendarTargetApp.teams_meeting_url}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Share Link Settings */}
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-2">
              <span className="text-xs font-bold text-emerald-800 block mb-1">
                การตั้งค่าลิงก์ข้อมูลผู้สมัคร (Profile Sharing Link)
              </span>

              {calendarHasShareLink ? (
                <div className="flex items-start gap-2 text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded-lg border border-emerald-100">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>
                    พบลิงก์แชร์โปรไฟล์ผู้สมัครแล้ว ระบบจะแนบลิงก์แชร์นี้ลงในคำอธิบายนัดหมายให้อัตโนมัติ เพื่อให้กรรมการผู้ประเมินคลิกเปิดดูเอกสารประวัติได้ทันที
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input 
                      type="checkbox"
                      checked={calendarCreateShareLink}
                      onChange={(e) => setCalendarCreateShareLink(e.target.checked)}
                      className="mt-0.5 w-4 h-4 text-emerald-600 border-emerald-300 rounded focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 block">สร้างลิงก์แชร์โปรไฟล์ผู้สมัครโดยอัตโนมัติ (แนะนำ)</span>
                      <span className="text-slate-500 text-[11px] block mt-0.5">
                        ระบบจะสร้างลิงก์แชร์ภายนอกและแนบไปในรายละเอียดนัดหมายปฏิทิน ช่วยให้กรรมการสามารถคลิกดูประวัติ ผลทดสอบ และเอกสารแนบได้โดยไม่ต้องล็อกอินเข้าระบบ
                      </span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-3 border-t border-slate-100">
              <Button 
                variant="outline" 
                onClick={() => setCalendarModalOpen(false)}
                disabled={isProcessingCalendar}
              >
                ยกเลิก
              </Button>
              <Button
                onClick={executeCalendarOpen}
                disabled={isProcessingCalendar}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center gap-1.5 shadow-md shadow-blue-200"
              >
                {isProcessingCalendar ? (
                  <>
                    <span className="animate-spin text-xs">⏳</span> กำลังเตรียมการ...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" /> ยืนยันเปิดปฏิทิน Outlook
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
