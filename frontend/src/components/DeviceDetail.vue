<script setup lang="ts">
import { type DeviceProps } from './DeviceMgmt.vue';

defineProps<DeviceProps>()
</script>

<template>
  <div class="device-detail">
    <div>{{ mac }}</div>
    <div>{{ model }}</div>
    <div>{{ type }}</div>
    <div>{{ status }}</div>
  </div>
</template>

<style scoped>
.device-detail {
  display: flex;
  gap: 5px;
}
</style>
