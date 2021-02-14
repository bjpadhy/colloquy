<template>
  <v-main>
    <v-container>
      <v-progress-linear
        :active="loading"
        dark
        :indeterminate="loading"
        rounded
        height="6"
      ></v-progress-linear>
      <Feed :feedData="fetchedPost" />

      <v-card dark v-if="!loading">
        <v-card-text>
          <v-card light color="secondary" v-if="!fetchedPost[0].isAnnouncement">
            <v-card-text>
              <v-text-field
                v-model="message"
                append-outer-icon="mdi-send"
                outlined
                clear-icon="mdi-close-circle"
                clearable
                color="red"
                label="Comment"
                type="text"
                style="color: black"
                :loading="sendingComment"
                :disabled="sendingComment"
                @click:append-outer="sendComment"
                @click:clear="clearComment"
              ></v-text-field>
            </v-card-text>
            <v-card-subtitle style="margin-top: -50px; color: black">
              <small><sup>*</sup>Be mindful of other people's sentiments</small>
              <v-chip
                v-if="errorChip"
                class="ma-2"
                color="primary"
                label
                outlined
                close
                @click:close="errorChip = false"
              >
                {{ errorMessage }}
              </v-chip>
            </v-card-subtitle>
          </v-card>
          <v-card v-else class="pa-md-4 mx-lg-auto">
            <v-card-title>
            <v-card-text class="text-center">
              <h3>Comments are disabled on announcements <v-icon class="ml-2">fa-ban</v-icon></h3>
            </v-card-text>
            </v-card-title>
          </v-card>
          <v-timeline dense v-if="comments.length > 0">
            <v-timeline-item v-for="(comment, index) in comments" :key="index">
              <template v-slot:icon>
                <v-avatar>
                  <img :src="comment.OP.dpURL" />
                </v-avatar>
              </template>
              <v-card
                class="elevation-2"
                color="secondary"
                style="color: black"
              >
                <v-card-title class="headline-2">
                  <router-link
                    :to="{
                      name: 'user',
                      params: { username: comment.OP.username },
                    }"
                    style="color: #3185fc"
                    >u/{{ comment.OP.username }}</router-link
                  >
                </v-card-title>
                <v-card-subtitle style="color: black">
                  posted {{ comment.time }}
                </v-card-subtitle>
                <v-card-text style="color: black">{{
                  comment.body
                }}</v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card-text>
      </v-card>
    </v-container>
  </v-main>
</template>

<script>
import Feed from "../components/Feed.vue";
import axios from "axios";
import moment from "moment";
import store from "../store/store";
var postid;
export default {
  name: "post",
  created() {
    this.getPost();
  },
  computed: {
    user: {
      get: () => {
        return store.getters.loggedUser;
      },
    },
  },
  components: {
    Feed,
  },
  data: () => ({
    loading: true,
    sendingComment: false,
    fetchedPost: [],
    comments: [],
    message: "",
    errorChip: false,
    errorMessage: "",
  }),
  methods: {
    async getPost() {
      this.loading = true;
      postid = this.$router.currentRoute.query.postid;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_API_URL}/s/post/?postid=${postid}`,
          {
            withCredentials: true,
          }
        );
        const subForumResponse = await axios.get(
          `${process.env.VUE_APP_BASE_API_URL}/s/${response.data.subForum}`,
          {
            withCredentials: true,
          }
        );
        const dateTime = moment.utc(response.data.createdAt).local().format();
        response.data.time = moment(dateTime).fromNow();
        this.fetchedPost.push({
          ...response.data,
          avatarURL: subForumResponse.data.dpURL,
        });
        this.comments = this.fetchedPost[0].comments;
        this.comments.reverse();
        this.comments.forEach((comment) => {
          const dateTime = moment.utc(comment.createdAt).local().format();
          comment.time = moment(dateTime).fromNow();
        });
        this.loading = false;
      } catch (error) {
        if (error.response.status === 401)
          await store.commit("setUnauthorizedError", true);
        console.log(error.response.data.error);
      }
    },
    async sendComment() {
      if (this.message !== "") {
        this.sendingComment = true;
        const comment = {
          OP: {
            dpURL: this.user.dpURL,
            username: this.user.username,
          },
          body: this.message,
          time: moment().fromNow(),
        };
        this.comments.unshift(comment);
        try {
          await axios.post(
            `${process.env.VUE_APP_BASE_API_URL}/s/post/comment?postid=${postid}`,
            {
              body: this.message,
            },
            {
              withCredentials: true,
            }
          );
          this.clearComment();
          this.sendingComment = false;
        } catch (error) {
          console.log(error.response.data.error);
        }
      } else {
        this.errorMessage = "Comment cannot be empty";
        this.errorChip = true;
      }
    },
    clearComment() {
      this.message = "";
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Archivo&display=swap");
</style>
