<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Eventos</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="events-container">
        <h2>Próximos Eventos</h2>
        <p>Participa en nuestras actividades y ayuda a más mascotas</p>
        
        <div class="events-grid">
          <div
    v-for="evento in eventos"
    :key="evento.id"
    class="event-card"
  >
            <div class="event-date">
  <span>
    {{ formatDate(evento.fecha).dia }}
  </span>

  <small>
    {{ formatDate(evento.fecha).mes }}
  </small>
</div>
            <div class="event-content">
              <h3>{{ evento.titulo }}</h3>
              <p><ion-icon :icon="locationOutline"></ion-icon> {{ evento.lugar }}</p>
              <p><ion-icon :icon="timeOutline"></ion-icon></p>
              <ion-button expand="block">Asistir</ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { locationOutline, timeOutline } from 'ionicons/icons';

const eventos = [
  {
    id: 1,
    titulo: 'Jornada de Adopción',
    fecha: '2026-06-15',
    lugar: 'Parque Simón Bolívar'
  },
  {
    id: 2,
    titulo: 'Vacunación Gratuita',
    fecha: '2026-06-16',
    lugar: 'Parque Nacional'
  },
  {
    id: 3,
    titulo: 'Feria de Mascotas',
    fecha: '2026-06-17',
    lugar: 'Plaza de Bolívar'
  },
  {
    id: 4,
    titulo: 'Campaña Educativa',
    fecha: '2026-06-18',
    lugar: 'Biblioteca Virgilio Barco'
  }
];

const formatDate = (fecha: string) => {
  const d = new Date(fecha);

  return {
    dia: d.getDate(),
    mes: d.toLocaleString('es-CO', {
      month: 'short'
    }).toUpperCase()
  };
};

const asistirEvento = (evento: any) => {
  alert(`Te has inscrito a: ${evento.titulo}`);
};
</script>

<style scoped>
.events-container {
  max-width: 1280px;
  margin: 0 auto;
}

.events-container h2 {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.events-container > p {
  color: #64748b;
  margin-bottom: 32px;
}

.events-grid {
  display: grid;
  gap: 20px;
}

.event-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  display: flex;
  gap: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.event-date {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  min-width: 80px;
}

.event-date .day {
  display: block;
  font-size: 32px;
  font-weight: 900;
}

.event-date .month {
  font-size: 14px;
  font-weight: 700;
}

.event-content h3 {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 12px 0;
}

.event-content p {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #64748b;
  margin: 8px 0;
}

.event-content ion-icon {
  color: #667eea;
}
</style>
