<template>
  <v-container>
    <h1 class="text-h5 mb-4">Lista faktur</h1>

    <v-row>
      <v-col>
        <v-btn class="mb-4" @click="showModal = true" color="primary">
          Dodaj fakturę
        </v-btn>
      </v-col>
      <v-col>
        <v-btn class="mb-4" @click="showImportModal = true" color="primary">
          Importuj fakturę
        </v-btn>
      </v-col>
    </v-row>

    <AddInvoiceDialog v-model="showModal" @added="refresh" />
    <ImportInvoiceDialog v-model="showImportModal" @imported="refresh" />
    <v-card v-if="invoices.length && ApexChart" class="mt-10 pa-4">
      <h2 class="text-h6 mb-4">Udział kwot w fakturach</h2>
      <component
        color="white"
        :is="ApexChart"
        type="pie"
        :options="chartOptions"
        :series="chartSeries"
        width="300"
      />
    </v-card>
    <v-data-table
      :items="invoices"
      :headers="headers"
      :items-per-page="10"
      class="elevation-1"
    >
      <template #item.invoiceDate="{ item }">
        {{ formatDate(item.invoiceDate) }}
      </template>

      <template #item.actions="{ item }">
        <v-btn icon @click="goToInvoice(item.id)">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
      </template>

      <template #no-data>
        <v-alert type="info" class="ma-4">Brak faktur</v-alert>
      </template>
    </v-data-table>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { apiCall } from "~/utils/api.js";
import AddInvoiceDialog from "./components/dialogs/AddInvoiceDialog.vue";
import ImportInvoiceDialog from "./components/dialogs/ImportInvoiceDialog.vue";

const router = useRouter();

const invoices = ref([]);
const showModal = ref(false);
const showImportModal = ref(false);
const ApexChart = ref(null);

const headers = [
  { title: "Numer faktury", key: "invoiceNumber", sortable: true },
  { title: "Data", key: "invoiceDate", sortable: true },
  { title: "Kwota brutto (zł)", key: "totalAmount", sortable: true },
  { title: "Kwota vat (zł)", key: "vatAmount", sortable: true },
  { title: "Kwota netto (zł)", key: "netAmount", sortable: true },
  { title: "Akcje", key: "actions", sortable: false },
];

const chartSeries = ref([0, 0, 0]);
const chartOptions = ref({
  labels: ["Netto", "VAT", "Brutto"],
  legend: {
    labels: {
      colors: "#FFFFFF",
    },
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          width: 300,
        },
        legend: {
          position: "bottom",
          labels: {
            colors: "#FFFFFF",
          },
        },
      },
    },
  ],
});

const computeChartData = () => {
  const netto = invoices.value.reduce((sum, i) => sum + (i.netAmount || 0), 0);
  const vat = invoices.value.reduce((sum, i) => sum + (i.vatAmount || 0), 0);
  const brutto = invoices.value.reduce(
    (sum, i) => sum + (i.totalAmount || 0),
    0
  );
  chartSeries.value = [netto, vat, brutto];
};

const loadInvoices = async () => {
  try {
    invoices.value = await apiCall({ route: "invoices" });
    computeChartData();
  } catch (err) {
    console.error("Błąd ładowania faktur", err);
  }
};

const refresh = () => {
  loadInvoices();
};

const goToInvoice = (id) => {
  router.push(`/invoices/${id}`);
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pl-PL");
};

onMounted(async () => {
  const module = await import("vue3-apexcharts");
  ApexChart.value = module.default;
  await loadInvoices();
});
</script>
