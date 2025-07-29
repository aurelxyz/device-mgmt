<script setup lang="ts">
import { ref, watch } from 'vue';
import DeviceDetail from './DeviceDetail.vue';
import { getDevices, type DeviceFilters, type DeviceInfo } from '../api-client/device-api';

const { fetchDataTrigger } = defineProps<{
  fetchDataTrigger: number
}>();

const loading = ref(false)
const devices = ref<DeviceInfo[] | null>(null)
const error = ref(null)

const macFilter = ref("");
const statusFilter = ref("");
const modelFilter = ref("");
const typeFilter = ref("");

const fetchData = async () => {
  error.value = null;
  loading.value = true;
  
  try {
    const filters: DeviceFilters =  { 
      mac: macFilter.value, 
      status: statusFilter.value,
      model: modelFilter.value,
      type: typeFilter.value 
    };
    devices.value = await getDevices(filters); 
  } catch (err: any) {
    error.value = err.toString()
  } finally {
    loading.value = false
  }
}

watch(() => fetchDataTrigger, fetchData);

fetchData()
</script>

<template>
  <div class="panel device-list-container">
    <h2>Filtres</h2>
    <form class="filters" @submit.prevent="fetchData" autocomplete="off">
      <div class="form-group">
        <label for="mac">Adresse MAC</label>
        <input type="text" v-model="macFilter" id="mac" />
      </div>
      <div class="form-group">
        <label for="status">Etat</label>
        <input type="text" v-model="statusFilter" id="status" />
      </div>
      <div class="form-group">
        <label for="model">Modèle</label>
        <input type="text" v-model="modelFilter" id="model" />
      </div>
      <div class="form-group">
        <label for="type">Type</label>
        <input type="text" v-model="typeFilter" id="type" />
      </div>
      <input type="submit" class="button-submit" value="Filtrer" />
      <p v-if="loading" class="loading">Chargement...</p>
    </form>
    
    <div v-if="error" class="error">{{ error }}</div>
    <div v-else class="device-list">
      <div class="device-list-item" v-for="device in devices" :key="device.deviceId">
        <DeviceDetail :device="device" @delete="fetchData" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.device-list-container {
  min-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filters {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  display: grid;
}

.button-submit {
  padding: 5px 20px;
}
</style>
