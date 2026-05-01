/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle2, DollarSign, CreditCard, Clock, FileText, Plus, Download, Filter, Eye, CheckCircle, XCircle, Share2, Printer, Search, AlertTriangle } from 'lucide-react';
import { studentService, adminService, api, authService } from '../services/api';
import { Student } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Input } from './ui/Input';

const ProofModal = ({ fee, onClose, onApprove }: { fee: any, onClose: () => void, onApprove: (id: string) => void }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden font-sans border border-slate-200"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-900">Payment Verification Proof</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircle className="h-6 w-6" /></button>
        </div>
        <div className="p-8">
          <div className="aspect-video bg-slate-100 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 overflow-hidden mb-6">
            {fee.screenshot === 'submitted_via_portal' ? (
              <div className="text-center p-6">
                <Share2 className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-400">Transaction proof was submitted via mobile app portal</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Ref ID: {fee.id.split('-')[0]}</p>
              </div>
            ) : (
              <img src={fee.screenshot} alt="Payment Proof" className="w-full h-full object-cover" />
            )}
          </div>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-500">Submission Date:</span>
              <span className="text-sm font-black text-slate-900">{new Date(fee.submissionDate || fee.date).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-bold text-slate-500">Amount to Verify:</span>
              <span className="text-sm font-black text-primary">PKR {fee.amount.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 flex space-x-3">
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Cancel</Button>
          <Button 
            className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700"
            onClick={() => onApprove(fee.id)}
          >
            Accept & Approve
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const ExtraChargeModal = ({ students, onClose, onSuccess }: { students: Student[], onClose: () => void, onSuccess: () => void }) => {
  const [formData, setFormData] = React.useState({
    targetType: 'individual', // individual, class, school
    targetClass: '',
    studentId: '',
    title: '',
    amount: '',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });
  const [loading, setLoading] = React.useState(false);

  const classes = Array.from(new Set(students.map(s => s.class))).filter(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.addExtraCharge(formData);
      onSuccess();
    } catch (err) {
      alert('Failed to add charge');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-200"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Add Dues / Charges</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><XCircle className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Charge Target</label>
            <div className="flex bg-slate-100 p-1 rounded-xl">
              {['individual', 'class', 'school'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData({...formData, targetType: t})}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-tighter rounded-lg transition-all",
                    formData.targetType === t ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {formData.targetType === 'individual' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Student</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required={formData.targetType === 'individual'}
              >
                <option value="">Select a student...</option>
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.rollNumber})</option>
                ))}
              </select>
            </div>
          )}

          {formData.targetType === 'class' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Class</label>
              <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/40 appearance-none"
                value={formData.targetClass}
                onChange={(e) => setFormData({...formData, targetClass: e.target.value})}
                required={formData.targetType === 'class'}
              >
                <option value="">Choose Class...</option>
                {classes.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          <Input 
            label="Charge Description (e.g. Annual Trip)" 
            required 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          <Input 
            label="Amount (PKR)" 
            type="number" 
            required 
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: e.target.value})}
          />
          <Input 
            label="Due Date" 
            type="date" 
            required 
            value={formData.dueDate}
            onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
          />
          <Button type="submit" className="w-full py-6 rounded-2xl shadow-lg mt-4" isLoading={loading}>
            {formData.targetType === 'school' ? 'Apply to All Students' : 
             formData.targetType === 'class' ? `Apply to Class ${formData.targetClass}` :
             'Apply to Selected Student'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

const VoucherModal = ({ fee, student, onClose }: { fee: any, student: any, onClose: () => void }) => {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden font-sans border border-slate-200"
      >
        <div className="p-8 border-b-2 border-dashed border-slate-100 flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">OFFICIAL FEE VOUCHER</h3>
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">EduFlow Management System</p>
          </div>
          <div className="bg-primary/10 p-3 rounded-2xl">
            <Plus className="h-6 w-6 text-primary" />
          </div>
        </div>

        <div className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Name</p>
              <p className="font-bold text-slate-900">{student?.name || 'Academic Scholar'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll Number</p>
              <p className="font-bold text-slate-900">{student?.rollNumber || 'S-2026'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</p>
              <p className="font-bold text-slate-900">{fee.title}</p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account #</p>
              <p className="font-bold text-slate-900">EduFlow-99-88776655</p>
            </div>
          </div>

          <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mt-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <span className="text-sm font-bold text-slate-500">Payable Amount</span>
              <span className="text-2xl font-black text-slate-900">PKR {fee.amount.toLocaleString()}</span>
            </div>
            <div className="pt-4 flex justify-between items-center">
              <span className="text-sm font-bold text-slate-500">Due Date</span>
              <span className="text-sm font-black text-rose-500 uppercase tracking-tight">10th of Current Month</span>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed italic">
            Note: After successful online transfer, please take a screenshot of the transaction confirmation and submit it via the "Submit Proof" button in your portal.
          </p>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex space-x-3">
          <Button onClick={() => window.print()} className="flex-1 rounded-xl bg-slate-900 hover:bg-slate-800">
            <Printer className="h-4 w-4 mr-2" /> Print PDF
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl">Close</Button>
        </div>
      </motion.div>
    </div>
  );
};

export const FeeModule = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [fees, setFees] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [paying, setPaying] = React.useState<string | null>(null);
  const [approving, setApproving] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'paid' | 'pending' | 'submitted'>('all');
  const [showVoucher, setShowVoucher] = React.useState<any>(null);
  const [showProof, setShowProof] = React.useState<any>(null);
  const [showExtraCharge, setShowExtraCharge] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const fetchData = async () => {
    try {
      const u = await authService.getMe();
      setUser(u);
      
      const [feeData, studentData] = await Promise.all([
        studentService.getFees(),
        u.role !== 'student' ? studentService.getStudents() : Promise.resolve([])
      ]);
      
      setFees(feeData);
      setStudents(studentData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handlePaymentSubmit = async (id: string) => {
    setPaying(id);
    try {
      await studentService.payFee(id, { screenshot: 'submitted_via_portal' });
      await fetchData();
      alert('Payment proof submitted successfully! Admin will verify your payment soon.');
    } catch (err) {
      alert('Submission failed. Please try again.');
    } finally {
      setPaying(null);
    }
  };

  const handleApprove = async (id: string) => {
    setApproving(id);
    try {
      await adminService.approveFee(id);
      await fetchData();
      alert('Fee approved successfully.');
    } catch (err) {
      alert('Approval failed.');
    } finally {
      setApproving(null);
      setShowProof(null);
    }
  };

  const stats = [
    { label: 'Total Expected', value: `PKR ${fees.reduce((acc, f) => acc + f.amount, 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Received', value: `PKR ${fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending/Unpaid', value: `PKR ${fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}`, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const filteredFees = fees.filter(f => {
    const matchesFilter = filter === 'all' || f.status === filter;
    if (!matchesFilter) return false;
    
    if (user?.role !== 'student' && searchQuery) {
      const student = students.find(s => s.id === f.studentId);
      const query = searchQuery.toLowerCase();
      return (
        student?.name?.toLowerCase().includes(query) || 
        student?.rollNumber?.toLowerCase().includes(query) ||
        f.title.toLowerCase().includes(query)
      );
    }
    return true;
  });

  if (user?.role === 'student') {
    const pendingFeesList = fees.filter(f => f.status !== 'paid');
    const myProfile = students.find(s => s.id === user.id) || user;
    const totalPending = pendingFeesList.reduce((acc, f) => acc + f.amount, 0);

    return (
      <div className="space-y-8">
        {showVoucher && <VoucherModal fee={showVoucher} student={myProfile} onClose={() => setShowVoucher(null)} />}
        
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Finances & Dues</h2>
          <p className="text-slate-500 font-medium">Manage your tuition fees and payment verification</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="p-8 border-slate-200 shadow-xl shadow-slate-200/5 relative overflow-hidden group bg-gradient-to-br from-white to-slate-50">
            <div className="relative z-10">
              <div className="flex items-center space-x-3 text-primary mb-6">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <CreditCard className="h-6 w-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-400">Next Payment Due</span>
              </div>
              <h3 className="text-4xl font-black text-slate-900 mb-2">
                {totalPending > 0 ? `PKR ${totalPending.toLocaleString()}` : 'Account Clear'}
              </h3>
              <p className="text-slate-500 text-sm font-medium mb-8 max-w-sm leading-relaxed">
                {totalPending > 0 
                  ? `Please pay your outstanding dues of PKR ${totalPending.toLocaleString()} to avoid any late payment penalties.`
                  : 'All your dues are currently settled. You can download previous receipts from the history section.'}
              </p>
              
              <div className="flex flex-wrap gap-3">
                {pendingFeesList.length > 0 && (
                  <>
                    <Button 
                      className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary group-hover:scale-105 transition-transform"
                      onClick={() => setShowVoucher(pendingFeesList.find(f => f.status === 'pending') || pendingFeesList[0])}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Get Voucher
                    </Button>
                    {pendingFeesList.some(f => f.status === 'pending') && (
                      <Button 
                        variant="outline"
                        className="rounded-xl px-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        onClick={() => {
                          const toPay = pendingFeesList.find(f => f.status === 'pending');
                          if (toPay) handlePaymentSubmit(toPay.id);
                        }}
                        isLoading={paying !== null}
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Submit Proof
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <DollarSign className="h-32 w-32" />
            </div>
          </Card>

          <Card title="Fee Transactions" className="p-6 border-slate-200 shadow-xl shadow-slate-200/10 bg-white">
            <div className="space-y-4 mt-6 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
              {fees.length === 0 ? (
                <div className="py-12 text-center text-slate-400 font-medium italic">No transactions found for your account.</div>
              ) : (
                fees.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-md transition-all">
                    <div className="flex items-center space-x-4">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center border transition-all",
                        item.status === 'paid' ? "bg-emerald-50 border-emerald-100 text-emerald-500" : 
                        item.status === 'submitted' ? "bg-blue-50 border-blue-100 text-blue-500" :
                        "bg-slate-50 border-slate-200 text-slate-400"
                      )}>
                        {item.status === 'paid' ? <CheckCircle className="h-6 w-6" /> : <FileText className="h-6 w-6" />}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{item.title}</p>
                        <div className="flex items-center space-x-3 mt-1.5">
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {new Date(item.date).toLocaleDateString()}
                          </p>
                          {item.dueDate && item.status === 'pending' && (
                            <p className={cn(
                              "text-[10px] font-black uppercase tracking-widest flex items-center",
                              new Date() > new Date(item.dueDate) ? "text-rose-500" : "text-amber-500"
                            )}>
                              <AlertTriangle className="h-3 w-3 mr-1" /> Due: {new Date(item.dueDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-sm font-black text-slate-950">PKR {item.amount.toLocaleString()}</p>
                      <div className="mt-1.5">
                        {item.status === 'paid' ? (
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                             Approved
                          </span>
                        ) : item.status === 'submitted' ? (
                          <span className="text-[10px] font-black uppercase tracking-[0.1em] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                             Verifying...
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                             <button 
                               onClick={() => setShowVoucher(item)}
                               className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                             >
                               Voucher
                             </button>
                             <span className="text-slate-300">|</span>
                             <button 
                               onClick={() => handlePaymentSubmit(item.id)}
                               className="text-[10px] font-black uppercase tracking-widest text-rose-500 hover:underline"
                             >
                               Unpaid
                             </button>
                          </div>
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

  // Admin View
  return (
    <div className="space-y-8">
      {showProof && <ProofModal fee={showProof} onClose={() => setShowProof(null)} onApprove={handleApprove} />}
      {showExtraCharge && <ExtraChargeModal students={students} onClose={() => setShowExtraCharge(false)} onSuccess={() => { setShowExtraCharge(false); fetchData(); }} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Finance Administration</h2>
          <p className="text-slate-500 font-medium">Monitor fee collections and approve payment submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-slate-200">
            <Download className="h-4 w-4 mr-2" /> Report
          </Button>
          <Button 
            className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20"
            onClick={() => setShowExtraCharge(true)}
          >
            <Plus className="h-4 w-4 mr-2" /> Other Charges
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/10">
            <div className="flex items-center space-x-4">
              <div className={cn("p-4 rounded-2xl", stat.bg, stat.color)}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-900 font-display">{stat.value}</h3>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
          <input 
            type="text"
            placeholder="Search student name, roll number... "
            className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex-1 flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm max-w-lg">
          {(['all', 'paid', 'submitted', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-1.5 px-3 text-[10px] font-black rounded-xl transition-all capitalize uppercase tracking-widest",
                filter === f ? "bg-slate-900 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <Card className="border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Student / Payee</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Description</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-8"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filteredFees.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-display">No matching records found.</td>
                </tr>
              ) : (
                filteredFees.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((f) => {
                  const student = students.find(s => s.id === f.studentId);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white shadow-inner",
                            f.status === 'paid' ? "bg-emerald-500" : "bg-slate-300"
                          )}>
                            {student?.name?.charAt(0) || 'S'}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{student?.name || 'Unknown Student'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Roll: {student?.rollNumber || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium text-slate-700">{f.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium italic">{new Date(f.date).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-950">PKR {f.amount.toLocaleString()}</p>
                        {f.lateFeeApplied && (
                          <span className="text-[9px] font-black text-rose-500 uppercase tracking-tighter">Incl. Late Fee (1,500)</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {f.dueDate ? (
                          <span className={cn(
                            "text-xs font-bold",
                            new Date() > new Date(f.dueDate) && f.status !== 'paid' ? "text-rose-500" : "text-slate-500"
                          )}>
                            {new Date(f.dueDate).toLocaleDateString()}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        {f.status !== 'paid' ? (
                          <div className="flex items-center justify-end space-x-2">
                             {f.status === 'submitted' ? (
                               <button 
                                onClick={() => setShowProof(f)}
                                className="inline-flex items-center justify-center h-8 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
                               >
                                 <Eye className="h-3.5 w-3.5 mr-1" /> View Proof
                               </button>
                             ) : (
                              <Button 
                                onClick={() => handleApprove(f.id)}
                                size="sm" 
                                className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-sm font-black uppercase tracking-widest px-4"
                                isLoading={approving === f.id}
                              >
                                Mark as Paid
                              </Button>
                             )}
                          </div>
                        ) : (
                          <span className="text-emerald-500 flex items-center justify-end text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
