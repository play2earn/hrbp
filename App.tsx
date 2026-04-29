
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, LANDING_CONTENT, FEATURED_JOBS } from './constants';
import { Role, Language, ApplicationForm, INITIAL_FORM_STATE } from './types';
import { ApplicantFormComp } from './components/ApplicantForm';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { PDFPreview } from './components/PDFPreview';
import { SharedProfileView } from './components/SharedProfileView';
import { Button, Card, Modal } from './components/UIComponents';
import { 
  Users, 
  Search, 
  MapPin, 
  Clock, 
  Briefcase, 
  ArrowRight, 
  ChevronRight, 
  Building2, 
  Globe, 
  Shield, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Facebook,
  Instagram,
  Linkedin,
  User as UserIcon,
  Plus,
  Heart,
  ChevronDown,
  Handshake,
  Lock
} from 'lucide-react';

import { api, AuthUser } from './services/api';
import TrackingSystem from './components/TrackingSystem';
import { CookieConsent } from './components/CookieConsent';

export default function App() {
  // Check for /share/:token path first
  const shareMatch = window.location.pathname.match(/^\/share\/([a-f0-9]{64})$/i);
  if (shareMatch) {
    return <SharedProfileView token={shareMatch[1]} />;
  }

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<Role>(() => {
    try {
      const stored = localStorage.getItem('currentUser');
      if (stored) {
        const user = JSON.parse(stored);
        if (user.role === 'admin' || user.role === 'mod') return user.role;
      }
    } catch {}
    return 'guest';
  });
  
  useEffect(() => {
    const checkSession = async () => {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        // Verify with server
        try {
          const result = await api.auth.verifySession();
          if (result.success && result.data) {
            setRole(result.data.role);
            setCurrentUser(result.data);
            localStorage.setItem('currentUser', JSON.stringify(result.data));
          } else {
            setRole('guest');
            setCurrentUser(null);
            localStorage.removeItem('currentUser');
          }
        } catch {
          setRole('guest');
          setCurrentUser(null);
          localStorage.removeItem('currentUser');
        }
      }
    };

    checkSession();

    // Re-verify periodically (every 15 minutes)
    const interval = setInterval(checkSession, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const [lang, setLang] = useState<Language>('en');
  const [pdpaAccepted, setPdpaAccepted] = useState(false);
  const [isPdpaModalOpen, setIsPdpaModalOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [urlParams, setUrlParams] = useState<{ bu?: string; ch?: string; tag?: string }>({});
  const [selectedJob, setSelectedJob] = useState<Partial<ApplicationForm> | undefined>(undefined);

  // Parse URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrlParams({
      bu: params.get('bu') || undefined,
      ch: params.get('ch') || undefined,
      tag: params.get('tag') || undefined
    });
  }, []);

  const t = TRANSLATIONS[lang];
  const landingText = LANDING_CONTENT[lang];

  const handleLogin = (selectedRole: Role) => {
    setRole(selectedRole);
    setShowLogin(false);
  };

  const handleLogout = () => {
    setRole('guest');
    setPdpaAccepted(false);
    setSelectedJob(undefined);
    localStorage.removeItem('currentUser');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'en' ? 'th' : 'en');
  };

  const handleApplyClick = (job?: typeof FEATURED_JOBS[0]) => {
    if (job) {
      setSelectedJob({
        position: job.title,
        department: job.dept,
        // Map mock departments to BU if possible, otherwise default empty
        businessUnit: 'Technology' // Mock default
      });
    } else {
      setSelectedJob(undefined);
    }
    setIsPdpaModalOpen(true);
  };

  const handleStartApplication = () => {
    setPdpaAccepted(true);
    setIsPdpaModalOpen(false);
    setRole('applicant');
  };

  // --- RENDER VIEWS ---

  // 1. Login Page
  if (showLogin) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onBack={() => setShowLogin(false)}
        lang={lang}
        onToggleLang={toggleLang}
      />
    );
  }

  // 2. Moderator / Admin Dashboard
  if (role === 'mod' || role === 'admin') {
    return <Dashboard role={role} onLogout={handleLogout} />;
  }

  // 3. Applicant View (Post-PDPA)
  if (role === 'applicant' && pdpaAccepted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="flex items-center min-w-0">
              <img src="https://doubleapaper.com/logo.svg" alt="Double A Logo" className="w-9 h-9 mr-3 flex-shrink-0 object-contain shadow-md" />
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight truncate">{t.appTitle}</h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleLang} className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors px-2 py-1 rounded-md hover:bg-slate-50">
                <Globe className="w-5 h-5 mr-1.5" />
                <span className="uppercase font-medium text-sm">{lang}</span>
              </button>
              <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-600">
                {t.actions.logout}
              </Button>
            </div>
          </div>
        </header>
        <main className="flex-grow w-full">
          <ApplicantFormComp
            lang={lang}
            urlParams={urlParams}
            initialValues={selectedJob}
          />
        </main>
        <footer className="bg-white border-t border-slate-200 py-8 mt-12 text-center text-sm text-slate-500">
          <p>© 2026 Double A Network.</p>
          <p className="text-xs mt-1 text-slate-400">Powered by AI Technology</p>
        </footer>
      </div>
    );
  }

  // 4. Landing Page (Guest View)
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar - Enhanced with glass effect */}
      <nav className="fixed top-0 w-full z-50 glass border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center min-w-0">
              <img src="https://doubleapaper.com/logo.svg" alt="Double A Logo" className="w-9 h-9 mr-2.5 flex-shrink-0 object-contain shadow-lg" />
              <span className="font-bold text-sm sm:text-xl text-gray-900 truncate">{t.appTitle}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleLang} className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all">
                <Globe className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              <button onClick={() => setIsTrackingOpen(true)} className="hidden sm:flex text-sm font-medium text-gray-600 hover:text-indigo-600 transition-all items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50">
                <Search className="w-4 h-4" /> {lang === 'th' ? 'ตรวจสอบสถานะ' : 'Check Status'}
              </button>
              <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-all px-3 py-2 rounded-lg hover:bg-indigo-50">
                {lang === 'th' ? 'เข้าสู่ระบบ' : 'Login'}
              </button>
              <Button 
                onClick={() => handleApplyClick()} 
                size="sm" 
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md rounded-full btn-shine pulse-glow"
              >
                <span className="hidden sm:inline">{landingText.apply}</span>
                <span className="sm:hidden">Apply</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Cinematic Video Background Section - NOW AT THE TOP */}
      <div className="relative h-[85vh] min-h-[600px] overflow-hidden flex items-center justify-center shadow-inner">
        {/* YouTube Video Wrapper */}
        <div className="absolute inset-0 z-0 pointer-events-none scale-110">
          <iframe 
            className="w-full h-full object-cover pointer-events-none"
            src="https://www.youtube.com/embed/nsCyLNtTFug?autoplay=1&mute=1&loop=1&playlist=nsCyLNtTFug&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1" 
            title="Double A Culture Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          ></iframe>
        </div>
        
        {/* Overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-indigo-900/40 to-white z-10"></div>
        
        <div className="relative z-20 max-w-4xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white font-medium mb-8 animate-pulse">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            {lang === 'th' ? 'บรรยากาศการทำงานจริง' : 'Experience Our Real Worklife'}
          </div>
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 drop-shadow-2xl leading-tight">
            {lang === 'th' ? 'สัมผัสวัฒนธรรม Transform ME Transform US' : 'Experience Our Transformative Culture'}
          </h2>
          <p className="text-xl sm:text-2xl text-white/90 font-medium max-w-2xl mx-auto drop-shadow-lg">
            {lang === 'th' 
              ? 'ก้าวหน้าไปกับเทคโนโลยีและพลังของทีมงานที่มุ่งเน้นผลลัพธ์และความสำเร็จร่วมกัน' 
              : 'Grow with technology and the power of a team focused on results and shared success.'}
          </p>
          <div className="mt-10">
            <Button
              size="lg"
              onClick={() => handleApplyClick()}
              className="rounded-full px-10 py-4 bg-white !text-indigo-900 hover:bg-indigo-600 hover:!text-white shadow-2xl shadow-black/30 transition-all duration-300 transform hover:-translate-y-1 font-bold text-lg border-none"
            >
              <span className="flex items-center gap-2">
                {lang === 'th' ? 'สมัครงานเลย' : 'Apply Now'}
                <ArrowRight className="w-5 h-5" />
              </span>
            </Button>
          </div>
        </div>
      </div>

      {/* Hero Section - Premium Redesign - NOW SECOND */}
      <div className="py-20 sm:py-28 relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full blur-3xl opacity-20 float-slow"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-blue-300 to-indigo-400 rounded-full blur-3xl opacity-20 float-medium"></div>
          <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-gradient-to-r from-pink-300 to-purple-300 rounded-full blur-3xl opacity-10 float-fast"></div>

          {/* Decorative Shapes */}
          <div className="absolute top-20 left-[10%] w-20 h-20 border-2 border-indigo-200 rounded-2xl rotate-12 float-slow opacity-40"></div>
          <div className="absolute bottom-32 right-[15%] w-16 h-16 border-2 border-purple-200 rounded-full float-medium opacity-40"></div>
          <div className="absolute top-[60%] left-[5%] w-8 h-8 bg-indigo-400 rounded-lg rotate-45 float-fast opacity-20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="flex-1 text-center lg:text-left">
              {/* Animated Badge */}
              <div className="fade-in-up mb-6">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200/50 text-sm font-medium text-indigo-700 badge-pulse">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  We're Hiring — Join Our Team!
                </span>
              </div>

              {/* Main Heading with Gradient */}
              <h1 className="fade-in-up-delay-1 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                <span className="text-gray-900">{landingText.heroTitle.split(' ').slice(0, 2).join(' ')}</span>{' '}
                <span className="text-gradient">{landingText.heroTitle.split(' ').slice(2).join(' ')}</span>
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0 animate-fade-in-up delay-200">
                {lang === 'th' 
                  ? 'ร่วมเป็นส่วนหนึ่งของทีมนักนวัตกรรมที่ขับเคลื่อนด้วยวัฒนธรรม Transform ME Transform US เพื่อสร้างอนาคตที่ยั่งยืนไปด้วยกัน' 
                  : 'Join a team of innovators driven by our culture (Transform, Think Forward, Team Synergy) to build a sustainable future together.'}
              </p>

              <div className="fade-in-up-delay-3 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                <Button
                  size="lg"
                  onClick={() => handleApplyClick()}
                  className="rounded-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-xl shadow-indigo-200 hover:shadow-2xl transition-all hover:-translate-y-1 btn-shine text-base font-bold"
                >
                  {landingText.apply} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsTrackingOpen(true)}
                  className="rounded-full px-8 py-4 border-2 hover:bg-gray-50 transition-all text-base"
                >
                  <Search className="mr-2 w-5 h-5" /> {lang === 'th' ? 'ตรวจสอบสถานะใบสมัคร' : 'Track Application'}
                </Button>
              </div>
            </div>

            <div className="flex-1 fade-in-up-delay-2 relative">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-[100px] animate-pulse"></div>
              <img 
                src="/hero_artwork.png" 
                alt="Digital Transformation Artwork" 
                className="w-full h-auto rounded-[3rem] shadow-2xl relative z-10 border border-white/20 transform hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
          </div>
        </div>
      </div>


      {/* Values Section - Enhanced with Double A 3Ts */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{landingText.aboutTitle}</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Users, gradient: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50', ...landingText.values[0] },
              { icon: Handshake, gradient: 'from-purple-600 to-pink-600', bg: 'bg-purple-50', ...landingText.values[1] },
              { icon: Shield, gradient: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50', ...landingText.values[2] },
            ].map((val, idx) => (
              <div
                key={idx}
                className="group p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 relative overflow-hidden"
              >
                {/* Decorative circle */}
                <div className={`absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br ${val.gradient} opacity-[0.03] rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none`}></div>
                
                <div className={`w-16 h-16 ${val.bg} rounded-2xl flex items-center justify-center mb-6 relative`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${val.gradient} opacity-0 group-hover:opacity-100 transition-all duration-300`}></div>
                  <val.icon className={`w-8 h-8 text-gray-700 group-hover:text-white transition-colors duration-300 relative z-10`} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed text-lg">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


      {/* Recruitment Process Section - Added for Transparency */}
      <div className="py-24 bg-slate-50 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none">
          <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-3 block">Transparency</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {lang === 'th' ? 'เส้นทางสู่การร่วมงานกับเรา' : 'Your Journey to Join Us'}
            </h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              {lang === 'th' 
                ? 'เราเชื่อในความโปร่งใส ทุกขั้นตอนการคัดเลือกถูกออกแบบมาเพื่อความยุติธรรมและประสบการณ์ที่ดีที่สุดของผู้สมัคร' 
                : 'We believe in transparency. Every selection step is designed for fairness and the best candidate experience.'}
            </p>
          </div>
          
          <div className="relative">
            {/* Connection Line (Desktop) */}
            <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-dashed border-t-2 border-dashed border-gray-200 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
              {[
                { 
                  title: lang === 'th' ? 'สมัครออนไลน์' : 'Online Application', 
                  desc: lang === 'th' ? 'กรอกข้อมูลส่วนตัวและแนบเรซูเม่ผ่านระบบที่ปลอดภัย' : 'Complete your profile and upload resume securely.',
                  icon: Search,
                  color: 'bg-blue-600'
                },
                { 
                  title: lang === 'th' ? 'คัดเลือกประวัติ' : 'Profile Screening', 
                  desc: lang === 'th' ? 'ทีม HR ตรวจสอบคุณสมบัติและทักษะให้เหมาะสมกับตำแหน่ง' : 'Our HR team reviews your skills for the best fit.',
                  icon: UserIcon,
                  color: 'bg-indigo-600'
                },
                { 
                  title: lang === 'th' ? 'สัมภาษณ์' : 'Professional Interview', 
                  desc: lang === 'th' ? 'พูดคุยแลกเปลี่ยนมุมมองและทัศนคติกับทีมงานตัวจริง' : 'Meet the team and share your vision and attitude.',
                  icon: Briefcase,
                  color: 'bg-purple-600'
                },
                { 
                  title: lang === 'th' ? 'เริ่มงาน' : 'Welcome Onboard', 
                  desc: lang === 'th' ? 'ยินดีต้อนรับเข้าสู่ครอบครัว Double A และเติบโตไปด้วยกัน' : 'Welcome to the family. Let\'s grow and succeed together.',
                  icon: Heart,
                  color: 'bg-pink-600'
                }
              ].map((step, i) => (
                <div key={i} className="relative">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group h-full">
                    <div className={`w-12 h-12 ${step.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="absolute top-8 right-8 text-4xl font-black text-gray-50 opacity-10 group-hover:opacity-20 transition-opacity">
                      0{i + 1}
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Alliance Group Section */}
      <div className="py-24 bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[120px] opacity-30 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="text-indigo-600 font-bold tracking-wider uppercase text-sm mb-3 block">Global Alliance</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {landingText.alliance.title}
            </h2>
            <div className="w-24 h-1.5 bg-indigo-600 mx-auto rounded-full mb-10"></div>
            
            <div className="mb-16 transform hover:scale-[1.01] transition-transform duration-700">
              <img 
                src="/alliance_artwork.png" 
                alt="Alliance Ecosystem" 
                className="max-w-4xl mx-auto w-full h-auto rounded-[3rem] shadow-2xl border border-gray-100"
              />
            </div>

            <p className="text-gray-600 max-w-2xl mx-auto text-lg italic">
              "{landingText.alliance.subtitle}"
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {landingText.alliance.groups.map((group: any, idx: number) => (
              <div key={idx} className="group relative">
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 h-full flex flex-col items-center text-center relative z-10 overflow-hidden">
                  {/* Subtle color splash on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${group.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500 pointer-events-none`}></div>
                  
                  <div className={`w-20 h-20 bg-gradient-to-br ${group.color} p-0.5 mb-8 shadow-lg transform group-hover:rotate-6 transition-transform duration-500`}>
                    <div className="w-full h-full bg-white flex items-center justify-center overflow-hidden p-2 gap-2">
                      {group.logos ? (
                        group.logos.map((logo: string, lIdx: number) => (
                          <img 
                            key={lIdx}
                            src={logo} 
                            alt={`${group.name} logo ${lIdx + 1}`} 
                            className="max-w-[45%] max-h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                          />
                        ))
                      ) : (
                        <img 
                          src={group.logo} 
                          alt={group.name} 
                          className="max-w-full max-h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                    </div>
                  </div>

                  <span className={`px-4 py-1 rounded-full bg-gradient-to-r ${group.color} text-white text-[10px] font-bold uppercase tracking-widest mb-4 shadow-sm`}>
                    {group.tag}
                  </span>

                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{group.name}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm mb-8 flex-1">
                    {group.desc}
                  </p>

                  <a 
                    href={group.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 font-bold text-sm flex items-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
                  >
                    {lang === 'th' ? 'ดูข้อมูลเพิ่มเติม' : 'Learn More'} <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Group Philosophy Quote */}
          <div className="mt-20 p-10 rounded-[3rem] bg-indigo-900 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1 text-center md:text-left">
                <h4 className="text-2xl font-bold mb-4">
                  {lang === 'th' ? 'สร้างความยั่งยืนไปกับเรา' : 'Build a Sustainable Future Together'}
                </h4>
                <p className="text-indigo-100 leading-relaxed text-lg opacity-90">
                  {lang === 'th' 
                    ? 'เราไม่ได้แค่ผลิตกระดาษ แต่เราสร้างพลังงานสะอาดและคุณภาพชีวิตที่ดียิ่งขึ้น ผ่านเครือข่ายธุรกิจที่ครอบคลุมและมั่นคง' 
                    : 'We don\'t just produce paper; we create clean energy and better living quality through our comprehensive and stable business network.'}
                </p>
              </div>
              <button 
                onClick={() => handleApplyClick()}
                className="bg-white text-indigo-900 hover:bg-indigo-50 px-10 py-4 rounded-2xl font-bold shadow-xl transition-all transform hover:-translate-y-1 active:scale-95 z-20"
              >
                {lang === 'th' ? 'ร่วมงานกับเรา' : 'Join Our Journey'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer - Enhanced with gradient */}
      <footer className="relative bg-gray-900 text-gray-300 pt-16 pb-8">
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-5">
                <div className="w-10 h-10 animated-gradient rounded-xl mr-3 flex items-center justify-center text-white font-bold text-lg">N</div>
                <span className="font-bold text-2xl text-white">{t.appTitle}</span>
              </div>
              <p className="text-gray-400 max-w-sm leading-relaxed mb-6">
                Empowering businesses with top talent. Streamlining recruitment for a better future.
              </p>
              <div className="flex gap-4">
                <a href="https://www.facebook.com/DoubleAGlobalOfficial/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://doubleapaper.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all" title="Official Website">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5">Company</h4>
              <ul className="space-y-3 text-sm">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span>About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span>Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"><span className="w-1 h-1 bg-indigo-500 rounded-full"></span>Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-5">Staff Access</h4>
              <button onClick={() => setShowLogin(true)} className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4" /> Staff Login
              </button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs sm:text-sm">© 2026 Double A Network. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* PDPA Modal - Terms & Conditions */}
      <Modal
        isOpen={isPdpaModalOpen}
        onClose={() => setIsPdpaModalOpen(false)}
        title={lang === 'th' ? 'ข้อกำหนดและเงื่อนไข' : 'Terms & Conditions'}
        size="lg"
        footer={
          <div className="w-full flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPdpaModalOpen(false)}>
              {lang === 'th' ? 'ยกเลิก' : 'Cancel'}
            </Button>
            <Button onClick={handleStartApplication} disabled={!pdpaAccepted}>
              {lang === 'th' ? 'ยอมรับและดำเนินการต่อ' : 'Accept & Continue'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Language Toggle inside modal */}
          <div className="flex items-center justify-end">
            <div className="inline-flex items-center bg-white rounded-full border border-gray-200 shadow-sm p-0.5">
              <button
                onClick={() => setLang('th')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${lang === 'th' ? 'bg-gradient-to-r from-[#1a3a7a] to-[#2855a8] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                🇹🇭 ไทย
              </button>
              <button
                onClick={() => setLang('en')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${lang === 'en' ? 'bg-gradient-to-r from-[#1a3a7a] to-[#2855a8] text-white shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>

          {/* Section 1: Privacy Notice */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#1a3a7a] to-[#2855a8] px-5 py-3">
              <h4 className="text-white font-bold text-base">
                {lang === 'th' ? 'รายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล' : 'Privacy Notice'}
              </h4>
            </div>
            <div className="p-5 max-h-72 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-3">
              {lang === 'th' ? (
                <>
                  <p>หนังสือนี้จัดทำขึ้นเพื่อชี้แจงรายละเอียดเกี่ยวกับข้อมูลส่วนบุคคลระหว่างบริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน) ("<strong>บริษัทฯ</strong>") และผู้ที่มีความประสงค์จะสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ ("<strong>ผู้สมัครงาน</strong>") ตามหลักเกณฑ์และนโยบายของบริษัทฯ ดังนี้</p>

                  <p className="font-bold text-gray-900">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</p>
                  <p className="pl-4">บริษัทฯ จะเก็บ รวบรวม ใช้ ประมวลผล และเปิดเผยข้อมูลส่วนบุคคลของผู้สมัครงาน ได้แก่ ชื่อ นามสกุล เลขประจำตัวประชาชน ที่อยู่ ประวัติการศึกษา ประวัติการทำงานหรือการอบรม ประวัติการเกณฑ์ทหาร อีเมล เบอร์โทรศัพท์ ข้อมูลตามที่ผู้สมัครงานระบุใน Resume และ CV ที่ผู้สมัครนำส่งให้บริษัทฯ ที่ไม่ใช่ข้อมูลอ่อนไหว เพื่อประโยชน์ของผู้สมัครงานในการยืนยันตัวบุคคลของผู้สมัครงาน และเพื่อการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทฯ</p>

                  <p className="font-bold text-gray-900">2. การเปิดเผยข้อมูลส่วนบุคคล</p>
                  <p className="pl-4">บริษัทฯ อาจเปิดเผยข้อมูลส่วนบุคคลของผู้สมัครงานต่อบริษัทในเครือพันธมิตรของบริษัทฯ เพื่อผลประโยชน์ของผู้สมัครงานในการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทในเครือพันธมิตรของบริษัทฯ รวมถึงเพื่อการดำเนินการตามวัตถุประสงค์ที่เกี่ยวข้องกับวัตถุประสงค์ดังกล่าว</p>

                  <p className="font-bold text-gray-900">3. การประมวลผลข้อมูล</p>
                  <p className="pl-4">ข้อมูลส่วนบุคคลของผู้สมัครงานจะถูกประมวลผลโดยผู้ที่ได้รับอนุมัติจากบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ เพื่อการพิจารณารับบุคคลเข้าทำงาน</p>

                  <p className="font-bold text-gray-900">4. ระยะเวลาในการจัดเก็บข้อมูล</p>
                  <p className="pl-4">บริษัทฯ จะเก็บข้อมูลส่วนบุคคลของผู้สมัครงานเพื่อการดำเนินการตามวัตถุประสงค์เป็นระยะเวลา 5 ปี นับแต่วันที่ผู้สมัครงานทำการสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือบริษัทในเครือพันธมิตรของบริษัทฯ</p>

                  <p className="font-bold text-gray-900">5. สิทธิของผู้สมัครงาน</p>
                  <p className="pl-4">รายละเอียดปรากฏตามพระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 นโยบายคุ้มครองข้อมูลส่วนบุคคลของบริษัทฯ เรื่อง "สิทธิของเจ้าของข้อมูล"</p>
                  <p className="pl-4">กรณีที่ผู้สมัครงานต้องการเข้าถึง แก้ไข ลบข้อมูลส่วนบุคคล ที่ให้ไว้แก่บริษัทฯ ผู้สมัครงานสามารถติดต่อมายังบริษัทฯ เพื่อยื่นคำขอเกี่ยวกับข้อมูลส่วนบุคคลของท่านผ่านช่องทางการติดต่อดังนี้</p>

                  <div className="pl-4 mt-2 bg-gray-50 p-3 rounded-lg text-xs">
                    <p><strong>ผู้ควบคุมข้อมูลส่วนบุคคล:</strong> บริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน)</p>
                    <p><strong>สถานที่ติดต่อ:</strong> ฝ่ายสรรหาและคัดเลือกบุคลากร</p>
                    <p className="pl-24">187/3 หมู่ที่ 1 ถนนบางนา-ตราด กม. 42 ตำบลบางวัว อำเภอบางปะกง</p>
                    <p className="pl-24">จังหวัดฉะเชิงเทรา 24180</p>
                    <p><strong>Email:</strong> recruit@doublea1991.com</p>
                  </div>

                  <p className="mt-2">ผู้สมัครงานสามารถตรวจสอบรายละเอียดเกี่ยวกับสิทธิอื่นๆ ของผู้สมัครงานได้ที่ <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://www.doubleapaper.com/privacy-policy</a></p>

                  <p>ทั้งนี้ผู้สมัครงานยืนยันว่าข้อมูลส่วนบุคคลของบุคคลที่สามที่ผู้สมัครงานให้แก่บริษัทฯ เพื่อผลประโยชน์ของผู้สมัครงานในการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงานกับบริษัทฯ หรือบริษัทในเครือ ถูกต้อง และเจ้าของข้อมูลส่วนบุคคลทราบถึงการเปิดเผยข้อมูลดังกล่าวแก่บริษัทฯ แล้ว</p>

                  <p className="font-semibold">ผู้สมัครงาน อ่าน เข้าใจ และรายละเอียดข้อซึ่งระบุไว้ข้างต้นแล้ว โดยยอมรับรองว่าข้อมูลที่นำส่งให้แก่บริษัทฯ เพื่อการประมวลผลข้อมูลนั้นถูกต้อง และเป็นความจริงทุกประการ</p>
                </>
              ) : (
                <>
                  <p>This Privacy Notice is to clarify the personal data processing between Double A (1991) Public Company Limited (the "<strong>Company</strong>") and the applicant who intends to apply for a job at the Company and/or the Company's alliance (the "<strong>Applicant</strong>") according to the Policy of the Company.</p>

                  <p className="font-bold text-gray-900">1. Processing of the Personal Data</p>
                  <p className="pl-4">The Company will collect, use, or disclose the Applicant's personal data, including name, surname, identification number, address, education background, work/ training experience, military status, email, contact number, photo, and the information in the Applicant's resume or CV, which is not sensitive personal data<sup>1</sup> (the "<strong>Personal Data</strong>") for the benefit of the Applicant, to verify identity and to consider the employment.</p>
                  <p className="pl-4">For the benefit of the Applicant, the Company may disclose the Personal Data to the Company's alliance for considering the employment by the Company's alliance and processing for the said purpose.</p>
                  <p className="pl-4">For the above purposes, the Company shall collect the Personal Data for 5 years from the date that the Applicant applies the job with the Company and/or the Company's alliance.</p>

                  <p className="font-bold text-gray-900">2. Rights of the Applicant</p>
                  <p className="pl-4">Rights of the Applicant is in accordance with the Personal Data Protection Act, B.E. 2562 (2019) and the Company's Personal Information Protection Policy in the subject "Rights of Data Subject".</p>
                  <p className="pl-4">If the Applicant would like access, rectification, erasure of the Personal Data provided to the Company, please submit the request to the contact below:</p>

                  <div className="pl-4 mt-2 bg-gray-50 p-3 rounded-lg text-xs">
                    <p><strong>Data Controller:</strong> Double A (1991) Public Company Limited</p>
                    <p><strong>Address:</strong> Recruitment Department, 187/3 Moo 1, Bangna-Trad Km. 42 Road, Bangwua,</p>
                    <p className="pl-16">Bangpakong, Chachoengsao 24180, Thailand.</p>
                    <p><strong>Email:</strong> recruit@doublea1991.com</p>
                  </div>

                  <p className="mt-2">Furthermore, The Application can find the information of the Personal Data Protection Policy of the Company at <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://www.doubleapaper.com/privacy-policy</a>.</p>

                  <p>The Applicant certifies that the third party's personal data provided to the Company is true and correct. Furthermore, the third party has acknowledged the said disclosure of their personal data to the Company for the benefit of the Applicant and the employment consideration of the Company and/or the Company's alliance.</p>

                  <p className="font-semibold">The Applicant has read and understood this Privacy Notice including the above terms and conditions. The Applicant certifies that the Personal Data provided to the Company is true and correct.</p>

                  <p className="text-xs text-gray-500 mt-4 border-t pt-3"><sup>1</sup> Section 26, the Personal Data Protection Act, B.E. 2562 (2019): Any collection of Personal Data pertaining to racial, ethnic origin, political opinions, cult, religious or philosophical beliefs, sexual behavior, criminal records, health data, disability, trade union information, genetic data, biometric data, or of any data which may affect the data subject in the same manner.</p>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Consent to Processing Personal Data */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#1a3a7a] to-[#2855a8] px-5 py-3">
              <h4 className="text-white font-bold text-base">
                {lang === 'th' ? 'ความยินยอมในการประมวลผลข้อมูล' : 'Consent to Processing the Personal Data'}
              </h4>
            </div>
            <div className="p-5 max-h-56 overflow-y-auto text-sm text-gray-700 leading-relaxed space-y-3">
              {lang === 'th' ? (
                <>
                  <p>ผู้สมัครงานยินยอมให้บริษัทฯ เก็บ รวบรวม ใช้ ประมวลผล ข้อมูลส่วนบุคคลที่เป็นข้อมูลอ่อนไหวของผู้สมัครงาน ได้แก่ น้ำหนัก ส่วนสูง ประวัติการรักษาพยาบาลที่เกี่ยวข้องกับการทำงาน เพื่อการพิจารณาความเหมาะสมในการเข้าทำสัญญาจ้างแรงงาน และตำแหน่งงานที่เกี่ยวข้องกับบริษัทฯ และ/หรือ บริษัทในเครือพันธมิตรของบริษัทฯ โดยบริษัทฯ จะเก็บข้อมูลส่วนบุคคลที่เป็นข้อมูลอ่อนไหวของผู้สมัครงานเป็นระเวลา 5 ปี นับแต่วันที่ผู้สมัครงานทำการสมัครงานเพื่อเข้าทำงานกับบริษัทฯ และ/หรือ บริษัทในเครือพันธมิตรของบริษัทฯ</p>

                  <p>ผู้สมัครงานสามารถยกเลิกความยินยอมได้ตามสิทธิของเจ้าของข้อมูลได้ที่</p>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs">
                    <p><strong>ผู้ควบคุมข้อมูลส่วนบุคคล:</strong> บริษัท ดั๊บเบิ้ล เอ (1991) จำกัด (มหาชน)</p>
                    <p><strong>สถานที่ติดต่อ:</strong> ฝ่ายสรรหาและคัดเลือกบุคลากร</p>
                    <p className="pl-24">187/3 หมู่ที่ 1 ถนนบางนา-ตราด กม. 42 ตำบลบางวัว อำเภอบางปะกง</p>
                    <p className="pl-24">จังหวัดฉะเชิงเทรา 24180</p>
                    <p><strong>Email:</strong> recruit@doublea1991.com</p>
                  </div>

                  <p>ผู้สมัครงานสามารถตรวจสอบรายละเอียดเกี่ยวกับสิทธิอื่นๆ ของผู้สมัครงานได้ที่ <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://www.doubleapaper.com/privacy-policy</a></p>

                  <p>ทั้งนี้กรณีผู้สมัครงานระบุข้อมูลส่วนบุคคลในส่วนข้อมูลอ่อนไหวอื่นๆ นอกเหนือจากรายละเอียดที่บริษัทฯ ร้องขอ ใน Resume และ CV ซึ่งนำส่งให้กับบริษัทฯ ผู้สมัครงานรับทราบ และยินยอมให้บริษัทฯ ประมวลผลข้อมูลอ่อนไหวที่ผู้สมัครงานระบุไว้โดยชัดแจ้งเพื่อวัตถุประสงค์ตามที่ระบุข้างต้น และยอมรับรองว่าข้อมูลที่นำส่งให้แก่บริษัทฯ เพื่อทำการประมวลผลข้อมูลนั้นถูกต้อง และเป็นความจริงทุกประการ</p>
                </>
              ) : (
                <>
                  <p>The Applicant gives consent to the Company to collect, use, or disclose the Applicant's sensitive personal data, including, i.e., weight, height, health conditions (the "<strong>Sensitive Data</strong>") for considering the employment and the job position of the Company and/or the Company's alliance. The Company will collect the Sensitive Data for 5 years from the date that the Applicant applies for a job with the Company and/or the Company's alliance.</p>

                  <p>According to the right of the data subject, the Applicant can request to withdraw the consent given for the purpose(s) above though the contact below:</p>

                  <div className="bg-gray-50 p-3 rounded-lg text-xs">
                    <p><strong>Data Controller:</strong> Double A (1991) Public Company Limited</p>
                    <p><strong>Address:</strong> Recruitment Department, 187/3 Moo 1, Bangna-Trad Km. 42 Road, Bangwua,</p>
                    <p className="pl-16">Bangpakong, Chachoengsao 24180, Thailand.</p>
                    <p><strong>Email:</strong> recruit@doublea1991.com</p>
                  </div>

                  <p>The Application can find the information of the Personal Data Protection Policy of the Company at <a href="https://www.doubleapaper.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">https://www.doubleapaper.com/privacy-policy</a>.</p>

                  <p>In case there is any other sensitive personal data, which is not requested by the Company, in the Resume or CV provided to the Company, the Applicant has acknowledged and given the explicit consent to the Company to collect, use, or disclose the said sensitive personal data for the above purpose. The Applicant also certifies that all information provided to the Company is true and correct.</p>
                </>
              )}
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
            <input
              type="checkbox"
              id="pdpa-check"
              checked={pdpaAccepted}
              onChange={(e) => setPdpaAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-all cursor-pointer accent-indigo-600"
            />
            <label htmlFor="pdpa-check" className="text-sm text-gray-700 cursor-pointer select-none leading-relaxed">
              {lang === 'th'
                ? 'ข้าพเจ้ารับทราบและยอมรับว่าข้าพเจ้าได้อ่าน เข้าใจ และยินยอมตามรายละเอียดเกี่ยวกับข้อมูลส่วนบุคคล และความยินยอมในการประมวลผลข้อมูลข้างต้น'
                : 'I acknowledge that I have read, understood, and agree to the Privacy Notice and Consent to Processing the Personal Data as stated above.'
              }
            </label>
          </div>
        </div>
      </Modal>

      {/* Tracking System Modal */}
      <TrackingSystem isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} lang={lang} />
      <CookieConsent lang={lang} />

    </div>
  );
}
