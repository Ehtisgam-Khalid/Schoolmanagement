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
import { authService } from './services/api';
import { User } from './types';
import { GraduationCap, Bell, Search, Settings, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('edu_flow_token');
      if (token) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (err) {
          localStorage.removeItem('edu_flow_token');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

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
        return <ExamResultModule />;
      case 'schedule':
        return <ScheduleModule />;
      case 'fees':
        return <FeeModule />;
      case 'announcements':
        return <AnnouncementsModule />;
      case 'profile':
        return <ProfileModule />;
      case 'applications':
        return <LeaveApplicationModule />;
      case 'academics':
        return (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500 mb-6 font-display text-4xl">📚</div>
            <h2 className="text-2xl font-bold font-display text-slate-900">Academic Planner</h2>
            <p className="text-slate-500 mt-2">Curriculum and syllabus management tools are almost ready.</p>
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
        onItemClick={setActiveTab} 
        onLogout={handleLogout} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <div className="flex-1 flex flex-col min-h-screen md:ml-64 transition-all duration-300">
        {/* Top Navbar */}
        <header className="h-20 glass sticky top-0 z-30 px-4 md:px-8 flex items-center justify-between border-b border-slate-200/50">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors"
            >
              <Menu className="h-6 w-6 text-slate-700" />
            </button>
            <h1 className="text-xl font-bold text-slate-900 font-display capitalize hidden md:block">
              {activeTab.replace('-', ' ')}
            </h1>
            <div className="md:hidden flex items-center space-x-2">
              <div className="bg-primary p-1.5 rounded-lg">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">EduFlow</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 md:space-x-6">
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-slate-100 border-none rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-primary/20 transition-all font-sans"
              />
            </div>
            
            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </button>

            <button className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
              <Settings className="h-5 w-5 text-slate-600" />
            </button>

            <div className="h-10 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div 
              onClick={() => setActiveTab('profile')}
              className="flex items-center space-x-3 cursor-pointer group hover:opacity-80 transition-opacity"
            >
              <div className="flex flex-col text-right hidden sm:block">
                <span className="text-sm font-bold text-slate-900 leading-none group-hover:text-primary transition-colors">{user.name}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user.role}</span>
              </div>
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                {user.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1">
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
