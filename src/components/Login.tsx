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
    <div className="min-h-screen flex items-center justify-center bg-[#06080b] relative overflow-hidden font-sans p-4 md:p-0">
      {/* Advanced Geometric Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/30 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[160px]" />
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-emerald-500/10 rounded-full blur-[140px]" />
        
        {/* Animated Particles Simulation (Visual) */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        
        {/* Floating Glass Shapes */}
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 left-1/4 w-96 h-96 border border-white/5 rounded-full"
        />
        <motion.div 
          animate={{ rotate: -360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] border border-white/5 rounded-[4rem]"
        />
      </div>
      
      <motion.div 
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[540px] relative z-10"
      >
        <div className="text-center mb-12">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="inline-flex items-center space-x-3 mb-6"
          >
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(8,126,164,0.5)]">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-widest font-display">EDUFLOW</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black font-display text-white tracking-tighter mb-4 leading-none uppercase">
            {isLogin ? 'System' : 'Join'} <span className="text-primary italic">Access</span>
          </h1>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] md:text-sm">
            {isLogin ? 'Mission-Critical Campus Node' : 'Initialize New Account Protocol'}
          </p>
        </div>

        <div className="bg-slate-900/40 backdrop-blur-2xl p-6 md:p-14 rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] relative group overflow-hidden">
          {/* Internal Glow */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[60px] rounded-full group-hover:bg-primary/30 transition-all duration-500" />
          
          <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y:0 }}
                className="flex items-center p-4 text-xs font-black uppercase tracking-widest text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20"
              >
                <AlertCircle className="h-4 w-4 mr-3 flex-shrink-0" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-6">
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] ml-1">Registry Name</label>
                  <input
                    type="text"
                    placeholder="FULL LEGAL NAME"
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl px-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-slate-950 transition-all font-sans text-sm font-bold tracking-tight uppercase"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em] ml-1">Terminal ID (Email)</label>
                <div className="relative group">
                  <Mail className="absolute left-6 top-5.5 h-4 w-4 text-slate-700 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="USER@EDUFLOW.SYS"
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl pl-14 pr-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-slate-950 transition-all font-sans text-sm font-bold tracking-tight uppercase"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.25em]">Security Key (Pass)</label>
                  {isLogin && <a href="#" className="text-[9px] font-black text-slate-500 hover:text-primary uppercase tracking-widest transition-colors">Reset Protocol?</a>}
                </div>
                <div className="relative group">
                  <Lock className="absolute left-6 top-5.5 h-4 w-4 text-slate-700 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl pl-14 pr-6 py-5 text-white placeholder:text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:bg-slate-950 transition-all font-sans text-sm font-bold tracking-tight"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full py-8 rounded-2xl text-sm font-black tracking-[0.2em] shadow-[0_15px_30px_rgba(8,126,164,0.3)] group bg-primary hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-[0.98]" isLoading={loading}>
              {isLogin ? 'INITIATE AUTHENTICATION' : 'CREATE CORE IDENTITY'}
              {!loading && <ArrowRight className="ml-3 h-4 w-4 group-hover:translate-x-1.5 transition-transform" />}
            </Button>
          </form>

          {/* Role Decryptors (Access Keys) */}
          {isLogin && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-14 pt-10 border-t border-slate-800/40"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => { setEmail('admin@eduflow.com'); setPassword('admin123'); }}
                  className="relative overflow-hidden bg-slate-950/60 p-5 rounded-3xl border border-slate-800/50 hover:border-primary/50 transition-all group flex items-center space-x-4 h-full"
                >
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg border border-primary/20 group-hover:bg-primary group-hover:text-white transition-all">A</div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Administrator</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Root Authority</p>
                  </div>
                </button>
                <button 
                  onClick={() => { setEmail('student@eduflow.com'); setPassword('student123'); }}
                  className="relative overflow-hidden bg-slate-950/60 p-5 rounded-3xl border border-slate-800/50 hover:border-indigo-500/50 transition-all group flex items-center space-x-4 h-full"
                >
                  <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-black text-lg border border-indigo-500/20 group-hover:bg-indigo-500 group-hover:text-white transition-all">S</div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-white uppercase tracking-widest">Student Portal</p>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-tight">Academic Node</p>
                  </div>
                </button>
              </div>
              
              <div className="mt-8 flex items-center justify-center space-x-3 text-[10px] text-slate-600 bg-slate-950/40 py-3.5 px-6 rounded-2xl border border-white/5 w-full">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="font-black uppercase tracking-[0.2em]">Primary Link Stabilized</span>
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-12 text-center">
           <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-slate-500 hover:text-white text-[11px] font-black uppercase tracking-[0.3em] transition-colors"
           >
             {isLogin ? 'Switch to Registration Interface' : 'Return to Authentication Terminal'}
           </button>
        </div>
      </motion.div>
    </div>
  );
};
