<script setup lang="ts">
import DeviceDetail from './DeviceDetail.vue';
import { type DeviceInfo } from './DeviceMgmt.vue';

defineProps<{
  devices: DeviceInfo[]
}>()
</script>

<template>
  <div class="panel device-list">
    
    <div class="device-list-item" v-for="device in devices" :key="device.deviceId">
      <DeviceDetail :device="device" />
    </div>
  </div>
</template>

<style scoped>
.device-list {
  min-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-list-item {
  padding-top: 5px;
  padding-bottom: 5px;
  border-bottom: solid 1px var(--text);
}
</style>
