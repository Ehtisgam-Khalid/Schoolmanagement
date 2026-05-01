/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, X, LayoutDashboard, Users, BookOpen, Calendar, GraduationCap, DollarSign, Bell, LogOut, ChevronRight, Trophy, Clock, FileText } from 'lucide-react';
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
    { id: 'applications', label: 'Leave Request', icon: FileText, roles: ['admin', 'teacher', 'student'] },
    { id: 'fees', label: 'Fees & Finance', icon: DollarSign, roles: ['admin', 'student', 'parent'] },
    { id: 'announcements', label: 'Announcements', icon: Bell, roles: ['admin', 'teacher', 'student', 'parent'] },
  ].filter(item => item.roles.includes(role));

  return (
    <>
      <div 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 transition-all duration-300 ease-in-out md:translate-x-0 overflow-hidden shadow-2xl",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-20 px-6 border-b border-slate-800">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold font-display text-white tracking-tight">EduFlow</span>
            </div>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 rounded-xl transition-colors md:hidden"
            >
              <X className="h-6 w-6 text-slate-400" />
            </button>
          </div>

          <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto custom-scrollbar">
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
                    "flex items-center w-full px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-200 group relative",
                    isActive 
                      ? "bg-primary text-white shadow-lg shadow-primary/20" 
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                  )}
                >
                  <item.icon className={cn(
                    "h-5 w-5 mr-4 flex-shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="whitespace-nowrap">{item.label}</span>
                  {isActive && (
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-slate-800">
            <button 
              onClick={onLogout}
              className="flex items-center w-full px-4 py-3.5 text-sm font-bold text-rose-400 rounded-2xl hover:bg-rose-500/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5 mr-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
      )}
    </>
  );
};
