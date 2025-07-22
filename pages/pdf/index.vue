<template>
  <v-container width="100%">
    <v-card>
      <client-only>
        <WangEditor v-model="htmlContent" />
      </client-only>
    </v-card>

    <v-btn class="mt-4 mr-2" @click="generatePdf"
      >Generuj PDF (zapisz szablon)</v-btn
    >
    <v-btn class="mt-4" @click="downloadPdf"
      >Pobierz PDF (na podstawie danych)</v-btn
    >
  </v-container>
</template>

<script setup>
import { defineAsyncComponent, ref } from "vue";

const WangEditor = defineAsyncComponent(() =>
  import("@/components/WangEditor.vue")
);

const htmlContent = ref("");

// Wyciąga unikalne klucze {{ ... }} z HTML-a
function extractPlaceholders(html) {
  const matches = [...html.matchAll(/{{\s*(.*?)\s*}}/g)];
  return [...new Set(matches.map((m) => m[1]))];
}

// 1. Generowanie szablonu (zapis do bazy, np. admin preview)
async function generatePdf() {
  const payload = {
    profileId: "00000000-0000-0000-0000-000000000001",
    templateId: "147F2576-8B3D-4873-84F0-08DDC4638337",
    templateName: "Szablon faktury",
    templateContent: htmlContent.value,
    placeholders: extractPlaceholders(htmlContent.value),
  };

  try {
    console.log("payload:", JSON.stringify(payload, null, 2));

    const res = await fetch(
      "https://localhost:5001/docgenpdf/profiles/00000000-0000-0000-0000-000000000001/templates",
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await res.json();
    console.log("Szablon zapisany", result);
  } catch (err) {
    console.error("Błąd generowania szablonu:", err);
  }
}

// 🔁 2. Pobieranie gotowego PDF z danymi
async function downloadPdf() {
  const payload = {
    documentReferenceNumber: crypto.randomUUID(),
    templateContent: htmlContent.value,
    data: [
      { key: "invoiceNumber", value: "FA/2025/07/123" },
      { key: "invoiceDate", value: "2025-07-17" },
      { key: "netAmount", value: "1000.00" },
      { key: "vatAmount", value: "230.00" },
      { key: "totalAmount", value: "1230.00" },
      { key: "createdAt", value: new Date().toISOString() },
    ],
  };

  try {
    const res = await fetch("https://localhost:5001/docgenpdf/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Błąd pobierania PDF");

    const result = await res.json();

    if (!result?.documentContent)
      throw new Error("Brak pola 'documentContent' w odpowiedzi");

    const byteCharacters = atob(result.documentContent);
    const byteNumbers = new Array(byteCharacters.length)
      .fill(0)
      .map((_, i) => byteCharacters.charCodeAt(i));
    const byteArray = new Uint8Array(byteNumbers);

    const blob = new Blob([byteArray], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "faktura.pdf";
    a.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Błąd pobierania PDF:", err);
  }
}
</script>
