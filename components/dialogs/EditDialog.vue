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
        <v-form ref="form" v-model="formValid">
          <v-container>
            <v-row v-for="field in fields" :key="field.name">
              <v-col cols="12">
                <v-text-field
                  v-if="field.type === 'text'"
                  v-model.trim="editedItem[field.name]"
                  :label="field.label"
                  :rules="[
                    (v) => !!v || `${field.label} is required`,
                    (v) =>
                      (v && v.length >= (field.minLength || 3)) ||
                      `${field.label} must be at least ${
                        field.minLength || 3
                      } characters`,
                  ]"
                  required
                ></v-text-field>

                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  v-model.trim="editedItem[field.name]"
                  :label="field.label"
                  :rules="[
                    (v) => !!v || `${field.label} is required`,
                    (v) =>
                      (v && v.length >= (field.minLength || 5)) ||
                      `${field.label} must be at least ${
                        field.minLength || 5
                      } characters`,
                  ]"
                ></v-textarea>

                <v-select
                  v-else-if="field.type === 'select'"
                  v-model="editedItem[field.name]"
                  :items="field.name === 'serverId' ? serversData : appsData"
                  item-title="name"
                  item-value="id"
                  :label="field.label"
                  :rules="[(v) => !!v || `${field.label} is required`]"
                >
                </v-select>

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
        <v-btn @click="closeDialog">Cancel</v-btn>
        <v-btn color="primary" @click="saveChanges" :disabled="!formValid"
          >Save</v-btn
        >
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
const formValid = ref(false);
const editedItem = ref({});

watch(dialog, (val) => {
  if (val) {
    Object.assign(editedItem.value, props.data);
  }
});

const fields = computed(() => {
  switch (props.type) {
    case "servers":
      return [
        {
          name: "name",
          label: "Name*",
          type: "text",
          required: true,
          minLength: 3,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          minLength: 5,
        },
      ];
    case "apps":
      return [
        {
          name: "name",
          label: "App Name*",
          type: "text",
          required: true,
          minLength: 3,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          minLength: 5,
        },
        { name: "serverId", label: "Server", type: "select" },
      ];
    case "tasks":
      return [
        {
          name: "name",
          label: "Task Title*",
          type: "text",
          required: true,
          minLength: 3,
        },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          minLength: 5,
        },
        { name: "appId", label: "App", type: "select" },
      ];
    default:
      return [];
  }
});

const saveChanges = async () => {
  try {
    let endpoint = "";
    const dataToSend = { ...editedItem.value };

    Object.keys(dataToSend).forEach((key) => {
      if (typeof dataToSend[key] === "string") {
        dataToSend[key] = dataToSend[key].trim();
      }
    });

    switch (props.type) {
      case "servers":
        endpoint = `servers/${editedItem.value.id}`;
        break;
      case "apps":
        if (!editedItem.value.serverId)
          throw new Error("Server ID is required.");
        endpoint = `server/${editedItem.value.serverId}/apps/${editedItem.value.id}`;
        break;
      case "tasks":
        if (!editedItem.value.appId) throw new Error("App ID is required.");
        endpoint = `apps/${editedItem.value.appId}/tasks/${editedItem.value.id}`;
        break;
      default:
        throw new Error("Unknown type for update.");
    }

    await apiCall({ route: endpoint, method: "PATCH", data: dataToSend });
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
