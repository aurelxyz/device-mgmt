<script setup lang="ts">
import { ref } from 'vue';
import DeviceList from '../components/DeviceList.vue';
import DeviceCreate from '../components/DeviceCreate.vue';
import * as appStore from '../stores/app-store';

const fetchDataTrigger = ref(0);

const apiKey = ref('');

const saveApiKey = () => {
  appStore.get().apiKey = apiKey.value;
  fetchDataTrigger.value++;
} 
</script>

<template>
  <div class="devices">
    <div class="header">
      <h1>Appareils</h1>
      <div class="separator"></div>
      <form class="form" @submit.prevent="saveApiKey" autocomplete="off">
        <label for="apikeybox">Clef API : </label>
        <input type="text" v-model="apiKey" id="apikeybox"/>
        <input type="submit" class="button-submit" value="Enregistrer" />
      </form>
    </div>
    <DeviceCreate :fetchDataTrigger="fetchDataTrigger" @create="fetchDataTrigger++"/>
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

.header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.form {
  display: flex;
  align-items: center;
  gap: 5px;
}

.separator {
  margin-left: auto;
}
</style>
