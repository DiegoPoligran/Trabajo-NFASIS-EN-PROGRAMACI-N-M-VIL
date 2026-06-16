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
          <div v-for="i in 3" :key="i" class="event-card">
            <div class="event-date">
              <span class="day">15</span>
              <span class="month">JUN</span>
            </div>
            <div class="event-content">
              <h3>Jornada de Adopción</h3>
              <p><ion-icon :icon="locationOutline"></ion-icon> Parque Principal, Bogotá</p>
              <p><ion-icon :icon="timeOutline"></ion-icon> 10:00 AM - 4:00 PM</p>
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