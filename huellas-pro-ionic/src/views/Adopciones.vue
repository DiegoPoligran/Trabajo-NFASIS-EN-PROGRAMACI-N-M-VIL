<template>
  <ion-page>
    <ion-content class="adopciones-content" :scroll-y="true">
      <!-- Hero compacto con personalidad -->
      <div class="hero-compact">
        <div class="hero-blob blob-1"></div>
        <div class="hero-blob blob-2"></div>
        
        <div class="hero-inner">
          <div class="hero-emoji">🐾</div>
          <h1 class="hero-title">
            Encuentra tu <span class="highlight">compañero</span> ideal
          </h1>
          <p class="hero-subtitle">
            {{ animalesFiltrados.length }} mascotas esperan por ti
          </p>
          
          <!-- Búsqueda integrada -->
          <div class="search-wrapper">
            <div class="search-box">
              <ion-icon :icon="searchOutline" class="search-icon"></ion-icon>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Buscar por nombre, raza o ciudad..."
                class="search-input"
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
                <ion-icon :icon="closeOutline"></ion-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Filtros compactos tipo pills -->
      <div class="filters-compact">
        <div class="filters-inner">
          <div class="filter-row">
            <div class="filter-group">
              <span class="filter-label">Especie</span>
              <div class="pills">
                <button 
                  v-for="option in speciesOptions" 
                  :key="option.value"
                  :class="['pill', { active: filtros.species === option.value }]"
                  @click="filtros.species = option.value"
                >
                  <span class="pill-emoji">{{ option.icon }}</span>
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Ubicación</span>
              <div class="pills">
                <button 
                  v-for="option in locationOptions" 
                  :key="option.value"
                  :class="['pill', { active: filtros.location === option.value }]"
                  @click="filtros.location = option.value"
                >
                  <ion-icon :icon="locationOutline" class="pill-icon"></ion-icon>
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>

          <div class="filter-row">
            <div class="filter-group">
              <span class="filter-label">Salud</span>
              <div class="pills">
                <button 
                  v-for="option in healthOptions" 
                  :key="option.value"
                  :class="['pill', { active: filtros.health === option.value }]"
                  @click="filtros.health = option.value"
                >
                  <span class="pill-emoji">{{ option.icon }}</span>
                  {{ option.label }}
                </button>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">Tamaño</span>
              <div class="pills">
                <button 
                  v-for="option in sizeOptions" 
                  :key="option.value"
                  :class="['pill', { active: filtros.size === option.value }]"
                  @click="filtros.size = option.value"
                >
                  <span class="pill-emoji">{{ option.icon }}</span>
                  {{ option.label }}
                </button>
              </div>
            </div>
          </div>

          <button v-if="hasActiveFilters" @click="limpiarFiltros" class="reset-link">
            <ion-icon :icon="refreshOutline"></ion-icon>
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Grid de mascotas 4x2 -->
      <div class="pets-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="title-emoji">🐶</span>
            Mascotas disponibles
            <span class="count-pill">{{ animalesFiltrados.length }}</span>
          </h2>
        </div>

        <div v-if="animalesFiltrados.length > 0" class="pets-grid">
          <div 
            v-for="(animal, index) in animalesFiltrados" 
            :key="animal.ID_animal"
            class="pet-card"
            :style="{ animationDelay: `${index * 0.08}s` }"
            @click="abrirDetalle(animal)"
          >
            <div class="card-image">
              <img 
                v-if="animal.imagen && !animal.imagen.startsWith('idb://')" 
                :src="animal.imagen" 
                :alt="animal.nombre"
                loading="lazy"
              />
              <div v-else class="image-placeholder">
                <span class="placeholder-emoji">{{ animal.especie === 'gatos' ? '🐱' : '🐶' }}</span>
                <span>Sin foto</span>
              </div>
              
              <!-- Badges flotantes -->
              <div class="badges">
                <span class="badge badge-location">
                  <ion-icon :icon="locationOutline"></ion-icon>
                  {{ animal.ciudad }}
                </span>
                <span class="badge badge-species">
                  {{ animal.especie === 'gatos' ? '' : '🐶' }}
                </span>
              </div>

              <!-- Overlay al hover -->
              <div class="card-overlay">
                <button class="view-btn">
                  <ion-icon :icon="eyeOutline"></ion-icon>
                  Ver ficha
                </button>
              </div>

              <!-- Badge de favorito -->
              <button class="favorite-toggle" @click.stop="toggleFavorito(animal)">
                <ion-icon :icon="esFavoritoAnimal(animal) ? heart : heartOutline"></ion-icon>
              </button>
            </div>

            <div class="card-body">
              <div class="card-header">
                <h3 class="pet-name">{{ animal.nombre }}</h3>
                <span class="health-dot" :class="animal.estado_salud"></span>
              </div>
              
              <p class="pet-meta">
                {{ animal.raza }} • {{ animal.edad }}
              </p>
              
              <p class="pet-description">
                {{ animal.descripcion }}
              </p>

              <div class="card-footer">
                <div class="tags">
                  <span v-if="animal.vacunado !== 'Pendiente'" class="tag tag-success">
                    <ion-icon :icon="checkmarkOutline"></ion-icon>
                    Vacunado
                  </span>
                  <span v-if="animal.esterilizado !== 'Pendiente'" class="tag tag-success">
                    <ion-icon :icon="checkmarkOutline"></ion-icon>
                    Esterilizado
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div v-else class="empty-state">
          <div class="empty-emoji"></div>
          <h3>No encontramos mascotas</h3>
          <p>Prueba ajustar los filtros o la búsqueda</p>
          <button @click="limpiarFiltros" class="reset-button">
            <ion-icon :icon="refreshOutline"></ion-icon>
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Modal de detalle -->
      <ion-modal :is-open="modalDetalleAbierto" @didDismiss="cerrarDetalle" class="detail-modal">
        <div v-if="animalSeleccionado" class="modal-content">
          <div class="modal-image">
            <img 
              v-if="animalSeleccionado.imagen && !animalSeleccionado.imagen.startsWith('idb://')" 
              :src="animalSeleccionado.imagen" 
              :alt="animalSeleccionado.nombre"
            />
            <div v-else class="modal-placeholder">
              <span class="placeholder-emoji large">{{ animalSeleccionado.especie === 'gatos' ? '🐱' : '🐶' }}</span>
            </div>
            
            <button class="modal-close" @click="cerrarDetalle">
              <ion-icon :icon="closeOutline"></ion-icon>
            </button>

            <div class="modal-badges">
              <span class="modal-badge">
                {{ animalSeleccionado.especie === 'gatos' ? '🐱 Gato' : '🐶 Perro' }}
              </span>
              <span class="modal-badge">
                <ion-icon :icon="locationOutline"></ion-icon>
                {{ animalSeleccionado.ciudad }}
              </span>
            </div>
          </div>

          <div class="modal-body">
            <div class="modal-header">
              <div>
                <h2 class="modal-title">{{ animalSeleccionado.nombre }}</h2>
                <p class="modal-subtitle">{{ animalSeleccionado.raza }} • {{ animalSeleccionado.edad }}</p>
              </div>
              <div class="gender-icon">
                <ion-icon :icon="animalSeleccionado.sexo === 'Macho' ? maleOutline : femaleOutline"></ion-icon>
              </div>
            </div>

            <div class="modal-info-grid">
              <div class="info-item">
                <ion-icon :icon="resizeOutline"></ion-icon>
                <div>
                  <span class="info-label">Tamaño</span>
                  <span class="info-value">{{ sizeLabels[animalSeleccionado.tamano] }}</span>
                </div>
              </div>
              <div class="info-item">
                <ion-icon :icon="heartOutline"></ion-icon>
                <div>
                  <span class="info-label">Salud</span>
                  <span class="info-value">{{ healthLabels[animalSeleccionado.estado_salud] }}</span>
                </div>
              </div>
              <div class="info-item" v-if="animalSeleccionado.vacunado !== 'Pendiente'">
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                <div>
                  <span class="info-label">Vacunas</span>
                  <span class="info-value">{{ animalSeleccionado.vacunado }}</span>
                </div>
              </div>
              <div class="info-item" v-if="animalSeleccionado.esterilizado !== 'Pendiente'">
                <ion-icon :icon="checkmarkCircleOutline"></ion-icon>
                <div>
                  <span class="info-label">Esterilización</span>
                  <span class="info-value">{{ animalSeleccionado.esterilizado }}</span>
                </div>
              </div>
            </div>

            <div class="modal-story">
              <h3>
                <span class="story-emoji">📖</span>
                Historia y personalidad
              </h3>
              <p>{{ animalSeleccionado.historia || animalSeleccionado.descripcion }}</p>
            </div>

            <div class="modal-actions">
              <button class="btn-adopt" @click="solicitarAdopcion" :disabled="yaSolicite">
                <ion-icon :icon="heartOutline"></ion-icon>
                {{ yaSolicite ? 'Solicitud enviada' : 'Solicitar adopción' }}
              </button>
              
              <div class="btn-group">
                <button class="btn-secondary" @click="toggleFavorito(animalSeleccionado)">
                  <ion-icon :icon="esFavoritoAnimal(animalSeleccionado) ? heart : heartOutline"></ion-icon>
                  {{ esFavoritoAnimal(animalSeleccionado) ? 'En favoritos' : 'Favoritos' }}
                </button>
                
                <button class="btn-secondary" @click="enviarMensaje">
                  <ion-icon :icon="chatbubbleOutline"></ion-icon>
                  Mensaje
                </button>
              </div>
            </div>
          </div>
        </div>
      </ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { alertController } from '@ionic/vue';
import { 
  IonPage, IonContent, IonIcon, IonModal
} from '@ionic/vue';
import { 
  heartOutline, heart, pawOutline, searchOutline, closeOutline,
  locationOutline, eyeOutline, checkmarkCircleOutline, checkmarkOutline,
  maleOutline, femaleOutline, resizeOutline,
  chatbubbleOutline, refreshOutline
} from 'ionicons/icons';
import { DatabaseService } from '@/services/database';
import { sessionState } from '@/services/auth.service';

const router = useRouter();

const searchQuery = ref('');
const filtros = ref({
  species: '',
  location: '',
  health: '',
  size: ''
});

const modalDetalleAbierto = ref(false);
const animalSeleccionado = ref<any>(null);

const speciesOptions = [
  { value: '', label: 'Todos', icon: '🐾' },
  { value: 'perros', label: 'Perros', icon: '🐶' },
  { value: 'gatos', label: 'Gatos', icon: '🐱' }
];

const locationOptions = [
  { value: '', label: 'Todo', icon: '' },
  { value: 'bogota', label: 'Bogotá', icon: '' },
  { value: 'medellin', label: 'Medellín', icon: '' },
  { value: 'cali', label: 'Cali', icon: '' },
  { value: 'cartagena', label: 'Cartagena', icon: '' },
  { value: 'barranquilla', label: 'Barranquilla', icon: '' }
];

const healthOptions = [
  { value: '', label: 'Todos', icon: '💚' },
  { value: 'vacunado', label: 'Vacunado', icon: '💉' },
  { value: 'esterilizado', label: 'Esterilizado', icon: '✂️' }
];

const sizeOptions = [
  { value: '', label: 'Todos', icon: '📏' },
  { value: 'pequeno', label: 'Pequeño', icon: '🐕' },
  { value: 'mediano', label: 'Mediano', icon: '' },
  { value: 'grande', label: 'Grande', icon: '🐕🦺' }
];

const sizeLabels: Record<string, string> = {
  pequeno: 'Pequeño',
  mediano: 'Mediano',
  grande: 'Grande'
};

const healthLabels: Record<string, string> = {
  sano: 'Sano',
  tratamiento: 'En tratamiento'
};

const hasActiveFilters = computed(() => {
  return filtros.value.species || filtros.value.location || 
         filtros.value.health || filtros.value.size || searchQuery.value;
});

const animalesFiltrados = computed(() => {
  const animales = DatabaseService.getAnimalesDisponibles();
  const query = searchQuery.value.toLowerCase();

  return animales.filter(animal => {
    if (query) {
      const searchText = `${animal.nombre} ${animal.raza} ${animal.ciudad}`.toLowerCase();
      if (!searchText.includes(query)) return false;
    }

    if (filtros.value.species && animal.especie !== filtros.value.species) return false;
    if (filtros.value.location && animal.ubicacion_key !== filtros.value.location) return false;

    if (filtros.value.health === 'vacunado' && !animal.vacunado?.toLowerCase().startsWith('vacunad')) return false;
    if (filtros.value.health === 'esterilizado' && !animal.esterilizado?.toLowerCase().startsWith('esterilizad')) return false;

    if (filtros.value.size && animal.tamano !== filtros.value.size) return false;

    return true;
  });
});

const usuarioActual = computed(() => sessionState.user);

const yaSolicite = computed(() => {
  if (!animalSeleccionado.value || !usuarioActual.value) return false;
  const solicitudes = DatabaseService.getSolicitudesByUsuario(usuarioActual.value.ID_usuario);
  return solicitudes.some(s => 
    s.ID_animal === animalSeleccionado.value.ID_animal && 
    s.estado_solicitud === 'pendiente'
  );
});

const esFavoritoAnimal = (animal: any) => {
  if (!usuarioActual.value) return false;
  const favoritos = DatabaseService.getFavoritos(usuarioActual.value.ID_usuario);
  return favoritos.some(f => f.ID_animal === animal.ID_animal);
};

const limpiarFiltros = () => {
  filtros.value = { species: '', location: '', health: '', size: '' };
  searchQuery.value = '';
};

const abrirDetalle = (animal: any) => {
  animalSeleccionado.value = animal;
  modalDetalleAbierto.value = true;
};

const cerrarDetalle = () => {
  modalDetalleAbierto.value = false;
  animalSeleccionado.value = null;
};

const solicitarAdopcion = async () => {
  if (!usuarioActual.value) {
    router.push('/login');
    return;
  }

  DatabaseService.crearSolicitud(
    usuarioActual.value.ID_usuario,
    animalSeleccionado.value.ID_animal,
    'Solicitud creada desde la ficha de adopción.'
  );

  const alert = await alertController.create({
    header: '🎉 ¡Solicitud enviada!',
    message: `Tu solicitud de adopción para ${animalSeleccionado.value.nombre} ha sido enviada. Te contactaremos pronto.`,
    buttons: ['Entendido']
  });
  await alert.present();
};

const toggleFavorito = (animal: any) => {
  if (!usuarioActual.value) {
    router.push('/login');
    return;
  }

  const animalId = animal.ID_animal;
  const userId = usuarioActual.value.ID_usuario;

  if (esFavoritoAnimal(animal)) { 
    DatabaseService.eliminarFavorito(userId, animalId);
  } else {
    DatabaseService.agregarFavorito(userId, animalId);
  }
};

const enviarMensaje = () => {
  if (!usuarioActual.value) {
    router.push('/login');
    return;
  }

  const animal = animalSeleccionado.value;
  if (animal.ID_refugio === usuarioActual.value.ID_usuario) {
    alert('Esta ficha pertenece a tu refugio.');
    return;
  }

  router.push('/perfil#mensajes');
};
</script>

<style scoped>
/* Contenido principal */
.adopciones-content {
  --background: #fafbfc;
}

/* Hero compacto */
.hero-compact {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 24px 40px;
  position: relative;
  overflow: hidden;
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  animation: blob-float 8s ease-in-out infinite;
}

.blob-1 {
  width: 300px;
  height: 300px;
  top: -100px;
  right: -100px;
  animation-delay: 0s;
}

.blob-2 {
  width: 200px;
  height: 200px;
  bottom: -80px;
  left: -80px;
  animation-delay: 4s;
}

@keyframes blob-float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

.hero-inner {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  z-index: 2;
}

.hero-emoji {
  font-size: 48px;
  margin-bottom: 16px;
  animation: bounce 2s ease-in-out infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  color: white;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.highlight {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0 0 24px 0;
}

/* Búsqueda */
.search-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  background: white;
  border-radius: 16px;
  padding: 4px;
  display: flex;
  align-items: center;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.search-icon {
  font-size: 20px;
  color: #667eea;
  margin-left: 16px;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  padding: 14px 16px;
  font-size: 15px;
  background: transparent;
  color: #333;
}

.search-input::placeholder {
  color: #999;
}

.clear-btn {
  background: #f0f0f0;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  margin-right: 4px;
  transition: all 0.2s;
}

.clear-btn:hover {
  background: #e0e0e0;
}

.clear-btn ion-icon {
  font-size: 18px;
  color: #666;
}

/* Filtros compactos */
.filters-compact {
  background: white;
  margin: -20px 24px 24px;
  border-radius: 20px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 3;
}

.filters-inner {
  max-width: 1200px;
  margin: 0 auto;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 16px;
}

.filter-row:last-child {
  margin-bottom: 0;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-label {
  font-size: 11px;
  font-weight: 700;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f5f5;
  border: 2px solid transparent;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.pill:hover {
  background: #e8e8e8;
  transform: translateY(-2px);
}

.pill.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: #667eea;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.pill-emoji {
  font-size: 14px;
}

.pill-icon {
  font-size: 14px;
}

.reset-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #667eea;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 12px;
  padding: 0;
  transition: all 0.2s;
}

.reset-link:hover {
  color: #764ba2;
}

.reset-link ion-icon {
  font-size: 14px;
}

/* Sección de mascotas */
.pets-section {
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
}

.section-header {
  margin-bottom: 24px;
}

.section-title {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0;
}

.title-emoji {
  font-size: 28px;
}

.count-pill {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
}

/* Grid 4x2 */
.pets-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

/* Card de mascota */
.pet-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.pet-card:hover .card-image img {
  transform: scale(1.1);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  gap: 8px;
}

.placeholder-emoji {
  font-size: 48px;
  opacity: 0.8;
}

.placeholder-emoji.large {
  font-size: 80px;
}

.image-placeholder span:last-child {
  font-size: 12px;
  font-weight: 600;
  opacity: 0.9;
}

.badges {
  position: absolute;
  top: 12px;
  left: 12px;
  right: 12px;
  display: flex;
  justify-content: space-between;
  pointer-events: none;
}

.badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 6px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.badge-location {
  color: #333;
}

.badge-location ion-icon {
  font-size: 12px;
  color: #667eea;
}

.badge-species {
  font-size: 16px;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.pet-card:hover .card-overlay {
  opacity: 1;
}

.view-btn {
  background: white;
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  transform: translateY(20px);
}

.pet-card:hover .view-btn {
  transform: translateY(0);
}

.view-btn:hover {
  transform: scale(1.05);
}

.view-btn ion-icon {
  font-size: 18px;
}

.favorite-toggle {
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
  transition: all 0.2s;
  color: #999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.favorite-toggle:hover {
  transform: scale(1.1);
  color: #f5576c;
}

.favorite-toggle ion-icon {
  font-size: 18px;
}

/* Cuerpo de la card */
.card-body {
  padding: 16px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.pet-name {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0;
}

.health-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.health-dot.sano {
  background: #28a745;
}

.health-dot.tratamiento {
  background: #ffc107;
}

.pet-meta {
  font-size: 12px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;
}

.pet-description {
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  margin: 0 0 12px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: flex-start;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 11px;
  font-weight: 600;
  color: #666;
}

.tag-success {
  background: #d4edda;
  color: #28a745;
}

.tag ion-icon {
  font-size: 12px;
}

/* Estado vacío */
.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-emoji {
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
  font-size: 14px;
  color: #666;
  margin: 0 0 20px 0;
}

.reset-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-button:hover {
  transform: scale(1.05);
}

/* Modal */
.detail-modal {
  --background: rgba(0, 0, 0, 0.8);
  --backdrop-opacity: 0.8;
}

.modal-content {
  background: white;
  border-radius: 24px;
  overflow: hidden;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-image {
  position: relative;
  height: 300px;
  overflow: hidden;
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.modal-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.modal-close:hover {
  transform: scale(1.1);
}

.modal-close ion-icon {
  font-size: 20px;
  color: #333;
}

.modal-badges {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  display: flex;
  gap: 8px;
}

.modal-badge {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  color: #333;
}

.modal-badge ion-icon {
  font-size: 14px;
  color: #667eea;
}

/* Cuerpo del modal */
.modal-body {
  padding: 24px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.modal-title {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px 0;
}

.modal-subtitle {
  font-size: 14px;
  color: #667eea;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
}

.gender-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

/* Info grid */
.modal-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.info-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.info-item ion-icon {
  font-size: 24px;
  color: #667eea;
}

.info-item div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-label {
  font-size: 11px;
  color: #999;
  font-weight: 600;
  text-transform: uppercase;
}

.info-value {
  font-size: 14px;
  color: #0f172a;
  font-weight: 700;
}

/* Historia */
.modal-story {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 16px;
  margin-bottom: 24px;
}

.modal-story h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 12px 0;
}

.story-emoji {
  font-size: 18px;
}

.modal-story p {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* Acciones */
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.btn-adopt {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 700;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-adopt:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.btn-adopt:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-adopt ion-icon {
  font-size: 20px;
}

.btn-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.btn-secondary {
  background: #f0f0f0;
  border: none;
  padding: 14px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #667eea;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.btn-secondary ion-icon {
  font-size: 18px;
}

/* Responsive */
@media (max-width: 1024px) {
  .pets-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }

  .filter-row {
    grid-template-columns: 1fr;
  }

  .pets-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-info-grid {
    grid-template-columns: 1fr;
  }

  .btn-group {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .hero-compact {
    padding: 40px 16px 30px;
  }

  .hero-title {
    font-size: 24px;
  }

  .filters-compact {
    margin: -15px 16px 16px;
    padding: 16px;
  }

  .pets-section {
    padding: 16px;
  }

  .pets-grid {
    grid-template-columns: 1fr;
  }
}
</style>