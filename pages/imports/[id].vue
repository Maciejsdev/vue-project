<template>
  <div>
    <v-card flat>
      <v-card-title>
        <v-icon class="mr-3" color="primary">mdi-format-list-bulleted</v-icon>
        Raw Data from Import File
      </v-card-title>
    </v-card>
    <v-row>
      <v-col cols="12">
        <v-card class="pa-6">
          <v-data-table
            height="50vh"
            dense
            :headers="headers"
            :server-items-length="totalCount"
            v-model:options="options"
            :footer-props="{ 'items-per-page-options': [10, 20, 50, 100, -1] }"
            :items-per-page="5"
            :items="rawDataItems"
          />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useNuxtApp } from "#app";

const route = useRoute();
const { $axios } = useNuxtApp();

const headers = ref([{ title: "Invoice No", value: "invoiceNo" }]);
const rawDataItems = ref([]);
const totalCount = ref(-1);
const options = ref({});
const id = route.params.id;

watch(options, fetchData, { deep: true });

async function fetchData() {
  try {
    const apiUrl = `https://localhost:5001/ImportData/${id}/rawdata`;
    const { page = 1, itemsPerPage = 5 } = options.value;

    const response = await $fetch(apiUrl, {
      method: "POST",
      body: {
        filter: { phrase: "" },
        page,
        itemsPerPage,
      },
    });

    const items = response?.items?.items ?? [];
    const total = response?.items?.total ?? 0;
    const headerData = response?.headers ?? [];

    rawDataItems.value = items;
    totalCount.value = total;

    headers.value = headerData.map((header) => {
      const value = header.text.charAt(0).toLowerCase() + header.text.slice(1);
      return {
        title: header.text,
        value,
        width: value === "payMeaning" ? "200px" : "auto",
      };
    });
  } catch (err) {
    console.error("Error fetching import raw data:", err);
    rawDataItems.value = [];
    totalCount.value = 0;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<style scoped>
v-data-table v-data-table__wrapper tbody tr {
  width: 10px;
}
</style>
