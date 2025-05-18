<template>
  <div>
    <h2>Login</h2>
    <form @submit.prevent="login">
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Login</button>
      <p v-if="message">{{ message }}</p>
    </form>
  </div>
</template>

<script>
import axios from 'axios';
import { useRouter } from 'vue-router';

export default {
  name: 'UserLogin',
  data() {
    return {
      email: '',
      password: '',
      message: '',
    };
  },
  setup() {
    const router = useRouter();
    return { router };
  },
  methods: {
    async login() {
      try {
        console.log('Attempting login with:', { email: this.email, password: this.password });
        const response = await axios.post('http://localhost:3000/auth/login', {
          email: this.email,
          password: this.password,
        }, { withCredentials: true });
        this.message = response.data.message;
        console.log('Login successful, redirecting to /dashboard');
        await this.router.push('/dashboard');
      } catch (error) {
        console.error('Login error:', error.response?.data);
        this.message = error.response?.data?.message || 'Login failed';
      }
    },
  },
};
</script>