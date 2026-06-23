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

  	   <div v-if="activeTab !== 'Denuncias'">

    	     <textarea
      		v-model="nuevoMensaje"
      		placeholder="Escribe tu publicación..."
      		class="community-input"
    	     ></textarea>

    	     <button
      	        class="tab"
      	        @click="publicarMensaje"
    	     >
      Publicar
    </button>

    <div
      v-for="comentario in comentarios.filter(c => c.tipo === activeTab)"
      :key="comentario.ID_comentario"
      class="post-card"
    >
      <strong>{{ comentario.ID_usuario }}</strong>

      <p>
        {{ comentario.contenido }}
      </p>
    </div>

  </div>

  <div v-else>

    <textarea
      v-model="nuevaDenuncia"
      placeholder="Describe el caso de maltrato..."
      class="community-input"
    ></textarea>

    <button
      class="tab"
      @click="crearDenuncia"
    >
      Enviar denuncia
    </button>

    <div
      v-for="denuncia in denuncias"
      :key="denuncia.ID_denuncia"
      class="post-card"
    >
      <strong>{{ denuncia.estado }}</strong>

      <p>
        {{ denuncia.descripcion }}
      </p>
    	      </div>

  	   </div>

	</div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { DatabaseService } from '@/services/database';
import { sessionState } from '@/services/auth.service';
import { toastController } from '@ionic/vue';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonIcon } from '@ionic/vue';
import { chatbubbleEllipsesOutline, trophyOutline, warningOutline } from 'ionicons/icons';

const activeTab = ref('General');
const tabs = ['General', 'Casos de Éxito', 'Denuncias'];
const nuevoMensaje = ref('');
const nuevaDenuncia = ref('');

const comentarios = computed(() =>
  DatabaseService.getComentarios()
);

const denuncias = computed(() =>
  DatabaseService.getDenuncias()
);
const publicarMensaje = async () => {
  if (!nuevoMensaje.value.trim()) return;

  if (!sessionState.user) return;

  DatabaseService.crearComentario({
    ID_usuario: sessionState.user.ID_usuario,
    tipo: activeTab.value,
    contenido: nuevoMensaje.value
  });

  nuevoMensaje.value = '';

  const toast = await toastController.create({
    message: 'Publicación realizada',
    duration: 2000,
    color: 'success'
  });

  toast.present();
};

const crearDenuncia = async () => {
  if (!nuevaDenuncia.value.trim()) return;

  if (!sessionState.user) return;

  DatabaseService.crearDenuncia({
    ID_usuario: sessionState.user.ID_usuario,
    descripcion: nuevaDenuncia.value
  });

  nuevaDenuncia.value = '';

  const toast = await toastController.create({
    message: 'Denuncia registrada',
    duration: 2000,
    color: 'warning'
  });

  toast.present();
};
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
.community-input{
  width:100%;
  min-height:120px;
  border:1px solid #ddd;
  border-radius:12px;
  padding:12px;
  margin-bottom:16px;
}

.post-card{
  margin-top:16px;
  padding:16px;
  border:1px solid #eee;
  border-radius:12px;
  text-align:left;
}
</style>
