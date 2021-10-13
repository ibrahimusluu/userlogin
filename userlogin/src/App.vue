<template>
  <v-app>
    <v-app-bar app color="primary" dark>
      <div class="d-flex align-center">
        <v-icon @click="homepage" x-large>mdi-home</v-icon>
      </div>
      <v-btn @click="adminDialog" text>
        <v-icon x-large>mdi-login</v-icon> <br />
        <span class="mr-2">Admin Login</span>
      </v-btn>

      <v-spacer></v-spacer>

      <v-btn @click="signup" text>
        <span class="mr-2">Sign Up</span>
        <v-icon>mdi-open-in-new</v-icon>
      </v-btn>
      <v-btn @click="login" text>
        <span class="mr-2">Log In</span>
        <v-icon>mdi-login</v-icon>
      </v-btn>
      <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
    </v-app-bar>

    <v-navigation-drawer v-model="drawer" absolute temporary right>
      <v-list nav dense>
        <v-list-item-group
          v-model="group"
          active-class="deep-purple--text text--accent-4"
        >
          <v-list-item @click="homepage">
            <v-list-item-icon>
              <v-icon large>mdi-tooltip-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Account</v-list-item-title>
          </v-list-item>

          <v-list-item @click="logout">
            <v-list-item-icon>
              <v-icon large>mdi-logout</v-icon>
            </v-list-item-icon>
            <v-list-item-title>Log Out</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-dialog v-model="dialog" max-width="400px">
      <v-card>
        <v-card-title class="text-h5 grey lighten-2">
          Admin Login
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12"
                ><v-text-field
                  v-model="email"
                  :error-messages="emailErrors"
                  :counter="30"
                  label="E-mail"
                  required
                  @input="$v.email.$touch()"
                  @blur="$v.email.$touch()"
                ></v-text-field
              ></v-col>
              <v-col cols="12"
                ><v-text-field
                  type="password"
                  v-model="password"
                  :error-messages="passwordErrors"
                  :counter="20"
                  label="Password"
                  required
                  @input="$v.password.$touch()"
                  @blur="$v.password.$touch()"
                ></v-text-field
              ></v-col>
            </v-row>
          </v-container>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">
            Close
          </v-btn>
          <v-btn color="blue darken-1" text @click="adminLogin"> Login </v-btn>
        </v-card-actions>
        <p align="center" v-if="submitStatus === 'ERROR'">
          Please fill the form correctly.
        </p>
      </v-card>
    </v-dialog>

    <v-main>
      <router-view />
    </v-main>
  </v-app>
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
  name: "App",

  data: () => ({
    drawer: false,
    group: null,
    dialog: false,
    submitStatus: null,
    email: "",
    password: "",
    adminEmail: "ibrahim.admin@gmail.com",
    adminPassword: "12345",
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
    login() {
      this.$router.push("/login");
    },
    logout() {
      axios
        .post("http://localhost:3000/online", {
          online: 0,
          email: localStorage.getItem("email"),
        })
        .then((res) => alert(res.data.message))
        .catch((err) => alert(err));
      localStorage.removeItem("email");
      this.$router.push("/login");
    },
    signup() {
      this.$router.push("/");
    },
    homepage() {
      this.$router.push("/");
    },
    adminDialog() {
      this.dialog = true;
      this.submitStatus = null;
      this.email = null;
      this.password = null;
    },
    adminLogin() {
      this.$v.$touch();
      if (this.$v.$invalid) {
        this.submitStatus = "ERROR";
      } else {
        if (
          this.adminEmail == this.email &&
          this.adminPassword == this.password
        ) {
          this.$router.push("/admin");
          this.email = null;
          this.password = null;
          this.dialog = false;
        } else {
          this.submitStatus = null;
          alert("Wrong!");
        }
      }
    },
  },
};
</script>
