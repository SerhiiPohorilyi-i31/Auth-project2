<template>
  <div>
    <h2>Register</h2>
    <form @submit.prevent="register">
      <div>
        <label>Email:</label>
        <input v-model="email" type="email" required />
      </div>
      <div>
        <label>Password:</label>
        <input v-model="password" type="password" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'UserRegister', // Змінили ім'я компонента
  data() {
    return {
      email: '',
      password: '',
      message: '',
    };
  },
  methods: {
    async register() {
      try {
        const response = await axios.post('http://localhost:3000/auth/register', {
          email: this.email,
          password: this.password,
        });
        this.message = response.data.message || 'Registration successful!';
      } catch (error) {
        this.message = error.response?.data?.message || 'Error during registration';
      }
    },
  },
};
</script>