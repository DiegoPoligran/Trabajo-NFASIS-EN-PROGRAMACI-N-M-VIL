import { createRouter, createWebHistory } from '@ionic/vue-router';
import { AuthService, sessionState } from '@/services/auth.service';

const routes = [
  {
    path: '/',
    redirect: '/inicio'
  },
  {
    path: '/inicio',
    name: 'Inicio',
    component: () => import('@/views/Inicio.vue')
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/registro',
    name: 'Registro',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/adopciones',
    name: 'Adopciones',
    component: () => import('@/views/Adopciones.vue')
  },
  {
    path: '/eventos',
    name: 'Eventos',
    component: () => import('@/views/Eventos.vue')
  },
  {
    path: '/comunidad',
    name: 'Comunidad',
    component: () => import('@/views/Comunidad.vue')
  },
  {
    path: '/educacion',
    name: 'Educacion',
    component: () => import('@/views/Educacion.vue')
  },
  {
  path: '/favoritos',
  name: 'Favoritos',
  component: () => import('@/views/Favoritos.vue'),
  meta: { requiresAuth: true }
},
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/Perfil.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('@/views/Admin.vue'),
    meta: { requiresAuth: true, requiredRole: 'admin' }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

router.beforeEach(async (to, from, next) => {
  if (to.path === '/login' || to.path === '/registro') {
    next();
    return;
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const meta = to.meta as any;
  const requiredRole = meta.requiredRole;

  if (!AuthService) {
    next('/login');
    return;
  }

  if (!sessionState.user) {
    try {
      const { DatabaseService } = await import('@/services/database');
      DatabaseService.init();
      AuthService.initSession();
    } catch (error) {
      console.error('Error al inicializar:', error);
      next('/login');
      return;
    }
  }

  const isLoggedIn = AuthService.isLoggedIn();
  const userRole = sessionState.user?.rol_usuario;

  if (requiresAuth && !isLoggedIn) {
    next('/login');
  } else if (requiredRole && userRole !== requiredRole) {
    next('/inicio');
  } else {
    next();
  }
});

export default router;
