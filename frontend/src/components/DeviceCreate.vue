<script setup lang="ts">
import { ref, watch } from 'vue';
import { addDevice, type DeviceAddInfo } from '../api-client/device-api.ts';
import { getDeviceModels, type DeviceModel } from '../api-client/model-api.ts';

const { fetchDataTrigger } = defineProps<{
  fetchDataTrigger: number 
}>();

const emit = defineEmits<{
  create: []
}>();

const loading = ref(false);
const success = ref(false);
const error = ref(null);

const models = ref<DeviceModel[] | null>(null);
const errorModels = ref(null);

const mac = ref("");
const status = ref("stock");
const modelId = ref("");

const postData = async () => {
  loading.value = true;
  success.value = false;
  error.value = null;
  
  try {
    const newDeviceData: DeviceAddInfo =  { 
      mac: mac.value, 
      status: status.value,
      modelId: Number(modelId.value),
    };
    await addDevice(newDeviceData); 
    success.value = true;
    mac.value = "";
    status.value = "stock";
    modelId.value = "";
    emit('create');
  } catch (err: any) {
    error.value = err.toString();
  } finally {
    loading.value = false;
  }
}

const resetMessages = () => {
  loading.value = false;
  success.value = false;
  error.value = null;
}

const fetchModels = async () => {
  try {
    models.value = await getDeviceModels({}); 
    errorModels.value = null;
  } catch (err: any) {
    errorModels.value = err;
    models.value = null;
  }
}

watch(() => fetchDataTrigger, fetchModels);

fetchModels()

const statuses = [
  'stock', 
  'installé', 
  'maintenance'
];
</script>

<template>
  <div class="panel device-create-container">
    <h2>Ajouter</h2>
    <form class="form" @submit.prevent="postData" autocomplete="off" :disabled="loading || errorModels">
      <fieldset class="fieldset" :disabled="loading || errorModels ? true : false">
        <div class="form-group">
          <label for="mac">Adresse MAC</label>
          <input type="text" v-model="mac" id="mac" @change="resetMessages" required />
        </div>
        <div class="form-group">
          <label for="status">Etat</label>
          <select v-model="status" id="status" @change="resetMessages" required>
            <option v-for="s in statuses" :value="s" :key="s">{{ s }}</option>
          </select>
        </div>
        <div class="form-group">
          <label for="model">Modèle</label>
          <select v-model="modelId" id="model" @change="resetMessages" required>
            <option disabled value="">Sélectionner</option>
            <option v-for="model in models" :value="model.modelId" :key="model.modelId">{{ model.modelName }} ({{ model.typeName }})</option>
          </select>
        </div>
        <div class="separator"></div>
        <p v-if="success">✔️ Enregistré !</p>
        <p v-if="error">❌ Une erreur est survenue</p>
        <p v-if="loading">🔄 Enregistrement en cours...</p>
        <input type="submit" class="button-submit" value="Ajouter" :disabled="loading" />
      </fieldset>
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

.fieldset {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  border: none;
}

.form-group {
  display: grid;
}

.button-submit {
  width: 80px;
  height: 30px;
  padding: 5px 20px;
}

.separator {
  margin-left: auto;
}
</style>
