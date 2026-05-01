import React, { useState, useEffect } from 'react';
import { Trophy, Search, Plus, Filter, FileText, CheckSquare, Award, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { motion } from 'motion/react';
import { adminService } from '../services/api';

export const ExamModule = ({ user }: { user: any }) => {
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getExams().then(data => {
      setExams(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Assessment Matrix</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Academic Performance & Examination System</p>
        </div>
        {user.role === 'admin' && (
          <Button className="rounded-2xl px-6 py-6 shadow-lg shadow-primary/20 bg-primary group">
            <Plus className="h-4 w-4 mr-2" />
            SCHEDULE EVALUATION
          </Button>
        )}
      </div>

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
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
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
                      <td className="px-6 py-5 text-right">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest">
                          Pending
                        </span>
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
