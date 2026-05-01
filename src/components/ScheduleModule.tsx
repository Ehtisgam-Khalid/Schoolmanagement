/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { studentService, authService } from '../services/api';
import { Clock, MapPin, User, BookOpen, Plus, X, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

const AddScheduleModal = ({ onClose, onSuccess, currentDay }: { onClose: () => void, onSuccess: () => void, currentDay: string }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    time: '',
    subject: '',
    teacher: '',
    room: '',
    day: currentDay
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await studentService.addScheduleEntry(formData);
      onSuccess();
    } catch (err) {
      alert('Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden font-sans border border-slate-200"
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">Schedule New Class</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Input 
            label="Time (e.g. 08:30 AM)" 
            required 
            value={formData.time}
            onChange={(e) => setFormData({...formData, time: e.target.value})}
          />
          <Input 
            label="Subject Name" 
            required 
            value={formData.subject}
            onChange={(e) => setFormData({...formData, subject: e.target.value})}
          />
          <Input 
            label="Teacher Name" 
            required 
            value={formData.teacher}
            onChange={(e) => setFormData({...formData, teacher: e.target.value})}
          />
          <Input 
            label="Room Number / Lab" 
            required 
            value={formData.room}
            onChange={(e) => setFormData({...formData, room: e.target.value})}
          />
          <Button type="submit" className="w-full py-6 rounded-2xl shadow-lg mt-4" isLoading={loading}>
            Add to My Timetable
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export const ScheduleModule = () => {
  const [schedule, setSchedule] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any>(null);
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [activeDay, setActiveDay] = React.useState('Monday');

  const fetchData = async () => {
    try {
      const [u, res] = await Promise.all([
        authService.getMe(),
        studentService.getSchedule()
      ]);
      setUser(u);
      setSchedule(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this class from your schedule?')) return;
    setIsDeleting(id);
    try {
      await studentService.deleteScheduleEntry(id);
      await fetchData();
    } catch (err) {
      alert('Delete failed');
    } finally {
      setIsDeleting(null);
    }
  };

  const filteredSchedule = schedule.filter(s => s.day === activeDay);

  return (
    <div className="space-y-8 pb-10">
      {showAddModal && <AddScheduleModal currentDay={activeDay} onClose={() => setShowAddModal(false)} onSuccess={() => { setShowAddModal(false); fetchData(); }} />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Class Timetable</h2>
          <p className="text-slate-500 font-medium">Weekly schedule and room assignments</p>
        </div>
        <Button 
          className="rounded-xl h-12 px-6 shadow-lg shadow-primary/20"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="h-4 w-4 mr-2" /> Add Class Slot
        </Button>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide py-1">
        {days.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
              activeDay === day 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />
          ))
        ) : filteredSchedule.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
            <BookOpen className="h-12 w-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-400 font-medium font-display uppercase tracking-widest text-xs">No classes scheduled for {activeDay}.</p>
            <Button variant="ghost" className="mt-4 text-primary" onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" /> Add first entry
            </Button>
          </div>
        ) : (
          filteredSchedule.map((slot, i) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              key={slot.id}
            >
              <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden bg-white group">
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center text-primary bg-primary/5 px-3 py-1.5 rounded-lg w-fit">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-xs font-bold">{slot.time}</span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-black text-slate-900 font-display tracking-tight">{slot.subject}</h4>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">{slot.room}</p>
                    </div>

                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center text-xs text-slate-500 font-bold">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center mr-2 text-slate-400">
                          <User className="h-3.5 w-3.5" />
                        </div>
                        {slot.teacher}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="opacity-10 group-hover:opacity-30 transition-opacity">
                      <BookOpen className="h-12 w-12 text-slate-400" />
                    </div>
                    <button 
                      onClick={() => handleDelete(slot.id)}
                      className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/20 group-hover:bg-primary transition-all" />
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
