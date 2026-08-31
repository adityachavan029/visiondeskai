import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import axios from 'axios';

export default function AuthModal({ isOpen, onClose, onAuthSuccess, theme }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload = mode === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await axios.post(endpoint, payload);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user || { email, name }));
        onAuthSuccess(res.data.user || { email, name });
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div
        className={`w-full max-w-[92vw] sm:max-w-md rounded-3xl border p-6 sm:p-8 space-y-6 shadow-2xl relative transition-all ${
          isDark ? 'bg-[#09090b] border-zinc-800 text-zinc-100' : 'bg-white border-zinc-300 text-zinc-900'
        }`}
      >
        {/* Close Button */}
        <button
          data-cursor="CLOSE"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1">
          <Badge variant="monochrome" className="mb-1">ENTERPRISE AUTH</Badge>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">
            {mode === 'login' ? 'Welcome Back' : 'Create Intelligence Account'}
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 font-sans">
            {mode === 'login' ? 'Sign in to access your saved audit logs and reports.' : 'Register to unlock enterprise compliance persistence.'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-zinc-700 dark:text-zinc-300 font-semibold">FULL NAME</label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-all font-sans text-xs"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-zinc-700 dark:text-zinc-300 font-semibold">WORK EMAIL</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-all font-sans text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-700 dark:text-zinc-300 font-semibold">PASSWORD</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 dark:placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-all font-sans text-xs"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-300 text-[11px] flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <Button
            data-cursor="SUBMIT"
            type="submit"
            disabled={loading}
            className="w-full py-3 text-xs font-mono"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <span className="flex items-center space-x-2">
                <span>{mode === 'login' ? 'Sign In to Workspace' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="pt-2 text-center text-xs font-sans text-zinc-600 dark:text-zinc-400 border-t border-zinc-200 dark:border-zinc-800">
          {mode === 'login' ? (
            <p>
              Don't have an enterprise account?{' '}
              <button
                data-cursor="REGISTER"
                onClick={() => setMode('register')}
                className="font-bold text-zinc-900 dark:text-white underline hover:opacity-80 ml-1"
              >
                Register Now
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button
                data-cursor="LOGIN"
                onClick={() => setMode('login')}
                className="font-bold text-zinc-900 dark:text-white underline hover:opacity-80 ml-1"
              >
                Sign In
              </button>
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
