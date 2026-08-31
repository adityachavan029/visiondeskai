import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, theme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isLogin ? '/api/login' : '/api/signup';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const res = await axios.post(endpoint, payload);
      if (res.data && res.data.access_token) {
        localStorage.setItem('token', res.data.access_token);
        if (res.data.user) {
          localStorage.setItem('user', JSON.stringify(res.data.user));
          onAuthSuccess(res.data.user);
        } else {
          onAuthSuccess({ email: formData.email });
        }
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className={`relative w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl overflow-hidden transition-colors ${
        isDark ? 'bg-[#0f1117]/95 border-slate-800 text-slate-100' : 'bg-white/95 border-slate-200 text-slate-900'
      }`}>
        
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600" />
        
        <button
          data-cursor="CLOSE"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-xl transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800/60' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl border mb-3 ${
            isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-800'
          }`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {isLogin ? 'Sign in to access your enterprise workstation' : 'Register to get started with VisionDesk AI'}
          </p>
        </div>

        {/* Tab Selector */}
        <div className={`flex p-1.5 rounded-2xl border mb-6 ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-slate-100 border-slate-200'
        }`}>
          <button
            data-cursor="SIGN IN"
            onClick={() => { setIsLogin(true); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold font-mono rounded-xl transition-all ${
              isLogin
                ? isDark ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            data-cursor="REGISTER"
            onClick={() => { setIsLogin(false); setError(null); }}
            className={`flex-1 py-2 text-xs font-semibold font-mono rounded-xl transition-all ${
              !isLogin
                ? isDark ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'bg-slate-900 text-white shadow-md'
                : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-sans">
          {!isLogin && (
            <div>
              <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Full Name</label>
              <div className="relative">
                <User className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="John Doe"
                  className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                    isDark
                      ? 'bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                      : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600'
                  }`}
                />
              </div>
            </div>
          )}

          <div>
            <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Email Address</label>
            <div className="relative">
              <Mail className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600'
                }`}
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-mono mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Password</label>
            <div className="relative">
              <Lock className={`absolute left-3 top-3 w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-9 pr-4 py-2.5 rounded-xl text-xs focus:outline-none transition-all ${
                  isDark
                    ? 'bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500'
                    : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-600'
                }`}
              />
            </div>
          </div>

          <button
            data-cursor="SUBMIT"
            type="submit"
            disabled={loading}
            className={`w-full py-3 mt-2 font-semibold font-mono rounded-xl text-xs transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer ${
              isDark
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLogin ? 'Sign In to VisionDesk' : 'Create VisionDesk Account'}</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
