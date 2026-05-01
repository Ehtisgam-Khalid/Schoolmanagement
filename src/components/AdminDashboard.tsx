/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, GraduationCap, DollarSign, TrendingUp, Calendar, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, BookOpen, Trophy, FileText } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { studentService, adminService, authService } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'motion/react';

export const AdminDashboard = () => {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userData = await authService.getMe();
        setUser(userData);
        
        if (userData.role === 'student') {
          // For student, we show different stats
          const fees = await studentService.getFees();
          const attendance = await studentService.getAttendance();
          const results = await studentService.getResults();
          
          setStats({
            totalFees: fees.reduce((acc: number, f: any) => acc + f.amount, 0),
            pendingFeesCount: fees.filter((f: any) => f.status === 'pending').length,
            attendanceRate: Math.round((attendance.filter((a: any) => a.status === 'present').length / (attendance.length || 1)) * 100),
            examsCount: results.length
          });
        } else {
          // For admin/teacher, keep combined stats
          const data = await adminService.getStats();
          setStats(data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading || !stats) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
      {Array(4).fill(0).map((_, i) => (
        <div key={i} className="h-32 bg-slate-100 rounded-2xl" />
      ))}
      <div className="col-span-1 lg:col-span-2 h-[400px] bg-slate-100 rounded-3xl" />
      <div className="col-span-1 lg:col-span-2 h-[400px] bg-slate-100 rounded-3xl" />
    </div>
  );

  const isStudent = user?.role === 'student';

  const statCards = isStudent ? [
    { title: 'Attendance Rate', value: stats.attendanceRate + '%', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', trend: 'Monthly', up: true },
    { title: 'Assignments', value: stats.examsCount, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Pending', up: true },
    { title: 'Pending Fees', value: stats.pendingFeesCount, icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50', trend: 'Dues', up: false },
    { title: 'Next Exam', value: '15 May', icon: Trophy, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Mid-term', up: true },
  ] : [
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="relative overflow-hidden group border-slate-200/60 shadow-xl shadow-slate-200/20">
            <div className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <div className={`p-4 rounded-[1.5rem] ${stat.bg} ${stat.color} transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-sm`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className={`flex items-center space-x-1 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${stat.up ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                  {stat.up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.title}</p>
              <h2 className="text-3xl md:text-4xl font-black font-display text-slate-900 mt-2 tracking-tighter">
                {stat.prefix}{stat.value.toLocaleString()}
              </h2>
            </div>
            <div className={`absolute bottom-0 left-0 h-1.5 w-full opacity-30 ${stat.bg} ${stat.color}`} />
          </Card>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Chart Column */}
        <div className="xl:col-span-2 space-y-8">
          <Card className="p-1 md:p-2 overflow-hidden" title="Node Throughput" subtitle="Real-time academic performance telemetry">
            <div className="h-[300px] md:h-[400px] w-full mt-8 p-4 md:p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                    dy={10} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                      backdropFilter: 'blur(10px)',
                      borderRadius: '20px', 
                      border: '1px solid rgba(241, 245, 249, 0.8)', 
                      boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                      padding: '12px 16px'
                    }}
                    itemStyle={{ fontWeight: 'black', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="attendance" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorAttendance)" dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="Sync Horizon" subtitle="Interactive node event scheduling grid">
            <div className="mt-8 grid grid-cols-7 gap-2">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                <div key={day} className="text-center text-[9px] font-black text-slate-400 uppercase tracking-widest py-2 bg-slate-50 rounded-xl">{day}</div>
              ))}
              {Array(31).fill(0).map((_, i) => (
                <div key={i} className={`aspect-square flex items-center justify-center rounded-2xl text-[11px] font-black border transition-all ${i + 1 === 15 ? 'bg-primary text-white shadow-lg shadow-primary/30 border-transparent' : 'bg-white text-slate-400 border-slate-100 hover:border-primary/20 hover:text-slate-900 group cursor-pointer'}`}>
                  {i + 1}
                  {i + 1 === 15 && <div className="absolute -top-1 -right-1 h-3 w-3 bg-white rounded-full flex items-center justify-center border-2 border-primary"><div className="h-1 w-1 bg-primary rounded-full" /></div>}
                </div>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Sync: Faculty Meeting Alpha (10:30)</span>
              </div>
              <Button size="sm" variant="ghost" className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Expand Feed</Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="bg-[#0f172a] text-white p-1 overflow-hidden group border-none">
              <div className="p-8 relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Next Sync Event</p>
                    <h3 className="text-2xl font-black font-display tracking-tight uppercase">Faculty <span className="text-primary italic">Audit</span></h3>
                  </div>
                  <div className="h-14 w-14 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-primary group-hover:rotate-12 group-hover:scale-110">
                    <Calendar className="h-7 w-7 text-white" />
                  </div>
                </div>
                
                <div className="flex items-center text-primary font-black uppercase tracking-widest text-[11px] mt-4">
                  <Clock className="h-4 w-4 mr-2" />
                  May 15 &bull; 10:30 &bull; AUDITORIUM ALPHA
                </div>
              </div>
              {/* Animated decorative layer */}
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-64 h-64 bg-primary/20 rounded-full blur-[90px] group-hover:bg-primary/30 transition-all duration-700" />
            </Card>

            <Card className="bg-primary p-1 text-white relative overflow-hidden group border-none">
              <div className="p-8 relative z-10 flex flex-col h-full justify-between min-h-[160px]">
                <div className="space-y-1">
                  <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.2em]">Aggregate Grade Metric</p>
                  <h3 className="text-6xl font-black font-display tracking-tighter">88<span className="text-primary-foreground/40 italic">%</span></h3>
                </div>
                <p className="text-primary-foreground/60 text-[10px] font-black uppercase tracking-widest mt-4">Growth Protocol: +4.2% Net Gain</p>
              </div>
              <TrendingUp className="absolute bottom-[-10px] right-[-10px] h-32 w-32 text-white/10 -rotate-12 transition-transform duration-700 group-hover:rotate-0 group-hover:scale-110" />
            </Card>
          </div>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          <Card className="" title="Signal Feed" subtitle="Latest encrypted system alerts">
            <div className="space-y-8 mt-4">
              {[
                { title: 'Inbound Registry', desc: 'Siddiq Jan &bull; Grade 8-C', time: '12m ago', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { title: 'Credit Dues', desc: '5 nodes pending (Class 10)', time: '1h ago', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { title: 'Data Release', desc: 'Chemistry Finals Grade 11', time: '3h ago', icon: ArrowUpRight, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { title: 'Asset Update', desc: 'Ms. Sara &bull; Mathematics', time: '5h ago', icon: Users, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
              ].map((item, i) => (
                <div key={i} className="flex space-x-5 group/item cursor-pointer">
                  <div className={`flex-shrink-0 h-12 w-12 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} border border-transparent group-hover/item:border-current transition-all ring-0 group-hover/item:ring-4 ring-slate-50`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <p className="text-sm font-black text-slate-800 uppercase tracking-tight group-hover/item:text-primary transition-colors truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500 font-bold truncate mt-0.5" dangerouslySetInnerHTML={{ __html: item.desc }} />
                    <p className="text-[9px] uppercase font-black text-slate-400 mt-2 tracking-[0.15em]">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-10 py-4 text-[10px] font-black uppercase tracking-[0.3em] text-primary hover:bg-primary/10 rounded-2xl transition-all border border-transparent hover:border-primary/20 active:scale-95">
              Access Full Logs
            </button>
          </Card>

          <Card className="p-1 bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 border-none relative overflow-hidden group shadow-2xl shadow-indigo-500/20">
            <div className="p-8 relative z-10 space-y-6">
              <div className="h-14 w-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center mb-6">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black font-display text-white leading-tight uppercase tracking-tight">Intelligence <span className="text-indigo-300 italic">Report</span></h3>
                <p className="text-indigo-100/60 text-xs font-bold mt-2 leading-relaxed uppercase tracking-widest">Aggregate School Performance Analytics (PDF)</p>
              </div>
              <button className="w-full py-4 bg-white text-indigo-700 text-xs font-black uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-black/20 hover:shadow-2xl hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95">
                Generate Export
              </button>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/2" />
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
