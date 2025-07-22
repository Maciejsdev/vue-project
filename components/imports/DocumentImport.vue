<template>
  <v-card class="pb-2">
    <v-snackbar
      v-model="snack.show"
      :timeout="snack.timeout"
      :color="snack.color"
      top
    >
      {{ snack.msg }}
    </v-snackbar>

    <v-card-title>Document Import</v-card-title>

    <v-select
      v-model="selectedOption"
      :items="options"
      label="Select data type"
      outlined
      dense
      item-text="text"
      item-value="value"
      class="ml-5 mr-5"
    />

    <div
      class="drag-and-drop-container ml-5 mr-5 mb-5"
      @dragover="handleDragOver"
      @drop="handleDrop"
      @click="browseFiles"
    >
      <span v-if="!selectedFile">Click or drag to select file</span>
      <span v-else>{{ selectedFile.name }}</span>
    </div>

    <v-card-text>
      <ul>
        <li v-for="(document, index) in uploadedDocuments" :key="index">
          {{ document.name }}
          <v-btn @click="removeDocument(index)" icon>
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </li>
      </ul>
    </v-card-text>

    <v-card-actions>
      <v-btn @click="close" text>Close</v-btn>
      <v-spacer />
      <v-btn
        @click="importDocuments"
        :disabled="uploadedDocuments.length === 0"
        class="primary"
      >
        Import
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  defaultType: String,
});
const emit = defineEmits(["import", "close"]);

const snack = ref({ show: false, msg: "", color: "success", timeout: 2000 });
const selectedOption = ref(null);
const selectedFile = ref(null);
const uploadedDocuments = ref([]);

watch(
  () => props.defaultType,
  (val) => {
    selectedOption.value = val;
  },
  { immediate: true }
);

const options = [{ text: "Invoice Lists", value: "invoices" }];

function close() {
  uploadedDocuments.value = [];
  emit("close");
}

function handleDragOver(event) {
  event.preventDefault();
}

function handleDrop(event) {
  event.preventDefault();
  const files = Array.from(event.dataTransfer.files);
  files.forEach((file) => {
    if (isExcelFile(file)) {
      addFileToList(file);
    } else {
      snack.value = {
        show: true,
        msg: "Please upload an Excel file.",
        color: "error",
        timeout: 3000,
      };
    }
  });
}

function browseFiles() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".xls, .xlsx, .csv";
  input.style.display = "none";
  input.multiple = true;
  input.addEventListener("change", (event) => {
    const files = Array.from(event.target.files);
    files.forEach((file) => addFileToList(file));
  });
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

function isExcelFile(file) {
  const validExtensions = [".xls", ".xlsx", ".csv"];
  const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
  return validExtensions.includes(ext);
}

function addFileToList(file) {
  uploadedDocuments.value.push(file);
}

function removeDocument(index) {
  uploadedDocuments.value.splice(index, 1);
}

async function importDocuments() {
  const wrongDocs = [];
  for (let file of uploadedDocuments.value) {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await $fetch(
        `https://localhost:5001/importData/internal/${selectedOption.value}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response?.invoice) {
        wrongDocs.push(file.name);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }
  uploadedDocuments.value = [];
  selectedFile.value = null;
  emit("import");
  snack.value = {
    show: true,
    msg: "All files were imported.",
    color: "success",
    timeout: 3000,
  };
}
</script>

<style>
.drag-and-drop-container {
  border: 2px dashed #ccc;
  padding: 20px;
  text-align: center;
  cursor: pointer;
}
</style>
