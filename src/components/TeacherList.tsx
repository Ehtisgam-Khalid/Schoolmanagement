/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Plus, Filter, MoreVertical, Users, Mail, Phone, BookOpen } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AddTeacherForm } from './AddTeacherForm';
import { teacherService } from '../services/api';
import { Teacher } from '../types';
import { cn } from '../lib/utils';

export const TeacherList = () => {
  const [teachers, setTeachers] = React.useState<Teacher[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);

  const fetchTeachers = React.useCallback(() => {
    setLoading(true);
    teacherService.getTeachers()
      .then(data => {
        setTeachers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    fetchTeachers();
  }, [fetchTeachers]);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.subject.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {isAdding && (
        <AddTeacherForm 
          onCancel={() => setIsAdding(false)} 
          onSuccess={() => {
            setIsAdding(false);
            fetchTeachers();
          }} 
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search teachers by name or subject..." 
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-64 bg-slate-100 rounded-xl animate-pulse" />
          ))
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
            <Users className="h-12 w-12 mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-medium">No teachers found.</p>
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <Card key={teacher.id} className="relative group p-0">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Users className="h-7 w-7" />
                  </div>
                  <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 rounded-md">
                    <MoreVertical className="h-5 w-5 text-slate-400" />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold font-display text-slate-900 mb-1">{teacher.name}</h3>
                <div className="flex items-center text-sm text-primary font-medium mb-4">
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  {teacher.subject}
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center text-sm text-slate-500">
                    <Mail className="h-4 w-4 mr-2 text-slate-400" />
                    {teacher.email}
                  </div>
                  <div className="flex items-center text-sm text-slate-500">
                    <Phone className="h-4 w-4 mr-2 text-slate-400" />
                    {teacher.contact}
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salary</span>
                <span className="text-sm font-bold text-slate-700">PKR {teacher.salary.toLocaleString()}</span>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
