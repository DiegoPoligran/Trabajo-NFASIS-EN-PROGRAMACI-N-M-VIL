<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Educación</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding">
      <div class="education-container">
        <h2>Centro de Educación</h2>
        <p>Aprende sobre cuidado responsable de mascotas</p>

        <div class="guides-grid">
          <div
            v-for="guia in guias"
            :key="guia.id"
            class="guide-card"
          >
            <div class="guide-image">
              <ion-icon :icon="bookOutline"></ion-icon>
            </div>

            <div class="guide-content">
              <span class="guide-category">Guía</span>

              <h3>{{ guia.titulo }}</h3>
              <p>{{ guia.descripcion }}</p>

              <ion-button
                fill="clear"
                @click="openGuide(guia)"
              >
                Leer más
              </ion-button>
            </div>
          </div>
        </div>
      </div>

      <!-- MODAL -->
      <ion-modal
        :is-open="showModal"
        @didDismiss="closeModal"
      >
        <ion-header>
          <ion-toolbar>
            <ion-title>{{ selectedGuide?.titulo }}</ion-title>

            <ion-buttons slot="end">
              <ion-button @click="closeModal">
                Cerrar
              </ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>

        <ion-content class="ion-padding">
          <div v-if="selectedGuide">

            <p>
              {{ selectedGuide.contenido.intro }}
            </p>

            <h2>1. Alimentación y Nutrición</h2>
            <p>{{ selectedGuide.contenido.nutricion }}</p>

            <h2>2. Salud y Medicina Preventiva</h2>
            <p>{{ selectedGuide.contenido.salud }}</p>

            <h2>3. Actividad Física y Mental</h2>
            <p>{{ selectedGuide.contenido.actividad }}</p>

            <h2>4. Higiene y Cuidado Estético</h2>
            <p>{{ selectedGuide.contenido.higiene }}</p>

          </div>
        </ion-content>
      </ion-modal>
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
  IonIcon,
  IonModal,
  IonButtons
} from '@ionic/vue';

import { ref } from 'vue';
import { bookOutline } from 'ionicons/icons';

/* -----------------------
   STATE
------------------------*/
const showModal = ref(false);
const selectedGuide = ref<any>(null);

/* -----------------------
   DATA
------------------------*/
const guias = [
  {
    id: 1,
    titulo: 'Cuidados Básicos',
    descripcion: 'Aprende los fundamentos del cuidado de tu mascota',
    contenido: {
      intro:
        'El cuidado de tu mascota se basa en cuatro pilares fundamentales: nutrición, salud, ejercicio e higiene.',

      nutricion:
        'Proporciona alimento de calidad según edad y necesidades. Mantén agua limpia siempre disponible y evita alimentos tóxicos.',

      salud:
        'Mantén vacunas al día, realiza desparasitación periódica y considera esterilización para prevenir enfermedades.',

      actividad:
        'Los paseos diarios y juegos mentales son esenciales para su bienestar físico y emocional.',

      higiene:
        'Cepillado regular, baños adecuados y limpieza de ojos, oídos y dientes son fundamentales.'
    }
  },
  {
    id: 2,
    titulo: 'Nutrición',
    descripcion: 'Alimentación saludable para perros y gatos',
    contenido: {
      intro: 'Guía completa de alimentación balanceada para tu mascota.',
      nutricion:
        'La dieta debe adaptarse a la especie, edad y nivel de actividad.',
      salud: '',
      actividad: '',
      higiene: ''
    }
  },
  {
    id: 3,
    titulo: 'Primeros Auxilios',
    descripcion: 'Qué hacer ante una emergencia',
    contenido: {
      intro: 'Aprende a reaccionar en situaciones críticas.',
      nutricion: '',
      salud:
        'Identifica signos de emergencia como dificultad respiratoria o heridas graves.',
      actividad: '',
      higiene: ''
    }
  }
];

/* -----------------------
   METHODS
------------------------*/
function openGuide(guia: any) {
  selectedGuide.value = guia;
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  selectedGuide.value = null;
}
</script>

<style scoped>
.education-container {
  max-width: 1280px;
  margin: 0 auto;
}

.education-container h2 {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.education-container > p {
  color: #64748b;
  margin-bottom: 32px;
}

.guides-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
}

.guide-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
}

.guide-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.guide-image {
  height: 160px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-image ion-icon {
  font-size: 64px;
  color: white;
  opacity: 0.8;
}

.guide-content {
  padding: 24px;
}

.guide-category {
  font-size: 11px;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guide-content h3 {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 8px 0;
}

.guide-content p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
}

/* MODAL IMPROVEMENTS */
ion-modal h2 {
  margin-top: 24px;
  color: #0f172a;
  font-size: 18px;
  font-weight: 700;
}

ion-modal p {
  line-height: 1.7;
  color: #334155;
}
</style>
