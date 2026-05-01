/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, X, LayoutDashboard, Users, BookOpen, Calendar, GraduationCap, DollarSign, Bell, LogOut, ChevronRight, Trophy, Clock, FileText, Bus, Home, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserRole } from '../types';
import { motion } from 'motion/react';

interface SidebarProps {
  role: UserRole;
  activeItem: string;
  onItemClick: (item: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar = ({ role, activeItem, onItemClick, onLogout, isOpen, onClose }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'students', label: 'Students', icon: GraduationCap, roles: ['admin', 'teacher'] },
    { id: 'teachers', label: 'Teachers', icon: Users, roles: ['admin'] },
    { id: 'attendance', label: 'Attendance', icon: Calendar, roles: ['admin', 'teacher', 'student'] },
    { id: 'exams', label: 'Exams & Results', icon: Trophy, roles: ['admin', 'teacher', 'student'] },
    { id: 'schedule', label: 'Timetable', icon: Clock, roles: ['admin', 'teacher', 'student'] },
    { id: 'library', label: 'Library', icon: BookOpen, roles: ['admin', 'teacher', 'student'] },
    { id: 'transport', label: 'Transport', icon: Bus, roles: ['admin', 'teacher', 'student'] },
    { id: 'dormitory', label: 'Dormitory', icon: Home, roles: ['admin', 'teacher', 'student'] },
    { id: 'material', label: 'Study Material', icon: FileText, roles: ['admin', 'teacher', 'student'] },
    { id: 'applications', label: 'Leave Request', icon: FileText, roles: ['admin', 'teacher', 'student'] },
    { id: 'fees', label: 'Fees & Finance', icon: DollarSign, roles: ['admin', 'student', 'parent'] },
    { id: 'announcements', label: 'Announcements', icon: Bell, roles: ['admin', 'teacher', 'student', 'parent'] },
    { id: 'settings', label: 'Settings', icon: Settings, roles: ['admin'] },
  ].filter(item => item.roles.includes(role));

  return (
    <>
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-[150] w-72 bg-[#0a0c10] transition-all duration-500 ease-[0.22,1,0.36,1] md:translate-x-0 overflow-hidden shadow-[20px_0_60px_rgba(0,0,0,0.4)] border-r border-white/5",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-24 px-8 border-b border-white/5">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-primary/10 p-2.5 rounded-2xl border border-primary/20 shadow-inner">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <span className="text-xl font-black font-display text-white tracking-widest uppercase">EduFlow</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-white/5 rounded-2xl transition-colors md:hidden text-slate-400"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-10 space-y-2 overflow-y-auto custom-scrollbar">
            <p className="px-5 mb-4 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">Main Directory</p>
            {menuItems.map((item) => {
              const isActive = activeItem === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onItemClick(item.id);
                    if (window.innerWidth < 768) onClose();
                  }}
                  className={cn(
                    "flex items-center w-full px-5 py-4 text-xs font-black rounded-[1.25rem] transition-all duration-300 group relative uppercase tracking-widest",
                    isActive 
                      ? "bg-primary text-white shadow-[0_10px_25px_rgba(8,126,164,0.3)] translate-x-1" 
                      : "text-slate-500 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={cn(
                    "h-4 w-4 mr-4 flex-shrink-0 transition-transform duration-300",
                    isActive ? "text-white" : "text-slate-600 group-hover:text-primary group-hover:scale-110",
                    isActive && "scale-110"
                  )} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto flex items-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      <ChevronRight className="ml-2 h-3.5 w-3.5 opacity-50" />
                    </div>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-6 mt-auto">
            <div className="bg-white/5 p-4 rounded-3xl border border-white/5 mb-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="h-8 w-8 rounded-xl bg-primary/20 flex items-center justify-center text-primary text-xs font-bold uppercase">v2</div>
                <div>
                  <p className="text-[10px] font-black text-white uppercase tracking-widest leading-none">System Core</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1">v2.4.0-Stable</p>
                </div>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-primary shadow-[0_0_10px_rgba(8,126,164,0.5)]" />
              </div>
            </div>

            <button 
              onClick={onLogout}
              className="flex items-center w-full px-5 py-4 text-xs font-black text-rose-500 rounded-[1.25rem] hover:bg-rose-500/10 transition-all duration-300 uppercase tracking-widest"
            >
              <LogOut className="h-4 w-4 mr-4" />
              <span>Terminate Session</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-[140] bg-black/80 md:hidden backdrop-blur-md transition-opacity duration-500" 
          onClick={onClose}
        />
      )}
    </>
  );
};
