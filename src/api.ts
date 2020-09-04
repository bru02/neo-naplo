import { apiClient } from './plugins/axios';
import { Exam } from './api-types.d';

export default {
  async getGeneral() {
    const r = await apiClient.get('general');
    return r.data;
  },
  async getEvents() {
    const r = await apiClient.get('events');
    return r.data;
  },
  async getClassAverages() {
    const r = await apiClient.get('classAverages');
    return r.data;
  },
  async getHirdetmenyek(className: string) {
    const r = await apiClient.get(`hirdetmenyek/${className}`);
    return r.data;
  },
  async getHomeworks() {
    const r = await apiClient.get('homework');
    return r.data;
  },
  async getTimetable(from, to) {
    const r = await apiClient.get(`timetable`, {
      params: {
        from,
        to,
      },
    });
    return r.data;
  },
  async login(
    username: string,
    password: string,
    school: string,
    rme: boolean
  ) {
    return await apiClient.post('/login', {
      username,
      password,
      school,
      rme,
    });
  },
  async logout() {
    return await apiClient.post('/logout');
  },
  async refresh() {
    return await apiClient.post('/refresh');
  },
  async sendToken(token) {
    return await apiClient.put('/notifications/token', { token });
  },
  async deleteToken() {
    return await apiClient.delete('/notifications/token');
  },
  async getExams() {
    return (await apiClient.get('/exams')).data;
  },
  async createExam(exam: Exam) {
    return await apiClient.put('/exams', exam);
  },
  async deleteExam(id: number) {
    return await apiClient.delete(`/exam/${id}`);
  },
};
