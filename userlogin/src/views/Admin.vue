<template>
  <v-main>
    <v-card class="mx-auto" max-width="800" elevation="10" outlined>
      <v-toolbar flat>
        <v-toolbar-title>Users</v-toolbar-title>
      </v-toolbar>

      <v-divider class="mx-4"></v-divider>
      <v-data-table
        :headers="headers"
        :items="users"
        :items-per-page="5"
        class="elevation-1"
      ></v-data-table>
    </v-card>
    <br />
    <v-row>
      <v-col cols="12"
        ><div align="center">Online Users : {{ onlineUsers }}</div></v-col
      >
      <v-col cols="12"
        ><div align="center">
          Registered Users(in last 24 hours) : {{ registered }}
        </div></v-col
      >
      <v-col cols="12"
        ><div align="center">
          Not Login Yet(after 1 day) or Offline Users : {{ offlineUsers }}
        </div></v-col
      >
      <v-col cols="12"
        ><div align="center">
          How long to login (for last user) : {{ loginTime }} seconds
        </div></v-col
      >
    </v-row>
  </v-main>
</template>
<script>
import axios from "axios";
export default {
  data: () => ({
    users: [],
    onlineUsers: 0,
    registered: 0,
    offlineUsers: 0,
    loginTime: 0,
    headers: [
      {
        text: "Name",
        align: "start",
        sortable: false,
        value: "name",
      },
      { text: "Surname", value: "surname" },
      { text: "Email", value: "email" },
      { text: "Password", value: "password" },
      { text: "Online/Offline", value: "online" },
    ],
  }),
  created() {
    this.getUsers();
  },

  methods: {
    async getUsers() {
      await axios
        .get("http://localhost:3000/users")
        .then((res) => (this.users = res.data))
        .catch((err) => alert(err));
      await axios
        .get("http://localhost:3000/onlineUsers")
        .then((res) => (this.onlineUsers = res.data.length))
        .catch((err) => alert(err));
      await axios
        .get("http://localhost:3000/registered")
        .then((res) => (this.registered = res.data.counter))
        .catch((err) => alert(err));
      await axios
        .get("http://localhost:3000/offlineUsers")
        .then((res) => (this.offlineUsers = res.data.counter))
        .catch((err) => alert(err));
      await axios
        .get("http://localhost:3000/loginTime")
        .then((res) => (this.loginTime = res.data.second))
        .catch((err) => alert(err));
    },
  },
};
</script>