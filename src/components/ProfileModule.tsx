/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { User, Mail, Phone, MapPin, Shield, Calendar, Edit2, Camera } from 'lucide-react';
import { authService } from '../services/api';
import { motion } from 'motion/react';

export const ProfileModule = () => {
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    authService.getMe().then(setUser);
  }, []);

  if (!user) return <div className="p-8 animate-pulse bg-slate-100 rounded-3xl h-64" />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="relative h-48 bg-gradient-to-r from-primary to-indigo-600 rounded-3xl overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute inset-0 bg-black/10" />
      </div>

      <div className="relative px-8 -mt-20">
        <div className="flex flex-col md:flex-row items-end md:items-center space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative group">
            <div className="h-32 w-32 rounded-3xl bg-white p-2 shadow-2xl ring-4 ring-white/50 overflow-hidden">
              <div className="h-full w-full bg-slate-100 rounded-2xl flex items-center justify-center text-4xl font-bold text-primary font-display overflow-hidden">
                {user.profilePic ? (
                  <img src={user.profilePic} className="h-full w-full object-cover" alt={user.name} />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
            </div>
            <button className="absolute bottom-2 right-2 p-2 bg-primary text-white rounded-xl shadow-lg border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div className="flex-1 text-center md:text-left pt-2">
            <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">{user.name}</h2>
            <div className="flex items-center justify-center md:justify-start mt-1 space-x-2">
              <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest">
                {user.role}
              </span>
              <span className="text-slate-400 text-sm font-medium">ID: #{user.id.slice(0, 8)}</span>
            </div>
          </div>
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="md:col-span-2 space-y-8">
            <Card title="Personal Information" className="border-slate-200/60 shadow-xl shadow-slate-200/10 p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
                <div className="space-y-1.5 px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Mail className="h-3.5 w-3.5 mr-2" /> Full Email
                  </label>
                  <p className="text-slate-900 font-bold font-sans">{user.email}</p>
                </div>
                <div className="space-y-1.5 px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Phone className="h-3.5 w-3.5 mr-2" /> Phone Number
                  </label>
                  <p className="text-slate-900 font-bold font-sans">{user.parentContact || '+92 300 1234567'}</p>
                </div>
                <div className="space-y-1.5 px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Shield className="h-3.5 w-3.5 mr-2" /> Nationality ID / Roll No
                  </label>
                  <p className="text-slate-900 font-bold font-sans">{user.cnic || user.rollNumber || 'N/A'}</p>
                </div>
                <div className="space-y-1.5 px-1">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-2" /> Join Date
                  </label>
                  <p className="text-slate-900 font-bold font-sans">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'August 12, 2024'}</p>
                </div>
              </div>
            </Card>

            <Card title="Address & Residence" className="border-slate-200/60 shadow-xl shadow-slate-200/10 p-6">
              <div className="flex items-start space-x-4 mt-4">
                <div className="p-3 bg-slate-100 rounded-2xl text-slate-400">
                  <MapPin className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-slate-900 font-bold leading-relaxed">
                    {user.address || 'Address not listed' }
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="Account Security" className="border-slate-200/60 shadow-xl shadow-slate-200/10 p-6">
              <div className="space-y-4 mt-4">
                <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Change Password</p>
                  <p className="text-[10px] text-slate-500 font-medium">Last changed 3 months ago</p>
                </button>
                <button className="w-full text-left px-4 py-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-100">
                  <p className="text-xs font-bold text-slate-900">Two-Factor Auth</p>
                  <p className="text-[10px] text-emerald-500 font-bold">Enabled</p>
                </button>
              </div>
            </Card>

            <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-xl font-bold font-display leading-tight">School Support</h3>
                <p className="text-slate-400 text-sm mt-2 font-medium">Need help with your account? Our team is available 24/7.</p>
                <Button variant="outline" className="w-full mt-6 rounded-xl border-slate-700 hover:bg-white/5 text-white">
                  Contact Support
                </Button>
              </div>
              <div className="absolute bottom-0 right-0 h-24 w-24 translate-x-1/4 translate-y-1/4 bg-primary/20 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
