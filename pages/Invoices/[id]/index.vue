<template>
  <v-container v-if="!loading && invoice" class="py-6">
    <v-row>
      <!-- Lewa kolumna: info + lista załączników -->
      <v-col cols="12" md="3">
        <p><strong>Numer:</strong> {{ invoice.invoiceNumber }}</p>
        <p><strong>Netto:</strong> {{ invoice.netAmount }}</p>
        <p><strong>VAT:</strong> {{ invoice.vatAmount }}</p>
        <p><strong>Brutto:</strong> {{ invoice.totalAmount }}</p>
        <p><strong>Data:</strong> {{ invoice.invoiceDate }}</p>

        <v-divider class="my-4" />

        <p class="text-subtitle-1 font-weight-medium">Załączniki</p>
        <v-list density="compact" nav v-if="invoice.attachments?.length">
          <v-list-item
            v-for="(att, index) in invoice.attachments"
            :key="att.id"
            :active="selectedAttachmentId === att.id"
            @click="selectedAttachmentId = att.id"
          >
            <v-list-item-title>{{
              att.name || `Plik #${index + 1}`
            }}</v-list-item-title>
          </v-list-item>
        </v-list>
        <p v-else class="text-grey">Brak załączników</p>
      </v-col>

      <!-- Prawa kolumna: podgląd PDF -->
      <v-col cols="12" md="9">
        <div
          v-if="selectedAttachmentId"
          style="height: 80vh; border: 1px solid #ccc"
        >
          <embed
            :src="`https://localhost:5001/attachment/inline/${selectedAttachmentId}`"
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
        <div v-else class="text-grey text-center">
          Wybierz załącznik z listy po lewej
        </div>
      </v-col>
    </v-row>
  </v-container>

  <v-container v-else class="d-flex justify-center align-center py-6">
    <v-progress-circular indeterminate />
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { apiCall } from "~/utils/api";

const route = useRoute();
const invoice = ref(null);
const loading = ref(true);
const selectedAttachmentId = ref(null);

onMounted(async () => {
  try {
    const id = route.params.id;
    const data = await apiCall({ route: `invoices/${id}` });

    invoice.value = data;

    if (data.attachments?.length) {
      selectedAttachmentId.value = data.attachments[0].id;
    }
  } catch (error) {
    console.error("Błąd API:", error);
  } finally {
    loading.value = false;
  }
});
</script>
