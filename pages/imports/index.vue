<template>
  <div width="1600">
    <v-snackbar
      v-model="snack.show"
      :timeout="snack.timeout"
      :color="snack.color"
      top
    >
      {{ snack.msg }}
    </v-snackbar>

    <v-dialog persistent v-model="dialog" width="1600">
      <DocumentImport
        @import="onImport"
        :defaultType="filter.type"
        @close="dialog = false"
      />
    </v-dialog>

    <v-card-title>
      <v-icon class="mr-3" color="primary">mdi-format-list-bulleted</v-icon>
      Import List
      <v-btn class="ml-3" small color="primary" @click="dialog = true">
        <v-icon left small>mdi-download</v-icon>
        Import Excel
      </v-btn>
    </v-card-title>

    <v-row>
      <v-col cols="12">
        <v-card flat>
          <DocumentsFilters :fetch="setFilters" />
          <v-data-table
            dense
            class="mx-4"
            :headers="headers"
            :server-items-length="totalCount"
            :options="options"
            :footer-props="{
              'items-per-page-options': [10, 20, 50, 100, -1],
              disablePagination: loading,
              'items-per-page-text': 'Items per page',
            }"
            :items-per-page="5"
            :items="documents"
            :loading="loading"
            no-data-text="No data"
            loading-text="Loading..."
            @update:options="fetch"
          >
            <template #footer.page-text="{ pageStart, pageStop, itemsLength }">
              {{ pageStart }} - {{ pageStop }} of {{ itemsLength }}
            </template>

            <template #item.type="{ item }">
              {{ item.type }}
            </template>

            <template #item.download="{ item }">
              <v-tooltip bottom open-delay="300">
                <template #activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-on="on"
                    v-bind="attrs"
                    @click="downloadFile(item)"
                  >
                    <v-icon>mdi-download</v-icon>
                  </v-btn>
                </template>
                <span>Download File</span>
              </v-tooltip>
            </template>

            <template #item.createdAt="{ item }">
              {{ new Date(item.createdAt).toLocaleString() }}
            </template>

            <template #item.outcome="{ item }">
              <div v-if="item.type === 'Pdf'">
                <v-icon color="success">mdi-check-circle-outline</v-icon>
              </div>
              <div v-else class="pa-0 ma-0">
                <ImportStagesStatus :item="item" />
              </div>
            </template>

            <template #item.preview="{ item }">
              <v-row>
                <v-tooltip bottom open-delay="300">
                  <template #activator="{ on, attrs }">
                    <v-btn
                      icon
                      small
                      v-on="on"
                      v-bind="attrs"
                      :to="`/imports/${item.id}`"
                    >
                      <v-icon>mdi-database-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Preview Raw Data</span>
                </v-tooltip>

                <v-btn
                  v-if="item.applyImportReport == null"
                  @click="reImport(item.id)"
                  x-small
                  class="ml-2 my-1 primary"
                  >Retry Import</v-btn
                >
              </v-row>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import DocumentImport from "~/components/imports/DocumentImport.vue";
import DocumentsFilters from "~/components/imports/DocumentsFilters.vue";
import ImportStagesStatus from "~/components/imports/ImportStagesStatus.vue";

const snack = ref({ show: false, msg: "", color: "success", timeout: 2000 });
const documents = ref([]);
const dialog = ref(false);
const loading = ref(true);
const options = ref({ sortBy: ["createdAt"], sortDesc: [true] });
const totalCount = ref(-1);
const filter = ref({
  phrase: "",
  dateFrom: null,
  dateTo: null,
  type: "",
  archived: null,
});

const breadcrumbs = [
  { text: "Home", disabled: false, href: "/" },
  { text: "Imports", disabled: true, href: "/administration" },
];

const headers = [
  { value: "download", align: "left", key: "download" },
  { title: "Filename", value: "filename", align: "left", key: "filename" },
  { title: "Source", value: "source", align: "left", key: "source" },
  { title: "Type", value: "type", align: "left", key: "type" },
  { title: "Created At", value: "createdAt", align: "left", key: "createdAt" },
  { value: "outcome", title: "Steps", width: "10em", key: "outcome" },
  { title: "Preview", value: "preview", align: "left", key: "preview" },
];

async function fetch() {
  try {
    loading.value = true;
    const response = await $fetch("https://localhost:5001/imports", {
      method: "POST",
      body: { ...options.value, filter: filter.value },
    });
    documents.value = response.items;
    totalCount.value = response.total;
  } catch (error) {
    console.error(error);
    snack.value = {
      show: true,
      msg: "Failed to fetch data",
      color: "error",
      timeout: 3000,
    };
  } finally {
    loading.value = false;
  }
}

async function downloadFile(item) {
  const url =
    item.type === "Pdf"
      ? `https://localhost:5001/attachments/download/${item.id}`
      : `https://localhost:5001/importData/${
          item.mainImportId || item.id
        }/file`;
  const res = await $fetch(url, { method: "GET", responseType: "blob" });
  const blobUrl = window.URL.createObjectURL(new Blob([res]));
  const link = document.createElement("a");
  link.href = blobUrl;
  link.setAttribute("download", item.filename);
  document.body.appendChild(link);
  link.click();
}

async function onImport() {
  dialog.value = false;
  await fetch();
}

async function reImport(id) {
  try {
    await $fetch(`https://localhost:5001/ImportData/${id}/restartImport`, {
      method: "PUT",
    });
    snack.value = {
      show: true,
      msg: "Import restarted successfully",
      color: "success",
      timeout: 3000,
    };
  } catch (error) {
    console.error("Error restarting import:", error);
    snack.value = {
      show: true,
      msg: "Failed to restart import",
      color: "error",
      timeout: 3000,
    };
  }
}

function setFilters(newFilters) {
  filter.value = newFilters;
  fetch();
}

onMounted(fetch);
</script>
