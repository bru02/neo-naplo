import Vue from 'vue';
export default {
  async getGeneral() {
    const r = await Vue.axios.get('general');
    return r.data;
  },
  async getEvents() {
    const r = await Vue.axios.get('events');
    return r.data;
  },
  async getClassAverages() {
    const r = await Vue.axios.get('classAverages');
    return r.data;
  },
  async getHirdetmenyek(className: string) {
    const r = await Vue.axios.get(`hirdetmenyek/${className}`);
    return r.data;
  },
  async getHomeworks() {
    const r = await Vue.axios.get('homework');
    return r.data;
  },
  async getTimetable(from, to) {
    const r = await Vue.axios.get(`timetable`, {
      params: {
        from,
        to
      }
    });
    return r.data;
  },
  async login(
    username: string,
    password: string,
    school: string,
    rme: boolean
  ) {
    return await Vue.axios.post('/login', {
      username,
      password,
      school,
      rme
    });
  },
  async logout() {
    return await Vue.axios.post('/logout');
  },
  async refresh() {
    return await Vue.axios.post('/refresh');
  },
  async sendToken(token) {
    return await Vue.axios.put('/notifications/token', { token });
  },
  async deleteToken() {
    return await Vue.axios.delete('/notifications/token');
  }
};
