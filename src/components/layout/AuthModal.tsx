'use client';

import React, { useState } from 'react';
import { Shield, User, Lock, CheckCircle2, AlertCircle, Key, LogOut } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useCampus } from '@/context/CampusContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, loginUser, logoutUser } = useCampus();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setStatusMsg(null);
    const res = await loginUser(email, password);
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: 'Authenticated successfully with signed JWT.' });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setStatusMsg(null);
      }, 1200);
    } else {
      setStatusMsg({ type: 'error', text: res.error || 'Authentication failed.' });
    }
  };

  const handleQuickSwitch = async (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setLoading(true);
    setStatusMsg(null);
    const res = await loginUser(roleEmail, rolePass);
    setLoading(false);
    if (res.success) {
      setStatusMsg({ type: 'success', text: `Switched account to ${roleEmail}.` });
      setTimeout(() => {
        setIsAuthModalOpen(false);
        setStatusMsg(null);
      }, 1000);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={() => setIsAuthModalOpen(false)}
      title="CampusOS Authentication & RBAC"
      description="Secure JWT-based role authentication and permission delegation"
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Current User Card */}
        {currentUser && (
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold text-sm shadow-xs">
                  {currentUser.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {currentUser.fullName}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">{currentUser.email}</p>
                </div>
              </div>
              <Badge
                variant={currentUser.role === 'admin' ? 'purple' : currentUser.role === 'operator' ? 'warning' : 'neutral'}
                size="sm"
              >
                ROLE: {currentUser.role.toUpperCase()}
              </Badge>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={logoutUser}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:underline font-semibold"
              >
                <LogOut className="h-3.5 w-3.5" /> Sign Out
              </button>
            </div>
          </div>
        )}

        {statusMsg && (
          <div
            className={`rounded-xl border p-3 text-xs font-medium flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300'
            }`}
          >
            {statusMsg.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 1-Click Role Switcher */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-1.5">
            <Key className="h-3.5 w-3.5 text-amber-500" />
            Quick Demo Role Switcher
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickSwitch('admin@campusos.ai', 'CampusOS@2026!')}
              className="rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 p-2.5 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-purple-700 dark:text-purple-300">Admin</span>
              <span className="block text-[10px] text-slate-400">Dr. Evelyn Reed</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch('operator@campusos.ai', 'Operator@2026!')}
              className="rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/15 p-2.5 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-amber-700 dark:text-amber-300">Operator</span>
              <span className="block text-[10px] text-slate-400">Carlos Vance</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickSwitch('dean@campusos.ai', 'Dean@2026!')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5 text-left transition-colors"
            >
              <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Viewer</span>
              <span className="block text-[10px] text-slate-400">Dean Arthur Sterling</span>
            </button>
          </div>
        </div>

        {/* Manual Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="admin@campusos.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-sky-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-sky-600 hover:bg-sky-500 px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
