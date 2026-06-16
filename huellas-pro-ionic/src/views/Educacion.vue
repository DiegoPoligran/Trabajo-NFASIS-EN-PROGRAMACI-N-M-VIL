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
          <div v-for="i in 6" :key="i" class="guide-card">
            <div class="guide-image">
              <ion-icon :icon="bookOutline"></ion-icon>
            </div>
            <div class="guide-content">
              <span class="guide-category">Guía</span>
              <h3>Cuidados Básicos</h3>
              <p>Aprende los fundamentos del cuidado de tu mascota</p>
              <ion-button fill="clear">Leer más</ion-button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonIcon } from '@ionic/vue';
import { bookOutline } from 'ionicons/icons';
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
</style>