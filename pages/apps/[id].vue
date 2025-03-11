<template>
  <div class="container my-6">
    <v-card v-if="app">
      <v-card-title>{{ app.name }}</v-card-title>
      <v-card-text>
        <p><strong>Description:</strong> {{ app.description }}</p>
        <p><strong>Date:</strong> {{ app.date }}</p>
        <p><strong>Server ID:</strong> {{ app.serverId }}</p>
        <p><strong>App ID:</strong> {{ app.appId }}</p>
      </v-card-text>
      <v-card-actions>
        <EditDialog :app="app" @updated="refreshData" />
        <v-btn @click="deleteItem(app.id)" color="error">Delete</v-btn>
      </v-card-actions>
      <v-btn @click="router.push('/apps')" class="mt-3" variant="outline"
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
const appId = route.params.id;

const { data: app, refresh } = useAsyncData(`apps-${appId}`, async () => {
  try {
    return await $fetch(`http://localhost:4000/apps/${appId}`);
  } catch (err) {
    console.error("Error fetching app:", err);
    return null;
  }
});

const deleteItem = async (id) => {
  try {
    await $fetch(`http://localhost:4000/apps/${id}`, { method: "DELETE" });
    toast.success("App deleted successfully", { autoClose: 1000 });
    router.push("/apps");
  } catch (err) {
    toast.error("Error deleting app", { autoClose: 1000 });
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
