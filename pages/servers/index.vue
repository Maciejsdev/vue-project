<template>
  <v-card width="100%" class="table-card mx-10 mt-8">
    <!-- Title and Search Input Row -->
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Servers</span>
      <div class="d-flex flex-row align-center">
        <CreateDialog type="servers" @saved="refresh" />
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

    <!-- Loading skeleton if pending -->
    <v-skeleton-loader v-if="pending" type="table"></v-skeleton-loader>

    <!-- Data Table with Pagination -->
    <v-data-table-server
      :loading="pending"
      :items="data"
      :headers="headers"
      :items-length="totalItemsCount"
      :items-per-page="options.pageSize"
      :items-per-page-text="'Ilość na stronie'"
      :no-data-text="'Brak danych'"
      @update:items-per-page="updateItemsPerPage"
      @update:page="updatePage"
    >
      <!-- Define custom slot for rendering item names -->
      <template v-slot:[`item.name`]="{ item }">
        <NuxtLink :to="`/servers/${item.id}`" class="no-link">
          {{ item.name }}
        </NuxtLink>
      </template>

      <!-- Define actions (edit and delete) -->
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
import { ref, watch } from "vue";
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";
import CreateDialog from "../../components/dialogs/CreateDialog.vue";
import { fetchData, deleteItem } from "~/utils/api";

const data = ref([]);
const pending = ref(false);
const search = ref("");
const options = ref({
  page: 1,
  pageSize: 5,
});
const totalItemsCount = ref(0);
const totalPages = ref(0);
const trimTimestamp = (timestamp) => {
  return timestamp.slice(0, 19).replace("T", " ");
};
// Fetch Data
const refresh = async () => {
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

// Handle delete
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

// Pagination updates
const updateItemsPerPage = (itemsPerPage) => {
  options.value.pageSize = itemsPerPage;
  refresh();
};
const updatePage = (page) => {
  options.value.page = page;
};
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

// Watch changes in search & pagination
watch(
  [search, options],
  () => {
    getListDebounced();
  },
  { deep: true }
);

// Table headers configuration
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
