/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { applicationService, authService } from '../services/api';
import { FileText, Send, Calendar, CheckCircle, XCircle, Clock, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const LeaveApplicationModule = () => {
  const [applications, setApplications] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  
  // Student form state
  const [reason, setReason] = React.useState('');
  const [startDate, setStartDate] = React.useState('');
  const [endDate, setEndDate] = React.useState('');
  const [sending, setSending] = React.useState(false);

  const fetchApplications = async () => {
    try {
      const data = await applicationService.getApplications();
      if (Array.isArray(data)) {
        setApplications(data);
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error(err);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    authService.getMe().then(setUser);
    fetchApplications();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await applicationService.sendApplication({ reason, startDate, endDate });
      setReason('');
      setStartDate('');
      setEndDate('');
      fetchApplications();
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await applicationService.updateStatus(id, status);
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center"><CheckCircle className="h-3 w-3 mr-1" /> Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center"><XCircle className="h-3 w-3 mr-1" /> Rejected</span>;
      default:
        return <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center"><Clock className="h-3 w-3 mr-1" /> Pending</span>;
    }
  };

  if (loading) return <div className="space-y-4">{Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-3xl animate-pulse" />)}</div>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Leave Applications</h2>
        <p className="text-slate-500 font-medium">Submit and manage leave requests</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {user?.role === 'student' && (
          <div className="lg:col-span-1">
            <Card title="New Application" className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/10">
              <form onSubmit={handleSend} className="space-y-6 mt-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Reason for Leave</label>
                  <textarea
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all font-sans min-h-[120px]"
                    placeholder="Briefly explain why you need leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <input
                      type="date"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full py-6 rounded-2xl font-bold shadow-lg shadow-primary/20 group" isLoading={sending}>
                  Send Application
                  {!sending && <Send className="ml-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
                </Button>
              </form>
            </Card>
          </div>
        )}

        <div className={cn("space-y-6", user?.role === 'student' ? "lg:col-span-2" : "lg:col-span-3")}>
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display text-slate-900">
              {user?.role === 'student' ? 'My Applications' : 'Pending Requests'}
            </h3>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="rounded-xl border-slate-200">
                <Search className="h-4 w-4 mr-2 text-slate-400" />
                Search
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-medium font-display">No applications found.</p>
              </div>
            ) : (
              applications.map((app, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  key={app.id}
                >
                  <Card className="p-6 border-slate-200/60 hover:shadow-xl transition-all group overflow-visible">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start space-x-4">
                        <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                          <FileText className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-base font-bold text-slate-900 font-display">
                              {user?.role !== 'student' ? app.studentName : 'Leave Request'}
                            </h4>
                            {getStatusBadge(app.status)}
                          </div>
                          <p className="text-sm text-slate-500 font-medium mt-1 line-clamp-1">{app.reason}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center">
                              <Calendar className="h-3 w-3 mr-1" /> {new Date(app.startDate).toLocaleDateString()} - {new Date(app.endDate).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {user?.role !== 'student' && app.status === 'pending' && (
                        <div className="flex items-center space-x-2">
                          <Button 
                            onClick={() => handleStatusUpdate(app.id, 'approved')}
                            size="sm" 
                            className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
                          >
                            Approve
                          </Button>
                          <Button 
                            onClick={() => handleStatusUpdate(app.id, 'rejected')}
                            size="sm" 
                            variant="outline" 
                            className="border-rose-200 text-rose-500 hover:bg-rose-50 rounded-xl px-4"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
