/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle2, DollarSign, CreditCard, Clock, FileText, Plus, Download, Filter } from 'lucide-react';
import { studentService, api, authService } from '../services/api';
import { Student } from '../types';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const FeeModule = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [fees, setFees] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [paying, setPaying] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'pending'>('all');

  const fetchData = async () => {
    try {
      const u = await authService.getMe();
      setUser(u);
      
      if (u.role === 'student') {
        const feeData = await studentService.getFees();
        setFees(feeData);
      } else {
        const studentData = await studentService.getStudents();
        setStudents(studentData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handlePayment = async (id: string) => {
    setPaying(id);
    try {
      await studentService.payFee(id);
      await fetchData();
      alert('Fee paid successfully! Receipt has been generated.');
    } catch (err) {
      alert('Payment failed. Please try again.');
    } finally {
      setPaying(null);
    }
  };

  const stats = [
    { label: 'Total Expected', value: 'PKR 1,250,000', icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Received', value: 'PKR 840,000', icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Pending', value: 'PKR 410,000', icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const filtered = user?.role === 'student' 
    ? students.filter(s => s.id === user.id)
    : students.filter(s => filter === 'all' || s.feeStatus === filter);

  if (user?.role === 'student') {
    const pendingFees = fees.filter(f => f.status === 'pending');
    const totalPending = pendingFees.reduce((acc, f) => acc + f.amount, 0);

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
                <span className="text-xs font-black uppercase tracking-widest">Outstanding Balance</span>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-2">
                {totalPending > 0 ? `PKR ${totalPending.toLocaleString()}` : 'No Dues'}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8">
                {totalPending > 0 
                  ? `You have ${pendingFees.length} pending fee records for the current term.`
                  : 'All dues for the current term have been successfully paid. Great job!'}
              </p>
              
              <div className="flex items-center space-x-4">
                {totalPending > 0 && (
                  <Button 
                    className="rounded-xl px-8 shadow-lg shadow-primary/20"
                    onClick={() => handlePayment(pendingFees[0].id)}
                    isLoading={paying === pendingFees[0].id}
                  >
                    Pay First Bill
                  </Button>
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

          <Card title="Payment Records" className="p-6">
            <div className="space-y-4 mt-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {fees.length === 0 ? (
                <div className="py-8 text-center text-slate-400 font-medium italic">No fee history found.</div>
              ) : (
                fees.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center border transition-colors",
                        item.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : "bg-white border-slate-200 text-slate-400"
                      )}>
                        <FileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">
                          {new Date(item.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-black text-slate-900">PKR {item.amount.toLocaleString()}</p>
                      <div className="mt-1">
                        {item.status === 'paid' ? (
                          <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 flex items-center">
                            <CheckCircle2 className="h-2.5 w-2.5 mr-1" /> Paid
                          </span>
                        ) : (
                          <button 
                            onClick={() => handlePayment(item.id)}
                            className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer"
                          >
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
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
