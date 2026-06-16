<template>
  <ion-page>
    <ion-header>
      <ion-toolbar color="danger">
        <ion-title>Panel de Administración</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="admin-container">
        <h2>Bienvenido, Administrador</h2>
        <p class="ion-margin-bottom">Gestiona usuarios, refugios y configuraciones del sistema.</p>

        <!-- Estadísticas rápidas -->
        <ion-grid>
          <ion-row>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-header>
                  <ion-card-subtitle>Total Usuarios</ion-card-subtitle>
                  <ion-card-title>{{ stats.totalUsuarios }}</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-header>
                  <ion-card-subtitle>Refugios</ion-card-subtitle>
                  <ion-card-title>{{ stats.refugios }}</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
          <ion-row>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-header>
                  <ion-card-subtitle>Administradores</ion-card-subtitle>
                  <ion-card-title>{{ stats.administradores }}</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
            <ion-col size="6">
              <ion-card class="stat-card">
                <ion-card-header>
                  <ion-card-subtitle>Animales</ion-card-subtitle>
                  <ion-card-title>{{ stats.animales }}</ion-card-title>
                </ion-card-header>
              </ion-card>
            </ion-col>
          </ion-row>
        </ion-grid>

        <!-- Gestión de cuentas -->
        <ion-card class="ion-margin-top">
          <ion-card-header>
            <ion-card-title>Gestión de Cuentas</ion-card-title>
            <ion-card-subtitle>Visualiza y administra todas las cuentas registradas</ion-card-subtitle>
          </ion-card-header>
          <ion-card-content>
            <ion-list>
              <ion-item v-for="user in usuarios" :key="user.ID_usuario">
                <ion-avatar slot="start">
                  <div class="avatar-placeholder">
                    {{ getInitials(user.nombre_completo) }}
                  </div>
                </ion-avatar>
                <ion-label>
                  <h2>{{ user.nombre_completo }}</h2>
                  <p>{{ user.correo_electronico }}</p>
                  <p>
                    <ion-badge :color="getRoleColor(user.rol_usuario)">
                      {{ getRoleLabel(user.rol_usuario) }}
                    </ion-badge>
                  </p>
                </ion-label>
                <ion-badge slot="end" :color="user.estado_cuenta === 'activo' ? 'success' : 'medium'">
                  {{ user.estado_cuenta }}
                </ion-badge>
              </ion-item>
            </ion-list>
          </ion-card-content>
        </ion-card>

        <!-- Botón de regreso -->
        <ion-button expand="block" router-link="/adopciones" class="ion-margin-top">
          Volver a Adopciones
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { 
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent,
  IonGrid, IonRow, IonCol, IonList, IonItem, IonLabel, IonAvatar,
  IonBadge, IonButton
} from '@ionic/vue';
import { DatabaseService } from '@/services/database';
import { AuthService, sessionState } from '@/services/auth.service';

const stats = ref({
  totalUsuarios: 0,
  refugios: 0,
  administradores: 0,
  animales: 0
});

const usuarios = computed(() => DatabaseService.getUsuarios());

const getInitials = (name: string) => {
  return AuthService.getInitials(name);
};

const getRoleLabel = (role: string) => {
  return AuthService.getRoleLabel(role);
};

const getRoleColor = (role: string) => {
  const colors: Record<string, string> = {
    admin: 'danger',
    refugio: 'primary',
    usuario: 'success'
  };
  return colors[role] || 'medium';
};

onMounted(() => {
  const db = DatabaseService.readDb();
  stats.value = {
    totalUsuarios: db.usuario.length,
    refugios: db.usuario.filter(u => u.rol_usuario === 'refugio').length,
    administradores: db.usuario.filter(u => u.rol_usuario === 'admin').length,
    animales: db.animales_adopcion.length
  };
});
</script>

<style scoped>
.admin-container {
  max-width: 800px;
  margin: 0 auto;
}

.stat-card {
  --background: #f8fafc;
  border-radius: 12px;
  margin: 0;
}

.stat-card ion-card-title {
  font-size: 32px;
  font-weight: 900;
  color: #0c4a6e;
}

.stat-card ion-card-subtitle {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #64748b;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
}

ion-item {
  --padding-start: 0;
  --inner-padding-end: 0;
}

ion-avatar {
  margin-right: 16px;
  border-radius: 12px;
}

ion-label h2 {
  font-weight: 700;
  font-size: 14px;
  color: #0f172a;
}

ion-label p {
  font-size: 12px;
  color: #64748b;
  margin-top: 2px;
}

ion-badge {
  font-size: 10px;
  padding: 4px 8px;
  text-transform: uppercase;
  font-weight: 700;
}
</style>