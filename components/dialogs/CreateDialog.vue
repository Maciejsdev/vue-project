<template>
  <v-dialog v-model="dialog" max-width="500px" @update:modelValue="resetForm">
    <template v-slot:activator="{ props }">
      <v-btn
        v-bind="props"
        icon="mdi-plus"
        variant="plain"
        class="my-small-btn"
      ></v-btn>
    </template>

    <v-card>
      <v-card-title>Create New {{ type }}</v-card-title>
      <v-card-text>
        <v-form v-model="formValid">
          <v-container>
            <v-row v-for="field in fields" :key="field.name">
              <v-col cols="12">
                <v-text-field
                  v-if="field.type === 'text'"
                  v-model.trim="newItem[field.name]"
                  :label="field.label"
                  :rules="[
                    (v) => !!v || `${field.label} is required`,
                    (v) =>
                      (v && v.length >= 3) ||
                      `${field.label} must be at least 3 characters`,
                  ]"
                  required
                ></v-text-field>

                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  v-model.trim="newItem[field.name]"
                  :label="field.label"
                  :rules="[
                    (v) => !!v || `${field.label} is required`,
                    (v) =>
                      (v && v.length >= 5) ||
                      `${field.label} must be at least 5 characters`,
                  ]"
                  required
                ></v-textarea>

                <v-select
                  v-else-if="field.type === 'select'"
                  v-model="newItem[field.name]"
                  :label="field.label"
                  :items="field.name === 'serverId' ? serversData : appsData"
                  item-value="id"
                  item-title="name"
                  :rules="[(v) => !!v || `${field.label} is required`]"
                  required
                  :loading="field.name === 'serverId' ? pending : false"
                  placeholder="Select an option"
                />
              </v-col>
            </v-row>
          </v-container>
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-btn @click="closeDialog">Cancel</v-btn>
        <v-btn
          color="primary"
          @click="handleCreateNewItem"
          :disabled="!formValid"
          >Create</v-btn
        >
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed } from "vue";
import { toast } from "vue3-toastify";
import { apiCall } from "../../utils/api.js";

const props = defineProps({
  type: { type: String, required: true },
  serversData: { type: Array, default: () => [] },
  appsData: { type: Array, default: () => [] },
});
const formValid = ref(false);
const dialog = ref(false);
const newItem = ref({});
const loading = ref(false);
const pending = ref(false);
const emit = defineEmits();

const resetForm = () => {
  newItem.value = {};
};

const closeDialog = () => {
  dialog.value = false;
  resetForm();
};

const fields = computed(() => {
  switch (props.type) {
    case "servers":
      return [
        { name: "name", label: "Name", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: true,
        },
      ];
    case "apps":
      return [
        { name: "name", label: "App Name", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: true,
        },
        { name: "serverId", label: "Server", type: "select", required: true },
      ];
    case "tasks":
      return [
        { name: "name", label: "Task Title", type: "text", required: true },
        {
          name: "description",
          label: "Description",
          type: "textarea",
          required: true,
        },
        { name: "appId", label: "App Id", type: "select", required: true },
      ];
    default:
      return [];
  }
});

const handleCreateNewItem = async () => {
  try {
    const dataToSend = Object.fromEntries(
      Object.entries(newItem.value).map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
    );

    let endpoint = "";
    switch (props.type) {
      case "servers":
        endpoint = "servers";
        break;
      case "apps":
        endpoint = `server/${newItem.value.serverId}/apps`;
        break;
      case "tasks":
        endpoint = `apps/${newItem.value.appId}/tasks`;
        break;
      default:
        throw new Error("Unknown type");
    }
    loading.value = true;
    await apiCall({
      route: endpoint,
      method: "POST",
      data: dataToSend,
    });

    loading.vlaue = false;

    toast.success(`${props.type} created successfully!`, { autoClose: 1000 });
    emit("refresh");
    closeDialog();
  } catch (err) {
    console.error("Error creating item:", err);
    toast.error(`Error creating ${props.type}: ${err.message}`);
  }
};
</script>

<style scoped>
.my-small-btn {
  font-size: 0.75rem;
}
</style>
