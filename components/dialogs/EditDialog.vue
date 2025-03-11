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
                  v-model="editedItem[field.name]"
                  :label="field.label"
                  :rules="field.required ? [(v) => !!v || 'Required'] : []"
                  required
                ></v-text-field>

                <v-textarea
                  v-else-if="field.type === 'textarea'"
                  v-model="editedItem[field.name]"
                  :label="field.label"
                ></v-textarea>

                <v-select
                  v-else-if="field.type === 'select'"
                  v-model="editedItem[field.name]"
                  :items="field.options"
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
import { ref, computed, watch, onMounted } from "vue";
import { toast } from "vue3-toastify";
import { useApi } from "../../utils/useApi.js";

const props = defineProps({
  type: { type: String, required: true },
  data: { type: Object, default: () => ({}) },
});

const dialog = ref(false);
const editedItem = ref({ ...props.data });

watch(dialog, (val) => {
  if (val) editedItem.value = { ...props.data };
});

const { data, pending, error, refresh, deleteItem, editItem } = useApi(
  props.type
);

const fields = computed(() => {
  switch (props.type) {
    case "servers":
      return [
        { name: "name", label: "Name*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "date", label: "Date*", type: "date", required: true },
      ];
    case "apps":
      return [
        { name: "name", label: "App Name*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        { name: "serverId", label: "Server", type: "select" },
        { name: "date", label: "Date", type: "date" },
      ];
    case "tasks":
      return [
        { name: "title", label: "Task Title*", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: ["Pending", "In Progress", "Completed"],
          required: true,
        },
        { name: "appId", label: "App Id", type: "select" },
        { name: "serverId", label: "Server Id", type: "select" },
        { name: "date", label: "Date", type: "date" },
      ];
    default:
      return [];
  }
});

const emit = defineEmits();

const saveChanges = async () => {
  try {
    await editItem(editedItem.value.id, editedItem.value);
    dialog.value = false;
    emit("saved");
  } catch (err) {
    console.error("Error updating item:", err);
  }
};
</script>

<style scoped>
.my-small-btn {
  font-size: 0.75rem;
}
.v-overlay {
  background: linear-gradient(
    to bottom right,
    rgba(0, 0, 0, 0.7),
    rgba(230, 12, 23, 0.7)
  ) !important;
}
</style>
