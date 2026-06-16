<template>
  <header class="app-header">
    <div class="header-container">
      <!-- Logo -->
      <div class="logo" @click="router.push('/')">
        <div class="logo-icon">
          <ion-icon :icon="pawOutline"></ion-icon>
        </div>
        <span class="logo-text">HUELLAS<span class="logo-pro">PRO</span></span>
      </div>

      <!-- Desktop Navigation -->
      <nav class="desktop-nav">
        <button 
          v-for="item in navItems" 
          :key="item.path"
          :class="['nav-link', { active: isActive(item.path) }]"
          @click="navigateTo(item.path)"
        >
          {{ item.label }}
        </button>
      </nav>

      <!-- Desktop Auth Buttons -->
      <div class="desktop-auth">
        <button class="auth-button user-avatar" v-if="user" @click="showUserMenu = !showUserMenu">
          {{ userInitials }}
        </button>
        
        <template v-else>
          <button class="auth-button login-btn" @click="navigateTo('/login')">
            LOGIN
          </button>
          <button class="auth-button register-btn" @click="navigateTo('/registro')">
            ÚNETE
          </button>
        </template>

        <!-- Language Selector -->
        <button class="lang-selector">
          <span>ES</span>
          <ion-icon :icon="chevronDownOutline"></ion-icon>
        </button>
      </div>

      <!-- Mobile Menu Toggle -->
      <button class="mobile-menu-toggle" @click="toggleMobileMenu" :class="{ active: isMobileMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>

    <!-- Mobile Menu Overlay -->
    <transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="mobile-menu-overlay" @click="closeMobileMenu"></div>
    </transition>

    <!-- Mobile Menu -->
    <transition name="slide-fade">
      <div v-if="isMobileMenuOpen" class="mobile-menu">
        <div class="mobile-menu-header">
          <div class="logo-small">
            <ion-icon :icon="pawOutline"></ion-icon>
            <span>HUELLASPRO</span>
          </div>
          <button class="close-menu-btn" @click="closeMobileMenu">
            <ion-icon :icon="closeOutline"></ion-icon>
          </button>
        </div>

        <nav class="mobile-nav">
          <button 
            v-for="item in navItems" 
            :key="item.path"
            :class="['mobile-nav-link', { active: isActive(item.path) }]"
            @click="navigateTo(item.path); closeMobileMenu()"
          >
            {{ item.label }}
          </button>
        </nav>

        <div class="mobile-auth">
          <template v-if="user">
            <div class="user-info">
              <div class="user-avatar-large">{{ userInitials }}</div>
              <div class="user-details">
                <p class="user-name">{{ user.nombre_usuario || user.email }}</p>
                <p class="user-email">{{ user.email }}</p>
              </div>
            </div>
            
            <button class="mobile-menu-item" @click="navigateTo('/perfil'); closeMobileMenu()">
              <ion-icon :icon="personOutline"></ion-icon>
              Mi Perfil
            </button>
            
            <button class="mobile-menu-item logout" @click="() => { AuthService.logout(router); closeMobileMenu(); }">
              <ion-icon :icon="logOutOutline"></ion-icon>
              Cerrar Sesión
            </button>
          </template>
          
          <template v-else>
            <button class="mobile-auth-btn login" @click="navigateTo('/login'); closeMobileMenu()">
              <ion-icon :icon="logInOutline"></ion-icon>
              LOGIN
            </button>
            <button class="mobile-auth-btn register" @click="navigateTo('/registro'); closeMobileMenu()">
              <ion-icon :icon="personAddOutline"></ion-icon>
              ÚNETE
            </button>
          </template>

          <div class="mobile-lang">
            <button class="mobile-lang-btn">
              <ion-icon :icon="languageOutline"></ion-icon>
              <span>Español</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- User Dropdown Menu (Desktop) -->
    <transition name="fade">
      <div v-if="showUserMenu" class="user-dropdown" @click="showUserMenu = false">
        <div class="dropdown-content" @click.stop>
          <button @click="navigateTo('/perfil'); showUserMenu = false">
            <ion-icon :icon="personOutline"></ion-icon>
            Mi Perfil
          </button>
          <button @click="() => { AuthService.logout(router); showUserMenu = false; }">
            <ion-icon :icon="logOutOutline"></ion-icon>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </transition>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { IonIcon } from '@ionic/vue';
import { 
  pawOutline, 
  chevronDownOutline, 
  closeOutline,
  personOutline,
  logOutOutline,
  logInOutline,
  personAddOutline,
  languageOutline
} from 'ionicons/icons';
import { AuthService, sessionState } from '@/services/auth.service';

const router = useRouter();
const route = useRoute();

const isMobileMenuOpen = ref(false);
const showUserMenu = ref(false);

const navItems = [
  { path: '/', label: 'Inicio' },
  { path: '/adopciones', label: 'Adopciones' },
  { path: '/eventos', label: 'Eventos' },
  { path: '/comunidad', label: 'Comunidad' },
  { path: '/educacion', label: 'Educación' }
];

const user = computed(() => sessionState.user);

const userInitials = computed(() => {
  if (!user.value) return '';
  const name = user.value.nombre_usuario || user.value.email || '';
  return name.charAt(0).toUpperCase();
});

const isActive = (path: string) => {
  return route.path === path;
};

const navigateTo = (path: string) => {
  router.push(path);
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
  document.body.style.overflow = isMobileMenuOpen.value ? 'hidden' : '';
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
  document.body.style.overflow = '';
};

const logout = () => {
  AuthService.logout();
  router.push('/');
};

// Close menu on escape key
const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && isMobileMenuOpen.value) {
    closeMobileMenu();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleEscape);
  document.body.style.overflow = '';
});
</script>

<style scoped>
/* Header Base */
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.header-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex-shrink: 0;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.logo-icon ion-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.logo-pro {
  color: #667eea;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  justify-content: center;
}

.nav-link {
  background: none;
  border: none;
  padding: 10px 16px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-link:hover {
  background: #f1f5f9;
  color: #667eea;
}

.nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

/* Desktop Auth */
.desktop-auth {
  display: flex;
  align-items: center;
  gap: 12px;
}

.auth-button {
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.login-btn {
  background: #f1f5f9;
  color: #667eea;
}

.login-btn:hover {
  background: #e2e8f0;
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 14px;
}

.lang-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f1f5f9;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
}

.lang-selector ion-icon {
  font-size: 14px;
}

/* Mobile Menu Toggle - HAMBURGER */
.mobile-menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 24px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1001;
}

.mobile-menu-toggle span {
  display: block;
  width: 100%;
  height: 3px;
  background: #0f172a;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-toggle.active span:nth-child(1) {
  transform: rotate(45deg) translate(7px, 7px);
}

.mobile-menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-toggle.active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

/* Mobile Menu */
.mobile-menu {
  position: fixed;
  top: 0;
  right: 0;
  width: 85%;
  max-width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 30px rgba(0, 0, 0, 0.1);
  z-index: 1002;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.logo-small {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
}

.logo-small ion-icon {
  font-size: 28px;
  color: #667eea;
}

.close-menu-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #f1f5f9;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.close-menu-btn:hover {
  background: #e2e8f0;
}

.close-menu-btn ion-icon {
  font-size: 20px;
  color: #0f172a;
}

.mobile-nav {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mobile-nav-link {
  background: none;
  border: none;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  color: #64748b;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
}

.mobile-nav-link:hover {
  background: #f1f5f9;
  color: #667eea;
}

.mobile-nav-link.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mobile-auth {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 8px;
}

.user-avatar-large {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.user-details {
  flex: 1;
}

.user-name {
  font-size: 15px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 2px 0;
}

.user-email {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.mobile-menu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  width: 100%;
}

.mobile-menu-item:hover {
  background: #f1f5f9;
  color: #667eea;
}

.mobile-menu-item.logout {
  color: #ef4444;
}

.mobile-menu-item.logout:hover {
  background: #fef2f2;
}

.mobile-menu-item ion-icon {
  font-size: 20px;
}

.mobile-auth-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.mobile-auth-btn.login {
  background: #f1f5f9;
  color: #667eea;
}

.mobile-auth-btn.register {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.mobile-auth-btn ion-icon {
  font-size: 18px;
}

.mobile-lang {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
}

.mobile-lang-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  padding: 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  width: 100%;
}

.mobile-lang-btn ion-icon {
  font-size: 18px;
}

/* Mobile Menu Overlay */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1001;
  backdrop-filter: blur(4px);
}

/* User Dropdown (Desktop) */
.user-dropdown {
  position: fixed;
  top: 64px;
  right: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 200px;
}

.dropdown-content {
  padding: 8px;
}

.dropdown-content button {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s;
  text-align: left;
}

.dropdown-content button:hover {
  background: #f1f5f9;
  color: #667eea;
}

.dropdown-content button ion-icon {
  font-size: 18px;
}

/* Transitions */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-fade-enter-to {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.slide-fade-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 968px) {
  .desktop-nav,
  .desktop-auth {
    display: none;
  }

  .mobile-menu-toggle {
    display: flex;
  }

  .header-container {
    padding: 12px 16px;
  }
}

@media (max-width: 480px) {
  .logo-text {
    font-size: 18px;
  }

  .logo-icon {
    width: 36px;
    height: 36px;
  }
}
</style>