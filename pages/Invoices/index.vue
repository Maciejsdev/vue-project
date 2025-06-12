<template>
  <v-container>
    <h1>Lista faktur</h1>
    <v-btn @click="showModal = true">Dodaj fakturę</v-btn>
    <AddInvoiceDialog v-model="showModal" @added="refresh" />
    <v-list v-if="invoices.length">
      <v-list-item v-for="invoice in invoices" :key="invoice.id">
        <v-list-item-content>
          <v-list-item-title>
            {{ invoice.invoiceNumber }} — {{ invoice.totalAmount }} zł
          </v-list-item-title>
          <v-list-item-subtitle>
            Data: {{ new Date(invoice.invoiceDate).toLocaleDateString() }}
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-alert v-else type="info">Brak faktur</v-alert>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { apiCall } from "~/utils/api.js"; // zakładam że masz to zdefiniowane
import AddInvoiceDialog from "./components/dialogs/AddInvoiceDialog.vue";

const invoices = ref([]);
const showModal = ref(false);
const loadInvoices = async () => {
  try {
    invoices.value = await apiCall({ route: "invoices" }); // GET /api/invoices
  } catch (err) {
    console.error("Błąd ładowania faktur", err);
  }
};

onMounted(loadInvoices);
</script>
