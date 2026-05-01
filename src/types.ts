/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  image?: string;
}

export interface Student extends User {
  role: 'student';
  class: string;
  section: string;
  rollNumber: string;
  parentContact: string;
  cnic?: string;
  feeStatus: 'paid' | 'pending';
}

export interface Teacher extends User {
  role: 'teacher';
  subject: string;
  contact: string;
  salary: number;
  cnic?: string;
  assignedClasses: string[];
}

export interface Attendance {
  id: string;
  studentId: string;
  date: string; // ISO string
  status: 'present' | 'absent' | 'late';
  markedBy: string; // Teacher ID
}

export interface Exam {
  id: string;
  name: string;
  class: string;
  subjects: string[];
  date: string;
}

export interface Result {
  id: string;
  studentId: string;
  examId: string;
  marks: Record<string, number>; // subject: marks
  total: number;
  percentage: number;
  remarks?: string;
}

export interface Fee {
  id: string;
  studentId: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending';
  paidDate?: string;
  receiptNumber?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  targetRoles: UserRole[];
}
