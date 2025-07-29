<script setup lang="ts">
import { ref } from 'vue'
import DeviceDetail from './DeviceDetail.vue';
import { type DeviceInfo } from './DeviceMgmt.vue';
import { getDevices } from '../api-client/device-api.ts'

const loading = ref(false)
const devices = ref<DeviceInfo[] | null>(null)
const error = ref(null)

const macFilter = ref("");
const statusFilter = ref("");
const modelFilter = ref("");
const typeFilter = ref("");

fetchData()

async function fetchData() {
  devices.value = null;
  error.value = null;
  loading.value = true;
  
  try {
    const filters =  { 
      mac: macFilter.value, 
      status: statusFilter.value,
      model: modelFilter.value,
      type: typeFilter.value 
    };
    await getDevices(filters); 
    devices.value = await getDevices(filters); 
  } catch (err: any) {
    error.value = err.toString()
  } finally {
    loading.value = false
  }
}
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
      <input type="submit" class="button-filter" value="Filtrer" />
    </form>
    
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="devices" class="device-list">
      <div class="device-list-item" v-for="device in devices" :key="device.deviceId">
        <DeviceDetail :device="device" />
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
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  display: grid;
}

.button-filter {
  padding: 5px 20px;
}
</style>
