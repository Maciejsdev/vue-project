<template>
  <v-container>
    <v-card max-width="900" width="100%">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Wyślij wiadomość</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="mail.Email"
                label="Adres e-mail odbiorcy"
                type="email"
                required
              />
              <v-text-field
                v-model="mail.PhoneNumber"
                label="Nr telefonu"
                required
              />
              <v-text-field
                v-model="mail.Fullname"
                label="Imię i nazwisko"
                required
              />
              <v-textarea
                v-model="mail.Message"
                label="Treść wiadomości"
                rows="6"
                auto-grow
                required
              />
              <v-btn block class="mt-4" color="primary" @click="handleSubmit">
                Wyślij
              </v-btn>
              <v-btn block color="grey" @click="closeDialog"> Anuluj </v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const mail = ref({
  Fullname: "",
  Email: "",
  PhoneNumber: "",
  Message: "",
});

const handleSubmit = async () => {
  try {
    const formData = new FormData();
    formData.append("Fullname", mail.value.Fullname);
    formData.append("Email", mail.value.Email);
    formData.append("PhoneNumber", mail.value.PhoneNumber);
    formData.append("Message", mail.value.Message);

    await axios.post("http://localhost:5079/contact/send", mail.value, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    mail.value = {
      Fullname: "",
      Email: "",
      PhoneNumber: "",
      Message: "",
    };
    console.log("Wiadomość została wysłana.");
  } catch (error) {
    console.error("Błąd przy wysyłaniu wiadomości:", error);
    alert("Wystąpił błąd przy wysyłaniu wiadomości.");
  }
};
</script>
