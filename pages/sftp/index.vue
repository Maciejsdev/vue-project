<template>
  <v-card class="pa-4" width="900">
    <v-card-title class="text-h6">Prześlij plik</v-card-title>

    <v-file-input
      v-model="selectedFile"
      label="Wybierz plik"
      variant="outlined"
      prepend-icon="mdi-upload"
      accept="*/*"
      :disabled="loading"
    />

    <v-btn
      color="primary"
      class="mt-4"
      @click="uploadFile"
      :loading="loading"
      :disabled="!selectedFile"
    >
      Wyślij
    </v-btn>

    <v-alert
      v-if="status"
      class="mt-4"
      :type="status.type"
      dense
      border="start"
      variant="tonal"
    >
      {{ status.message }}
    </v-alert>
  </v-card>
</template>

<script setup>
import { ref } from "vue";

const selectedFile = ref(null);
const loading = ref(false);
const status = ref(null);

const uploadFile = async () => {
  if (!selectedFile.value) return;

  loading.value = true;
  status.value = null;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  try {
    const response = await fetch("https://localhost:5001/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Błąd przesyłania pliku.");

    const result = await response.json();
    status.value = {
      type: "success",
      message: "Plik został przesłany pomyślnie.",
    };
  } catch (err) {
    status.value = {
      type: "error",
      message: err.message || "Nie udało się przesłać pliku.",
    };
  } finally {
    loading.value = false;
  }
};
</script>
