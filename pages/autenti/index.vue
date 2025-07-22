<template>
  <v-container>
    <h1 class="text-h5 mb-4">Dokumenty PDF</h1>
    <v-row>
      <v-col cols="8">
        <AutentiTable @preview="handlePreview" />
      </v-col>
      <v-col cols="4">
        <AutentiAction
          v-if="selectedReferenceNumber"
          :reference-number="selectedReferenceNumber"
          class="mt-6"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import AutentiTable from "@/components/autenti/table/AutentiTable.vue";
import AutentiAction from "@/components/autenti/actions/AutentiAction.vue";

const selectedReferenceNumber = ref("");

function handlePreview(referenceNumber) {
  selectedReferenceNumber.value = referenceNumber;
}
</script>
