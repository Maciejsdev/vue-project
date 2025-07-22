<template>
  <v-data-table
    :headers="headers"
    :items="serverItems"
    :items-length="totalItems"
    :items-per-page="itemsPerPage"
    :loading="loading"
    item-value="documentReferenceNumber"
    :search="search"
    server-items-length
    show-expand
    @update:options="loadItems"
  >
    <template #item.warnings="{ item }">
      <span v-if="item.warnings && item.warnings !== '[]'">
        <ul>
          <li v-for="(w, i) in JSON.parse(item.warnings)" :key="i">
            {{ w }}
          </li>
        </ul>
      </span>
      <span v-else>Brak</span>
    </template>

    <template #item.actions="{ item }">
      <v-btn icon @click="$emit('preview', item.documentReferenceNumber)">
        <v-icon>mdi-eye</v-icon>
      </v-btn>
    </template>
  </v-data-table>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const emit = defineEmits(["preview"]);

const headers = [
  { text: "Dokument", value: "documentReferenceNumber" },
  { text: "Profil", value: "profileId" },
  { text: "Ostrzeżenia", value: "warnings" },
  { text: "Akcje", value: "actions", sortable: false },
];

const itemsPerPage = ref(10);
const serverItems = ref([]);
const totalItems = ref(0);
const loading = ref(false);
const search = ref("");

async function loadItems(options) {
  loading.value = true;
  try {
    const { page, itemsPerPage, sortBy } = options;
    const sort = sortBy.length ? sortBy[0] : {};
    const response = await axios.get(
      "https://localhost:5001/api/invoices/pdfs",
      {
        params: {
          page,
          itemsPerPage,
          search: search.value,
          sortBy: sort.key,
          sortDesc: sort.order === "desc",
        },
      }
    );

    serverItems.value = response.data;
    totalItems.value = response.data.length;
  } catch (e) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}
</script>
