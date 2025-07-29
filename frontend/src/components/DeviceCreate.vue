<script setup lang="ts">
import { ref } from 'vue'
import { addDevice, type DeviceAddInfo } from '../api-client/device-api.ts'

const emit = defineEmits<{
  create: []
}>();

const loading = ref(false);
const success = ref(false);
const error = ref(null);

const mac = ref("");
const status = ref("");
const modelId = ref("");

const postData = async () => {
  loading.value = true;
  success.value = false;
  error.value = null;
  
  try {
    const newDeviceData: DeviceAddInfo =  { 
      mac: mac.value, 
      status: status.value,
      modelId: Number(modelId.value),   // TODO
    };
    await addDevice(newDeviceData); 
    success.value = true;
    mac.value = "";
    status.value = "";
    modelId.value = "";
    emit('create');
  } catch (err: any) {
    error.value = err.toString()
  } finally {
    loading.value = false
  }
}

const resetMessages = () => {
  loading.value = false;
  success.value = false;
  error.value = null;
}
</script>

<template>
  <div class="panel device-create-container">
    <h2>Ajouter</h2>
    <form class="form" @submit.prevent="postData" autocomplete="off" :disabled="loading">
      <div class="form-group">
        <label for="mac">Adresse MAC</label>
        <input type="text" v-model="mac" id="mac" @change="resetMessages" />
      </div>
      <div class="form-group">
        <label for="status">Etat</label>
        <input type="text" v-model="status" id="status" @change="resetMessages" />
      </div>
      <div class="form-group">
        <label for="model">Modèle</label>
        <input type="text" v-model="modelId" id="model" @change="resetMessages" />
      </div>
      <input type="submit" class="button-submit" value="Ajouter" :disabled="loading" />
      <p v-if="loading">🔄 Enregistrement en cours...</p>
      <p v-if="success">✔️ Enregistré !</p>
      <p v-if="error">❌ Une erreur est survenue</p>
    </form>
  </div>
</template>

<style scoped>
.device-create-container {
  min-width: 100%;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form {
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
