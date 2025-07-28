<script setup lang="ts">
import { ref } from 'vue'
import { getDevices } from '../api-client/device-api.ts'
import DeviceList from '../components/DeviceList.vue'

type DeviceFromApi = {
  id: number,
  modelId: number,
  mac: string,
  status: string
}

export type DeviceProps = {
  id: number,
  model: string,
  mac: string,
  status: string,
  type: string  
}

const loading = ref(false)
const devices = ref<DeviceProps[] | null>(null)
const error = ref(null)

fetchData()

async function fetchData() {
  error.value = devices.value = null
  loading.value = true
  
  try {
    const result: DeviceFromApi[] = await getDevices();       // TODO: validate?
    devices.value = result.map(d => ({
      id: d.id,
      model: d.modelId.toString(),                  // TODO
      mac: d.mac,
      status: d.status,
      type: "type of" + d.modelId.toString(),      // TODO                
    }));
    console.log(devices.value);
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
    <div>
      <div v-if="loading" class="loading">Loading...</div>

      <div v-if="error" class="error">{{ error }}</div>

      <div v-if="devices" class="content">
        <DeviceList :devices="devices" />
      </div>
    </div>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .devices {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}
</style>
