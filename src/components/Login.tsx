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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0c10] relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]" />
      
      <motion.div 
        key={isLogin ? 'login' : 'register'}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-[440px] px-6 relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-primary to-indigo-600 rounded-3xl shadow-2xl shadow-primary/40 mb-6"
          >
            <GraduationCap className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold font-display text-white tracking-tight">EduFlow</h1>
          <p className="text-slate-400 mt-3 font-medium">
            {isLogin ? 'Empowering the next generation of learners' : 'Create your student account today'}
          </p>
        </div>

        <div className="glass p-8 md:p-10 rounded-[32px] border-slate-700/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="flex items-center p-4 text-sm text-rose-400 bg-rose-500/10 rounded-2xl border border-rose-500/20"
              >
                <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </motion.div>
            )}
            
            <div className="space-y-5">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Class / Grade</label>
                    <div className="relative group">
                      <GraduationCap className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <input
                        type="text"
                        placeholder="Grade 10"
                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group text-white">
                  <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="email"
                    placeholder="name@school.com"
                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all font-sans"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-xs px-1">
                <label className="flex items-center text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                  <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-800 text-primary focus:ring-primary/40 transition-all" />
                  Remember for 30 days
                </label>
                <a href="#" className="text-primary hover:text-primary/80 font-bold transition-colors">Forgot password?</a>
              </div>
            )}

            <Button type="submit" className="w-full py-7 rounded-2xl text-base font-bold shadow-xl shadow-primary/20 group" isLoading={loading}>
              {isLogin ? 'Sign In to Dashboard' : 'Create Account'}
              {!loading && <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />}
            </Button>
          </form>

          {/* Login option toggle removed as students are registered by Admin */}
          
          {isLogin && (
            <div className="mt-10 pt-8 border-t border-slate-700/30 text-center space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Administrator Dashboard</p>
                <div className="font-mono text-slate-300 text-xs bg-slate-800/60 py-2.5 px-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
                  <span>admin@eduflow.com <span className="text-slate-600 px-2">/</span> admin123</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-primary/70 font-black uppercase tracking-[0.2em]">Student Portal Demo</p>
                <div className="font-mono text-slate-300 text-xs bg-primary/5 py-2.5 px-3 rounded-xl border border-primary/20 flex items-center justify-between">
                  <span>student@eduflow.com <span className="text-slate-600 px-2">/</span> student123</span>
                </div>
              </div>
              
              <p className="text-[10px] text-slate-500 font-medium italic">
                * Students can manage attendance, results, fees & leave requests.
              </p>
            </div>
          )}
        </div>

        <p className="text-center mt-8 text-slate-500 text-xs font-medium">
          &copy; 2026 EduFlow Systems International. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
};
