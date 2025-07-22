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
        <v-btn icon @click="goToInvoice(item.id)" title="Podgląd">
          <v-icon>mdi-eye</v-icon>
        </v-btn>
        <v-btn icon @click="generateInvoicePdf(item)" title="Pobierz PDF">
          <v-icon>mdi-file-pdf-box</v-icon>
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
const generateInvoicePdf = async (invoice) => {
  const profileId = "00000000-0000-0000-0000-000000000001";
  const referenceNumber = crypto.randomUUID(); // lub invoice.id

  const payload = {
    profileId,
    documentReferenceNumber: referenceNumber,
    templateName: "Szablon faktury",
    templateVersion: 3,
    data: [
      { key: "invoiceNumber", value: invoice.invoiceNumber },
      { key: "invoiceDate", value: invoice.invoiceDate },
      { key: "netAmount", value: invoice.netAmount?.toString() ?? "0" },
      { key: "vatAmount", value: invoice.vatAmount?.toString() ?? "0" },
      { key: "totalAmount", value: invoice.totalAmount?.toString() ?? "0" },
      { key: "createdAt", value: new Date().toISOString() },
    ],
  };

  try {
    // 🔁 1. Wysłanie żądania tworzącego dokument
    const resPost = await fetch(
      `https://localhost:5001/docgenpdf/profiles/${profileId}/documents`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!resPost.ok) throw new Error("Błąd podczas POST PDF");

    // 🔁 2. Pobranie gotowego PDF jako binarki
    const resGet = await fetch(
      `https://localhost:5001/docgenpdf/profiles/${profileId}/documents/${referenceNumber}`
    );

    if (!resGet.ok) throw new Error("Błąd podczas GET PDF");

    const blob = await resGet.blob();

    // 📦 Wyświetlenie / pobranie
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${invoice.invoiceNumber || "faktura"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Błąd generowania lub pobierania PDF:", err);
  }
};

onMounted(async () => {
  const module = await import("vue3-apexcharts");
  ApexChart.value = module.default;
  await loadInvoices();
});
</script>
