<template>
  <div class="my-6">
    <v-card class="table-card">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Apps</span>
        <div class="d-flex flex-row align-center">
          <CreateDialog
            type="apps"
            :serversData="serversData"
            @refresh="refresh"
          />
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
        v-else
        :items="data"
        :loading="pending"
        loading-text="Loading... Please wait"
        class="full"
        :headers="headers"
        :items-length="totalItemsCount"
        :items-per-page="options.pageSize"
        :items-per-page-text="'Items per page'"
        @update:items-per-page="updateItemsPerPage"
        @update:page="updatePage"
      >
        <template v-slot:[`item.name`]="{ item }">
          <NuxtLink :to="`/apps/${item.id}`" class="no-link">
            {{ item.name }}
          </NuxtLink>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <div class="d-flex flex-row">
            <EditDialog type="apps" :data="item" @saved="refresh" />
            <v-btn
              @click="handleDelete(item.serverId, item.id)"
              variant="plain"
              icon="mdi-delete"
              class="my-small-btn"
            ></v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";
import CreateDialog from "../../components/dialogs/CreateDialog.vue";
import { fetchData, deleteItem } from "../../utils/api.js";

const data = ref([]);
const pending = ref(false);
const search = ref("");
const options = ref({
  page: 1,
  pageSize: 5,
});
const totalItemsCount = ref(0);
const totalPages = ref(0);
const serversData = ref([]);

// Fetch Data
const refresh = async () => {
  pending.value = true;
  await fetchData({
    route: "apps",
    search,
    options,
    setData: (items, totalCount, totalPagesCount) => {
      data.value = items;
      totalItemsCount.value = totalCount;
      totalPages.value = totalPagesCount;
      pending.value = false;
    },
  }).catch(() => {
    toast.error("Error fetching data");
    pending.value = false;
  });

  await fetchData({
    route: "servers",
    search: ref(""),
    options: ref({ page: 1, pageSize: 100 }),
    setData: (items) => {
      serversData.value = items;
    },
  });
};

// Handle delete
const handleDelete = async (serverId, appId) => {
  const fullRoute = `server/${serverId}/apps`;

  await deleteItem({
    route: fullRoute,
    id: appId,
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

// Debounce function
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

onMounted(() => {
  refresh();
});

// Table headers configuration
const headers = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "description", title: "Description" },
  { key: "serverId", title: "Server Id" },
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
