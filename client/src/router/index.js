import { createRouter, createWebHistory } from 'vue-router';
import UserRegister from '../views/UserRegister.vue';
import UserLogin from '../views/UserLogin.vue';
import UserDashboard from '../views/UserDashboard.vue';
import UserVerify from '../views/UserVerify.vue';
import axios from 'axios';

const routes = [
  { path: '/', name: 'UserRegister', component: UserRegister },
  { path: '/login', name: 'UserLogin', component: UserLogin },
  { path: '/dashboard', name: 'UserDashboard', component: UserDashboard, meta: { requiresAuth: true } },
  { path: '/verify', name: 'UserVerify', component: UserVerify },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    try {
      console.log('Checking auth status for', to.path);
      await axios.get('http://localhost:3000/dashboard', { withCredentials: true });
      console.log('User is authenticated, proceeding to', to.path);
      next();
    } catch (error) {
      console.log('User not authenticated, redirecting to /login');
      next('/login');
    }
  } else {
    next();
  }
});

export default router;