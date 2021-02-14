<template>
<div>
  <v-app-bar app dark style="font-family: 'Archivo', sans-serif !important">
    <v-container class="py-0 fill-height">
      <!-- Logo and Title -->
      <v-avatar tile class="mr-5" size="48">
        <img alt="Logo" src="@/assets/logo.svg" />
      </v-avatar>
      <v-toolbar-title class="mr-12 align-center">
        <span
          class="title"
          style="font-family: 'Maven Pro', sans-serif !important"
          >Project Colloquy</span
        >
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <!-- Search Bar -->
      <v-responsive v-if="loginState">
        <v-autocomplete
          style="margin-bottom: -25px"
          chips
          clearable
          filled
          rounded
          dense
          v-model="model"
          :items="items"
          :loading="isLoading"
          :search-input.sync="search"
          color="white"
          hide-no-data
          hide-selected
          item-text="title"
          item-value="title"
          append-icon="mdi-magnify"
          solo
          return-object
        >
          <template v-slot:item="{ item }">
            <v-list-item-avatar>
              <v-img :src="item.dpURL"> </v-img>
            </v-list-item-avatar>
            <v-list-item-content>
              <router-link
                v-if="item.type === 'user'"
                :to="{ name: 'user', params: { username: item.title } }"
              >
                <v-list-item-title>
                  {{ item.title }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ item.type }}</v-list-item-subtitle>
              </router-link>
              <router-link
                v-else
                :to="{ name: 'subforum', params: { subForum: item.title } }"
              >
                <v-list-item-title>
                  {{ item.title }}
                </v-list-item-title>
                <v-list-item-subtitle>{{ item.type }}</v-list-item-subtitle>
              </router-link>
            </v-list-item-content>
          </template>
        </v-autocomplete>
      </v-responsive>

      <!-- Home -->
      <v-spacer></v-spacer>
      <router-link to="/">
        <v-btn text> Home </v-btn>
      </router-link>

      <!-- Login Dialog -->
      <v-dialog v-model="loginDialog" max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            v-if="!loginState"
            text
            @click="loginDialog = true"
            v-bind="attrs"
            v-on="on"
          >
            Sign-In
          </v-btn>
        </template>

        <v-card dark color="surface">
          <v-card-title> <span class="headline">Login</span> </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    suffix="@daiict.ac.in"
                    v-model="email"
                    name="email"
                    label="Email*"
                    required
                  ></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="password"
                    :append-icon="passwordShow ? 'mdi-eye' : 'mdi-eye-off'"
                    :type="passwordShow ? 'text' : 'password'"
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

                <v-col cols="12">
                  <small>*indicates required field<br /></small>
                </v-col>

                <!-- Reset Password -->
                <v-col cols="12">
                  <v-dialog v-model="resetPasswordDialog" max-width="600px">
                    <template v-slot:activator="{ on, attrs }">
                      <span
                        style="color: red"
                        @click="
                          (resetPasswordDialog = true), (loginDialog = false)
                        "
                        v-bind="attrs"
                        v-on="on"
                      >
                        Forgot Password?
                      </span>
                    </template>
                    <v-card dark color="surface">
                      <v-card-title>
                        <span class="headline">Reset Password</span>
                      </v-card-title>
                      <v-card-subtitle>
                      <span style="color: red"
                        ><br />A new password will be sent to your registered email</span
                      >
                    </v-card-subtitle>
                      <v-card-text>
                        <v-container>
                          <v-row>
                            <v-col cols="12">
                              <v-text-field
                                v-model="username"
                                name="username"
                                label="Username*"
                                required
                              ></v-text-field>
                            </v-col>
                            <v-col cols="12">
                              <v-chip
                                v-if="resetErrorChip"
                                class="ma-2"
                                color="primary"
                                label
                                outlined
                                @click:close="resetErrorChip = false"
                              >
                                {{ resetError }}
                              </v-chip>
                            </v-col>
                          </v-row>
                        </v-container>

                        <small>*indicates required field<br /></small>
                      </v-card-text>
                      <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn
                          color="accent"
                          :disabled="resetting"
                          text
                          @click="resetPasswordDialog = false"
                        >
                          Close
                        </v-btn>
                        <v-btn
                          color="accent"
                          :loading="resetting"
                          :disabled="resetting"
                          text
                          type="submit"
                          @click="resetPassword"
                        >
                          Reset
                        </v-btn>
                      </v-card-actions>
                    </v-card>
                  </v-dialog>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="accent"
              :disabled="loggingIn"
              text
              @click="loginDialog = false"
            >
              Close
            </v-btn>
            <v-btn
              color="accent"
              :loading="loggingIn"
              :disabled="loggingIn"
              text
              type="submit"
              @click="login()"
            >
              Login
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Create Menu -->
      <CreateMenu :loginState="loginState" :user="user" />

      <!-- User Menu -->
      <v-menu
        v-model="menu"
        dark
        bottom
        right
        transition="scale-transition"
        min-width="200px"
        rounded
        offset-y
      >
        <template v-slot:activator="{ on }">
          <v-btn icon x-large v-on="on" v-if="loginState">
            <v-avatar size="32">
              <v-img :src="user.dpURL"></v-img>
            </v-avatar>
          </v-btn>
        </template>

        <v-card>
          <v-list-item-content class="justify-center">
            <div class="mx-auto text-center">
              <h6>Signed in as {{ user.username }}</h6>
              <v-divider class="my-3"></v-divider>
              <v-list>
                <v-list-item
                  link
                  :to="{ name: 'user', params: { username: user.username } }"
                >
                  Your Profile
                </v-list-item>
                <!-- Your Activity Dialog -->
                <v-dialog v-model="activityDialog" max-width="430px">
                  <template v-slot:activator="{ on }">
                    <v-list-item v-on="on"> Your Activity </v-list-item>
                  </template>
                  <v-card dark class="justify space-around">
                    <v-img :src="user.bannerURL" max-height="290px">
                      <div class="fill-height bottom-gradient">
                        <v-row align="end" class="fill-height">
                          <v-col align-self="start" class="pa-0" cols="12">
                            <v-avatar
                              class="profile"
                              color="grey"
                              size="164"
                              tile
                            >
                              <v-img :src="user.dpURL"></v-img>
                            </v-avatar>
                          </v-col>
                          <v-col class="py-0">
                            <v-list-item color="rgba(0, 0, 0, .4)" dark>
                              <v-list-item-content>
                                <v-list-item-title class="title">
                                  {{ user.name }}
                                </v-list-item-title>
                                <v-list-item-subtitle>{{
                                  user.email
                                }}</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-list-item>
                          </v-col>
                        </v-row>
                      </div>
                    </v-img>
                    <v-card-text style="margin-top: 20px">
                      <div class="font-weight-bold ml-8 mb-2">
                        Member Since {{ user.createdAt }}
                      </div>
                      <v-timeline align-top dense>
                        <v-timeline-item color="accent" small>
                          <div>
                            <div class="font-weight-normal">
                              <strong>Created SubForums</strong>:
                              {{ user.totalCreatedSubForums }}
                            </div>
                          </div>
                        </v-timeline-item>
                        <v-timeline-item color="accent" small>
                          <div>
                            <div class="font-weight-normal">
                              <strong>Joined SubForums</strong>:
                              {{ user.totalJoinedSubForums }}
                            </div>
                          </div>
                        </v-timeline-item>
                        <v-timeline-item color="accent" small>
                          <div>
                            <div class="font-weight-normal">
                              <strong>Created Posts</strong>:
                              {{ user.totalCreatedPosts }}
                            </div>
                          </div>
                        </v-timeline-item>
                      </v-timeline>
                    </v-card-text>
                  </v-card>
                </v-dialog>
                <v-divider class="my-3"></v-divider>

                <!-- Password change -->
                <v-dialog v-model="editPasswordDialog" max-width="600px">
                  <template v-slot:activator="{ on, attrs }">
                    <v-list-item
                      link
                      v-bind="attrs"
                      v-on="on"
                      @click="editPasswordDialog = true"
                    >
                      Edit Password
                    </v-list-item>
                  </template>

                  <v-card dark color="surface">
                    <v-card-title>
                      <span class="headline">Edit Password</span>
                    </v-card-title>
                    <v-card-subtitle>
                      <span style="color: red"
                        ><br />You will be logged out upon password change</span
                      >
                    </v-card-subtitle>
                    <v-card-text>
                      <v-container>
                        <v-row>
                          <v-col cols="12">
                            <v-text-field
                              v-model="oldPassword"
                              :append-icon="
                                oldPasswordShow ? 'mdi-eye' : 'mdi-eye-off'
                              "
                              :type="oldPasswordShow ? 'text' : 'password'"
                              label="Old Password*"
                              counter
                              @click:append="oldPasswordShow = !oldPasswordShow"
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model="newPassword"
                              type="password"
                              label="New Password*"
                              counter
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-text-field
                              v-model="confirmNewPassword"
                              label="Confirm Password*"
                              counter
                              required
                            ></v-text-field>
                          </v-col>
                          <v-col cols="12">
                            <v-chip
                              v-if="editErrorChip"
                              class="ma-2"
                              color="primary"
                              label
                              outlined
                              @click:close="editErrorChip = false"
                            >
                              {{ editError }}
                            </v-chip>
                          </v-col>
                        </v-row>
                      </v-container>

                      <small>*indicates required field</small>
                    </v-card-text>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        color="accent"
                        :disabled="editingPassword"
                        text
                        @click="editPasswordDialog = false"
                      >
                        Close
                      </v-btn>
                      <v-btn
                        color="accent"
                        :loading="editingPassword"
                        :disabled="editingPassword"
                        text
                        type="submit"
                        @click="editPassword"
                      >
                        Save
                      </v-btn>
                    </v-card-actions>
                  </v-card>
                </v-dialog>

                <!-- Logout -->
                <v-list-item @click="logout(false)"> Logout </v-list-item>
              </v-list>
            </div>
          </v-list-item-content>
        </v-card>
      </v-menu>
    </v-container>
  </v-app-bar>
      <v-snackbar v-model="resetNotification" timeout="2000">
      New password sent to registered email!
      <template v-slot:action="{ attrs }">
        <v-btn color="red" text v-bind="attrs" @click="resetNotification = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
</div>
</template>

<script>
import store from "../store/store";
import axios from "axios";
import moment from "moment";
import CreateMenu from "./CreateMenu.vue";

export default {
  name: "Appbar",
  components: {
    CreateMenu,
  },
  computed: {
    user: {
      get: () => {
        return store.getters.loggedUser;
      },
    },
    loginState: {
      get: () => {
        return store.getters.loginState;
      },
    },
    items() {
      return this.results.map((result) => {
        const Description =
          result.description.length > this.descriptionLimit
            ? result.description.slice(0, this.descriptionLimit) + "..."
            : result.description;

        return Object.assign({}, result, { Description });
      });
    },
  },
  watch: {
    // eslint-disable-next-line no-unused-vars
    search(val) {
      // Items have already been requested
      if (this.isLoading) return;

      this.isLoading = true;

      // Lazily load input items
      fetch(`${process.env.VUE_APP_BASE_API_URL}/search`)
        .then((res) => res.json())
        .then((res) => {
          this.results = res;
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => (this.isLoading = false));
    },
  },
  data: () => ({
    resetPasswordDialog: false,
    resetNotification: false,
    username: "",
    resetting: false,
    resetErrorChip: false,
    resetError: "",
    editPasswordDialog: false,
    editingPassword: false,
    editErrorChip: false,
    editError: "",
    loggingIn: false,
    activityDialog: false,
    menu: false,
    errorChip: false,
    loginError: "",
    passwordShow: false,
    oldPasswordShow: false,
    oldPassword: "",
    newPassword: "",
    confirmNewPassword: "",
    password: "",
    email: "",
    loginDialog: false,
    descriptionLimit: 60,
    results: [],
    isLoading: false,
    model: null,
    search: null,
  }),
  methods: {
    async login() {
      this.loggingIn = true;
      try {
        var email;
        this.email === "admin"
          ? (email = this.email + "@projectcolloquy.tech")
          : (email = this.email + "@daiict.ac.in");
        const loginBody = {
          email: email,
          password: this.password,
        };
        if(this.password !== "") {
        const response = await axios.post(
          `${process.env.VUE_APP_BASE_API_URL}/login`,
          loginBody,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        await store.commit("setUser", {
          ...response.data,
          totalCreatedSubForums: response.data.createdSubForums.length,
          totalJoinedSubForums: response.data.joinedSubForums.length,
          totalCreatedPosts: response.data.createdPosts.length,
          createdAt: moment(response.data.createdAt).format("ll"),
        });
        await store.commit("setLoginState", true);
        const subResponse = await axios.get(
          `${process.env.VUE_APP_BASE_API_URL}/u/subscribed`,
          {
            withCredentials: true,
          }
        );
        await store.commit("setSubscriptions", subResponse.data);
        this.loggingIn = false;
        this.loginDialog = false;
        location.reload();
        }
        else {
          this.loginError = "Password Incorrect";
          this.errorChip = true;
          this.loggingIn = false;
        }
      } catch (error) {
        if (Array.isArray(error.response.data.error))
          this.loginError = error.response.data.error[0];
        else this.loginError = error.response.data.error;
        this.errorChip = true;
        this.loggingIn = false;
      }
    },
    async logout(fromPasswordChange) {
      if (!fromPasswordChange) {
        try {
          await axios.get(`${process.env.VUE_APP_BASE_API_URL}/logout`, {
            withCredentials: true,
          });
        } catch (error) {
          console.log(error.response);
        }
      }
      await store.commit("setLoginState", false);
      await store.commit("resetAll");
      if (this.$router.currentRoute.name === "homepage") location.reload();
      else this.$windowObj.open("/", "_self");
    },
    async editPassword() {
      if (this.newPassword === this.confirmNewPassword) {
        this.editingPassword = true;
        const requestBody = {
          oldPassword: this.oldPassword,
          newPassword: this.newPassword,
        };
        try {
          await axios.post(
            `${process.env.VUE_APP_BASE_API_URL}/u/edit/password`,
            requestBody,
            {
              withCredentials: true,
            }
          );
        } catch (error) {
          this.editError = error.response.data.error;
          this.editErrorChip = true;
        }
        this.editingPassword = false;
        this.logout(true);
      } else {
        this.editError = "New Password and Confirm Password are not same";
        this.editErrorChip = true;
      }
    },
    async resetPassword() {
      this.resetting = true;
      try {
        await axios.patch(
          `${process.env.VUE_APP_BASE_API_URL}/resetpassword?username=${this.username}`,
          null,
          {
            withCredentials: true,
          }
        );
        this.resetting = false;
        this.resetPasswordDialog = false;
        this.username = "";
        this.resetNotification = true;
      } catch (error) {
        this.resetting = false;
        this.resetError = error.response.data.error;
        this.resetErrorChip = true;
      }
    },
  },
};
</script>

<style scoped>
.bottom-gradient {
  background-image: linear-gradient(
    to top,
    rgba(0, 0, 0, 0.4) 0%,
    transparent 72px
  );
}
</style>