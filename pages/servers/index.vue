<template>
  <div class="my-6">
    <v-card class="table-card">
      <!-- Title and Search Input Row -->
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Servers</span>
        <div class="d-flex flex-row align-center">
          <CreateDialog type="servers" />
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

      <v-data-table
        v-else
        :items="filteredItems"
        :loading="pending"
        loading-text="Loading... Please wait"
        class="full"
        :headers="headers"
        item-key="id"
        :search="search"
      >
        <!-- Custom Item (Row) -->
        <template v-slot:item="{ item }">
          <tr>
            <td v-for="(value, key) in item" :key="key">
              <NuxtLink
                v-if="key === 'name'"
                :to="`/servers/${item.id}`"
                class="no-link"
              >
                {{ value }}
              </NuxtLink>
              <span v-else>{{ value }}</span>
            </td>
            <td>
              <div class="d-flex flex-row">
                <EditDialog type="servers" :data="item" />
                <v-btn
                  @click="deleteItem(item.id)"
                  variant="plain"
                  icon="mdi-delete"
                  class="my-small-btn"
                ></v-btn>
              </div>
            </td>
          </tr>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";
import CreateDialog from "../../components/dialogs/CreateDialog.vue";

const { data, pending, error, deleteItem, refresh } = useApi("servers");

const search = ref("");

const filteredItems = computed(() => {
  if (!search.value) return data.value;
  return data.value.filter((item) =>
    Object.values(item).some((val) =>
      String(val).toLowerCase().includes(search.value.toLowerCase())
    )
  );
});

const headers = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "description", title: "Description" },
  { key: "date", title: "Date" },
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
