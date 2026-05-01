import React, { useState, useEffect } from 'react';
import { Trophy, Search, Plus, Filter, FileText, CheckSquare, Award, Clock, Trash2, Calendar, ChevronRight } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import { adminService, api } from '../services/api';

export const ExamModule = ({ user }: { user: any }) => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newExam, setNewExam] = useState({ title: '', subject: '', class: '', date: '' });

  const fetchExams = () => {
    adminService.getExams().then(data => {
      setExams(Array.isArray(data) ? data : []);
      setLoading(false);
    }).catch(() => {
      setExams([]);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleAddExam = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.addExam(newExam);
    setIsAdding(false);
    setNewExam({ title: '', subject: '', class: '', date: '' });
    fetchExams();
  };

  const handleDeleteExam = async (id: string) => {
    if (confirm('Verify: Cancel and remove examination?')) {
      // Reusing a generic delete if I didn't add the specific endpoint, but I'll add one to server.ts too
      await api.delete(`/exams/${id}`);
      fetchExams();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Assessment Matrix</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Academic Performance & Examination System</p>
        </div>
        {user.role === 'admin' && (
          <Button 
            className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            SCHEDULE EVALUATION
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-8 border-b border-slate-100 bg-slate-50">
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Schedule Assessment</h3>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Evaluation Protocol v4.0</p>
            </div>
            <form onSubmit={handleAddExam} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evaluation Descriptor</label>
                <input 
                  required
                  value={newExam.title}
                  onChange={e => setNewExam({...newExam, title: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="E.G. FIRST TERM FINALS"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subject Node</label>
                  <input 
                    required
                    value={newExam.subject}
                    onChange={e => setNewExam({...newExam, subject: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="MATHEMATICS"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Class</label>
                  <input 
                    required
                    value={newExam.class}
                    onChange={e => setNewExam({...newExam, class: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temporal Window (Date)</label>
                <input 
                  required
                  type="date"
                  value={newExam.date}
                  onChange={e => setNewExam({...newExam, date: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-xs font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="button" variant="outline" className="flex-1 rounded-2xl py-6 border-slate-200" onClick={() => setIsAdding(false)}>
                  ABORT
                </Button>
                <Button type="submit" className="flex-1 rounded-2xl py-6 bg-primary shadow-lg shadow-primary/20">
                  EXECUTE SCHEDULE
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card className="" title="Upbound Evaluations" subtitle="Scheduled examination registry">
            <div className="overflow-x-auto mt-6">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocol ID</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Descriptor</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Temporal Window</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {exams.length > 0 ? exams.map((exam) => (
                    <tr key={exam.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tighter">EX-{exam.id.slice(0, 4)}</span>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{exam.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{exam.subject} &bull; Class {exam.class}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center text-xs font-bold text-slate-600">
                          <Clock className="h-3.5 w-3.5 mr-2 text-primary" />
                          {new Date(exam.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {user.role === 'admin' && (
                          <button 
                            onClick={() => handleDeleteExam(exam.id)}
                            className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-20 text-center">
                        <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No evaluation protocols scheduled</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none p-1 overflow-hidden" title="Grading Logic" subtitle="System constants">
            <div className="p-6 space-y-4">
              {[
                { grade: 'A+', range: '90-100', color: 'bg-emerald-500' },
                { grade: 'A', range: '80-89', color: 'bg-emerald-400' },
                { grade: 'B', range: '70-79', color: 'bg-blue-500' },
                { grade: 'C', range: '60-69', color: 'bg-amber-500' },
                { grade: 'D', range: '50-59', color: 'bg-orange-500' },
              ].map((g, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5">
                  <div className="flex items-center space-x-3">
                    <div className={`h-8 w-8 rounded-lg ${g.color} flex items-center justify-center text-white font-black text-xs`}>{g.grade}</div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Score Interval</span>
                  </div>
                  <span className="text-xs font-black tracking-widest">{g.range}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="bg-primary/5 border-primary/20 p-6 flex flex-col items-center text-center">
             <div className="h-16 w-16 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6">
                <Award className="h-8 w-8 text-primary" />
             </div>
             <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Performance Audit</h3>
             <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2 leading-relaxed">
               Generate detailed analytics of school-wide academic standing.
             </p>
             <Button className="w-full mt-6 rounded-[1.5rem] bg-primary shadow-lg shadow-primary/20 text-[10px] font-black uppercase tracking-widest">
               Execute Result Sweep
             </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
