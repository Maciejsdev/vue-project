<template>
  <div class="container my-6">
    <v-card v-if="task">
      <v-card-title>{{ task.name }}</v-card-title>
      <v-card-text>
        <p><strong>Description:</strong> {{ task.description }}</p>
        <p><strong>Date:</strong> {{ task.date }}</p>
        <p><strong>Server ID:</strong> {{ task.serverId }}</p>
        <p><strong>App ID:</strong> {{ task.appId }}</p>
      </v-card-text>
      <v-card-actions>
        <EditDialog :task="task" @updated="refreshData" @saved="refresh" />
        <v-btn @click="deleteItem(task.id)" color="error">Delete</v-btn>
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
const taskId = route.params.id;

const { data: task, refresh } = useAsyncData(`tasks-${taskId}`, async () => {
  try {
    return await $fetch(`http://localhost:4000/tasks/${taskId}`);
  } catch (err) {
    console.error("Error fetching task:", err);
    return null;
  }
});

const deleteItem = async (id) => {
  try {
    await $fetch(`http://localhost:4000/tasks/${id}`, { method: "DELETE" });
    toast.success("Task deleted successfully", { autoClose: 1000 });
    router.push("/tasks");
  } catch (err) {
    toast.error("Error deleting task", { autoClose: 1000 });
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
