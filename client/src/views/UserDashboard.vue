<template>
  <div>
    <h2>Dashboard</h2>
    <p>Welcome to your dashboard!</p>
    <button @click="logout">Logout</button>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'UserDashboard',
  data() {
    return {
      message: '',
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async logout() {
      try {
        await axios.post('http://localhost:3000/auth/logout', {}, { withCredentials: true });
        this.message = 'Ви вийшли з акаунта';
        setTimeout(() => {
          this.router.push('/login');
        }, 2000);
      } catch (error) {
        this.message = error.response?.data?.message || 'Logout failed';
      }
    },
  },
};
</script>