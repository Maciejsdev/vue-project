<template>
  <div v-if="item" class="d-flex justify-start import-statuses">
    <div>
      <div v-if="stage1">
        <v-btn icon tile small @click.stop="showRawImportReport = true">
          <v-icon
            v-if="!stage1.shouldEndProcessing"
            :color="stage1.allOk ? 'success' : 'warning'"
            >mdi-check-network-outline</v-icon
          >
          <v-icon v-else color="error">mdi-close-network-outline</v-icon>
        </v-btn>
      </div>
      <div v-else>
        <v-icon color="grey lighten-2" class="import-status-inactive">
          mdi-network-outline
        </v-icon>
      </div>
    </div>

    <div>
      <div v-if="stage2">
        <v-btn icon tile small @click.stop="showMergingReport = true">
          <v-icon
            v-if="!stage2.shouldEndProcessing"
            :color="stage2.allOk ? 'success' : 'warning'"
            >mdi-check-network-outline</v-icon
          >
          <v-icon v-else color="error">mdi-close-network-outline</v-icon>
        </v-btn>
      </div>
      <div v-else>
        <v-icon color="grey lighten-2" class="import-status-inactive">
          mdi-network-outline
        </v-icon>
      </div>
    </div>

    <div>
      <div v-if="stage3">
        <v-btn icon tile small @click.stop="showApplyingReport = true">
          <v-icon
            v-if="!stage3.shouldEndProcessing"
            :color="stage3.allOk ? 'success' : 'warning'"
            >mdi-check-network-outline</v-icon
          >
          <v-icon v-else color="error">mdi-close-network-outline</v-icon>
        </v-btn>
      </div>
      <div v-else>
        <v-icon color="grey lighten-2" class="import-status-inactive">
          mdi-network-outline
        </v-icon>
      </div>
    </div>

    <RawImportReport v-model="showRawImportReport" :item="item" />
    <MergingReport v-model="showMergingReport" :item="item" />
    <ApplyingReport v-model="showApplyingReport" :item="item" />
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from "vue";
import MergingReport from "~/components/imports/MergingReport.vue";
import RawImportReport from "~/components/imports/RawImportReport.vue";
import ApplyingReport from "~/components/imports/ApplyingReport.vue";

const props = defineProps({
  item: { type: Object, required: true },
});
onMounted(() => {
  if (!props.item) {
    throw new Error("Item prop is required for ImportStagesStatus component.");
  }
  console.log(props.item);
});
const showRawImportReport = ref(false);
const showMergingReport = ref(false);
const showApplyingReport = ref(false);

const stage1 = computed(() => props.item?.rawImportReport);
const stage2 = computed(() => props.item?.dictionariesMergeReport);
const stage3 = computed(() => props.item?.applyImportReport);
</script>

<style lang="scss" scoped>
.import-status-inactive {
  margin: 2px 0 0 0;
  padding: 0;
}
</style>
