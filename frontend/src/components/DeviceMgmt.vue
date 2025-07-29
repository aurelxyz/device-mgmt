<script setup lang="ts">
import DeviceList from '../components/DeviceList.vue'

export type DeviceInfo = {
  deviceId: number,
  mac: string,
  status: string
  modelId: number,
  modelName: string,
  typeId: number,
  typeName: string
};
</script>

<template>
  <div class="devices">
    <h1>Appareils</h1>
    <DeviceList />
  </div>
</template>

<style scoped>
.devices {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 10px;
}
</style>
