/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle2, DollarSign, CreditCard, Clock, FileText, Plus, Download, Filter, Eye, CheckCircle, XCircle, Share2, Printer } from 'lucide-react';
import { studentService, adminService, api, authService } from '../services/api';
import { Student } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

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
    }
  };

  const stats = [
    { label: 'Total Expected', value: `PKR ${fees.reduce((acc, f) => acc + f.amount, 0).toLocaleString()}`, icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Received', value: `PKR ${fees.filter(f => f.status === 'paid').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}`, icon: CreditCard, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending/Unpaid', value: `PKR ${fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + f.amount, 0).toLocaleString()}`, icon: Clock, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  const isAdmin = user?.role === 'admin';

  if (user?.role === 'student') {
    const pendingFees = fees.filter(f => f.status === 'pending');
    const myProfile = students.find(s => s.id === user.id) || user;
    const totalPending = pendingFees.reduce((acc, f) => acc + f.amount, 0);

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
                {pendingFees.length > 0 && (
                  <>
                    <Button 
                      className="rounded-xl px-8 shadow-lg shadow-primary/20 bg-primary group-hover:scale-105 transition-transform"
                      onClick={() => setShowVoucher(pendingFees[0])}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Get Voucher
                    </Button>
                    <Button 
                      variant="outline"
                      className="rounded-xl px-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      onClick={() => handlePaymentSubmit(pendingFees[0].id)}
                      isLoading={paying === pendingFees[0].id}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Submit Proof
                    </Button>
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
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-1.5 flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> {new Date(item.date).toLocaleDateString()}
                        </p>
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
  const filteredFees = fees.filter(f => filter === 'all' || f.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Finance Administration</h2>
          <p className="text-slate-500 font-medium">Monitor fee collections and approve payment submissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="rounded-xl h-11 px-6 border-slate-200">
            <Download className="h-4 w-4 mr-2" /> Report
          </Button>
          <Button className="rounded-xl h-11 px-6 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4 mr-2" /> Create Invoice
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

      <div className="flex items-center justify-between space-x-4 max-w-lg mb-6">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Filter Records:</label>
        <div className="flex-1 flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
          {(['all', 'paid', 'submitted', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "flex-1 py-1.5 px-3 text-[10px] font-black rounded-xl transition-all capitalize uppercase tracking-tighter",
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
                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
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
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-display">No fee records found for the selected filter.</td>
                </tr>
              ) : (
                filteredFees.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((f) => {
                  const student = students.find(s => s.id === f.studentId);
                  return (
                    <tr key={f.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center font-bold text-white",
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
                      <td className="px-6 py-5 text-sm font-black text-slate-950">PKR {f.amount.toLocaleString()}</td>
                      <td className="px-6 py-5">
                        <span className={cn(
                          "inline-flex items-center px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                          f.status === 'paid' ? "bg-emerald-100 text-emerald-700" : 
                          f.status === 'submitted' ? "bg-blue-100 text-blue-700" :
                          "bg-rose-100 text-rose-700"
                        )}>
                          {f.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {f.status !== 'paid' ? (
                          <div className="flex items-center justify-end space-x-2">
                             {f.status === 'submitted' && (
                               <Button variant="outline" size="sm" className="h-8 text-[10px] border-blue-200 text-blue-600 hover:bg-blue-50">
                                 <Eye className="h-3.5 w-3.5 mr-1" /> View Proof
                               </Button>
                             )}
                             <Button 
                              size="sm" 
                              className="h-8 text-[10px] bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                              onClick={() => handleApprove(f.id)}
                              isLoading={approving === f.id}
                             >
                               Mark as Paid
                             </Button>
                          </div>
                        ) : (
                          <span className="text-emerald-500 flex items-center justify-end text-[10px] font-black uppercase">
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Verified
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
