<template>
  <v-col cols="12" v-if="pdfUrl">
    <iframe
      :src="pdfUrl"
      width="100%"
      height="600px"
      style="border: 1px solid #444"
    />
  </v-col>
  <v-col>
    <AutentiProcessForm />
  </v-col>
</template>

<script setup>
import AutentiProcessForm from "@/components/autenti/actions/AutentiProcessForm.vue";
import { ref, watch } from "vue";

const props = defineProps({
  referenceNumber: String,
});

const pdfUrl = ref(null);

watch(
  () => props.referenceNumber,
  async (newVal) => {
    if (!newVal) return;
    try {
      const res = await fetch(
        `https://localhost:5001/docgenpdf/profiles/00000000-0000-0000-0000-000000000001/documents/${newVal}`
      );
      if (!res.ok) throw new Error("Błąd pobierania PDF");
      const blob = await res.blob();
      pdfUrl.value = URL.createObjectURL(blob);
    } catch (err) {
      console.error("Błąd ładowania PDF:", err);
    }
  },
  { immediate: true }
);
</script>
