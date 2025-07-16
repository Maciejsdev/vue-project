<template>
  <v-container>
    <v-card>
      <client-only>
        <WangEditor v-model="htmlContent" />
      </client-only>
    </v-card>
    <v-btn @click="generatePdf">Generuj PDF</v-btn>
  </v-container>
</template>

<script setup>
const WangEditor = defineAsyncComponent(() =>
  import("@/components/WangEditor.vue")
);

const htmlContent = ref("");

async function generatePdf() {
  try {
    const response = await fetch("/api/pdf/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html: htmlContent.value }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    window.open(url);
  } catch (err) {
    console.error("Błąd generowania PDF:", err);
  }
}
</script>
