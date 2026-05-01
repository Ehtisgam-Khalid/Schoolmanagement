/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { cn } from '../lib/utils';
import { adminService } from '../services/api';
import { X, Shield, Lock } from 'lucide-react';

interface AddStudentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddStudentForm = ({ onSuccess, onCancel }: AddStudentFormProps) => {
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '',
    lastName: '',
    fatherName: '',
    dob: '',
    class: '',
    section: '',
    bFormNumber: '',
    admissionFees: '5000',
    monthlyFees: '2000',
    email: '',
    password: '',
    rollNumber: '',
    parentContact: '',
    cnic: '',
    feeStatus: 'pending' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await adminService.createStudent(formData);
      onSuccess();
    } catch (err) {
      alert('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold font-display text-slate-900">Add New Student</h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="bg-primary/5 p-6 rounded-2xl border border-primary/10 space-y-4">
            <div className="flex items-center space-x-2 text-primary">
              <Shield className="h-4 w-4" />
              <h4 className="text-sm font-bold uppercase tracking-tight">Login Credentials</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="Login Email / Username" 
                type="email" 
                required 
                placeholder="student@example.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Account Password</label>
                <div className="relative">
                  <Input 
                    type="password" 
                    placeholder="Default: student123"
                    className="pr-10"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-slate-300" />
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium italic">* These credentials will be used by the student to manage their portal.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <Input 
              label="Last Name" 
              required 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
            />
            <Input 
              label="Father's Name" 
              required 
              value={formData.fatherName}
              onChange={(e) => setFormData({...formData, fatherName: e.target.value})}
            />
            <Input 
              label="Date of Birth" 
              type="date"
              required 
              value={formData.dob}
              onChange={(e) => setFormData({...formData, dob: e.target.value})}
            />
            <Input 
              label="Class" 
              required 
              placeholder="e.g. 10th"
              value={formData.class}
              onChange={(e) => setFormData({...formData, class: e.target.value})}
            />
            <Input 
              label="Section" 
              required 
              value={formData.section}
              onChange={(e) => setFormData({...formData, section: e.target.value})}
            />
            <Input 
              label="B-Form Number" 
              required 
              placeholder="e.g. 42101-1234567-1"
              value={formData.bFormNumber}
              onChange={(e) => setFormData({...formData, bFormNumber: e.target.value})}
            />
            <Input 
              label="Roll Number" 
              required 
              value={formData.rollNumber}
              onChange={(e) => setFormData({...formData, rollNumber: e.target.value})}
            />
            <Input 
              label="Admission Fees (PKR)" 
              type="number"
              required 
              value={formData.admissionFees}
              onChange={(e) => setFormData({...formData, admissionFees: e.target.value})}
            />
            <Input 
              label="Monthly Fees (PKR)" 
              type="number"
              required 
              value={formData.monthlyFees}
              onChange={(e) => setFormData({...formData, monthlyFees: e.target.value})}
            />
            <Input 
              label="Parent Contact" 
              required 
              value={formData.parentContact}
              onChange={(e) => setFormData({...formData, parentContact: e.target.value})}
            />
            <Input 
              label="Parent CNIC" 
              placeholder="e.g. 42101-1234567-8"
              value={formData.cnic}
              onChange={(e) => setFormData({...formData, cnic: e.target.value})}
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
            <Button type="submit" isLoading={loading}>Register Student</Button>
          </div>
        </form>
      </div>
    </div>
  );
};
