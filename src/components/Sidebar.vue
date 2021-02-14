<template>
  <v-sheet color="secondary" rounded="lg">
    <!-- Registration -->
    <v-card v-if="!loginState" dark class="mx-auto">
      <v-card-text>
        <div>
          <img alt="Logo" src="@/assets/logo.svg" />
        </div>
        <h2 class="text-center">Project Colloquy</h2>
        <br />
        <div class="text-center">
          Join the most happening place<br />
          to have a striking conversation
        </div>
      </v-card-text>
      <v-card-actions>
        <v-row align="center" justify="center">
          <v-dialog v-model="registerDialog" max-width="600px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                text
                color="accent"
                outlined
                @click="registerDialog = true"
                v-bind="attrs"
                v-on="on"
              >
                Register
              </v-btn>
            </template>
            <v-card dark color="surface">
              <v-card-title>
                <span class="headline">Register</span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        :rules="[rules.required]"
                        v-model="firstName"
                        label="First Name*"
                        hint="A username will be automatically set - FirstName_Email"
                        persistent-hint
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12" sm="6" md="6">
                      <v-text-field
                        :rules="[rules.required]"
                        v-model="lastName"
                        label="Last name*"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-select
                        v-model="batch"
                        :items="courses"
                        label="Course"
                      ></v-select>
                      <v-select
                        v-model="gender"
                        :items="genders"
                        label="Gender"
                      ></v-select>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="email"
                        suffix="@daiict.ac.in"
                        :rules="[rules.required]"
                        label="DAIICT Email*"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-text-field
                        v-model="password"
                        :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                        :type="passwordShow ? 'text' : 'password'"
                        :rules="[rules.required]"
                        label="Password*"
                        counter
                        @click:append="passwordShow = !passwordShow"
                        required
                      ></v-text-field>
                    </v-col>
                    <v-col cols="12">
                      <v-chip
                        v-if="errorChip"
                        class="ma-2"
                        color="primary"
                        label
                        outlined
                        @click:close="errorChip = false"
                      >
                        {{ loginError }}
                      </v-chip>
                    </v-col>
                  </v-row>
                </v-container>
                <small>*indicates required field</small>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="accent" :disabled="registering" text @click="registerDialog = false">
                  Close
                </v-btn>
                <v-btn
                  :loading="registering"
                  :disabled="registering"
                  type="submit"
                  color="accent"
                  text
                  @click="register(), (stepCount = 2)"
                >
                  Register
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-row>
      </v-card-actions>
    </v-card>

    <!-- Navigation -->
    <v-list v-if="loginState" color="transparent" nav dense>
      <v-list-item-group>
        <router-link to="/popular">
          <v-list-item color="accent">
            <v-list-item-icon>
              <v-icon>mdi-trending-up</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Most Popular</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
        <router-link to="/recent">
          <v-list-item color="accent">
            <v-list-item-icon>
              <v-icon>mdi-history</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>Most Recent</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </router-link>
      </v-list-item-group>
    </v-list>
    <v-divider></v-divider>
    <v-list color="transparent" v-if="loginState">
      <v-list-item>
        <v-list-item-title>
          <h2>Subscriptions</h2>
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <v-list v-if="loginState" color="transparent" nav dense>
      <v-list-item v-if="subscriptions.length === 0">
        <v-list-item-title>
          <span class="body-1">No SubForums Joined</span>
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        v-else
        v-for="(subforum, index) in subscriptions"
        :key="index"
        :to="{
          name: 'subforum',
          params: { subForum: subforum.title },
        }"
      >
        <v-list-item-avatar>
          <v-img :src="subforum.dpURL"></v-img>
        </v-list-item-avatar>
        <v-list-item-title>
          <span class="body-1">{{ subforum.title }}</span>
        </v-list-item-title>
      </v-list-item>
    </v-list>
    <v-snackbar v-model="snackbar" timeout="2000">
      User registered successfully. Login to continue!

      <template v-slot:action="{ attrs }">
        <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-sheet>
</template>

<script>
import store from "../store/store";
import axios from "axios";

export default {
  name: "Sidebar",
  computed: {
    loginState: {
      get: () => {
        return store.getters.loginState;
      },
    },
    subscriptions: {
      get: () => {
        return store.getters.subscriptions;
      },
    },
  },
  data: () => ({
    registering: false,
    snackbar: false,
    errorChip: false,
    loginError: "",
    registerDialog: false,
    passwordShow: false,
    password: "",
    email: "",
    batch: "",
    firstName: "",
    lastName: "",
    gender: "",
    rules: {
      required: (value) => !!value || "Required",
    },
    genders: ["Female", "Male", "Transgender", "None"],
    courses: [
      "BTech - ICT",
      "BTech - ICT.CS",
      "BTech - MnC",
      "MTech - ICT",
      "MTech - EC",
      "MTech - CSE.DS",
      "MTech - CSE.IS",
      "MSc - IT",
      "MSc - DS",
      "PhD",
    ],
  }),
  methods: {
    async register() {
      this.registering = true;
      try {
        var email;
        this.email === "admin"
          ? (email = this.email + "@projectcolloquy.tech")
          : (email = this.email + "@daiict.ac.in");
        await axios.post(`${process.env.VUE_APP_BASE_API_URL}/register`, {
          name: this.firstName + " " + this.lastName,
          batch: this.batch,
          gender: this.gender,
          email: email,
          password: this.password,
        });
        this.registering = false;
        this.clearAll();
        this.registerDialog = false;
        this.snackbar = true;
      } catch (error) {
        if (Array.isArray(error.response.data.error))
          this.loginError = error.response.data.error[0];
        else this.loginError = error.response.data.error;
        this.errorChip = true;
      }
    },
    clearAll() {
      this.firstName = "";
      this.lastName = "";
      this.gender = "";
      this.email = "";
      this.password = "";
      this.batch = "";
    }
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Archivo&display=swap");
</style>