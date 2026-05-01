/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
});

// Interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('edu_flow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (credentials: any) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('edu_flow_token', data.token);
    return data;
  },
  register: async (credentials: any) => {
    const { data } = await api.post('/auth/register', credentials);
    localStorage.setItem('edu_flow_token', data.token);
    return data;
  },
  logout: () => {
    localStorage.removeItem('edu_flow_token');
  },
  getMe: async () => {
    const { data } = await api.get('/auth/me');
    return data;
  },
};

export const adminService = {
  getStats: async () => {
    const { data } = await api.get('/stats');
    return data;
  },
  getUsers: async () => {
    const { data } = await api.get('/users');
    return data;
  },
  createStudent: async (studentData: any) => {
    const { data } = await api.post('/students', studentData);
    return data;
  },
  createTeacher: async (teacherData: any) => {
    const { data } = await api.post('/teachers', teacherData);
    return data;
  },
  approveFee: async (id: string) => {
    const { data } = await api.patch(`/fees/${id}/approve`);
    return data;
  },
  addExtraCharge: async (chargeData: any) => {
    const { data } = await api.post('/fees/add-charge', chargeData);
    return data;
  },
  updateStudent: async (id: string, studentData: any) => {
    const { data } = await api.put(`/students/${id}`, studentData);
    return data;
  },
  deleteStudent: async (id: string) => {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  },
};

export const studentService = {
  getStudents: async () => {
    const { data } = await api.get('/students');
    return data;
  },
  getFees: async () => {
    const { data } = await api.get('/fees');
    return data;
  },
  payFee: async (id: string, proofData?: any) => {
    const { data } = await api.post(`/fees/${id}/pay`, proofData);
    return data;
  },
  getResults: async () => {
    const { data } = await api.get('/results');
    return data;
  },
  getAttendance: async () => {
    const { data } = await api.get('/attendance');
    return data;
  },
  getSchedule: async () => {
    const { data } = await api.get('/schedule');
    return data;
  },
  addScheduleEntry: async (entry: any) => {
    const { data } = await api.post('/schedule', entry);
    return data;
  },
  deleteScheduleEntry: async (id: string) => {
    const { data } = await api.delete(`/schedule/${id}`);
    return data;
  },
};

export const teacherService = {
  getTeachers: async () => {
    const { data } = await api.get('/teachers');
    return data;
  },
};

export const applicationService = {
  getApplications: async () => {
    const { data } = await api.get('/applications');
    return data;
  },
  sendApplication: async (applicationData: any) => {
    const { data } = await api.post('/applications', applicationData);
    return data;
  },
  updateStatus: async (id: string, status: string) => {
    const { data } = await api.patch(`/applications/${id}`, { status });
    return data;
  },
};

export const announcementService = {
  getAnnouncements: async () => {
    const { data } = await api.get('/announcements');
    return data;
  },
};

export default api;
