<script setup lang="ts">
import DeviceList from '../components/DeviceList.vue';
import DeviceCreate from '../components/DeviceCreate.vue';
import { ref } from 'vue';

const fetchDataTrigger = ref(0);
</script>

<template>
  <div class="devices">
    <h1>Appareils</h1>
    <DeviceCreate @create="fetchDataTrigger++"/>
    <DeviceList :fetchDataTrigger="fetchDataTrigger" />
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
