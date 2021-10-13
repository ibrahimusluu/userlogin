<template>
  <v-main>
    <h3 align="center" class="email">
      Email was sent. input your account to verify!
    </h3>
    <v-row>
      <v-col cols="4" offset-md="4">
        <v-text-field
          v-model="input"
          maxLength="6"
          label="Activate"
          placeholder="Your Activation Code!"
          outlined
          block
        ></v-text-field>
      </v-col>
      <v-col>
        <v-btn @click="verify">Verify</v-btn>
      </v-col>
    </v-row>
  </v-main>
</template>

<script>
import axios from "axios";
export default {
  data: () => ({
    input: null,
  }),
  methods: {
    async verify() {
      await axios
        .get("http://localhost:3000/verify")
        .then((response) => {
          if (this.input != null) {
            if (this.input == response.data.code) {
              axios
                .post("http://localhost:3000/activated", {
                  id: response.data.id,
                })
                .then((response) => alert(response.data.message))
                .catch((err) => alert(err.data.message));
              this.$router.push("/login");
            } else if (this.input != response.data.code) {
              alert("Your activation code is WRONG! Check it correctly.");
            }
          }
        })
        .catch((err) => alert(err));
    },
  },
};
</script>