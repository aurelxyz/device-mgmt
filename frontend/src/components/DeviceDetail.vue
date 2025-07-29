<script setup lang="ts">
import { ref } from 'vue';
import { deleteDevice, type DeviceInfo } from '../api-client/device-api';

defineProps<{
  device: DeviceInfo
}>();

const emit = defineEmits<{
  delete: [id: number]
}>();

const loading = ref(false);
const error = ref(null);

const deleteData = async (deviceId: number) => {
  loading.value = true;
  error.value = null;

  try {
    await deleteDevice(deviceId); 
  } catch (err: any) {
    error.value = err.toString()
  } finally {
    loading.value = false;
    emit('delete', deviceId);
  }
}
</script>

<template>
  <div class="device-detail">
    <h3 class="mac">Adresse MAC: {{ device.mac }}</h3>
    <div>Etat: {{ device.status }}</div>
    <div>Modèle: {{ device.modelName }}</div>
    <div>Type: {{ device.typeName }}</div>
    <p v-if="loading">🔄 En cours...</p>
    <p v-else-if="error">❌ Une erreur est survenue: {{ error }}</p>
    <button class="button-delete" @click="deleteData(device.deviceId)" :disabled="loading">Supprimer</button>
  </div>
</template>

<style scoped>
.device-detail {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
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

.button-delete {
  padding: 5px 20px;
  grid-column: -1;
  grid-row: 1 / span 2;
  margin: auto;
}
</style>
