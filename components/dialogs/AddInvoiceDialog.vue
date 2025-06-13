<template>
  <v-dialog
    v-model="isOpen"
    fullscreen
    transition="dialog-bottom-transition"
    scrollable
  >
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Dodaj fakturę</span>
        <v-btn icon @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-row>
            <!-- Formularz -->
            <v-col cols="12" md="3" lg="2">
              <v-text-field
                v-model="invoice.invoiceNumber"
                label="Numer faktury"
                required
              />
              <v-text-field
                v-model.number="invoice.netAmount"
                label="Kwota netto"
                type="number"
                required
              />
              <v-text-field
                v-model.number="invoice.vatAmount"
                label="VAT"
                type="number"
                required
              />
              <v-text-field
                v-model.number="invoice.totalAmount"
                label="Kwota brutto"
                type="number"
                required
              />
              <v-text-field
                v-model="invoice.invoiceDate"
                label="Data faktury"
                type="date"
                required
              />

              <v-file-input
                v-model="pdfFiles"
                accept="application/pdf"
                label="Załącz pliki PDF"
                prepend-icon="mdi-upload"
                multiple
                show-size
              />

              <v-btn block class="mt-4" color="primary" @click="handleSubmit"
                >Zapisz</v-btn
              >
              <v-btn block color="grey" @click="closeDialog">Anuluj</v-btn>
            </v-col>

            <!-- Podglądy -->
            <v-col cols="12" md="9" lg="10">
              <v-row v-if="pdfPreviews.length > 0" dense>
                <v-col
                  v-for="(item, index) in pdfPreviews"
                  :key="index"
                  cols="12"
                  md="6"
                  lg="4"
                  class="d-flex flex-column align-center"
                >
                  <div
                    class="mb-2 d-flex justify-space-between w-100 align-center"
                  >
                    <span class="text-truncate">{{ item.file.name }}</span>
                    <div class="d-flex gap-2">
                      <v-btn icon size="small" @click="openPreview(item.url)">
                        <v-icon>mdi-magnify</v-icon>
                      </v-btn>
                      <v-btn
                        icon
                        size="small"
                        color="red"
                        @click="removeFile(index)"
                      >
                        <v-icon>mdi-delete</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <embed
                    :src="item.url"
                    type="application/pdf"
                    width="100%"
                    height="300px"
                    style="border: 1px solid #ccc"
                  />
                </v-col>
              </v-row>

              <div v-else class="text-center w-100">
                <p class="text-grey">Brak podglądu plików PDF</p>
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, reactive, watch } from "vue";
import { apiCall } from "~/utils/api.js";
import { toast } from "vue3-toastify";

const props = defineProps({ modelValue: Boolean });
const emit = defineEmits(["update:modelValue", "added"]);

const isOpen = ref(false);
const form = ref();
const pdfFiles = ref([]);
const pdfPreviews = ref([]);

const invoice = reactive({
  invoiceNumber: "",
  netAmount: 0,
  vatAmount: 0,
  totalAmount: 0,
  invoiceDate: "",
});

watch(
  () => props.modelValue,
  (val) => {
    isOpen.value = val;
  }
);
watch(isOpen, (val) => {
  emit("update:modelValue", val);
  if (!val) resetForm();
});

watch(pdfFiles, (files) => {
  pdfPreviews.value.forEach((p) => URL.revokeObjectURL(p.url));
  pdfPreviews.value = [];

  if (Array.isArray(files)) {
    pdfPreviews.value = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }
});

const removeFile = (index) => {
  URL.revokeObjectURL(pdfPreviews.value[index].url);
  pdfPreviews.value.splice(index, 1);
  pdfFiles.value.splice(index, 1);
};

const openPreview = (url) => {
  window.open(url, "_blank");
};

const handleSubmit = async () => {
  if (!pdfFiles.value.length) {
    toast.error("Załącz co najmniej jeden plik PDF.");
    return;
  }

  const formData = new FormData();
  formData.append("InvoiceNumber", invoice.invoiceNumber);
  formData.append("NetAmount", invoice.netAmount.toString());
  formData.append("VatAmount", invoice.vatAmount.toString());
  formData.append("TotalAmount", invoice.totalAmount.toString());
  formData.append("InvoiceDate", invoice.invoiceDate);

  pdfFiles.value.forEach((file) => {
    formData.append("Attachments", file);
  });

  try {
    await apiCall({
      route: "invoices",
      method: "POST",
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    emit("added");
    isOpen.value = false;
  } catch (error) {
    console.error("Błąd zapisu faktury:", error);
    toast.error("Nie udało się zapisać faktury.");
  }
};

const closeDialog = () => {
  isOpen.value = false;
};

const resetForm = () => {
  invoice.invoiceNumber = "";
  invoice.netAmount = 0;
  invoice.vatAmount = 0;
  invoice.totalAmount = 0;
  invoice.invoiceDate = "";
  pdfFiles.value = [];
  pdfPreviews.value.forEach((p) => URL.revokeObjectURL(p.url));
  pdfPreviews.value = [];
};
</script>
