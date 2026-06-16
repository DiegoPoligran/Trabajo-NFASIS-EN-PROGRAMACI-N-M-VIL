<template>
  <ion-app>
    <AppHeader />
    <ion-router-outlet />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from '@ionic/vue';
import AppHeader from '@/components/AppHeader.vue';
</script>