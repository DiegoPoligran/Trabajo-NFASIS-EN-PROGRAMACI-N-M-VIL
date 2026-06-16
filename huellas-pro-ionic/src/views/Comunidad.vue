<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Comunidad</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="community-container">
        <h2>Comunidad HuellasPro</h2>
        <p>Conecta con otros amantes de los animales</p>
        
        <div class="tabs">
          <button 
            v-for="tab in tabs" 
            :key="tab"
            :class="['tab', { active: activeTab === tab }]"
            @click="activeTab = tab"
          >
            {{ tab }}
          </button>
        </div>

        <div class="content-area">
          <div v-if="activeTab === 'General'" class="placeholder">
            <ion-icon :icon="chatbubbleEllipsesOutline"></ion-icon>
            <h3>Foro General</h3>
            <p>Comparte experiencias y consejos</p>
          </div>
          <div v-else-if="activeTab === 'Casos de Éxito'" class="placeholder">
            <ion-icon :icon="trophyOutline"></ion-icon>
            <h3>Casos de Éxito</h3>
            <p>Historias de adopciones felices</p>
          </div>
          <div v-else-if="activeTab === 'Denuncias'" class="placeholder">
            <ion-icon :icon="warningOutline"></ion-icon>
            <h3>Denuncias</h3>
            <p>Reporta casos de maltrato</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/vue';
import { chatbubbleEllipsesOutline, trophyOutline, warningOutline } from 'ionicons/icons';

const activeTab = ref('General');
const tabs = ['General', 'Casos de Éxito', 'Denuncias'];
</script>

<style scoped>
.community-container {
  max-width: 1280px;
  margin: 0 auto;
}

.community-container h2 {
  font-size: 32px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 8px;
}

.community-container > p {
  color: #64748b;
  margin-bottom: 32px;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  background: #f1f5f9;
  padding: 6px;
  border-radius: 12px;
}

.tab {
  flex: 1;
  padding: 12px 24px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s;
}

.tab.active {
  background: white;
  color: #667eea;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.content-area {
  background: white;
  border-radius: 16px;
  padding: 60px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.placeholder ion-icon {
  font-size: 64px;
  color: #cbd5e1;
}

.placeholder h3 {
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.placeholder p {
  color: #64748b;
  margin: 0;
}
</style>