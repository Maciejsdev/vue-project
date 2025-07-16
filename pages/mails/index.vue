<template>
  <v-container justify="center" class="pa-4">
    <v-card max-width="1200" width="100%" class="pa-4">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Wyślij wiadomość</span>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="form" @submit.prevent>
          <v-row dense>
            <!-- Formularz e-mail -->
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 mb-2">E-mail</h3>
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

              <v-btn
                block
                class="mt-4"
                color="primary"
                @click="handleSubmitEmail"
              >
                Wyślij e-mail
              </v-btn>
              <v-btn block color="grey" @click="closeDialog">Anuluj</v-btn>
            </v-col>

            <!-- Formularz SMS -->
            <v-col cols="12" md="6">
              <h3 class="text-subtitle-1 mb-2">SMS</h3>
              <v-text-field
                v-model="smsPhone"
                label="Nr telefonu odbiorcy"
                required
              />
              <v-text-field
                v-model="sms.Sender"
                label="Nadawca (max 11 znaków)"
                maxlength="11"
                required
              />
              <v-textarea
                v-model="sms.Text"
                label="Treść SMS-a"
                rows="6"
                auto-grow
                required
              />
              <v-btn
                block
                class="mt-4"
                color="primary"
                @click="handleSubmitSms"
              >
                Wyślij SMS
              </v-btn>
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

// Formularz e-mail
const mail = ref({
  Fullname: "",
  Email: "",
  PhoneNumber: "",
  Message: "",
});

// Formularz SMS
const sms = ref({
  Recipients: [],
  Sender: "Vectio",
  Text: "",
  Type: 0, // np. 0 = standardowy
});

const smsPhone = ref(""); // numer pojedynczy jako input

const handleSubmitEmail = async () => {
  try {
    await axios.post("https://localhost:5001/contact/send", mail.value, {
      headers: { "Content-Type": "application/json" },
    });
    mail.value = {
      Fullname: "",
      Email: "",
      PhoneNumber: "",
      Message: "",
    };
    console.log("E-mail został wysłany.");
  } catch (error) {
    console.error("Błąd przy wysyłaniu e-maila:", error);
    alert("Wystąpił błąd przy wysyłaniu wiadomości e-mail.");
  }
};

const handleSubmitSms = async () => {
  try {
    sms.value.Recipients = [smsPhone.value];

    await axios.post("https://localhost:5001/contact/sendsms", sms.value, {
      headers: { "Content-Type": "application/json" },
    });

    sms.value = {
      Recipients: [],
      Sender: "Vectio",
      Text: "",
      Type: 3,
    };
    smsPhone.value = "";

    console.log("SMS został wysłany.");
  } catch (error) {
    console.error("Błąd przy wysyłaniu SMS-a:", error);
    alert("Wystąpił błąd przy wysyłaniu SMS-a.");
  }
};
</script>
