
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, PDPA_TEXT, LANDING_CONTENT, FEATURED_JOBS } from './constants';
import { Role, Language, ApplicationForm, INITIAL_FORM_STATE } from './types';
import { ApplicantFormComp } from './components/ApplicantForm';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { PDFPreview } from './components/PDFPreview';
import { Button, Card, Modal } from './components/UIComponents';
import { Globe, Lock, User as UserIcon, ArrowRight, Briefcase, TrendingUp, Heart, Shield, MapPin, Building2, Search } from 'lucide-react';

import TrackingSystem from './components/TrackingSystem';

export default function App() {
  const [role, setRole] = useState<Role>('guest');
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
            <div className="flex items-center">
              <div className="w-9 h-9 bg-indigo-600 rounded-lg mr-3 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-200">N</div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{t.appTitle}</h1>
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
          <p>© 2024 NovaRecruit System.</p>
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
            <div className="flex items-center">
              <div className="w-9 h-9 animated-gradient rounded-xl mr-2.5 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200">N</div>
              <span className="font-bold text-xl text-gray-900">{t.appTitle}</span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button onClick={toggleLang} className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all">
                <Globe className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              <button onClick={() => setIsTrackingOpen(true)} className="hidden sm:flex text-sm font-medium text-gray-600 hover:text-indigo-600 transition-all items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50">
                <Search className="w-4 h-4" /> Check Status
              </button>
              <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-all px-3 py-2 rounded-lg hover:bg-indigo-50">
                Login
              </button>
              <Button onClick={() => handleApplyClick()} size="sm" className="btn-shine pulse-glow rounded-full">
                <span className="hidden sm:inline">{landingText.apply}</span>
                <span className="sm:hidden">Apply</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Premium Redesign */}
      <div className="pt-28 pb-20 sm:pt-36 sm:pb-28 relative overflow-hidden bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
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

          <p className="fade-in-up-delay-2 text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {landingText.heroSubtitle}
          </p>

          <div className="fade-in-up-delay-3 flex flex-col sm:flex-row justify-center gap-4">
            <Button
              size="lg"
              onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full px-8 py-4 shadow-xl shadow-indigo-300/50 hover:shadow-2xl hover:shadow-indigo-400/50 transition-all hover:-translate-y-1 btn-shine text-base"
            >
              {landingText.cta} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => setIsTrackingOpen(true)}
              className="rounded-full px-8 py-4 border-2 hover:bg-gray-50 transition-all text-base"
            >
              <Search className="mr-2 w-5 h-5" /> Track Application
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-xl mx-auto fade-in-up-delay-3">
            {[
              { value: '500+', label: 'Open Positions' },
              { value: '50+', label: 'Companies' },
              { value: '10K+', label: 'Hired' },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-gradient">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Values Section - Enhanced with glassmorphism */}
      <div className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{landingText.aboutTitle}</h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: TrendingUp, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50', ...landingText.values[0] },
              { icon: Briefcase, gradient: 'from-purple-500 to-pink-500', bg: 'bg-purple-50', ...landingText.values[1] },
              { icon: Shield, gradient: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50', ...landingText.values[2] },
              { icon: Heart, gradient: 'from-red-500 to-orange-500', bg: 'bg-red-50', ...landingText.values[3] },
            ].map((val, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-2xl bg-white border border-gray-100 shadow-sm card-hover icon-bounce relative overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br ${val.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                <div className={`icon-inner w-14 h-14 ${val.bg} rounded-2xl flex items-center justify-center mb-5 relative`}>
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${val.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                  <val.icon className={`w-7 h-7 text-gray-600 group-hover:text-white transition-colors duration-300 relative z-10`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-gray-600 leading-relaxed">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Section - Enhanced cards */}
      <div id="jobs" className="py-24 bg-gradient-to-b from-gray-50 to-white relative">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold mb-3">OPPORTUNITIES</span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{landingText.jobsTitle}</h2>
              <p className="text-gray-600 mt-2">Discover roles that match your skills and aspirations.</p>
            </div>
            <Button variant="outline" className="hidden sm:flex rounded-full px-6">View All Jobs</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_JOBS.map((job, idx) => (
              <div
                key={job.id}
                className="group bg-white rounded-2xl p-6 border border-gray-100 card-hover flex flex-col h-full relative overflow-hidden"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-100/50">
                      {job.dept}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">{job.title}</h3>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 mt-auto mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <span>{job.loc}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                    </div>
                    <span>{job.type}</span>
                  </div>
                </div>

                <Button onClick={() => handleApplyClick(job)} className="w-full mt-auto rounded-xl btn-shine">
                  {landingText.apply}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Button variant="outline" className="w-full rounded-full">View All Positions</Button>
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
              <div className="flex gap-3">
                {['facebook', 'twitter', 'linkedin'].map((social) => (
                  <a key={social} href="#" className="w-10 h-10 rounded-xl bg-gray-800 hover:bg-indigo-600 flex items-center justify-center transition-colors">
                    <span className="text-xs text-gray-400 hover:text-white uppercase">{social[0]}</span>
                  </a>
                ))}
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
            <p className="text-gray-500">© 2024 NovaRecruit. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>

      {/* PDPA Modal */}
      <Modal
        isOpen={isPdpaModalOpen}
        onClose={() => setIsPdpaModalOpen(false)}
        title="Terms & Conditions"
        footer={
          <div className="w-full flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsPdpaModalOpen(false)}>Cancel</Button>
            <Button onClick={handleStartApplication} disabled={!pdpaAccepted}>Accept & Continue</Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="h-64 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 leading-relaxed shadow-inner">
            <h4 className="font-bold text-gray-900 mb-2">Privacy Policy (PDPA)</h4>
            {PDPA_TEXT}
            <h4 className="font-bold text-gray-900 mt-4 mb-2">Terms of Service</h4>
            <p>
              1. You certify that all information provided is true and correct.<br />
              2. Any false information may result in disqualification.<br />
              3. We reserve the right to verify your background history.
            </p>
          </div>
          <div className="flex items-start gap-3 p-1">
            <input
              type="checkbox"
              id="pdpa-check"
              checked={pdpaAccepted}
              onChange={(e) => setPdpaAccepted(e.target.checked)}
              className="w-5 h-5 mt-0.5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 transition-all cursor-pointer accent-indigo-600"
            />
            <label htmlFor="pdpa-check" className="text-sm text-gray-700 cursor-pointer select-none">
              I acknowledge that I have read, understood, and agree to the Privacy Policy and Terms of Service.
            </label>
          </div>
        </div>
      </Modal>

      {/* Tracking System Modal */}
      <TrackingSystem isOpen={isTrackingOpen} onClose={() => setIsTrackingOpen(false)} />

    </div>
  );
}
