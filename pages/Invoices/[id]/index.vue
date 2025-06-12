<template>
  <v-container class="py-6">
    <v-row>
      <!-- Szczegóły faktury -->
      <v-col cols="12" md="3">
        <div v-if="invoice">
          <p><strong>Numer faktury:</strong> {{ invoice.invoiceNumber }}</p>
          <p><strong>Kwota netto:</strong> {{ invoice.netAmount }}</p>
          <p><strong>VAT:</strong> {{ invoice.vatAmount }}</p>
          <p><strong>Kwota brutto:</strong> {{ invoice.totalAmount }}</p>
          <p><strong>Data:</strong> {{ invoice.invoiceDate }}</p>
        </div>
        <div v-else>
          <v-progress-circular indeterminate />
        </div>
      </v-col>

      <!-- Podgląd PDF -->
      <v-col cols="12" md="9">
        <div v-if="pdfUrl" style="height: 80vh; border: 1px solid #ccc">
          <embed
            :src="pdfUrl"
            type="application/pdf"
            width="100%"
            height="100%"
          />
        </div>
        <div v-else>Brak podglądu pliku</div>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { apiCall } from "~/utils/api";

const route = useRoute();
const invoiceId = route.params.id;

const invoice = ref(null);
const pdfUrl = ref("");

onMounted(async () => {
  try {
    const { data } = await apiCall({ route: `invoices/${invoiceId}` });
    invoice.value = data;

    pdfUrl.value = `/api/invoices/${invoiceId}/attachment`;
  } catch (err) {
    console.error("Błąd pobierania faktury:", err);
  }
});
</script>
