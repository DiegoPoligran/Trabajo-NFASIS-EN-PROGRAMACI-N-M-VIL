<template>
  <ion-page>
    <ion-content class="ion-padding login-background">
      <div class="login-container">
        <!-- Logo/Header -->
        <div class="login-header ion-text-center ion-margin-bottom">
          <div class="logo-circle">
            <ion-icon :icon="pawOutline" size="large"></ion-icon>
          </div>
          <h1 class="app-title">HUELLASPRO</h1>
          <p class="app-subtitle">Protegiendo vidas en Colombia</p>
        </div>

        <!-- Tabs: Login / Registro / Recuperar -->
        <ion-segment v-model="activePanel" class="auth-tabs">
          <ion-segment-button value="login">
            <ion-label>Ingresar</ion-label>
          </ion-segment-button>
          <ion-segment-button value="register">
            <ion-label>Únete</ion-label>
          </ion-segment-button>
          <ion-segment-button value="forgot">
            <ion-label>Recuperar</ion-label>
          </ion-segment-button>
        </ion-segment>

        <!-- Mensaje de feedback -->
        <ion-note v-if="message" :color="messageType" class="auth-message ion-text-center ion-margin-top">
          {{ message }}
        </ion-note>

        <!-- PANEL: LOGIN -->
        <div v-if="activePanel === 'login'" class="auth-panel">
          <ion-list class="auth-form">
            <ion-item>
              <ion-input 
                label="Correo electrónico" 
                label-placement="floating" 
                type="email" 
                v-model="loginForm.email"
                placeholder="tu@correo.com"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input 
                label="Contraseña" 
                label-placement="floating" 
                type="password" 
                v-model="loginForm.password"
                placeholder="••••••••"
              ></ion-input>
            </ion-item>
          </ion-list>

          <ion-button expand="block" class="ion-margin-top" @click="handleLogin" :disabled="loading">
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Iniciar Sesión</span>
          </ion-button>
		
	  <!--
          <div class="demo-credentials ion-margin-top">
            <p class="demo-title">🔑 Cuentas de prueba:</p>
            <p><strong>Admin:</strong> admin@huellaspro.com / admin123</p>
            <p><strong>Refugio:</strong> miguelangelangelroapinzon99@gmail.com / 123456</p>
            <p><strong>Usuario:</strong> felipe@huellaspro.com / 123456</p>
          </div>
	  -->	
        </div> 
	

        <!-- PANEL: REGISTRO -->
        <div v-if="activePanel === 'register'" class="auth-panel">
          <ion-list class="auth-form">
            <ion-item>
              <ion-input 
                label="Nombre completo" 
                label-placement="floating" 
                v-model="registerForm.name"
                placeholder="Tu nombre"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input 
                label="Correo electrónico" 
                label-placement="floating" 
                type="email" 
                v-model="registerForm.email"
                placeholder="tu@correo.com"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-input 
                label="Contraseña" 
                label-placement="floating" 
                type="password" 
                v-model="registerForm.password"
                placeholder="Mínimo 4 caracteres"
              ></ion-input>
            </ion-item>
            <ion-item>
              <ion-label>Tipo de cuenta</ion-label>
              <ion-select v-model="registerForm.role" interface="popover">
                <ion-select-option value="usuario">Usuario (Adoptante)</ion-select-option>
                <ion-select-option value="refugio">Refugio Aliado</ion-select-option>
              </ion-select>
            </ion-item>
          </ion-list>

          <ion-button expand="block" class="ion-margin-top" @click="handleRegister" :disabled="loading">
            <ion-spinner v-if="loading" name="crescent"></ion-spinner>
            <span v-else>Crear Cuenta</span>
          </ion-button>
        </div>

        <!-- PANEL: RECUPERAR CONTRASEÑA -->
        <div v-if="activePanel === 'forgot'" class="auth-panel">
          <!-- Paso 1: Verificar email -->
          <div v-if="!recoveryStep2">
            <p class="recovery-text">Ingresa tu correo para verificar tu cuenta:</p>
            <ion-list class="auth-form">
              <ion-item>
                <ion-input 
                  label="Correo electrónico" 
                  label-placement="floating" 
                  type="email" 
                  v-model="forgotForm.email"
                  placeholder="tu@correo.com"
                ></ion-input>
              </ion-item>
            </ion-list>
            <ion-button expand="block" class="ion-margin-top" @click="handleVerifyEmail" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Verificar Correo</span>
            </ion-button>
          </div>

          <!-- Paso 2: Nueva contraseña -->
          <div v-else>
            <p class="recovery-text">✅ Usuario verificado. Ingresa tu nueva contraseña:</p>
            <ion-list class="auth-form">
              <ion-item>
                <ion-input 
                  label="Nueva contraseña" 
                  label-placement="floating" 
                  type="password" 
                  v-model="forgotForm.newPassword"
                  placeholder="Mínimo 4 caracteres"
                ></ion-input>
              </ion-item>
            </ion-list>
            <ion-button expand="block" class="ion-margin-top" @click="handleResetPassword" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span v-else>Cambiar Contraseña</span>
            </ion-button>
            <ion-button expand="block" fill="clear" @click="resetRecovery">
              Volver
            </ion-button>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import { 
  IonPage, IonContent, IonItem, IonInput, IonButton, IonSpinner,
  IonList, IonLabel, IonSelect, IonSelectOption, IonSegment,
  IonSegmentButton, IonNote, IonIcon
} from '@ionic/vue';
import { pawOutline } from 'ionicons/icons';
import { AuthService } from '@/services/auth.service';

const router = useRouter();

// Estado de los paneles
const activePanel = ref('login');
const loading = ref(false);
const message = ref('');
const messageType = ref('primary'); // 'primary', 'success', 'danger', 'warning'

// Formularios
const loginForm = ref({ email: '', password: '' });
const registerForm = ref({ name: '', email: '', password: '', role: 'usuario' });
const forgotForm = ref({ email: '', newPassword: '' });

// Estado de recuperación
const recoveryStep2 = ref(false);
const verifiedUserId = ref(null);

// Helper para mostrar toasts
const showToast = async (msg, color = 'primary') => {
  const toast = await toastController.create({
    message: msg,
    duration: 3000,
    position: 'top',
    color: color
  });
  await toast.present();
};

// ─── LOGIN ────────────────────────────────────────────────────────────
const handleLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    message.value = 'Por favor completa todos los campos.';
    messageType.value = 'warning';
    return;
  }

  loading.value = true;
  message.value = '';

  const result = await AuthService.login(loginForm.value.email, loginForm.value.password);
  loading.value = false;

  if (result.success) {
    message.value = '¡Sesión iniciada correctamente!';
    messageType.value = 'success';
    await showToast(`Bienvenido ${result.user.nombre_completo}`, 'success');

    // Redirección según rol
    setTimeout(() => {
      if (result.user.rol_usuario === 'admin') {
        router.push('/admin');
      } else {
        router.push('/perfil');
      }
    }, 800);
  } else {
    message.value = result.message;
    messageType.value = 'danger';
  }
};

// ─── REGISTRO ─────────────────────────────────────────────────────────
const handleRegister = async () => {
  if (!registerForm.value.name || !registerForm.value.email || !registerForm.value.password) {
    message.value = 'Completa nombre, correo y contraseña.';
    messageType.value = 'warning';
    return;
  }

  if (registerForm.value.password.length < 4) {
    message.value = 'La contraseña debe tener al menos 4 caracteres.';
    messageType.value = 'warning';
    return;
  }

  loading.value = true;
  message.value = '';

  const result = await AuthService.register(
    registerForm.value.name,
    registerForm.value.email,
    registerForm.value.password,
    registerForm.value.role
  );
  loading.value = false;

  if (result.success) {
    message.value = '¡Cuenta creada correctamente!';
    messageType.value = 'success';
    await showToast('Cuenta creada exitosamente', 'success');

    setTimeout(() => {
      router.push('/perfil');
    }, 800);
  } else {
    message.value = result.message;
    messageType.value = 'danger';
  }
};

// ─── RECUPERACIÓN DE CONTRASEÑA ───────────────────────────────────────
const handleVerifyEmail = () => {
  if (!forgotForm.value.email) {
    message.value = 'Ingresa tu correo electrónico.';
    messageType.value = 'warning';
    return;
  }

  loading.value = true;
  message.value = '';

  const result = AuthService.verifyEmailForRecovery(forgotForm.value.email);
  loading.value = false;

  if (result.success) {
    verifiedUserId.value = result.userId;
    recoveryStep2.value = true;
    message.value = 'Usuario verificado. Ingresa tu nueva contraseña.';
    messageType.value = 'success';
  } else {
    message.value = result.message;
    messageType.value = 'danger';
  }
};

const handleResetPassword = () => {
  if (!forgotForm.value.newPassword) {
    message.value = 'Ingresa la nueva contraseña.';
    messageType.value = 'warning';
    return;
  }

  loading.value = true;
  message.value = '';

  const result = AuthService.resetPassword(verifiedUserId.value, forgotForm.value.newPassword);
  loading.value = false;

  if (result.success) {
    message.value = 'Contraseña actualizada. Ya puedes iniciar sesión.';
    messageType.value = 'success';
    showToast('Contraseña cambiada exitosamente', 'success');

    setTimeout(() => {
      resetRecovery();
      activePanel.value = 'login';
    }, 1500);
  } else {
    message.value = result.message;
    messageType.value = 'danger';
  }
};

const resetRecovery = () => {
  recoveryStep2.value = false;
  verifiedUserId.value = null;
  forgotForm.value = { email: '', newPassword: '' };
  message.value = '';
};
</script>

<style scoped>
.login-background {
  --background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
}

.login-container {
  max-width: 450px;
  margin: 0 auto;
  padding: 20px 0;
}

.login-header {
  padding: 20px 0;
}

.logo-circle {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
  box-shadow: 0 10px 25px rgba(14, 165, 233, 0.3);
}

.app-title {
  font-size: 28px;
  font-weight: 900;
  color: #0c4a6e;
  margin: 0;
  letter-spacing: 2px;
}

.app-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 4px 0 0;
}

.auth-tabs {
  margin-bottom: 20px;
  --background: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
}

.auth-message {
  display: block;
  padding: 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 16px;
}

.auth-form {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.demo-credentials {
  background: #fef3c7;
  border: 1px solid #fde68a;
  border-radius: 12px;
  padding: 12px;
  font-size: 11px;
  color: #92400e;
}

.demo-title {
  font-weight: bold;
  margin-bottom: 6px;
  font-size: 12px;
}

.demo-credentials p {
  margin: 2px 0;
}

.recovery-text {
  text-align: center;
  color: #475569;
  font-size: 14px;
  margin-bottom: 16px;
}
</style>