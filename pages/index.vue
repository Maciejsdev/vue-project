<template>
  <div>
    <h2>Home</h2>

    <v-card
      class="mx-auto"
      prepend-icon="$vuetify"
      subtitle="The #1 Vue UI Library"
      width="70vw"
    >
      <template v-slot:title>
        <span class="font-weight-black">Welcome to Vuetify</span>
      </template>

      <v-card-text class="bg-surface-light pt-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi,
        ratione debitis quis est labore voluptatibus! Eaque cupiditate minima,
        at placeat totam, magni doloremque veniam neque porro libero rerum unde
        voluptatem!
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
const isLoading = ref(true);
</script>

<style scoped>
h2 {
  margin-bottom: 4rem;
  font-size: 36px;
}
</style>
