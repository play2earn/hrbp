
import React, { useState, useEffect } from 'react';
import { TRANSLATIONS, PDPA_TEXT, LANDING_CONTENT, FEATURED_JOBS } from './constants';
import { Role, Language, ApplicationForm } from './types';
import { ApplicantFormComp } from './components/ApplicantForm';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
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

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg mr-2 flex items-center justify-center text-white font-bold">N</div>
              <span className="font-bold text-xl text-gray-900">{t.appTitle}</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={toggleLang} className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-1">
                <Globe className="w-4 h-4" /> {lang.toUpperCase()}
              </button>
              <button onClick={() => setIsTrackingOpen(true)} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                <Search className="w-4 h-4" /> Check Status
              </button>
              <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors">
                Login
              </button>
              <Button onClick={() => handleApplyClick()} size="sm" className="hidden sm:inline-flex">
                {landingText.apply}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 bg-gradient-to-b from-indigo-50/50 to-white relative overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 form-step-enter">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            {landingText.heroTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {landingText.heroSubtitle}
          </p>
          <div className="flex justify-center gap-4">
            <Button size="lg" onClick={() => document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' })} className="rounded-full px-8 py-4 shadow-xl shadow-indigo-200 hover:shadow-2xl transition-all hover:-translate-y-1">
              {landingText.cta} <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{landingText.aboutTitle}</h2>
            <div className="w-20 h-1.5 bg-indigo-600 mx-auto rounded-full"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', ...landingText.values[0] },
              { icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50', ...landingText.values[1] },
              { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-50', ...landingText.values[2] },
              { icon: Heart, color: 'text-red-600', bg: 'bg-red-50', ...landingText.values[3] },
            ].map((val, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 ${val.bg} ${val.color} rounded-xl flex items-center justify-center mb-4`}>
                  <val.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{val.title}</h3>
                <p className="text-gray-600">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Jobs Section */}
      <div id="jobs" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">{landingText.jobsTitle}</h2>
              <p className="text-gray-600 mt-2">Find your next role.</p>
            </div>
            <Button variant="outline" className="hidden sm:flex">View All</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_JOBS.map((job) => (
              <div key={job.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
                      {job.dept}
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 leading-tight">{job.title}</h3>
                  </div>
                </div>
                <div className="flex flex-col gap-2 mt-auto mb-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" /> {job.loc}
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> {job.type}
                  </div>
                </div>
                <Button onClick={() => handleApplyClick(job)} className="w-full mt-auto">
                  {landingText.apply}
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center sm:hidden">
            <Button variant="outline" className="w-full">View All Positions</Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center text-white font-bold text-2xl mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg mr-2 flex items-center justify-center">N</div>
                {t.appTitle}
              </div>
              <p className="text-gray-400 max-w-sm">
                Empowering businesses with top talent. Streamlining recruitment for a better future.
              </p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About Us</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Staff</h4>
              <button onClick={() => setShowLogin(true)} className="text-sm hover:text-white transition block mb-2">Staff Login</button>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
            <p>© 2024 NovaRecruit. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white">Privacy Policy</a>
              <a href="#" className="hover:text-white">Terms of Service</a>
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
