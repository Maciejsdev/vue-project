<template>
  <div class="my-6">
    <v-card title="Tasks" class="table-card">
      <v-skeleton-loader v-if="pending" type="table"></v-skeleton-loader>

      <v-data-table
        v-else
        :items="data"
        :loading="pending"
        loading-text="Loading... Please wait"
        class="full"
        :headers="headers"
        item-key="id"
      >
        <!-- Custom Item (Row) -->
        <template v-slot:item="{ item }">
          <tr>
            <td v-for="(value, key) in item" :key="key">
              <NuxtLink
                v-if="key === 'name'"
                :to="`/tasks/${item.id}`"
                class="no-link"
              >
                {{ value }}
              </NuxtLink>
              <span v-else>{{ value }}</span>
            </td>
            <td>
              <div class="d-flex flex-row">
                <EditDialog type="tasks" :data="item" />
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
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";

const { data, pending, error, deleteItem, refresh } = useApi("tasks");

const headers = [
  { key: "id", title: "ID" },
  { key: "name", title: "Name" },
  { key: "description", title: "Description" },
  { key: "serverId", title: "Server ID" },
  { key: "appId", title: "App Id" },
  { key: "date", title: "Date" },
  { key: "actions", title: "Actions", sortable: false },
];
</script>

<style scoped>
h2 {
  margin-bottom: 4rem;
  font-size: 36px;
}
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
</style>
