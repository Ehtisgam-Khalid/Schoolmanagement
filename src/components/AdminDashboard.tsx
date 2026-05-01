/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { adminService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';

export const AdminDashboard = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    adminService.getStats().then(data => {
      setStats(data);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
      ))}
      <div className="col-span-1 lg:col-span-2 h-[400px] bg-slate-100 rounded-3xl" />
      <div className="col-span-1 lg:col-span-2 h-[400px] bg-slate-100 rounded-3xl" />
    </div>
  );

  const statCards = [
    { title: 'Total Students', value: stats.totalStudents, icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+12%', up: true },
    { title: 'Total Teachers', value: stats.totalTeachers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Stable', up: true },
    { title: 'Monthly Revenue', value: stats.totalIncome, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+8.4%', up: true, prefix: 'PKR ' },
    { title: 'Pending Fees', value: stats.pendingFees, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', trend: '-2.1%', up: false, prefix: 'PKR ' },
  ];

  const chartData = [
    { name: 'Mon', attendance: 92, revenue: 45000 },
    { name: 'Tue', attendance: 88, revenue: 52000 },
    { name: 'Wed', attendance: 95, revenue: 48000 },
    { name: 'Thu', attendance: 90, revenue: 61000 },
    { name: 'Fri', attendance: 93, revenue: 55000 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 border-slate-200/60 shadow-xl shadow-slate-200/20">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-transform group-hover:rotate-6`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center space-x-1 text-xs font-bold px-2 py-1 rounded-full ${stat.up ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</p>
              <h2 className="text-3xl font-bold font-display text-slate-900 mt-1">
                {stat.prefix}{stat.value.toLocaleString()}
              </h2>
            </div>
            <div className={`absolute bottom-0 left-0 h-1 w-full opacity-20 ${stat.bg} ${stat.color}`} />
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8 border-slate-200/60 shadow-xl shadow-slate-200/20 bg-white" title="Attendance & Engagement" subtitle="Daily trends for student participation">
            <div className="h-[350px] w-full mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorAttendance)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-slate-900 text-white p-8 overflow-hidden group">
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">Next Faculty Meeting</p>
                  <h3 className="text-xl font-bold font-display">May 15, 2026</h3>
                  <div className="flex items-center text-primary text-sm font-medium">
                    <Clock className="h-4 w-4 mr-2" />
                    10:30 AM (Auditorium)
                  </div>
                </div>
                <div className="h-12 w-12 rounded-full border border-slate-700 flex items-center justify-center transition-transform group-hover:scale-110">
                  <Calendar className="h-6 w-6" />
                </div>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
            </Card>

            <Card className="bg-primary p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <p className="text-primary-foreground/80 text-sm font-medium">Academic Performance</p>
                <h3 className="text-4xl font-bold font-display mt-2 italic">88%</h3>
                <p className="text-primary-foreground/60 text-xs mt-2 font-medium">Across all grades (+4.2% since Mid-term)</p>
              </div>
              <TrendingUp className="absolute bottom-4 right-4 h-24 w-24 text-primary-foreground/10" />
            </Card>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <Card className="p-6" title="Recent Notifications" subtitle="Latest system alerts">
            <div className="space-y-6 mt-6">
              {[
                { title: 'New Enrollment', desc: 'Siddiq Jan, Grade 8-C', time: '12m ago', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50' },
                { title: 'Fee Alert', desc: '5 students pending (Class 10)', time: '1h ago', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50' },
                { title: 'Result Published', desc: 'Chemistry Finals Grade 11', time: '3h ago', icon: ArrowUpRight, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                { title: 'Teacher Assigned', desc: 'Ms. Sara - Mathematics', time: '5h ago', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-50' },
              ].map((item, i) => (
                <div key={i} className="flex space-x-4">
                  <div className={`flex-shrink-0 h-10 w-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">{item.title}</p>
                    <p className="text-xs text-slate-500 truncate">{item.desc}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 mt-1 tracking-wider">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 text-sm font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors">
              View All History
            </button>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-bold font-display leading-tight">Generate School Report (PDF)</h3>
              <p className="text-indigo-100 text-sm opacity-80">Get a comprehensive overview of students, staff, and financial standing.</p>
              <button className="w-full py-3 bg-white text-indigo-700 font-bold rounded-xl shadow-lg shadow-black/10 hover:shadow-xl transition-all">
                Download Now
              </button>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
