
import React, { useState } from 'react';
import { Mail, Lock, Globe, ArrowLeft, User, Eye, EyeOff, CheckCircle, AlertCircle, Phone } from 'lucide-react';
import { Button, Input } from './UIComponents';
import { Role, Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { api } from '../services/api';

interface LoginPageProps {
  onLogin: (role: Role) => void;
  onBack: () => void;
  lang: Language;
  onToggleLang: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onBack, lang, onToggleLang }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const t = TRANSLATIONS[lang];

  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({
    full_name: '',
    phone: '',
    email: '',
    emp_id: '',
    hrms_username: ''
  });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await api.auth.signIn(username, password);

      if (response.needsRegistration) {
        // Prepare registration data
        setRegData({
          ...regData,
          emp_id: response.empId || '',
          hrms_username: username
        });
        setIsRegistering(true);
        setError('บัญชีของคุณยังไม่ได้ลงทะเบียนในระบบ กรุณากรอกข้อมูลเพิ่มเติม');
        setIsLoading(false);
        return;
      }

      if (response.error) {
        throw response.error;
      }

      if (response.user) {
        setSuccess('เชื่อมต่อระบบ HRMS สำเร็จ!');
        // Store user info for use in Dashboard
        localStorage.setItem('currentUser', JSON.stringify({
          full_name: response.user.full_name,
          email: response.user.email,
          role: response.user.role,
          emp_id: response.user.emp_id || ''
        }));
        setTimeout(() => {
          onLogin(response.user.role as Role);
        }, 500);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await api.auth.registerHrmsUser(regData as any);
      if (!result.success) {
        throw result.error;
      }

      setSuccess('บันทึกข้อมูลสำเร็จ! บัญชีของคุณอยู่ในสถานะรอแอดมินอนุมัติ');
      setTimeout(() => {
        setIsRegistering(false);
        setRegData({ full_name: '', phone: '', email: '', emp_id: '', hrms_username: '' });
        setUsername('');
        setPassword('');
      }, 3000);
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30 font-sans flex flex-col relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-indigo-300 to-purple-400 rounded-full blur-3xl opacity-15 float-slow"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-gradient-to-tr from-blue-300 to-indigo-400 rounded-full blur-3xl opacity-15 float-medium"></div>
      </div>

      {/* Navbar */}
      <nav className="w-full glass border-b border-white/20 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center cursor-pointer group" onClick={onBack}>
          <div className="w-9 h-9 animated-gradient rounded-xl mr-2.5 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-200 group-hover:scale-105 transition-transform">N</div>
          <span className="font-bold text-xl text-gray-900">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 font-medium text-sm hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all">
            <ArrowLeft className="w-4 h-4" /> Home
          </button>
          <button onClick={onToggleLang} className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-indigo-50 transition-all">
            <Globe className="w-4 h-4" /> {lang.toUpperCase()}
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4 relative z-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-indigo-200/50 border border-white/50 overflow-hidden p-8 sm:p-10 fade-in-up">

            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 animated-gradient rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg shadow-indigo-300/50">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {isRegistering ? 'Complete Profile' : 'HRMS Login'}
              </h1>
              <p className="text-gray-500">
                {isRegistering ? 'กรุณากรอกข้อมูลเพิ่มเติมเพื่อขอสิทธิ์ใช้งาน' : 'Sign in using your corporate account'}
              </p>
            </div>

            {/* Success Message */}
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center gap-3 fade-in-up">
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl flex items-center gap-3 fade-in-up">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            {!isRegistering ? (
              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">HRMS Username</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400"
                      placeholder="e.g. somchai_ka"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">HRMS Password</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full pl-12 pr-12 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all placeholder:text-gray-400"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-indigo-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full animated-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 btn-shine mt-4"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Authenticating...
                    </span>
                  ) : 'Sign In'}
                </button>
              </form>

            ) : (
              /* Registration Form (Complete Profile) */
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">Emp ID</label>
                    <input
                      type="text"
                      disabled
                      value={regData.emp_id}
                      className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-gray-700">HRMS Username</label>
                    <input
                      type="text"
                      disabled
                      value={regData.hrms_username}
                      className="block w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={regData.full_name}
                      onChange={(e) => setRegData({ ...regData, full_name: e.target.value })}
                      required
                      placeholder="John Doe"
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Company Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={regData.email}
                      onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                      required
                      placeholder="email@advanceagro.net"
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Phone</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="tel"
                      value={regData.phone}
                      onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                      placeholder="081-XXX-XXXX"
                      className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full animated-gradient text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-300/50 hover:shadow-xl hover:shadow-indigo-400/50 transition-all hover:-translate-y-0.5 disabled:opacity-70 mt-2 btn-shine"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Request'}
                </button>

                <button
                  type="button"
                  onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }}
                  className="w-full py-3 text-gray-500 hover:text-indigo-600 font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Cancel
                </button>
              </form>
            )}
          </div>

          {/* Footer Text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
