<template>
  <v-dialog v-model="internalValue" max-width="650">
    <v-card>
      <v-card-title>Import pliku</v-card-title>
      <v-card-text>
        <v-file-input
          v-model="selectedFile"
          label="Wybierz plik do importu"
          accept=".csv,.xlsx,.json,.pdf"
          outlined
        />

        <v-btn
          class="mt-4"
          :disabled="!selectedFile || loading"
          @click="uploadFile"
          color="primary"
        >
          Wyślij i rozpocznij import
        </v-btn>

        <v-btn
          class="mt-4 ml-2"
          :disabled="!importId || loading"
          @click="resetImport"
          color="error"
        >
          Resetuj import
        </v-btn>

        <v-progress-linear
          v-if="loading"
          indeterminate
          class="mt-4"
        ></v-progress-linear>

        <div v-if="importResult" class="mt-6">
          <p><strong>Status:</strong> {{ importResult.status }}</p>
          <p>
            <strong>Raport:</strong> {{ importResult.rawImportReport || "–" }}
          </p>
          <p>
            <strong>Rozpoczęto:</strong>
            {{ format(importResult.processingStartedAt) }}
          </p>
          <p>
            <strong>Zakończono:</strong>
            {{ format(importResult.processingEndedAt) }}
          </p>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const selectedFile = ref(null);
const importId = ref(null);
const importResult = ref(null);
const loading = ref(false);

const uploadFile = async () => {
  if (!selectedFile.value) return;

  const formData = new FormData();
  formData.append("file", selectedFile.value);

  loading.value = true;
  try {
    await axios.post("http://localhost:5079/api/invoices/import", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    importId.value = res.data.id;
    await fetchImportResult();
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const fetchImportResult = async () => {
  if (!importId.value) return;

  try {
    const res = await axios.get(`/api/imports/${importId.value}`);
    importResult.value = res.data;
  } catch (err) {
    console.error(err);
  }
};

const resetImport = async () => {
  if (!importId.value) return;

  loading.value = true;
  try {
    await axios.post(`/api/imports/${importId.value}/reset`);
    importResult.value = null;
  } catch (err) {
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const format = (str) => (str ? new Date(str).toLocaleString() : "–");
</script>
