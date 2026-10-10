import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Language } from '../utils/translations';
import { X, Lock, Mail, User, Phone, MapPin, Eye, EyeOff, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  lang,
  initialMode = 'login',
  onSuccess,
}) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [district, setDistrict] = useState('Kigali (Gasabo)');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const res = await login(email, password);
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Invalid credentials');
        }
      } else {
        if (!name.trim()) {
          setError(lang === 'rw' ? 'Shyiramo amazina yawe yose' : 'Please provide your full name');
          setIsLoading(false);
          return;
        }
        const res = await register({ email, password, name, phone, district });
        if (res.success) {
          onSuccess?.();
          onClose();
        } else {
          setError(res.error || 'Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (role: 'admin' | 'seeker') => {
    if (role === 'admin') {
      setEmail('admin@akazi.rw');
      setPassword('AdminRwanda2026!');
      setMode('login');
    } else {
      setEmail('seeker@akazi.rw');
      setPassword('AkaziSeeker2026!');
      setMode('login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="relative w-full max-w-md bg-[#fffdf7] border border-[#d9ded4] rounded-3xl shadow-2xl overflow-hidden my-auto p-6 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#596b5e] hover:bg-[#e9eee4] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Badge */}
        <div className="text-center space-y-1 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#174332]/10 text-[#174332] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#efbd43]" />
            <span>{mode === 'login' ? (lang === 'rw' ? 'Injira muri AkaziConnect' : 'Account Sign In') : (lang === 'rw' ? 'Iyandikishe' : 'Create Job Seeker Account')}</span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#173b2d]">
            {mode === 'login'
              ? lang === 'rw'
                ? 'Komeza ku mwirondoro wawe'
                : 'Welcome back to AkaziConnect'
              : lang === 'rw'
              ? 'Tangira ubusabe bwawe none'
              : 'Empower your career in Rwanda'}
          </h2>
          <p className="text-xs text-[#596b5e]">
            {mode === 'login'
              ? lang === 'rw'
                ? 'Injira kugira ngo urebe ubusabe bwawe n’ibyangombwa'
                : 'Sign in to access your dashboard, documents, and applied roles'
              : lang === 'rw'
              ? 'Fungura konti yo gusaba akazi mu buryo bwizewe'
              : 'Create your profile, upload your CVs, and apply with instant verification'}
          </p>
        </div>



        {error && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <>
              <div>
                <label className="block text-xs font-bold text-[#173b2d] mb-1">
                  {lang === 'rw' ? 'Amazina Yose' : 'Full Name'} *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-[#799083]" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marie Claire Mukamana"
                    className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#173b2d] mb-1">
                    {lang === 'rw' ? 'Telefone' : 'Phone'} (MTN/Airtel)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-4 h-4 text-[#799083]" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+250 788 000 000"
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#173b2d] mb-1">
                    {lang === 'rw' ? 'Akarere' : 'District'}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-4 h-4 text-[#799083]" />
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
                    >
                      <option value="Kigali (Gasabo)">Gasabo (Kigali)</option>
                      <option value="Kigali (Kicukiro)">Kicukiro (Kigali)</option>
                      <option value="Kigali (Nyarugenge)">Nyarugenge (Kigali)</option>
                      <option value="Musanze (Amajyaruguru)">Musanze</option>
                      <option value="Rubavu (Iburengerazuba)">Rubavu</option>
                      <option value="Huye (Amajyepfo)">Huye</option>
                      <option value="Rwamagana (Iburasirazuba)">Rwamagana</option>
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-[#173b2d] mb-1">
              {lang === 'rw' ? 'Imeli (Email)' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-[#799083]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.rw"
                className="w-full pl-9 pr-3 py-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#173b2d] mb-1">
              {lang === 'rw' ? 'Ijambo ry’ibanga' : 'Password'} *
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-[#799083]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2.5 bg-white border border-[#e4e5d9] rounded-xl text-xs text-[#173b2d] focus:outline-none focus:ring-2 focus:ring-[#174332]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-[#799083] hover:text-[#173b2d]"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-[#174332] hover:bg-[#102e24] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span>{lang === 'rw' ? 'Tegereza...' : 'Processing...'}</span>
            ) : (
              <>
                <span>
                  {mode === 'login'
                    ? lang === 'rw'
                      ? 'Injira muri Sisitemu'
                      : 'Sign In to Dashboard'
                    : lang === 'rw'
                    ? 'Fungura Konti Nshya'
                    : 'Create Account & Continue'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-6 pt-4 border-t border-[#e4e5d9] text-center text-xs text-[#596b5e]">
          {mode === 'login' ? (
            <p>
              {lang === 'rw' ? 'Ntabwo uragira konti?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
                className="font-bold text-[#174332] underline hover:text-[#102e24]"
              >
                {lang === 'rw' ? 'Iyandikishe hano' : 'Register now'}
              </button>
            </p>
          ) : (
            <p>
              {lang === 'rw' ? 'Usanzwe ufite konti?' : 'Already have an account?'}{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="font-bold text-[#174332] underline hover:text-[#102e24]"
              >
                {lang === 'rw' ? 'Injira hano' : 'Sign in'}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
