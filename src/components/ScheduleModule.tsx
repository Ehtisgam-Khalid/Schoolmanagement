/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Card } from './ui/Card';
import { api } from '../services/api';
import { Clock, MapPin, User, BookOpen } from 'lucide-react';
import { motion } from 'motion/react';

export const ScheduleModule = () => {
  const [schedule, setSchedule] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    api.get('/schedule').then(res => {
      setSchedule(res.data);
      setLoading(false);
    });
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [activeDay, setActiveDay] = React.useState('Monday');

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display text-slate-900 tracking-tight">Class Timetable</h2>
        <p className="text-slate-500 font-medium">Weekly schedule and room assignments</p>
      </div>

      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
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
        ) : schedule.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-medium font-display">No classes scheduled for {activeDay}.</p>
          </div>
        ) : (
          schedule.map((slot, i) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={slot.id}
            >
              <Card className="p-6 border-slate-200/60 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden bg-white">
                <div className="flex items-start justify-between relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center text-primary bg-primary/5 px-3 py-1.5 rounded-lg w-fit">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-xs font-bold">{slot.time}</span>
                    </div>
                    
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 font-display">{slot.subject}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-0.5">{slot.room}</p>
                    </div>

                    <div className="flex items-center space-x-4 pt-2">
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <User className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        {slot.teacher}
                      </div>
                      <div className="flex items-center text-xs text-slate-500 font-medium">
                        <MapPin className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                        Main Wing
                      </div>
                    </div>
                  </div>
                  <div className="opacity-10 group-hover:opacity-20 transition-opacity">
                    <BookOpen className="h-12 w-12 text-primary" />
                  </div>
                </div>
                <div className="absolute top-0 right-0 w-2 h-full bg-primary/20" />
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
