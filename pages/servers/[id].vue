<template>
  <div class="container my-6">
    <v-card v-if="server">
      <v-card-title>{{ server.name }}</v-card-title>
      <v-card-text>
        <p><strong>Description:</strong> {{ server.description }}</p>
        <p><strong>Date:</strong> {{ server.date }}</p>
        <p><strong>Server ID:</strong> {{ server.serverId }}</p>
        <p><strong>App ID:</strong> {{ server.appId }}</p>
      </v-card-text>
      <v-card-actions>
        <EditDialog :server="server" @updated="refreshData" @saved="refresh" />
        <v-btn @click="deleteItem(server.id)" color="error">Delete</v-btn>
      </v-card-actions>
      <v-btn @click="router.push('/tasks')" class="mt-3" variant="outline"
        >Back</v-btn
      >
    </v-card>

    <v-skeleton-loader v-else type="card"></v-skeleton-loader>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { toast } from "vue3-toastify";
import EditDialog from "../../components/dialogs/EditDialog.vue";

const route = useRoute();
const router = useRouter();
const serverId = route.params.id;

const { data: server, refresh } = useAsyncData(
  `server-${serverId}`,
  async () => {
    try {
      return await $fetch(`http://localhost:4000/servers/${serverId}`);
    } catch (err) {
      console.error("Error fetching server:", err);
      return null;
    }
  }
);

const deleteItem = async (id) => {
  try {
    await $fetch(`http://localhost:4000/servers/${id}`, { method: "DELETE" });

    toast.success("Server deleted successfully", { autoClose: 1000 });

    router.push("/servers");
  } catch (err) {
    toast.error("Error deleting server", { autoClose: 1000 });
  }
};

const refreshData = () => {
  refresh();
};
</script>

<style scoped>
.container {
  min-width: 75vw;
  margin: auto;
}
</style>
