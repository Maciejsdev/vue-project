<template>
  <header>
    <nav>
      <v-app-bar :elevation="2" rounded scroll-behavior="fade-image">
        <!-- Menu inside the Nav Icon -->
        <template v-slot:prepend>
          <v-menu>
            <template v-slot:activator="{ props }">
              <v-app-bar-nav-icon v-bind="props"></v-app-bar-nav-icon>
              <Logo />
            </template>
            <v-list>
              <v-list-item to="/">
                <v-list-item-title>Home</v-list-item-title>
              </v-list-item>
              <!-- <v-list-item to="/apps">
                <v-list-item-title>Apps</v-list-item-title>
              </v-list-item>
              <v-list-item to="/servers">
                <v-list-item-title>Servers</v-list-item-title>
              </v-list-item>
              <v-list-item to="/tasks">
                <v-list-item-title>Tasks</v-list-item-title>
              </v-list-item> -->
              <v-list-item to="/invoices">
                <v-list-item-title>Invoices</v-list-item-title>
              </v-list-item>
              <v-list-item to="/mails">
                <v-list-item-title>Mails</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
        <v-app-bar-title>Vectio</v-app-bar-title>
      </v-app-bar>
    </nav>
  </header>
</template>

<script setup></script>

<style scoped></style>
