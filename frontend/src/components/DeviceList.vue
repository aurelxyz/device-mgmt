<script setup lang="ts">
import DeviceDetail from './DeviceDetail.vue';
import { type DeviceProps } from './DeviceMgmt.vue';

defineProps<{
  devices: DeviceProps[]
}>()
</script>

<template>
  <div class="panel">
    <div class="device-list" v-for="device in devices" :key="device.id">
      <DeviceDetail 
        :id="device.id" 
        :mac="device.mac"
        :model="device.model"
        :type="device.type"
        :status="device.status"
      />
    </div>
  </div>
</template>

<style scoped>
.device-list {
  display: flex;
  flex-direction: column;
}
</style>
