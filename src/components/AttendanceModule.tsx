/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { CheckCircle2, XCircle, Clock, Save, Search, Filter } from 'lucide-react';
import { studentService, api, authService } from '../services/api';
import { Student, Attendance } from '../types';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const AttendanceModule = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [attendance, setAttendance] = React.useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [user, setUser] = React.useState<any>(null);
  const [history, setHistory] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState('10-A');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    setLoading(true);
    authService.getMe().then(u => {
      setUser(u);
      if (u.role === 'student') {
        api.get('/attendance').then(res => {
          setHistory(res.data.filter((r: any) => r.studentId === u.id));
          setLoading(false);
        });
      } else {
        studentService.getStudents().then(data => {
          setStudents(data);
          const initial: Record<string, 'present' | 'absent' | 'late'> = {};
          data.forEach((s: Student) => initial[s.id] = 'present');
          setAttendance(initial);
          setLoading(false);
        });
      }
    });
  }, []);

  const handleStatusChange = (id: string, status: 'present' | 'absent' | 'late') => {
    setAttendance(prev => ({ ...prev, [id]: status }));
  };

  const saveAttendance = async () => {
    setSaving(true);
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
        date: new Date().toISOString(),
      }));
      await api.post('/attendance', records);
      alert('Attendance saved successfully!');
    } catch (err) {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const filtered = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  if (user?.role === 'student') {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">My Attendance</h2>
          <p className="text-slate-500 font-medium">Monthly summary and detailed history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-emerald-50 border-emerald-100">
            <h4 className="text-emerald-700 font-bold mb-1">Present Days</h4>
            <p className="text-3xl font-black text-emerald-800">{history.filter(h => h.status === 'present').length}</p>
          </Card>
          <Card className="p-6 bg-rose-50 border-rose-100">
            <h4 className="text-rose-700 font-bold mb-1">Absent Days</h4>
            <p className="text-3xl font-black text-rose-800">{history.filter(h => h.status === 'absent').length}</p>
          </Card>
          <Card className="p-6 bg-amber-50 border-amber-100">
            <h4 className="text-amber-700 font-bold mb-1">Late Arrivals</h4>
            <p className="text-3xl font-black text-amber-800">{history.filter(h => h.status === 'late').length}</p>
          </Card>
        </div>

        <Card className="overflow-hidden border-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 border-r border-slate-200 last:border-0 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 border-r border-slate-200 last:border-0 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 border-r border-slate-200 last:border-0 uppercase tracking-widest">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-slate-400 font-medium">No records found.</td>
                  </tr>
                ) : (
                  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => (
                    <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{new Date(record.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest inline-flex items-center",
                          record.status === 'present' ? "bg-emerald-100 text-emerald-700" :
                          record.status === 'late' ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                        )}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-medium">Periodic academic attendance</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Daily Attendance</h2>
          <p className="text-slate-500 font-medium">Marking attendance for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-white border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          >
            <option value="10-A">Class 10-A</option>
            <option value="9-B">Class 9-B</option>
            <option value="8-C">Class 8-C</option>
          </select>
          <Button onClick={saveAttendance} isLoading={saving} className="shadow-lg shadow-primary/20 rounded-xl h-11 px-6">
            <Save className="h-4 w-4 mr-2" />
            Save Records
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-4 mb-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search student..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="rounded-xl border-slate-200 h-10">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-medium font-display text-xl">No students found matching filters.</p>
          </div>
        ) : (
          filtered.map((student) => (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              key={student.id}
            >
              <Card className="p-4 md:p-6 border-slate-200/60 shadow-sm hover:shadow-md transition-all group overflow-visible">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 min-w-0">
                    <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary border border-primary/10 font-bold text-lg select-none">
                      {student.rollNumber || 'S'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-base font-bold text-slate-900 truncate">{student.name}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{student.class} - {student.section}</p>
                    </div>
                  </div>

                  <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200">
                    <button
                      onClick={() => handleStatusChange(student.id, 'present')}
                      className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all",
                        attendance[student.id] === 'present' 
                          ? "bg-white text-emerald-600 shadow-sm scale-110 ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <CheckCircle2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'late')}
                      className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all",
                        attendance[student.id] === 'late' 
                          ? "bg-white text-amber-500 shadow-sm scale-110 ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <Clock className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleStatusChange(student.id, 'absent')}
                      className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-lg transition-all",
                        attendance[student.id] === 'absent' 
                          ? "bg-white text-rose-500 shadow-sm scale-110 ring-1 ring-slate-200" 
                          : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      <XCircle className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
