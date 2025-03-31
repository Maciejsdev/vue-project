<template>
  <v-dialog v-model="dialog" max-width="500px">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-pencil"
        variant="plain"
        class="my-small-btn"
      ></v-btn>
    </template>

    <v-card>
      <v-card-title>Edit {{ type }}</v-card-title>
      <v-card-text>
        <v-form ref="form">
          <v-container>
            <v-row v-for="field in fields" :key="field.name">
              <v-col cols="12">
                <v-text-field
                  v-if="field.type === 'text'"
                  v-model="trimmedFields[field.name]"
                  :label="field.label"
                  :rules="field.required ? [(v) => !!v || 'Required'] : []"
                  required
                ></v-text-field>

                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="trimmedFields[field.name]"
                  :label="field.label"
                ></v-textarea>

                <v-select
                  v-else-if="
                    field.type === 'select' && field.name === 'serverId'
                  "
                  v-model="editedItem[field.name]"
                  :items="serversData"
                  item-title="name"
                  item-value="id"
                  :label="field.label"
                  required
                ></v-select>

                <v-select
                  v-else-if="field.type === 'select' && field.name === 'appId'"
                  v-model="editedItem[field.name]"
                  :items="appsData"
                  item-title="name"
                  item-value="id"
                  :label="field.label"
                  required
                ></v-select>

                <v-text-field
                  v-else-if="field.type === 'date'"
                  v-model="editedItem[field.name]"
                  type="date"
                  :label="field.label"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="dialog = false">Cancel</v-btn>
        <v-btn color="primary" @click="saveChanges">Save</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch, defineProps, defineEmits } from "vue";
import { apiCall } from "../../utils/api.js";
import { toast } from "vue3-toastify";
const props = defineProps({
  type: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
  serversData: { type: Array, default: () => [] },
  appsData: { type: Array, default: () => [] },
});

const emit = defineEmits(["saved"]);

const dialog = ref(false);
const editedItem = ref({ ...props.data });

watch(dialog, (val) => {
  if (val) {
    editedItem.value = { ...props.data };
  }
});

const fields = computed(() => {
  switch (props.type) {
    case "servers":
      return [
        { name: "name", label: "Name*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
      ];
    case "apps":
      return [
        { name: "name", label: "App Name*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "serverId", label: "Server", type: "select" },
      ];
    case "tasks":
      return [
        { name: "name", label: "Task Title*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "appId", label: "App", type: "select" },
        { name: "serverId", label: "Server", type: "select" },
      ];
    default:
      return [];
  }
});

const trimmedFields = computed(() => {
  const trimmed = {};
  for (const field of fields.value) {
    const value = editedItem.value[field.name];
    trimmed[field.name] =
      typeof value === "string" ? value.trim() : value || "";
  }
  return trimmed;
});

const saveChanges = async () => {
  try {
    // Determine the endpoint dynamically based on the type
    let endpoint = "";
    const dataToSend = {
      name: trimmedFields.value.name,
      description: trimmedFields.value.description,
      // Include any other necessary fields
    };

    switch (props.type) {
      case "servers":
        endpoint = `servers/${editedItem.value.id}`; // Endpoint for updating a server
        break;

      case "apps":
        if (!editedItem.value.serverId) {
          throw new Error("Server ID is required to update the app.");
        }
        endpoint = `server/${editedItem.value.serverId}/apps/${editedItem.value.id}`; // Dynamic endpoint for apps
        break;

      case "tasks":
        if (!editedItem.value.appId || !editedItem.value.serverId) {
          throw new Error(
            "App ID and Server ID are required to update the task."
          );
        }
        endpoint = `apps/${editedItem.value.appId}/tasks/${editedItem.value.id}`; // Dynamic endpoint for tasks
        break;

      default:
        throw new Error("Unknown type for update.");
    }

    // Make the API call using apiCall from api.js
    await apiCall({
      route: endpoint,
      method: "PATCH",
      data: dataToSend,
    });

    toast.success(
      `${
        props.type.charAt(0).toUpperCase() + props.type.slice(1)
      } updated successfully!`,
      { autoClose: 1000 }
    );
    closeDialog();
    emit("saved");
  } catch (err) {
    toast.error(`Error updating ${props.type}.`);
    console.error("Error updating item:", err);
  }
};
const closeDialog = () => {
  dialog.value = false;
  editedItem.value = {};
};
</script>

<style scoped>
.my-small-btn {
  font-size: 0.75rem;
}
</style>
