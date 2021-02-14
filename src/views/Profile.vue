/* eslint-disable no-mixed-spaces-and-tabs */
<template>
  <v-main>
    <v-container>
      <ProfileBanner :profileData="user" :isProfile="isProfile" :isOP="false" />
      <v-row>
        <v-col cols="4">
          <v-card dark elevation="8">
            <v-tabs dark icons-and-text fixed-tabs>
              <v-tabs-slider></v-tabs-slider>
              <v-tab>
                <v-icon color="accent"> fas fa-id-card </v-icon>
              </v-tab>
              <v-tab>
                <v-icon color="accent"> fas fa-shoe-prints </v-icon>
              </v-tab>

              <v-tab-item>
                <v-card dark tile>
                  <v-card-title> About </v-card-title>
                  <v-card-text>
                    <h3>Member Since {{ user.createdAt }}</h3>
                    <br />
                    <v-divider></v-divider><br />
                    <div class="font-weight-bold">
                      Full Name – {{ user.name }}<br />
                      Username – {{ user.username }}<br />
                      Email – {{ user.email }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-card dark tile>
                  <v-card-title> Activity </v-card-title>
                  <v-card-text>
                    <div
                      v-if="user.isPrivileged"
                      class="font-weight-bold ml-8 mb-2"
                    >
                      {{ user.totalCreatedSubForums }} SubForums Created<br />
                    </div>
                    <div class="font-weight-bold ml-8 mb-2">
                      {{ user.totalJoinedSubForums }} SubForums Joined<br />
                      {{ user.totalCreatedPosts }} Posts Created<br />
                    </div>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
        <v-col>
          <Feed :feedData="posts" :showAction="true" />
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import axios from "axios";
import store from "../store/store";
import moment from "moment";
import ProfileBanner from "../components/ProfileBanner";

import Feed from "../components/Feed";

export default {
  name: "Profile",
  components: {
    ProfileBanner,
    Feed,
  },
  computed: {
    loggedUser: {
      get: () => {
        return store.getters.loggedUser;
      },
    },
  },
  data: () => ({
    user: {},
    posts: [],
    isProfile: false,
  }),
  watch: {
    "$route.params": {
      handler(newValue) {
        const { username } = newValue;
        this.getProfile(username);
      },
      immediate: true,
    },
  },
  methods: {
    async getProfile() {
      if (
        this.$route.params.username !==
        (await store.getters.loggedUser.username)
      ) {
        try {
          const profileResponse = await axios.get(
            `${process.env.VUE_APP_BASE_API_URL}/u/${this.$route.params.username}`,
            {
              withCredentials: true,
            }
          );
          const postResponse = await axios.get(
            `${process.env.VUE_APP_BASE_API_URL}/u/posts/${this.$route.params.username}`,
            {
              withCredentials: true,
            }
          );
          console.log("created subforums: ", profileResponse.data.createdSubForums);
          this.user = {
            ...profileResponse.data,
            totalCreatedSubForums: profileResponse.data.createdSubForums,
            totalJoinedSubForums: profileResponse.data.joinedSubForums.length,
            totalCreatedPosts: profileResponse.data.createdPosts.length,
            createdAt: moment(profileResponse.data.createdAt).format("ll"),
          };
          this.isProfile =
            this.loggedUser.username ===
            this.$router.currentRoute.params.username;
          this.posts = postResponse.data.createdPosts;
          this.posts.forEach((post) => {
            post.avatarURL = this.user.dpURL;
            post.time = moment(post.createdAt).format("ll");
          });
        } catch (error) {
          console.log(error);
        }
      } else {
        this.user = await store.getters.loggedUser;
        this.isProfile =
          this.loggedUser.username ===
          this.$router.currentRoute.params.username;
        try {
          const postData = await axios.get(
            `${process.env.VUE_APP_BASE_API_URL}/u/posts/${this.user.username}`,
            {
              withCredentials: true,
            }
          );
          this.posts = postData.data.createdPosts;
          this.posts.forEach((post) => {
            post.avatarURL = this.user.dpURL;
            const dateTime = moment.utc(post.createdAt).local().format();
            post.time = moment(dateTime).fromNow();
          });
        } catch (error) {
          if (error.response.status === 401)
            await store.commit("setUnauthorizedError", true);
          console.log(error);
        }
      }
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Archivo&display=swap");
</style>
