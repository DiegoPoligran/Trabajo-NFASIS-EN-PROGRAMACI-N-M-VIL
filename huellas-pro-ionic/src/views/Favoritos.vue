<template>
  <ion-page>
    <ion-content class="favoritos-content">
      <div class="favoritos-header">
        <h1>Mis Mascotas Favoritas ❤️</h1>
        <p>{{ favoritos.length }} mascotas en tu lista</p>
      </div>

      <div v-if="favoritos.length > 0" class="favoritos-grid">
        <div 
          v-for="fav in favoritos" 
          :key="fav.ID_animal"
          class="fav-card"
          @click="verDetalle(fav)"
        >
          <div class="fav-image">
            <img v-if="fav.imagen" :src="fav.imagen" :alt="fav.nombre" />
            <div v-else class="no-image">
              <span>{{ fav.especie === 'gatos' ? '🐱' : '🐶' }}</span>
            </div>
            <button class="remove-fav" @click.stop="quitarFavorito(fav)">
              <ion-icon :icon="closeCircleOutline"></ion-icon>
            </button>
          </div>
          <div class="fav-info">
            <h3>{{ fav.nombre }}</h3>
            <p>{{ fav.raza }} • {{ fav.ciudad }}</p>
            <ion-button size="small" @click.stop="solicitarAdopcion(fav)">
              Solicitar adopción
            </ion-button>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">💔</div>
        <h3>No tienes favoritos aún</h3>
        <p>Explora las mascotas y agrega las que te gusten</p>
        <ion-button router-link="/adopciones">
          Ver mascotas disponibles
        </ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { closeCircleOutline } from 'ionicons/icons';
import { DatabaseService } from '@/services/database';
import { sessionState } from '@/services/auth.service';

const router = useRouter();
const favoritos = ref<any[]>([]);

onMounted(() => {
  cargarFavoritos();
});

const cargarFavoritos = () => {
  if (!sessionState.user) return;
  
  const favIds = DatabaseService.getFavoritos(sessionState.user.ID_usuario);
  favoritos.value = favIds.map((fav: any) => {
    const animal = DatabaseService.getAnimalById(fav.ID_animal);
    return animal;
  }).filter(Boolean);
};

const quitarFavorito = (animal: any) => {
  if (!sessionState.user) return;
  DatabaseService.eliminarFavorito(sessionState.user.ID_usuario, animal.ID_animal);
  cargarFavoritos();
};

const verDetalle = (animal: any) => {
  router.push({ path: '/adopciones', query: { animal: animal.ID_animal } });
};

const solicitarAdopcion = (animal: any) => {
  if (!sessionState.user) {
    router.push('/login');
    return;
  }
  DatabaseService.crearSolicitud(
    sessionState.user.ID_usuario,
    animal.ID_animal,
    'Solicitud desde favoritos'
  );
  alert('¡Solicitud enviada! Te contactaremos pronto.');
};
</script>

<style scoped>
.favoritos-content {
  --background: #f8fafc;
}

.favoritos-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 24px;
  color: white;
  text-align: center;
}

.favoritos-header h1 {
  font-size: 28px;
  font-weight: 800;
  margin: 0 0 8px 0;
}

.favoritos-header p {
  font-size: 14px;
  opacity: 0.9;
  margin: 0;
}

.favoritos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.fav-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: all 0.3s;
}

.fav-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.fav-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.fav-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.no-image {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 64px;
}

.remove-fav {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #ef4444;
  font-size: 20px;
}

.fav-info {
  padding: 16px;
}

.fav-info h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.fav-info p {
  font-size: 13px;
  color: #64748b;
  margin: 0 0 12px 0;
}

.empty-state {
  text-align: center;
  padding: 60px 24px;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.empty-state p {
  color: #64748b;
  margin: 0 0 24px 0;
}
</style>
