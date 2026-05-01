/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Bell, Megaphone, Send, Calendar, User, Trash2 } from 'lucide-react';
import { api, authService } from '../services/api';
import { Announcement } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export const AnnouncementsModule = () => {
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newTitle, setNewTitle] = React.useState('');
  const [newContent, setNewContent] = React.useState('');
  const [isPosting, setIsPosting] = React.useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const currentUser = await authService.getMe();
        setUser(currentUser);
        const res = await api.get('/announcements');
        setAnnouncements(res.data);
        if (res.data.length > 0) {
          localStorage.setItem(`last_seen_announcement_${currentUser.role}`, res.data[0].id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role !== 'admin') return;
    setIsPosting(true);
    try {
      const data = {
        title: newTitle,
        content: newContent,
        targetRoles: ['admin', 'teacher', 'student', 'parent']
      };
      const res = await api.post('/announcements', data);
      setAnnouncements([res.data, ...announcements]);
      setNewTitle('');
      setNewContent('');
      alert('Announcement broadcasted successfully!');
    } catch (err) {
      alert('Failed to post announcement');
    } finally {
      setIsPosting(false);
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-1">
        <div className="sticky top-28 space-y-6">
          <div className="mb-6">
            <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">
              {isAdmin ? 'Announcements' : 'Notice Board'}
            </h2>
            <p className="text-slate-500 font-medium">
              {isAdmin 
                ? 'Broadcast news and alerts to students, staff, and parents' 
                : 'Stay updated with the latest news and bulletins from the school management'}
            </p>
          </div>

          {isAdmin ? (
            <Card title="New Broadcast" className="border-slate-200 shadow-xl shadow-slate-200/20 bg-white">
              <form onSubmit={handlePost} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Headline</label>
                  <input 
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    placeholder="e.g. School Spring Break Dates"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-sans"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message Content</label>
                  <textarea 
                    value={newContent}
                    onChange={e => setNewContent(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all font-sans min-h-[140px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20" isLoading={isPosting}>
                  <Send className="h-4 w-4 mr-2" />
                  Publish Announcement
                </Button>
              </form>
            </Card>
          ) : (
            <Card className="p-6 bg-slate-900 border-none relative overflow-hidden group">
              <div className="relative z-10">
                <Bell className="h-8 w-8 text-primary mb-4 animate-bounce" />
                <h3 className="text-white text-lg font-bold font-display">Notifications</h3>
                <p className="text-slate-400 text-sm mt-1">Please read all announcements carefully to stay informed about events and deadlines.</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
            </Card>
          )}
        </div>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center">
            <Bell className="h-4 w-4 mr-2 text-primary" />
            Recent Posts
          </h3>
          <span className="text-xs font-bold text-slate-400">{announcements.length} Published</span>
        </div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-40 bg-slate-100 rounded-3xl animate-pulse" />
            ))
          ) : announcements.length === 0 ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
              <Megaphone className="h-12 w-12 mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-medium font-display">No announcements published yet.</p>
            </div>
          ) : (
            announcements.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="group"
              >
                <Card className="p-8 border-slate-200/60 shadow-xl shadow-slate-200/10 hover:shadow-2xl transition-all relative overflow-hidden bg-white">
                  <div className="flex items-start justify-between relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 text-primary rounded-lg">
                          <Megaphone className="h-5 w-5" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 font-display capitalize cursor-pointer hover:text-primary transition-colors">{item.title}</h4>
                      </div>
                      <p className="text-slate-600 leading-relaxed font-sans">{item.content}</p>
                      
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center text-xs font-bold text-slate-400">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {format(new Date(item.date), 'MMMM dd, yyyy')}
                        </div>
                        <div className="flex items-center text-xs font-bold text-slate-400">
                          <User className="h-3.5 w-3.5 mr-1.5" />
                          Published by Admin
                        </div>
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-rose-50 text-rose-400 rounded-xl">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                </Card>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
