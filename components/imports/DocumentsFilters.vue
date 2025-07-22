<template>
  <div>
    <v-card class="pa-4" dense flat>
      <v-row>
        <v-col md="3" xl="2">
          <v-menu
            :close-on-content-click="false"
            :nudge-right="40"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                dense
                v-bind="attrs"
                v-on="on"
                label="Import period"
                readonly
                outlined
                v-model="importDatesText"
                prepend-inner-icon="mdi-calendar"
              />
            </template>
            <v-date-picker
              no-title
              v-model="importDates"
              range
              @change="filtersHandler"
            />
          </v-menu>
        </v-col>

        <v-col md="3" xl="2">
          <v-select
            dense
            v-model="selectedDocType"
            :items="documentTypes"
            label="Document type"
            outlined
            item-text="text"
            item-value="value"
            @change="filtersHandler"
          />
        </v-col>

        <v-spacer />

        <v-col md="3" xl="2" class="align-self-end">
          <v-text-field
            v-model="phrase"
            dense
            label="Search document"
            outlined
            prepend-inner-icon="mdi-magnify"
            @input="filtersHandler"
          />
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps } from "vue";

const props = defineProps({
  fetch: Function,
});

const today = new Date();
const prevMonth = new Date(
  today.getFullYear(),
  today.getMonth() - 1,
  today.getDate()
);
const formatDate = (date) => date.toISOString().split("T")[0];

const importDates = ref([formatDate(prevMonth), formatDate(today)]);
const selectedDocType = ref("All");
const phrase = ref("");
const filter = ref({});

const importDatesText = computed(() => {
  return [...importDates.value]
    .sort((a, b) => new Date(a) - new Date(b))
    .join(" - ");
});

const documentTypes = [
  { text: "All", value: "All" },
  { text: "Price Lists", value: "prices" },
];

function filtersHandler() {
  filter.value = {
    type: selectedDocType.value || "",
    dateFrom:
      importDates.value[0] < importDates.value[1]
        ? importDates.value[0]
        : importDates.value[1],
    dateTo:
      importDates.value[0] < importDates.value[1]
        ? importDates.value[1]
        : importDates.value[0],
    phrase: phrase.value || "",
  };
  props.fetch(filter.value);
}
</script>
