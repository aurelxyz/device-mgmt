<script setup lang="ts">
import { ref } from 'vue'
import { getDevices } from '../api-client/device-api.ts'
import DeviceList from '../components/DeviceList.vue'

export type DeviceInfo = {
  deviceId: number,
  mac: string,
  status: string
  modelId: number,
  modelName: string,
  typeId: number,
  typeName: string
}

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
  <div class="devices">
    <h1>Devices</h1>
    <div class="panel">
      <form class="filters" @submit.prevent="fetchData" autocomplete="off">
        <div class="form-group">
          <label for="mac">Adress Mac</label>
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
    </div>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <DeviceList v-if="devices" :devices="devices" />
  </div>
</template>

<style>
.devices {
  min-height: 100vh;
  min-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.filters {
  display: flex;
  gap: 10px;
}

.form-group {
  display: grid;
}

.button-filter {
  padding-left: 20px;
  padding-right: 20px;
}
</style>
