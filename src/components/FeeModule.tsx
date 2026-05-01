/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { DollarSign, CreditCard, Clock, FileText, Plus, Download, Filter } from 'lucide-react';
import { studentService, api, authService } from '../services/api';
import { Student } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const FeeModule = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'pending'>('all');

  React.useEffect(() => {
    authService.getMe().then(u => {
      setUser(u);
      studentService.getStudents().then(data => {
        setStudents(data);
        setLoading(false);
      });
    });
  }, []);

  const stats = [
    { label: 'Total Expected', value: 'PKR 1,250,000', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Received', value: 'PKR 840,000', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Pending', value: 'PKR 410,000', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const filtered = user?.role === 'student' 
    ? students.filter(s => s.id === user.id)
    : students.filter(s => filter === 'all' || s.feeStatus === filter);

  if (user?.role === 'student') {
    const myData = students.find(s => s.id === user.id);
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Fee & Payments</h2>
          <p className="text-slate-500 font-medium">View your tuition fee status and download receipts</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/5 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 text-primary mb-6">
                <CreditCard className="h-6 w-6" />
                <span className="text-xs font-black uppercase tracking-widest">Current Status</span>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-2">
                {myData?.feeStatus === 'paid' ? 'Clear' : 'PKR 15,000'}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                {myData?.feeStatus === 'paid' ? 'All dues for the current month have been successfully paid.' : 'Unpaid balance for the month of May 2026.'}
              </p>
              
              <div className="flex items-center space-x-4">
                {myData?.feeStatus !== 'paid' && (
                  <Button className="rounded-xl px-8 shadow-lg shadow-primary/20">Pay Online Now</Button>
                )}
                <Button variant="outline" className="rounded-xl border-slate-200">
                  <Download className="h-4 w-4 mr-2" />
                  Get Voucher
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="h-24 w-24" />
            </div>
          </Card>

          <Card title="Payment History" className="p-6">
            <div className="space-y-4 mt-6">
              {[
                { month: 'April 2026', amount: '15,000', status: 'paid', date: '05 Apr, 2026' },
                { month: 'March 2026', amount: '15,000', status: 'paid', date: '02 Mar, 2026' },
                { month: 'February 2026', amount: '15,000', status: 'paid', date: '10 Feb, 2026' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.month}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">{item.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-slate-900">PKR {item.amount}</p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Receipt Ready</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Finance Management</h2>
          <p className="text-slate-500 font-medium">Track school fees, receipts, and outstanding payments</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-slate-200">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/10">
            <div className="flex items-center space-x-4">
              <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 font-display mt-0.5">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-sm max-w-md">
        {(['all', 'paid', 'pending'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 py-2 px-4 text-sm font-bold rounded-xl transition-all capitalize",
              filter === f ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-display">No matching records found.</td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{s.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll: {s.rollNumber || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm font-medium text-slate-600">{s.class}-{s.section}</td>
                    <td className="px-6 py-5 text-sm font-bold text-slate-900">PKR 15,000</td>
                    <td className="px-6 py-5">
                      <span className={cn(
                        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter",
                        s.feeStatus === 'paid' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
                      )}>
                        {s.feeStatus || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
