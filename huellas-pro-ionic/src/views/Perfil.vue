<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Mi Perfil</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div v-if="user" class="profile-container">

        <div class="profile-card">
          <ion-avatar class="avatar">
            <img
              src="https://ionicframework.com/docs/img/demos/avatar.svg"
              alt="Perfil"
            />
          </ion-avatar>

          <h2>{{ user.nombre_completo }}</h2>

          <p>{{ user.correo_electronico }}</p>

          <ion-chip color="primary">
            <ion-label>{{ user.rol_usuario }}</ion-label>
          </ion-chip>
        </div>

        <ion-list>
          <ion-item>
            <ion-label>
              <h2>Ciudad</h2>
              <p>{{ user.ciudad_ubicacion_general || 'No registrada' }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <h2>Estado</h2>
              <p>{{ user.estado_cuenta }}</p>
            </ion-label>
          </ion-item>

          <ion-item>
            <ion-label>
              <h2>Fecha de Registro</h2>
              <p>{{ user.fecha_registro }}</p>
            </ion-label>
          </ion-item>
        </ion-list>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Acciones</ion-card-title>
          </ion-card-header>

          <ion-card-content>

            <ion-button
              expand="block"
              color="primary"
              @click="editarPerfil"
            >
              Editar Perfil
            </ion-button>

            <ion-button
              expand="block"
              color="medium"
              @click="verFavoritos"
            >
              Mis Favoritos
            </ion-button>

            <ion-button
              expand="block"
              color="tertiary"
              @click="verSolicitudes"
            >
              Mis Solicitudes
            </ion-button>

            <ion-button
              expand="block"
              color="danger"
              @click="cerrarSesion"
            >
              Cerrar Sesión
            </ion-button>

          </ion-card-content>
        </ion-card>

      </div>

      <div v-else class="empty-state">
        <h2>No hay sesión activa</h2>

        <ion-button @click="router.push('/login')">
          Iniciar Sesión
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAvatar,
  IonChip
} from '@ionic/vue';

import { computed } from 'vue';
import { useRouter } from 'vue-router';

import {
  AuthService,
  sessionState
} from '@/services/auth.service';

const router = useRouter();

const user = computed(() => sessionState.user);

const editarPerfil = () => {
  alert('Función de edición pendiente');
};

const verFavoritos = () => {
  router.push('/adopciones');
};

const verSolicitudes = () => {
  router.push('/adopciones');
};

const cerrarSesion = () => {
  AuthService.logout(router);
};
</script>

<style scoped>
.profile-container {
  max-width: 700px;
  margin: auto;
}

.profile-card {
  text-align: center;
  margin-bottom: 24px;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: auto;
  margin-bottom: 12px;
}

.empty-state {
  text-align: center;
  margin-top: 80px;
}
</style>
