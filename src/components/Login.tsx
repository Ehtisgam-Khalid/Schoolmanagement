/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { GraduationCap, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { motion } from 'motion/react';
import { authService } from '../services/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login = ({ onLoginSuccess }: LoginProps) => {
  const [isLogin, setIsLogin] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [className, setClassName] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      let data;
      if (isLogin) {
        data = await authService.login({ email, password });
      } else {
        data = await authService.register({ name, email, password, className });
      }
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.response?.data?.error || (isLogin ? 'Login failed' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06080b] relative overflow-hidden font-sans">
      {/* Dynamic Animated Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 rounded-full blur-[100px]" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>
      
      <motion.div 
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-[480px] px-6 relative z-10 py-12"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.5, rotate: -15 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', damping: 10 }}
            className="inline-flex items-center justify-center p-5 bg-gradient-to-tr from-primary via-primary to-indigo-600 rounded-[2.5rem] shadow-[0_20px_50px_rgba(8,_126,_164,_0.3)] mb-8"
          >
            <GraduationCap className="h-12 w-12 text-white" />
          </motion.div>
          <h1 className="text-5xl font-black font-display text-white tracking-tight mb-2">EduFlow</h1>
          <p className="text-slate-400 font-medium text-lg tracking-tight">
            {isLogin ? 'Digital Campus Management System' : 'Join our vibrant academic community'}
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[40px] border border-slate-800/50 shadow-2xl shadow-black/50">
          <form onSubmit={handleSubmit} className="space-y-7">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center p-4 text-sm text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20 shadow-inner"
              >
                <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </motion.div>
            )}
            
            <div className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Full Name</label>
                    <div className="relative group">
                      <Mail className="absolute left-5 top-4 h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="e.g. Johnathan Smith"
                        className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl pl-14 pr-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans text-sm"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Official Email</label>
                <div className="relative group text-white">
                  <Mail className="absolute left-5 top-4 h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="student@eduflow.edu"
                    className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl pl-14 pr-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Security Password</label>
                  {isLogin && <a href="#" className="text-[10px] font-black text-primary hover:text-primary/80 uppercase tracking-widest transition-colors">Forgot?</a>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-4 h-5 w-5 text-slate-600 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800/80 rounded-2xl pl-14 pr-5 py-4 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans text-sm"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-8 rounded-2xl text-base font-black shadow-[0_20px_40px_rgba(8,_126,_164,_0.2)] group bg-primary hover:bg-primary/90" isLoading={loading}>
              {isLogin ? 'AUTHENTICATE & ENTER' : 'START YOUR JOURNEY'}
              {!loading && <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1.5 transition-transform" />}
            </Button>
          </form>

          {/* Quick Access Info */}
          {isLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-12 pt-10 border-t border-slate-800/50"
            >
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => { setEmail('admin@eduflow.com'); setPassword('admin123'); }}
                  className="bg-slate-950/40 p-4 rounded-3xl border border-slate-800/50 hover:border-primary/50 transition-all cursor-pointer group text-left"
                >
                  <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-2">Administrator</p>
                  <p className="text-xs font-bold text-white mb-1">Super User</p>
                  <p className="text-[9px] text-slate-600 font-mono italic">Click to fill</p>
                </div>
                <div 
                  onClick={() => { setEmail('student@eduflow.com'); setPassword('student123'); }}
                  className="bg-slate-950/40 p-4 rounded-3xl border border-slate-800/50 hover:border-indigo-500/50 transition-all cursor-pointer group text-left"
                >
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2">Student Portal</p>
                  <p className="text-xs font-bold text-white mb-1">Demo Student</p>
                  <p className="text-[9px] text-slate-600 font-mono italic">Click to fill</p>
                </div>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-3 text-[10px] text-slate-600 bg-slate-950/50 py-3 px-6 rounded-2xl border border-slate-800/30 w-full">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold tracking-tight">Academic Server: Online & Responsive</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-12 text-center">
           <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
             &copy; 2026 EduFlow Systems &bull; Precise Academic Control
           </p>
        </div>
      </motion.div>
    </div>
  );
};
