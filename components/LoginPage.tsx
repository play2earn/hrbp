
import React, { useState } from 'react';
import { User, Shield, Mail, Lock, Globe, ArrowLeft, Briefcase } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const t = TRANSLATIONS[lang];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { user, error } = await api.auth.signIn(email, password);

      if (error) {
        throw error;
      }

      if (user) {
        // Auto-detect role from the user object
        onLogin(user.role as Role);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Show specific message if account is pending (passed from api.ts)
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const [isRegistering, setIsRegistering] = useState(false);
  const [regData, setRegData] = useState({
    full_name: '',
    phone: '',
    role: 'mod',
    email: '',
    password: ''
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await api.auth.signUp(regData);
      if (error) throw error;

      alert('Registration Successful! Please login.');
      setIsRegistering(false);
      setRegData({ full_name: '', phone: '', role: 'mod', email: '', password: '' });
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white sm:bg-slate-50 font-sans flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center cursor-pointer" onClick={onBack}>
          <div className="w-8 h-8 bg-indigo-600 rounded-lg mr-2 flex items-center justify-center text-white font-bold">N</div>
          <span className="font-bold text-xl text-gray-900">{t.appTitle}</span>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="text-gray-500 hover:text-indigo-600 font-medium text-sm hidden sm:block">Home</button>
          <button onClick={onToggleLang} className="text-gray-500 hover:text-indigo-600 font-medium text-sm flex items-center gap-1"><Globe className="w-4 h-4" /> {lang.toUpperCase()}</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl sm:shadow-xl sm:shadow-indigo-100/50 sm:border border-gray-100 overflow-hidden p-6 sm:p-10 animate-in fade-in zoom-in-95 duration-300">

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{isRegistering ? 'Create Account' : t.actions.login}</h1>
            <p className="text-gray-500 text-sm">{isRegistering ? 'Join the team' : 'For moderators and administrators'}</p>
          </div>

          {/* Login/Register Toggle */}
          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Role Toggle for Login Context - simplified to just act as a filter/context since auth is now DB based */}
              {/* Role Toggle Removed - Auto-detected from DB */}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Mail className="w-5 h-5" /></div>
                  <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="name@novarecruit.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400"><Lock className="w-5 h-5" /></div>
                  <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-indigo-500 focus:outline-none" placeholder="••••••••" />
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-sky-400 to-indigo-500 hover:from-sky-500 hover:to-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg mt-2 disabled:opacity-70">
                {isLoading ? 'Authenticating...' : 'Login'}
              </button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsRegistering(true)} className="text-sm text-indigo-600 hover:underline font-medium">
                  Need an account? Register
                </button>
              </div>
            </form>

          ) : (

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                <Input value={regData.full_name} onChange={(e) => setRegData({ ...regData, full_name: e.target.value })} required placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                <select
                  value={regData.role}
                  onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                  className="block w-full px-3 py-3 border border-gray-200 rounded-xl bg-gray-50/50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="mod">Moderator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                <Input value={regData.phone} onChange={(e) => setRegData({ ...regData, phone: e.target.value })} required placeholder="081-234-5678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                <Input type="email" value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} required placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                <Input type="password" value={regData.password} onChange={(e) => setRegData({ ...regData, password: e.target.value })} required placeholder="Create a password" />
              </div>

              {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>}

              <button type="submit" disabled={isLoading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg mt-4 disabled:opacity-70">
                {isLoading ? 'Creating Account...' : 'Register'}
              </button>

              <div className="text-center mt-4">
                <button type="button" onClick={() => setIsRegistering(false)} className="text-sm text-gray-500 hover:text-gray-800 flex items-center justify-center gap-1 mx-auto">
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
