<template>
  <ion-page>
    <ion-content :scroll-y="true" class="main-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">
            Conectando corazones con <span class="highlight">huellas</span>
          </h1>
          <p class="hero-subtitle">
            Plataforma nacional para la protección y adopción responsable de animales en Colombia
          </p>
          <div class="hero-buttons">
            <ion-button router-link="/adopciones" class="btn-primary">
              <ion-icon :icon="pawOutline" slot="start"></ion-icon>
              Adoptar Ahora
            </ion-button>
            <ion-button router-link="/comunidad" fill="outline" class="btn-secondary">
              <ion-icon :icon="peopleOutline" slot="start"></ion-icon>
              Unirse a la Comunidad
            </ion-button>
          </div>
        </div>
        
        <!-- Floating cards - Posicionados para ser visibles -->
        <div class="floating-card card-1">
          <ion-icon :icon="heartOutline"></ion-icon>
          <span>+500 Adopciones</span>
        </div>
        <div class="floating-card card-2">
          <ion-icon :icon="homeOutline"></ion-icon>
          <span>+50 Refugios</span>
        </div>
      </div>

      <!-- Stats Section -->
      <div class="stats-section">
        <div class="stat-card">
          <ion-icon :icon="pawOutline"></ion-icon>
          <h3>{{ stats.animales }}</h3>
          <p>Mascotas en adopción</p>
        </div>
        <div class="stat-card">
          <ion-icon :icon="heartOutline"></ion-icon>
          <h3>{{ stats.adopciones }}</h3>
          <p>Adopciones exitosas</p>
        </div>
        <div class="stat-card">
          <ion-icon :icon="homeOutline"></ion-icon>
          <h3>{{ stats.refugios }}</h3>
          <p>Refugios aliados</p>
        </div>
        <div class="stat-card">
          <ion-icon :icon="peopleOutline"></ion-icon>
          <h3>{{ stats.usuarios }}</h3>
          <p>Usuarios activos</p>
        </div>
      </div>

      <!-- Featured Pets -->
      <div class="featured-section">
        <div class="section-header">
          <h2>Mascotas Destacadas</h2>
          <ion-button router-link="/adopciones" fill="clear" class="view-all-btn">
            Ver todas
            <ion-icon :icon="arrowForwardOutline" slot="end"></ion-icon>
          </ion-button>
        </div>
        <div class="pets-grid">
          <div 
            v-for="animal in featuredPets" 
            :key="animal.ID_animal" 
            class="pet-card-mini" 
            @click="router.push('/adopciones')"
          >
            <div class="pet-image-wrapper">
              <img :src="animal.imagen" :alt="animal.nombre" />
            </div>
            <div class="pet-info">
              <h4>{{ animal.nombre }}</h4>
              <p>{{ animal.raza }} • {{ animal.ciudad }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Espacio inferior para scroll -->
      <div class="bottom-spacer"></div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { IonPage, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { 
  pawOutline, 
  heartOutline, 
  homeOutline, 
  peopleOutline,
  arrowForwardOutline
} from 'ionicons/icons';
import { DatabaseService } from '@/services/database';

const router = useRouter();

const stats = ref({
  animales: 0,
  adopciones: 523,
  refugios: 0,
  usuarios: 0
});

const featuredPets = computed(() => {
  return DatabaseService.getAnimalesDisponibles().slice(0, 4);
});

onMounted(() => {
  const db = DatabaseService.readDb();
  stats.value.animales = db.animales_adopcion.filter(a => a.estado_publicacion === 'publicado').length;
  stats.value.refugios = db.usuario.filter(u => u.rol_usuario === 'refugio').length;
  stats.value.usuarios = db.usuario.length;
});
</script>

<style scoped>
/* Contenido principal con scroll */
.main-content {
  --background: #f8fafc;
}

/* Hero Section - Centrado y con padding adecuado */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 120px 24px 80px; /* Padding superior aumentado para navbar */
  text-align: center;
  position: relative;
  overflow: visible; /* Cambiado para que las cards flotantes se vean */
  min-height: 450px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* Patrón de fondo sutil */
.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 10c-2.5 0-4.5 2-4.5 4.5 0 .8.2 1.5.6 2.1-.4-.1-.8-.1-1.2-.1-4.1 0-7.4 3.3-7.4 7.4 0 .8.1 1.6.4 2.3-3.3.8-5.9 3.8-5.9 7.3 0 4.1 3.3 7.5 7.5 7.5h21c4.1 0 7.5-3.4 7.5-7.5 0-3.5-2.5-6.5-5.9-7.3.3-.7.4-1.5.4-2.3 0-4.1-3.3-7.4-7.4-7.4-.4 0-.8 0-1.2.1.4-.6.6-1.3.6-2.1 0-2.5-2-4.5-4.5-4.5z' fill='%23ffffff' fill-opacity='0.03'/%3E%3C/svg%3E");
  pointer-events: none;
}

.hero-content {
  max-width: 800px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 48px;
  font-weight: 900;
  color: white;
  margin: 0 0 20px 0;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary {
  --background: white;
  --color: #667eea;
  --border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  padding: 16px 32px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
}

.btn-secondary {
  --color: white;
  --border-color: white;
  --border-radius: 12px;
  font-weight: 700;
  font-size: 15px;
  padding: 16px 32px;
}

/* Floating cards - Posicionadas para ser visibles */
.floating-card {
  position: absolute;
  background: white;
  padding: 16px 24px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  animation: float 3s ease-in-out infinite;
  z-index: 3;
}

.floating-card ion-icon {
  font-size: 28px;
  color: #667eea;
}

.floating-card span {
  font-weight: 700;
  color: #333;
  font-size: 14px;
}

/* Card 1 - Arriba a la derecha pero visible */
.card-1 {
  top: 40px;
  right: 5%;
  animation-delay: 0s;
}

/* Card 2 - Abajo a la izquierda pero visible */
.card-2 {
  bottom: 60px;
  left: 5%;
  animation-delay: 1.5s;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}

/* Stats */
.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 60px 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.stat-card {
  background: white;
  padding: 32px;
  border-radius: 20px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(102, 126, 234, 0.15);
}

.stat-card ion-icon {
  font-size: 40px;
  color: #667eea;
  margin-bottom: 16px;
}

.stat-card h3 {
  font-size: 36px;
  font-weight: 900;
  color: #667eea;
  margin: 0 0 8px 0;
}

.stat-card p {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

/* Featured */
.featured-section {
  padding: 40px 24px 60px;
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.section-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.view-all-btn {
  --color: #667eea;
  font-weight: 700;
  font-size: 14px;
}

.pets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.pet-card-mini {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.pet-card-mini:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.pet-image-wrapper {
  width: 100%;
  height: 260px; /* Aumentado de 180px a 260px */
  overflow: hidden;
}

.pet-card-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s;
}

.pet-card-mini:hover img {
  transform: scale(1.08);
}

.pet-info {
  padding: 16px;
}

.pet-info h4 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.pet-info p {
  font-size: 12px;
  color: #64748b;
  margin: 0;
}

/* Espaciador inferior */
.bottom-spacer {
  height: 60px;
}

/* Responsive */
@media (max-width: 968px) {
  .hero-section {
    padding: 100px 16px 60px;
    min-height: 400px;
  }

  .hero-title {
    font-size: 36px;
  }

  .floating-card {
    display: none; /* Ocultar en tablets/móviles para mejor UX */
  }

  .stats-section {
    grid-template-columns: repeat(2, 1fr);
    padding: 40px 16px;
  }

  .pets-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .hero-section {
    padding: 80px 16px 50px;
    min-height: 350px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-subtitle {
    font-size: 14px;
  }

  .hero-buttons {
    flex-direction: column;
    width: 100%;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }

  .stats-section {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }
}
</style>