<script setup lang="ts">
import { ref } from 'vue';
import { deleteDevice, modifyDevice, type DeviceInfo } from '../api-client/device-api';

const { device } = defineProps<{
  device: DeviceInfo
}>();

const emit = defineEmits<{
  delete: [id: number]
  change: [id: number]
}>();

const loading = ref(false);
const error = ref(null);

const deleteData = async () => {
  loading.value = true;
  error.value = null;

  try {
    await deleteDevice(device.deviceId); 
  } catch (err: any) {
    error.value = err.toString()
  } finally {
    loading.value = false;
    emit('delete', device.deviceId);
  }
}

const oldStatus = ref(device.status);
const newStatus = ref(device.status);
const loadingStatus = ref(false);
const errorStatus = ref(null);

const statuses = [
  { name: 'stock', canTransitionFrom: ['stock', 'maintenance'] }, 
  { name: 'installé', canTransitionFrom: ['installé', 'stock'] }, 
  { name: 'maintenance', canTransitionFrom: ['maintenance', 'installé'] }
];

const modifyStatus = async () => {
  loadingStatus.value = true;
  errorStatus.value = null;

  try {
    await modifyDevice(device.deviceId, newStatus.value); 
    oldStatus.value = newStatus.value;
  } catch (err: any) {
    errorStatus.value = err.toString()
  } finally {
    loadingStatus.value = false;
    emit('change', device.deviceId);
  }
}
</script>

<template>
  <div class="device-detail">
    <p class="mac">
      <span class="label">Adresse MAC : </span><span>{{ device.mac }}</span>
    </p>
    <div class="status">
      <span class="label">Etat : </span>
      <select v-model="newStatus" id="status" required>
        <option v-for="s in statuses" :value="s.name" :disabled="!s.canTransitionFrom.includes(oldStatus)" :key="s.name">{{ s.name }}</option>
      </select>
      <button class="button-modif-status" @click="modifyStatus()" :disabled="newStatus === oldStatus">Enregistrer</button>
    </div>
    <div><span class="label">Modèle : </span>{{ device.modelName }}</div>
    <div><span class="label">Type : </span>{{ device.typeName }}</div>
    <p v-if="loading">🔄 En cours...</p>
    <p v-else-if="error">❌ Une erreur est survenue</p>
    <button class="button-delete" @click="deleteData()" :disabled="loading">Supprimer</button>
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

.status {
  grid-column: 1 / -1;
  grid-row: 2;
}

.button-delete {
  padding: 5px 20px;
  grid-column: -1;
  grid-row: 1 / span 2;
  margin: auto;
}

.button-modif-status {
  margin-left: 5px;
}

.label {
  color: var(--text-muted);
}
</style>
