<script setup lang="ts">
import { type DeviceInfo } from './DeviceMgmt.vue';

defineProps<{
  device: DeviceInfo
}>()
</script>

<template>
  <div class="device-detail">
    <h3 class="mac">Adresse MAC: {{ device.mac }}</h3>
    <div>Etat: {{ device.status }}</div>
    <div>Modèle: {{ device.modelName }}</div>
    <div>Type: {{ device.typeName }}</div>
  </div>
</template>

<style scoped>
.device-detail {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  row-gap: 8px;
  column-gap: 50px;
  background: white;
  padding: 12px 20px;
  border: solid 1px hsl(0, 0%, 93%);
  border-radius: 3px;
}

.mac {
  grid-column: 1 / -1;
}
</style>
