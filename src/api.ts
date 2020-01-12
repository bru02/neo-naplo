import Vue from 'vue';
export default {
  async getGeneral() {
    const r = await Vue.axios.get('general');
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
  async login(username: string, password: string, school: string) {
    return await Vue.axios.post('/login', {
      username,
      password,
      school
    });
  },
  async logout() {
    return await Vue.axios.post('/logout');
  },
  async refresh() {
    return await Vue.axios.post('/refresh');
  }
};
