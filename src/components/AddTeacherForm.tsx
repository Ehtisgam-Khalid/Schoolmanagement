/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { adminService } from '../services/api';
import { X } from 'lucide-react';

interface AddTeacherFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddTeacherForm = ({ onSuccess, onCancel }: AddTeacherFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    subject: '',
    contact: '',
    salary: 0,
    cnic: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await adminService.createTeacher(formData);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold font-display text-slate-900">Add New Teacher</h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Email Address" 
              type="email" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <Input 
              label="Subject Specialization" 
              required 
              value={formData.subject}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
            />
            <Input 
              label="Contact Number" 
              required 
              value={formData.contact}
              onChange={(e) => setFormData({...formData, contact: e.target.value})}
            />
            <Input 
              label="Monthly Salary (PKR)" 
              type="number"
              required 
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: parseFloat(e.target.value) || 0})}
            />
            <Input 
              label="CNIC (National ID)" 
              placeholder="e.g. 42101-1234567-8"
              value={formData.cnic}
              onChange={(e) => setFormData({...formData, cnic: e.target.value})}
            />
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium">Initial Password</label>
              <Input 
                type="password" 
                placeholder="Default: teacher123"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Register Teacher</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
