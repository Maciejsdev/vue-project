<template>
  <v-dialog v-model="dialog" max-width="500px">
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
        <v-form ref="form">
          <v-container>
            <v-row v-for="field in fields" :key="field.name">
              <v-col cols="12">
                <v-text-field
                  v-if="field.type === 'text'"
                  v-model="newItem[field.name]"
                  :label="field.label"
                  :rules="field.required ? [(v) => !!v || 'Required'] : []"
                  required
                ></v-text-field>

                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="newItem[field.name]"
                  :label="field.label"
                ></v-textarea>

                <v-select
                  v-else-if="field.name === 'serverId'"
                  v-model="newItem[field.name]"
                  :label="field.label"
                  :items="serversData"
                  item-value="id"
                  item-title="name"
                  required
                  :loading="pending"
                  placeholder="Select a server"
                />

                <v-select
                  v-else-if="field.name === 'appId'"
                  v-model="newItem[field.name]"
                  :label="field.label"
                  :items="appsData"
                  item-value="id"
                  item-title="name"
                  required
                  :loading="false"
                  placeholder="Select an app"
                />

                <v-text-field
                  v-else-if="field.type === 'date'"
                  v-model="newItem[field.name]"
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
        <v-btn color="primary" @click="handleCreateNewItem(newItem)">
          Create
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watchEffect, onMounted } from "vue";
import { toast } from "vue3-toastify";
import { apiCall } from "../../utils/api.js";

const props = defineProps({
  type: { type: String, required: true },
  serversData: { type: Array, required: false, default: () => [] },
  appsData: { type: Array, required: false, default: () => [] },
});

const dialog = ref(false);
const newItem = ref({});
const pending = ref(false);
const emit = defineEmits();

const fields = computed(() => {
  const fields = [];

  switch (props.type) {
    case "servers":
      fields.push(
        { name: "name", label: "Name*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" }
      );
      break;
    case "apps":
      fields.push(
        { name: "name", label: "App Name*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "serverId",
          label: "Server",
          type: "select",
          required: true,
        }
      );
      break;
    case "tasks":
      fields.push(
        { name: "name", label: "Task Title*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "appId", label: "App Id", type: "select" }
      );
      break;
    default:
      break;
  }

  return fields;
});

watchEffect(() => {
  newItem.value = {};

  switch (props.type) {
    case "servers":
      newItem.value = { name: "", description: "", date: null };
      break;
    case "apps":
      newItem.value = { name: "", description: "", serverId: null, date: null };
      break;
    case "tasks":
      newItem.value = {
        name: "",
        description: "",
        status: "Pending",
        appId: null,
        serverId: null,
        date: null,
      };
      break;
    default:
      break;
  }
});

watch(dialog, (val) => {
  if (!val) {
    newItem.value = {};
  }
});

const handleCreateNewItem = async (newItem) => {
  try {
    const dataToSend = {
      ...newItem,
      name: newItem.name.trim(),
      description: newItem.description.trim(),
    };

    let endpoint = "";
    switch (props.type) {
      case "servers":
        endpoint = "servers";
        break;
      case "apps":
        if (!newItem.serverId) {
          throw new Error("Server ID is required for creating an app.");
        }
        endpoint = `server/${newItem.serverId}/apps`;
        break;
      case "tasks":
        endpoint = `apps/${newItem.appId}/tasks`;
        break;
      default:
        throw new Error("Unknown type");
    }

    await apiCall({
      route: endpoint,
      method: "POST",
      data: dataToSend,
    });

    toast.success(`${props.type} created successfully!`, { autoClose: 1000 });
    dialog.value = false;
    newItem.value = {};
    emit("refresh");
  } catch (err) {
    console.error("Error creating item:", err);
    toast.error(`Error creating ${props.type}: ${err}`);
  }
};
</script>

<style scoped>
.my-small-btn {
  font-size: 0.75rem;
}
</style>
