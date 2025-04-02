<template>
  <v-card class="table-card mx-10 mt-8" width="100%">
    <v-card-title class="d-flex justify-space-between align-center">
      <span>Tasks</span>
      <div class="d-flex flex-row align-center">
        <CreateDialog type="tasks" @refresh="refresh" :appsData="appsData" />
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
      :loading="pending2"
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
        {{ item.name }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <div class="d-flex flex-row">
          <EditDialog
            type="tasks"
            :data="item"
            :appsData="appsData"
            @saved="refresh"
          />
          <v-btn
            @click="handleDelete(item.appId, item.id)"
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
import { ref, computed, onMounted, watch } from "vue";
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";
import CreateDialog from "../../components/dialogs/CreateDialog.vue";
import { fetchData, deleteItem } from "../../utils/api.js";

const data = ref([]);
const appsData = ref([]);
const pending = ref(false);
const pending2 = ref(false);
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
};

const appsOptions = ref({
  page: 1,
  pageSize: -1,
  sortBy: ["Name"],
  sortDesc: [false],
});
const trimTimestamp = (timestamp) => {
  return timestamp.slice(0, 19).replace("T", " ");
};

const refresh = async () => {
  pending2.value = true;
  await fetchData({
    route: "tasks",
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
      pending2.value = false;
    },
  }).catch(() => {
    toast.error("Error fetching data");
    pending2.value = false;
  });
  pending2.value = false;
};

const fetchApps = async () => {
  try {
    await fetchData({
      route: "apps",
      search: ref(""),
      options: appsOptions,
      setData: (items) => {
        appsData.value = items;
      },
    });
  } catch {
    toast.error("Error fetching apps");
    pending.value = false;
  }
};

const handleDelete = async (appId, taskId) => {
  const fullRoute = `apps/${appId}/tasks`;

  await deleteItem({
    route: fullRoute,
    id: taskId,
    onSuccess: () => {
      toast.success("Successfully deleted", { autoClose: 1000 });
      refresh();
    },
  }).catch(() => {
    toast.error("Error deleting item");
  });
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

watch(
  [search, options],
  () => {
    getListDebounced();
  },
  { deep: true }
);

onMounted(() => {
  refresh();
  fetchApps();
});

const headers = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "description", title: "Description" },
  { key: "appId", title: "App Id" },
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
