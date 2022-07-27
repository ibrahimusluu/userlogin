<template>
  <v-main>
    <h1 align="center" class="pa-4">Log In</h1>
    <v-card class="mx-auto" max-width="344" elevation="5" outlined shaped>
      <v-card-text>
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
          v-if="hide"
          type="password"
          v-model="password"
          :error-messages="passwordErrors"
          :counter="20"
          label="Password"
          required
          @input="$v.password.$touch()"
          @blur="$v.password.$touch()"
        ></v-text-field>

        <v-btn v-if="hide" class="mr-4" @click="login"> login </v-btn>
        <v-btn v-if="hide" class="pa-2 ma-2" @click="clear"> clear </v-btn>
        <br />
        <p class="typo__p" v-if="submitStatus === 'ERROR'">
          Please fill the form correctly.
        </p>
        <a v-if="hide" @click="forget">Did you forget your password?</a>
        <v-btn align="center" v-if="newPassword" @click="send"
          >New Password</v-btn
        >
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
    email: { required, email },
    password: { required, maxLength: maxLength(20) },
  },

  data: () => ({
    email: "",
    password: "",
    hide: true,
    newPassword: false,
    submitStatus: null,
  }),

  computed: {
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
    async login() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = "ERROR";
      } else {
        await axios
          .post("http://localhost:3000/login", {
            email: this.email,
            password: this.password,
          })
          .then((response) => {
            if (response.data.status == 0) {
              alert(response.data.message);
            } else if (response.data.status == 1) {
              if (
                response.data.email == this.email &&
                response.data.password == this.password
              ) {
                alert(response.data.message);
                axios
                  .post("http://localhost:3000/online", {
                    online: 1,
                    email: this.email,
                  })
                  .then((res) => alert(res))
                  .catch((err) => alert(err));
                localStorage.setItem("email", this.email);
                this.$router.push("/welcome");
              } else {
                alert("Email address or password is wrong!");
              }
            } else if (response.data.status == 2) {
              alert(response.data.message);
              this.$router.push("/verify");
            }
          })
          .catch((error) => {
            alert(error);
          });
      }
    },
    send() {
      if (!this.$v.email.required || !this.$v.email.email) {
        this.submitStatus = "ERROR";
      } else {
        this.submitStatus = null;
        axios
          .post("http://localhost:3000/forgetPassword", {
            email: this.email,
          })
          .then((response) => alert(response.data.message))
          .catch((error) => {
            alert(error);
          });
      }
    },
    forget() {
      this.newPassword = true;
      this.hide = false;
    },
    clear() {
      this.submitStatus = null;
      this.$v.$reset();
      this.email = "";
      this.password = "";
    },
  },
};
</script>