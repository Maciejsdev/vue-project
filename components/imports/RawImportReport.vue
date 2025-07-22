<template>
  <v-dialog v-model="visible" max-width="500">
    <v-card v-if="item && item.rawImportReport" class="dense-card">
      <v-card-title>File: {{ item.filename }}</v-card-title>
      <v-card-text>
        <v-alert
          v-if="item.rawImportReport.allOk"
          dense
          outlined
          type="success"
          border="left"
        >
          File imported successfully.
        </v-alert>
        <v-alert
          v-if="
            !item.rawImportReport.allOk &&
            !item.rawImportReport.shouldEndProcessing
          "
          dense
          outlined
          type="warning"
          border="left"
        >
          File imported with some warnings.
        </v-alert>
        <v-alert
          v-if="item.rawImportReport.shouldEndProcessing"
          dense
          outlined
          type="error"
          border="left"
        >
          Import failed due to critical issues.
        </v-alert>

        <v-divider class="mb-1" />
        <h4>Details:</h4>

        <div class="success--text">
          Total items in file: {{ item.rawImportReport.itemsInFile }}
        </div>
        <div class="success--text">
          Successfully imported: {{ item.rawImportReport.itemsImported }}
        </div>
        <div
          v-if="
            item.rawImportReport.itemsInFile >
            item.rawImportReport.itemsImported
          "
          class="warning--text"
        >
          Rejected:
          {{
            item.rawImportReport.itemsInFile -
            item.rawImportReport.itemsImported
          }}
        </div>
      </v-card-text>

      <v-card-text v-if="!issuesLoaded || item.rawImportReport.issues.length">
        <h4>
          Errors ({{
            issuesLoaded ? item.rawImportReport.issues.length : "loading..."
          }}):
        </h4>

        <v-progress-circular v-if="!issuesLoaded" indeterminate class="ma-2" />

        <v-virtual-scroll
          v-else
          :bench="0"
          :items="item.rawImportReport.issues"
          height="200"
          item-height="32"
          class="pa-2"
        >
          <template #default="{ item, index }">
            <div
              :class="
                'problem-item text-truncate text-caption ' +
                (item.description[0] === '!' ? 'critical--text' : '')
              "
            >
              {{ index + 1 }}.
              {{
                item.row && item.column ? `[${item.row},${item.column}]` : ""
              }}
              {{ item.description }}

              <b v-if="item.description[0] === '!'">
                &nbsp;&nbsp;&nbsp;&nbsp; Row rejected: {{ item.row }}
              </b>
            </div>
          </template>
        </v-virtual-scroll>
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
  itemModel: { type: Object, required: true },
  value: { type: Boolean, required: true },
});

const emit = defineEmits(["input"]);
const visible = ref(false);
const item = ref(null);
const issuesLoaded = ref(false);

watch(
  () => props.value,
  async (val) => {
    visible.value = val;
    emit("input", val);
    if (val) {
      item.value = props.itemModel;
      const fetchedItem = await $fetch(`/api/imports/${item.value.id}`);
      item.value.rawImportReport.issues =
        fetchedItem.rawImportReport.issues.sort((a, b) =>
          a.description[0] === "!" ? -1 : 1
        );
      issuesLoaded.value = true;
    }
  },
  { immediate: true }
);
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
.critical--text {
  color: red;
  border: 1px solid red;
}
</style>
