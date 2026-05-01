/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { AdminDashboard } from './components/AdminDashboard';
import { StudentList } from './components/StudentList';
import { TeacherList } from './components/TeacherList';
import { AttendanceModule } from './components/AttendanceModule';
import { FeeModule } from './components/FeeModule';
import { AnnouncementsModule } from './components/AnnouncementsModule';
import { ExamResultModule } from './components/ExamResultModule';
import { ScheduleModule } from './components/ScheduleModule';
import { ProfileModule } from './components/ProfileModule';
import { LeaveApplicationModule } from './components/LeaveApplicationModule';
import { LibraryModule } from './components/LibraryModule';
import { ExamModule } from './components/ExamModule';
import { TransportModule } from './components/TransportModule';
import { DormitoryModule } from './components/DormitoryModule';
import { authService } from './services/api';
import { User } from './types';
import { GraduationCap, Bell, Search, Settings, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [notificationCount, setNotificationCount] = React.useState(0);

  const checkAnnouncements = async (role: string) => {
    try {
      const response = await fetch('/api/announcements', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('edu_flow_token')}` }
      });
      const data = await response.json();
      const lastSeenId = localStorage.getItem(`last_seen_announcement_${role}`);
      if (data.length > 0 && data[0].id !== lastSeenId) {
        setNotificationCount(1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  React.useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('edu_flow_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
          checkAnnouncements(userData.role);
        } catch (err) {
          localStorage.removeItem('edu_flow_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'announcements') {
      setNotificationCount(0);
      // Store the latest announcement ID if we had data, or just clear the count
      // Ideally we'd fetch them here to get the ID, but for a simple "1", this works.
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-primary rounded-2xl animate-pulse">
            <GraduationCap className="h-8 w-8 text-white" />
          </div>
          <div className="text-slate-500 font-medium font-display translate-y-2">Initializing EduFlow...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLoginSuccess={setUser} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'students':
        return <StudentList />;
      case 'teachers':
        return <TeacherList />;
      case 'attendance':
        return <AttendanceModule />;
      case 'exams':
        return <ExamModule user={user} />;
      case 'schedule':
        return <ScheduleModule />;
      case 'library':
        return <LibraryModule user={user} />;
      case 'transport':
        return <TransportModule user={user} />;
      case 'dormitory':
        return <DormitoryModule user={user} />;
      case 'material':
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <div className="h-20 w-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-500 mb-6 font-display text-4xl">📚</div>
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Study Material Depot</h2>
            <p className="text-slate-500 mt-2 font-bold uppercase tracking-widest text-xs">Repository synchronization in progress...</p>
          </div>
        );
      case 'fees':
        return <FeeModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'profile':
        return <ProfileModule />;
      case 'applications':
        return <LeaveApplicationModule />;
      case 'settings':
        return (
          <div className="max-w-4xl space-y-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">System Config</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
                  <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Academic Session</h3>
                  <select className="w-full bg-slate-50 border border-transparent rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-primary/20">
                     <option>2025-2026 (Active)</option>
                     <option>2024-2025</option>
                  </select>
               </div>
               <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-xl">
                  <h3 className="text-lg font-black text-slate-900 mb-6 uppercase tracking-tight">Visual Identity</h3>
                  <div className="flex space-x-4">
                     <div className="h-10 w-10 rounded-full bg-primary ring-4 ring-primary/20 cursor-pointer" />
                     <div className="h-10 w-10 rounded-full bg-rose-500 cursor-pointer" />
                     <div className="h-10 w-10 rounded-full bg-indigo-600 cursor-pointer" />
                  </div>
               </div>
            </div>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar 
        role={user.role} 
        activeItem={activeTab} 
        onItemClick={handleTabChange} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen md:ml-72 transition-all duration-500 overflow-x-hidden">
        {/* Advanced Top Navbar */}
        <header className="h-24 bg-white/70 backdrop-blur-2xl sticky top-0 z-[100] px-4 md:px-12 flex items-center justify-between border-b border-slate-200/50 shadow-[0_5px_30px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-3 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all active:scale-95"
            >
              <Menu className="h-6 w-6 text-slate-900" />
            </button>
            
            <div className="hidden md:flex flex-col">
              <h1 className="text-2xl font-black text-slate-900 font-display capitalize tracking-tighter">
                {activeTab.replace('-', ' ')}
              </h1>
              <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                <span className="text-primary tracking-normal">EDU</span>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span>CENTRAL NODE</span>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-slate-500">SECURE</span>
              </div>
            </div>
            
            <div className="md:hidden flex items-center space-x-3">
              <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <span className="font-black text-xl text-slate-900 tracking-tighter uppercase font-display">EduFlow</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 md:space-x-8">
            <div className="relative hidden xl:block">
              <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Global Database Search..." 
                className="bg-slate-100/50 border border-transparent rounded-[1.25rem] pl-12 pr-6 py-3.5 text-xs w-72 focus:ring-2 focus:ring-primary/20 focus:bg-white focus:border-slate-200 transition-all font-bold uppercase tracking-widest"
              />
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <button 
                onClick={() => handleTabChange('announcements')}
                className="p-3 bg-slate-100/80 hover:bg-slate-200 border border-slate-200/50 rounded-2xl transition-all relative group"
              >
                <Bell className="h-5 w-5 text-slate-700 group-hover:scale-110 transition-transform" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-white rounded-full border-2 border-white text-[10px] flex items-center justify-center font-black shadow-lg shadow-primary/40">
                    {notificationCount}
                  </span>
                )}
              </button>

              <button className="p-3 bg-slate-100/80 hover:bg-slate-200 border border-slate-200/50 rounded-2xl transition-all group hidden sm:block">
                <Settings className="h-5 w-5 text-slate-700 group-hover:rotate-45 transition-transform" />
              </button>
            </div>

            <div className="h-10 w-px bg-slate-200/60 mx-1 hidden sm:block" />

            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-4 cursor-pointer group"
            >
              <div className="flex flex-col text-right hidden lg:block">
                <span className="text-sm font-black text-slate-900 leading-none group-hover:text-primary transition-colors uppercase tracking-tight">{user.name}</span>
                <span className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 opacity-70">Lvl 4 {user.role}</span>
              </div>
              <div className="relative">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 border-2 border-slate-200/50 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-0.5">
                   {user.profilePic && user.profilePic !== "" ? (
                     <img src={user.profilePic} className="h-full w-full object-cover" alt={user.name} />
                   ) : (
                     <span className="text-lg font-black text-primary font-display">{user.name.charAt(0)}</span>
                   )}
                </div>
                <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-emerald-500 rounded-lg border-2 border-white shadow-sm" />
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-12 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
