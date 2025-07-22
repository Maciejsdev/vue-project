<template>
  <v-dialog v-model="visible" max-width="500">
    <v-card v-if="item.applyImportReport" class="dense-card">
      <v-card-title>File: {{ item.filename }}</v-card-title>
      <v-card-text>
        <v-alert
          v-if="item.applyImportReport.allOk"
          dense
          outlined
          type="success"
          border="left"
        >
          Merge completed successfully.
        </v-alert>

        <v-alert
          v-if="
            !item.applyImportReport.allOk &&
            !item.applyImportReport.shouldEndProcessing
          "
          dense
          outlined
          type="warning"
          border="left"
        >
          Merge completed with warnings.
        </v-alert>

        <div
          v-if="
            !item.applyImportReport.allOk &&
            !item.applyImportReport.shouldEndProcessing
          "
        >
          <h4>Details:</h4>

          <div class="success--text">
            Total in file: {{ item.applyImportReport.totalItems }}
          </div>
          <div class="success--text">
            Updated: {{ item.applyImportReport.itemsUpdated }}
          </div>
          <div class="success--text">
            Added: {{ item.applyImportReport.itemsInserted }}
          </div>
          <div>
            Skipped:
            {{
              item.applyImportReport.totalItems -
              (item.applyImportReport.itemsInserted +
                item.applyImportReport.itemsUpdated)
            }}
          </div>
          <div
            v-if="
              item.applyImportReport.itemsInFile >
              item.applyImportReport.itemsImported
            "
            class="warning--text"
          >
            Rejected:
            {{
              item.applyImportReport.itemsInFile -
              item.applyImportReport.itemsImported
            }}
          </div>
        </div>

        <v-alert
          v-if="item.applyImportReport.shouldEndProcessing"
          dense
          outlined
          type="error"
          border="left"
        >
          Critical error occurred during merging.
        </v-alert>

        <div
          v-if="
            item.applyImportReport.errors &&
            item.applyImportReport.errors.length > 0
          "
        >
          <v-divider class="mb-1"></v-divider>
          <h4>Details:</h4>
          <div v-for="(error, i) in item.applyImportReport.errors" :key="i">
            {{ error }}
          </div>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="visible = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
  value: { type: Boolean, required: true },
});

const emit = defineEmits(["input"]);
const visible = ref(false);

watch(
  () => props.value,
  (val) => {
    visible.value = val;
  },
  { immediate: true }
);

watch(visible, (val) => {
  emit("input", val);
});
</script>

<style lang="scss" scoped>
.dense-card .v-card__text {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
.problem-item {
  height: 24px;
  border: 1px solid #ddd;
  margin: 2px 2px 2px 0;
  padding: 2px 4px;
}
</style>
