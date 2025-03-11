<template>
  <v-theme-provider theme="dark">
    <v-app>
      <div>
        <Navbar />
      </div>

      <div class="main-wrapper d-flex justify-center">
        <slot />
      </div>
    </v-app>
  </v-theme-provider>
</template>

<script setup></script>

<style scoped>
.main-wrapper {
  margin-top: 4rem;
}
</style>
