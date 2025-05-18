<template>
  <div>
    <h2>Verify Your Account</h2>
    <p v-if="message">{{ message }}</p>
    <p v-if="error">{{ error }}</p>
  </div>
</template>

<script>
import { useRoute } from 'vue-router';
import axios from 'axios';

export default {
  name: 'UserVerify', // Змінено на багатослівне ім’я
  data() {
    return {
      message: '',
      error: '',
    };
  },
  mounted() {
    this.verifyAccount();
  },
  methods: {
    async verifyAccount() {
      const route = useRoute();
      const token = route.query.token;

      if (!token) {
        this.error = 'No token provided';
        return;
      }

      try {
        console.log('Verifying token:', token);
        const response = await axios.get(`http://localhost:3000/auth/verify?token=${token}`);
        this.message = response.data.message || 'Account verified successfully!';
      } catch (err) {
        console.error('Verification error:', err.response);
        this.error = err.response?.data?.message || 'Verification failed';
      }
    },
  },
};
</script>