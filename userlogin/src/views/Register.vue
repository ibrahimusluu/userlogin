<template>
  <v-main>
    <h1 align="center">Sign Up</h1>
    <div align="center">Welcome to Our Login User System</div>
    <v-card class="mx-auto" max-width="344" elevation="5" outlined shaped>
      <v-card-text>
        <v-text-field
          v-model="name"
          :error-messages="nameErrors"
          :counter="20"
          label="Name"
          required
          @input="$v.name.$touch()"
          @blur="$v.name.$touch()"
        ></v-text-field>
        <v-text-field
          v-model="surname"
          :error-messages="surnameErrors"
          :counter="20"
          label="Surname"
          required
          @input="$v.surname.$touch()"
          @blur="$v.surname.$touch()"
        ></v-text-field>
        <v-text-field
          v-model="email"
          :error-messages="emailErrors"
          :counter="40"
          label="E-mail"
          required
          @input="$v.email.$touch()"
          @blur="$v.email.$touch()"
        ></v-text-field>
        <v-text-field
          type="password"
          v-model="password"
          :error-messages="passwordErrors"
          :counter="20"
          label="Password"
          required
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
        ></v-text-field>

        <v-btn class="mr-4" @click="register"> register </v-btn>
        <v-btn @click="clear"> clear </v-btn>
        <br />
        <p class="typo__p" v-if="submitStatus === 'ERROR'">
          Please fill the form correctly.
        </p>
      </v-card-text>
    </v-card>
  </v-main>
</template>

<script>
import { validationMixin } from "vuelidate";
import { required, maxLength, email } from "vuelidate/lib/validators";
import axios from "axios";

export default {
  mixins: [validationMixin],

  validations: {
    name: { required, maxLength: maxLength(20) },
    surname: { required, maxLength: maxLength(20) },
    email: { required, email },
    password: { required, maxLength: maxLength(20) },
  },

  data: () => ({
    name: "",
    surname: "",
    email: "",
    password: "",
    submitStatus: null,
  }),

  computed: {
    nameErrors() {
      const errors = [];
      if (!this.$v.name.$dirty) return errors;
      !this.$v.name.maxLength &&
        errors.push("Name must be at most 20 characters long");
      !this.$v.name.required && errors.push("Name is required.");
      return errors;
    },
    surnameErrors() {
      const errors = [];
      if (!this.$v.surname.$dirty) return errors;
      !this.$v.surname.maxLength &&
        errors.push("Surname must be at most 20 characters long");
      !this.$v.surname.required && errors.push("Surname is required.");
      return errors;
    },
    emailErrors() {
      const errors = [];
      if (!this.$v.email.$dirty) return errors;
      !this.$v.email.email && errors.push("Must be valid e-mail");
      !this.$v.email.required && errors.push("E-mail is required");
      return errors;
    },
    passwordErrors() {
      const errors = [];
      if (!this.$v.password.$dirty) return errors;
      !this.$v.password.maxLength &&
        errors.push("Password must be at most 20 characters long");
      !this.$v.password.required && errors.push("Password is required.");
      return errors;
    },
  },

  methods: {
    register() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = "ERROR";
      } else {
        axios
          .post("http://localhost:3000/register", {
            name: this.name,
            surname: this.surname,
            email: this.email,
            password: this.password,
          })
          .then((response) => {
            if (response.data.status == true) {
              this.$router.push("/verify");
            } else if (response.data.status == false) {
              alert(response.data.message);
            }
          })
          .catch((error) => {
            alert(error);
          });
      }
    },
    clear() {
      this.submitStatus = null;
      this.$v.$reset();
      this.name = "";
      this.surname = "";
      this.email = "";
      this.password = "";
    },
  },
};
</script>