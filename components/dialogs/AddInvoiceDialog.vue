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
                v-model="pdfFile"
                accept="application/pdf"
                label="Załącz plik PDF"
                prepend-icon="mdi-upload"
                show-size
                required
              />
              <v-btn block class="mt-4" color="primary" @click="handleSubmit"
                >Zapisz</v-btn
              >
              <v-btn block color="grey" @click="closeDialog">Anuluj</v-btn>
            </v-col>

            <!-- Podgląd -->
            <v-col
              cols="12"
              md="9"
              lg="10"
              class="d-flex justify-center align-center"
            >
              <div
                v-if="pdfPreviewUrl"
                style="width: 100%; height: 85vh; border: 1px solid #ccc"
              >
                <embed
                  :src="pdfPreviewUrl"
                  type="application/pdf"
                  width="100%"
                  height="100%"
                />
              </div>
              <div v-else class="text-center w-100">
                <p class="text-grey">Brak podglądu pliku PDF</p>
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
const props = defineProps({
  modelValue: Boolean,
});
const emit = defineEmits(["update:modelValue", "added"]);

const isOpen = ref(false);
const form = ref();
const pdfFile = ref(null);
const pdfPreviewUrl = ref("");

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
  if (!val) {
    resetForm();
  }
});

watch(pdfFile, (file) => {
  if (file instanceof File) {
    pdfPreviewUrl.value = URL.createObjectURL(file);
  } else {
    pdfPreviewUrl.value = "";
  }
});

const handleSubmit = async () => {
  if (!pdfFile.value || !(pdfFile.value instanceof File)) {
    toast.error("Załącz plik PDF.");
    return;
  }

  const formData = new FormData();
  formData.append("InvoiceNumber", invoice.invoiceNumber);
  formData.append("NetAmount", invoice.netAmount.toString());
  formData.append("VatAmount", invoice.vatAmount.toString());
  formData.append("TotalAmount", invoice.totalAmount.toString());
  formData.append("InvoiceDate", invoice.invoiceDate);
  formData.append("Attachment", pdfFile.value);

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
  pdfFile.value = null;

  if (pdfPreviewUrl.value) {
    URL.revokeObjectURL(pdfPreviewUrl.value);
    pdfPreviewUrl.value = "";
  }
};
</script>
