/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { api, studentService, authService } from '../services/api';
import { Trophy, FileText, Search, Filter, ChevronRight, Award, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

export const ExamResultModule = () => {
  const [exams, setExams] = React.useState<any[]>([]);
  const [results, setResults] = React.useState<any[]>([]);
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'reports'>('overview');

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        
        const [examsRes, resultsRes] = await Promise.all([
          api.get('/exams'),
          studentService.getResults()
        ]);
        
        setExams(examsRes.data);
        setResults(resultsRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (user?.role === 'student') {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">My Academic Results</h2>
            <p className="text-slate-500 font-medium">Detailed marksheet and performance analytics</p>
          </div>
          <Button variant="outline" className="rounded-xl border-slate-200 shadow-sm">
            <FileText className="h-4 w-4 mr-2" />
            Download Marksheet (PDF)
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card title="Latest Examination Results" className="p-0 overflow-hidden border-slate-200 shadow-xl shadow-slate-200/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Marks</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Total</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium italic">No results published yet.</td>
                      </tr>
                    ) : (
                      results.map((res) => (
                        <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-5 font-bold text-slate-900">{res.subject}</td>
                          <td className="px-6 py-5 text-center font-mono font-bold text-primary">{res.marks}</td>
                          <td className="px-6 py-5 text-center font-mono text-slate-400">{res.totalMarks}</td>
                          <td className="px-6 py-5 text-right">
                            <span className={cn(
                              "px-2.5 py-1 rounded-lg text-xs font-black",
                              res.grade.startsWith('A') ? "bg-emerald-100 text-emerald-700" :
                              res.grade.startsWith('B') ? "bg-blue-100 text-blue-700" :
                              "bg-slate-100 text-slate-700"
                            )}>
                              {res.grade}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {exams.filter(e => e.status === 'upcoming').map(exam => (
                <Card key={exam.id} className="p-6 bg-slate-900 text-white border-none shadow-xl shadow-slate-900/10">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Upcoming Schedule</p>
                  <h4 className="text-xl font-bold font-display mb-1">{exam.title}</h4>
                  <p className="text-primary text-sm font-bold flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> {new Date(exam.startDate).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-primary to-indigo-600 text-white border-none shadow-2xl shadow-primary/20">
              <Trophy className="h-12 w-12 text-white/20 mb-6" />
              <h3 className="text-lg font-bold font-display mb-1">Academic Performance</h3>
              <p className="text-primary-foreground/70 text-sm mb-6">Your overall grade point average for this semester.</p>
              <div className="text-5xl font-black font-display mb-2 text-white tracking-tight">3.8</div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/50">GPA Score (Out of 4.0)</p>
            </Card>

            <Card title="Subject Proficiency" className="p-6">
              <div className="space-y-6 mt-6">
                {results.map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between text-xs font-bold uppercase tracking-tight">
                      <span className="text-slate-500">{item.subject}</span>
                      <span className="text-slate-900">{item.marks}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${item.marks}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-primary rounded-full" 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Examinations & Results</h2>
          <p className="text-slate-500 font-medium">Track academic performance and publish semester results</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-200 shadow-sm">
          {(['overview', 'reports'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 text-sm font-bold rounded-xl transition-all capitalize",
                activeTab === tab ? "bg-primary text-white shadow-lg" : "text-slate-500 hover:text-slate-900"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative overflow-hidden group">
          <div className="relative z-10">
            <Trophy className="h-8 w-8 text-indigo-200 mb-4" />
            <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Average Score</p>
            <h3 className="text-3xl font-bold font-display mt-1">78.4%</h3>
            <p className="text-indigo-300 text-xs mt-4 flex items-center font-medium">
              <Award className="h-3 w-3 mr-1" /> Top Performer: Grade 10
            </p>
          </div>
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
        </Card>

        <Card className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/10">
          <FileText className="h-8 w-8 text-primary mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Upcoming Exams</p>
          <h3 className="text-3xl font-bold font-display text-slate-900 mt-1">02</h3>
          <p className="text-slate-500 text-xs mt-4 font-medium italic">Next: Mid-Term (May 15)</p>
        </Card>

        <Card className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/10">
          <AlertCircle className="h-8 w-8 text-amber-500 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pending Results</p>
          <h3 className="text-3xl font-bold font-display text-slate-900 mt-1">12</h3>
          <p className="text-slate-500 text-xs mt-4 font-medium italic">Classes yet to upload marks</p>
        </Card>

        <Card className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/10">
          <Award className="h-8 w-8 text-emerald-500 mb-4" />
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Pass Rate</p>
          <h3 className="text-3xl font-bold font-display text-slate-900 mt-1">92.1%</h3>
          <p className="text-slate-500 text-xs mt-4 font-medium italic">+2.4% from last term</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display text-slate-900">Current Examination Cycles</h3>
            <Button variant="ghost" size="sm" className="text-primary font-bold">View History</Button>
          </div>

          <div className="space-y-4">
            {loading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-3xl animate-pulse" />
              ))
            ) : exams.map((exam) => (
              <Card key={exam.id} className="p-6 border-slate-200/60 hover:shadow-xl transition-all group overflow-visible">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <div className={cn(
                      "h-14 w-14 rounded-2xl flex items-center justify-center font-display text-xl shadow-lg",
                      exam.status === 'upcoming' ? "bg-primary text-white shadow-primary/20" : "bg-emerald-500 text-white shadow-emerald-500/20"
                    )}>
                      {exam.status === 'upcoming' ? '📅' : '📈'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-lg font-bold text-slate-900 font-display">{exam.title}</h4>
                        <span className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest",
                          exam.status === 'upcoming' ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"
                        )}>
                          {exam.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-500 mt-1">Starting on {new Date(exam.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-xl border-slate-200 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                    {exam.status === 'upcoming' ? 'View Schedule' : 'View Results'}
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold font-display text-slate-900">Academic Standing</h3>
          <Card className="p-6">
            <div className="space-y-6">
              {[
                { subject: 'Mathematics', avg: 82, trend: '+4%' },
                { subject: 'English', avg: 75, trend: '-2%' },
                { subject: 'Physics', avg: 68, trend: '+12%' },
                { subject: 'Chemistry', avg: 71, trend: 'Stable' },
              ].map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-700">{item.subject}</span>
                    <span className="text-slate-400">{item.avg}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${item.avg}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest",
                      item.trend.startsWith('+') ? "text-emerald-500" : item.trend === 'Stable' ? "text-slate-400" : "text-rose-500"
                    )}>
                      {item.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-8 bg-slate-900 rounded-xl py-6 font-bold shadow-xl shadow-slate-900/10">
              Download Full Report
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
