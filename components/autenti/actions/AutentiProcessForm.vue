<template>
  <v-form @submit.prevent="submitForm" ref="form">
    <v-text-field v-model="form.value.title" label="Tytuł" />

    <v-text-field v-model="form.description" label="Opis" required />

    <v-divider class="my-4" />
    <h3 class="text-h6 mb-2">Podpisujący</h3>

    <template v-for="(signer, index) in singerList" :key="index">
      <v-row dense class="mb-2">
        <v-col cols="12" sm="4">
          <v-text-field
            v-model="signer.email"
            label="Email"
            placeholder="np. jan.kowalski@example.com"
            required
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="signer.firstname"
            label="Imię"
            placeholder="np. Jan"
            required
          />
        </v-col>
        <v-col cols="12" sm="3">
          <v-text-field
            v-model="signer.lastname"
            label="Nazwisko"
            placeholder="np. Kowalski"
            required
          />
        </v-col>
        <v-col cols="12" sm="2" class="d-flex align-end">
          <v-select
            v-model="signer.signatureType"
            :items="['QUALIFIED', 'STANDARD', 'BIO']"
            label="Typ podpisu"
            required
          />
        </v-col>
        <v-col cols="12" class="d-flex justify-end">
          <v-btn icon color="red" @click="removeSigner(index)">
            <v-icon>mdi-delete</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      <v-divider class="mb-4" />
    </template>

    <v-btn class="my-2" color="primary" @click="addSigner">
      <v-icon left>mdi-plus</v-icon> Dodaj podpisującego
    </v-btn>

    <v-divider class="my-4" />
    <v-btn type="submit" color="success">Wyślij</v-btn>
  </v-form>
</template>

<script setup>
import { reactive } from "vue";

const singer = {
  email: "",
  firstname: "",
  lastname: "",
  signatureType: "STANDARD",
};

const singerList = [];

const addSigner = () => {
  singerList.push({
    email: "",
    firstname: "",
    lastname: "",
    signatureType: "STANDARD",
  });
};

const removeSigner = (index) => {
  form.value.signers.splice(index, 1);
};

const submitForm = () => {
  console.log("Payload:", JSON.stringify(form.value, null, 2));
};
</script>
