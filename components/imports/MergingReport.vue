<template>
  <v-dialog v-model="visible" max-width="900">
    <v-card v-if="item.dictionariesMergeReport" class="dense-card">
      <v-card-title>File: {{ item.filename }}</v-card-title>
      <v-card-text>
        <v-alert
          v-if="item.dictionariesMergeReport.allOk"
          dense
          outlined
          type="success"
          border="left"
        >
          Dictionary updated successfully.
        </v-alert>

        <v-alert
          v-if="
            !item.dictionariesMergeReport.allOk &&
            !item.dictionariesMergeReport.shouldEndProcessing
          "
          dense
          outlined
          type="warning"
          border="left"
        >
          Dictionary updated with warnings.
        </v-alert>

        <v-alert
          v-if="item.dictionariesMergeReport.shouldEndProcessing"
          dense
          outlined
          type="error"
          border="left"
        >
          Dictionary update failed.
        </v-alert>

        <v-divider class="mb-1" />
        <h4>Details:</h4>

        <ul v-if="actualMerges.length > 0">
          <li
            v-for="d in actualMerges"
            :key="d.dictionaryName"
            class="dict-item"
          >
            <div>
              <strong>Dictionary "{{ d.dictionaryName }}"</strong>:
            </div>
            <div v-for="(issue, i) in d.issues" :key="i" class="ml-3">
              - {{ issue.description }}: {{ issue.value }}
            </div>
          </li>
        </ul>

        <ul v-else>
          <li>No new items added to dictionaries.</li>
        </ul>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="primary" @click="visible = false">Ok</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { computed, defineProps, defineEmits } from "vue";

const props = defineProps({
  item: { type: Object, required: true },
  modelValue: { type: Boolean, required: true },
});

const emit = defineEmits(["update:modelValue"]);

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const actualMerges = computed(() => {
  return (
    props.item.dictionariesMergeReport?.dictionariesMergingResults?.filter(
      (x) => x.issues && x.issues.length > 0
    ) || []
  );
});
</script>

<style lang="scss" scoped>
.dense-card .v-card__text {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
}
.dict-item {
  margin-bottom: 10px;
}
</style>
