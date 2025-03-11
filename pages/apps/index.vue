<template>
  <div class="my-6">
    <v-card title="Apps" class="table-card">
      <v-skeleton-loader v-if="pending" type="table"></v-skeleton-loader>

      <v-data-table
        v-else
        :items="data"
        :loading="pending"
        loading-text="Loading... Please wait"
        class="full"
        :headers="headers"
      >
        <!-- Custom Item (Row) -->

        <template v-slot:item="{ item }">
          <tr>
            <td v-for="(value, key) in item" :key="key">
              <NuxtLink
                v-if="key === 'name'"
                :to="`/apps/${item.id}`"
                class="no-link"
              >
                {{ value }}
              </NuxtLink>
              <span v-else>{{ value }}</span>
            </td>
            <td class="action-column icons">
              <div class="d-flex flex-row">
                <EditDialog type="apps" :data="item" @saved="refresh" />
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

const { data, pending, error, deleteItem, refresh } = useApi("apps");

const headers = [
  { key: "id", title: "id" },
  { key: "name", title: "Name" },
  { key: "description", title: "Description" },
  { key: "serverId", title: "Server Id" },
  { key: "date", title: "Date" },
  {
    key: "actions",
    title: "Actions",
    sortable: false,
  },
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
.icons {
  color: #ecdfcc;
}
.header-actions {
  justify-items: right;
}
.table-card {
  padding: 1rem;
}
</style>
