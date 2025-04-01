<template>
  <v-card width="100%" class="table-card mx-10 mt-8">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Servers</span>
      <div class="d-flex flex-row align-center">
        <v-btn color="primary" @click="exportCsv" :loading="loading">Csv</v-btn>
        <CreateDialog type="servers" @refresh="refresh" />
        <v-text-field
          v-model="search"
          label="Search"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-magnify"
          class="search-field"
          hide-details
        ></v-text-field>
      </div>
    </v-card-title>

    <v-skeleton-loader v-if="pending" type="table"></v-skeleton-loader>

    <v-data-table-server
      :loading="pending"
      :items="data"
      :headers="headers"
      :items-length="totalItemsCount"
      :items-per-page="options.pageSize"
      :items-per-page-text="'Ilość na stronie'"
      :no-data-text="'Brak danych'"
      :options="options"
      @update:options="optionUpdated"
    >
      <template v-slot:[`item.name`]="{ item }">
        <NuxtLink :to="`/servers/${item.id}`" class="no-link">
          {{ item.name }}
        </NuxtLink>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex flex-row">
          <EditDialog type="servers" :data="item" @saved="refresh" />
          <v-btn
            @click="handleDelete(item.id)"
            variant="plain"
            icon="mdi-delete"
            class="my-small-btn"
          ></v-btn>
        </div>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";
import CreateDialog from "../../components/dialogs/CreateDialog.vue";
import { fetchData, deleteItem } from "~/utils/api";
import axios from "axios";

const data = ref([]);
const pending = ref(false);
const search = ref("");
const options = ref({
  page: 1,
  pageSize: 5,
  sortBy: ["Name"],
  sortDesc: [false],
});

const totalItemsCount = ref(0);
const totalPages = ref(0);

const optionUpdated = (noptions) => {
  let sortKey = noptions.sortBy[0]?.key;
  if (sortKey) {
    sortKey = sortKey.charAt(0).toUpperCase() + sortKey.slice(1);
  }
  let sortDirection = noptions.sortBy[0]?.order;
  sortDirection == "asc" ? (sortDirection = false) : (sortDirection = true);
  options.value = {
    page: noptions.page,
    pageSize: noptions.itemsPerPage,
    sortBy: [sortKey],
    sortDesc: [sortDirection],
  };

  refresh();
};

const trimTimestamp = (timestamp) => {
  return timestamp.slice(0, 19).replace("T", " ");
};

const exportCsv = async () => {
  try {
    const response = await axios.get(`https://localhost:7112/export-csv`, {
      params: {
        searchPhrase: search.value,
        pageSize: -1,
        pageNumber: 1,
      },
      responseType: "blob",
    });

    const link = document.createElement("a");
    const url = window.URL.createObjectURL(new Blob([response.data]));
    link.href = url;
    link.setAttribute("download", "servers_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    toast.error("Error exporting CSV");
  }
};

const refresh = async () => {
  pending.value = true;
  await fetchData({
    route: "servers",
    search,
    options,
    setData: (items, totalCount, totalPagesCount) => {
      data.value = items.map((item) => ({
        ...item,
        updatedAt: trimTimestamp(item.updatedAt),
        createdAt: trimTimestamp(item.createdAt),
      }));
      totalItemsCount.value = totalCount;
      totalPages.value = totalPagesCount;
      pending.value = false;
    },
  }).catch(() => {
    toast.error("Error fetching data");
    pending.value = false;
  });
};

onMounted(() => {
  refresh();
});

const handleDelete = async (id) => {
  await deleteItem({
    route: "servers",
    id,
    onSuccess: () => {
      toast.success("Successfully deleted", { autoClose: 1000 });
      refresh();
    },
  }).catch(() => {
    toast.error("Error deleting item");
  });
};

// Debounce function to optimize API calls
function debounce(fn, delay) {
  let timeoutID;
  return function (...args) {
    if (timeoutID) {
      clearTimeout(timeoutID);
    }
    timeoutID = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const getListDebounced = debounce(refresh, 300);

watch(
  search,
  () => {
    getListDebounced();
  },
  { deep: true }
);
const headers = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "description", title: "Description" },
  { key: "createdAt", title: "Created At" },
  { key: "updatedAt", title: "Updated At" },
  { key: "actions", title: "Actions", sortable: false },
];
</script>

<style scoped>
.full {
  width: 90vw;
}
.my-small-btn {
  font-size: 0.75rem;
}
.no-link {
  color: inherit;
  text-decoration: none;
  cursor: pointer;
}
.table-card {
  padding: 1rem;
}
.search-field {
  min-width: 250px;
}
</style>
