/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Plus, Filter, MoreVertical, GraduationCap, Edit2, Trash2, X } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { AddStudentForm } from './AddStudentForm';
import { studentService, adminService } from '../services/api';
import { Student } from '../types';
import { cn } from '../lib/utils';

const EditStudentModal = ({ student, onClose, onSuccess }: { student: Student, onClose: () => void, onSuccess: () => void }) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({ ...student });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.updateStudent(student.id, formData);
      onSuccess();
    } catch (err) {
      alert('Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden font-sans border border-slate-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-xl font-black text-slate-900">Edit Student Record</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-6 w-6" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <Input label="Roll Number" value={formData.rollNumber} onChange={e => setFormData({...formData, rollNumber: e.target.value})} />
          <Input label="Class" value={formData.class} onChange={e => setFormData({...formData, class: e.target.value})} />
          <Input label="Section" value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})} />
          <Input label="Monthly Fee (PKR)" type="number" value={formData.monthlyFees || ''} onChange={e => setFormData({...formData, monthlyFees: e.target.value})} />
          <Input label="Admission Fee (PKR)" type="number" value={formData.admissionFees || ''} onChange={e => setFormData({...formData, admissionFees: e.target.value})} />
          
          <div className="col-span-full pt-6 flex justify-end space-x-3 border-t">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button type="submit" isLoading={loading}>Save Changes</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const StudentList = () => {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [isAdding, setIsAdding] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);

  const fetchStudents = React.useCallback(() => {
    setLoading(true);
    studentService.getStudents().then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this student and all their data?')) return;
    try {
      await adminService.deleteStudent(id);
      fetchStudents();
    } catch (err) {
      alert('Delete failed');
    }
  };

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) || 
    s.rollNumber?.includes(search)
  );

  return (
    <div className="space-y-6">
      {isAdding && (
        <AddStudentForm 
          onCancel={() => setIsAdding(false)} 
          onSuccess={() => {
            setIsAdding(false);
            fetchStudents();
          }} 
        />
      )}

      {editingStudent && (
        <EditStudentModal 
          student={editingStudent} 
          onClose={() => setEditingStudent(null)} 
          onSuccess={() => {
            setEditingStudent(null);
            fetchStudents();
          }} 
        />
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search students by name or roll number..." 
            className="pl-10 h-11"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" className="h-11 border-slate-200">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button className="h-11 shadow-lg shadow-primary/20" onClick={() => setIsAdding(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-xl shadow-slate-200/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Roll No</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Class</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Status</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400 font-medium">Loading student records...</td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-24 text-center text-slate-400 font-display">
                    {search ? 'No matching students found.' : 'No students found.'}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="h-11 w-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                          <GraduationCap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tracking-tight">{student.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-bold text-slate-600">
                      {student.rollNumber}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                       <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                        {student.class} - {student.section}
                       </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-xl border",
                        student.feeStatus === 'paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                      )}>
                        {(student.feeStatus || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right relative">
                      <div className="flex items-center justify-end space-x-1">
                        <button 
                          onClick={() => setEditingStudent(student)}
                          className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-primary transition-all"
                          title="Edit Student"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
                          className="p-2 hover:bg-rose-50 rounded-xl text-slate-300 hover:text-rose-500 transition-all"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
