<template>
  <v-sheet v-if="feedData.length > 0" class="mx-auto surface" rounded="lg">
    <v-card
      v-for="(data, index) in feedData"
      :key="index"
      color="secondary"
      elevation="6"
      style="margin-bottom: 20px"
    >
      <v-row>
        <v-col cols="1" align-self="center" style="margin-left: 30px">
          <v-row>
            <v-btn
              class="ma-2"
              text
              icon
              color="accent"
              @click="vote(data, 'up')"
            >
              <v-icon>mdi-arrow-up-thick</v-icon>
              <span class="subheading">{{ data.upvotes }}</span>
            </v-btn>
          </v-row>
          <v-row>
            <v-btn
              class="ma-2"
              text
              icon
              color="red"
              @click="vote(data, 'down')"
            >
              <v-icon>mdi-arrow-down-thick</v-icon>
              <span class="subheading">{{ data.downvotes }}</span>
            </v-btn>
          </v-row>
          <v-row>
            <v-btn
              class="ma-2"
              disabled
              text
              icon
              style="color: green !important"
              color="accent_2"
            >
              <v-icon style="color: green !important">mdi-message-text</v-icon>
              <span class="subheading">{{ data.comments.length }}</span>
            </v-btn>
          </v-row>
        </v-col>
        <v-col style="margin-left: -30px">
          <div class="d-flex flex-no-wrap justify-space-between">
            <div>
              <v-card-subtitle style="margin-left: -11px">
                <v-avatar class="ma-3" size="24">
                  <v-img :src="data.avatarURL"></v-img>
                </v-avatar>
                <router-link
                  :to="{
                    name: 'subforum',
                    params: { subForum: data.subForum },
                  }"
                  style="color: #678d58"
                  >s/{{ data.subForum }}</router-link
                >
                • Posted by
                <router-link
                  :to="{ name: 'user', params: { username: data.OP } }"
                  style="color: #3185fc"
                  >u/{{ data.OP }}</router-link
                >
                {{ data.time }}
                <span v-if="data.isAnnouncement">
                  •
                  <v-chip small outlined label color="red">
                    Announcement
                  </v-chip>
                </span>
                <span v-if="isOP">
                  •
                  <v-btn @click="pinPost(data)" icon text>
                    <v-icon
                      v-if="!data.isPinned"
                      color="accent"
                      class="pa-2"
                      dense
                      style="transform: rotate(45deg)"
                    >
                      fa-thumbtack
                    </v-icon>
                    <v-icon v-else color="accent" class="pa-2" dense
                      >fa-thumbtack</v-icon
                    >
                  </v-btn>
                </span>
                <span v-else-if="data.isPinned && showPin">
                  •
                  <v-icon color="accent" class="pa-2" dense
                    >fa-thumbtack</v-icon
                  >
                </span>
              </v-card-subtitle>

              <v-card-text>
                <v-list-item-title>
                  <p class="display-1 text--primary">{{ data.title }}</p>
                </v-list-item-title>

                <div class="text--primary">
                  {{ data.body }}
                </div>

                <v-row :v-if="data.media.length">
                  <v-col v-for="(image, index) in data.media" :key="index">
                    <v-img
                      max-height="100"
                      max-width="200"
                      :src="image"
                      :lazy-src="image"
                      :alt="data.title"
                      class="grey lighten-2"
                    >
                      <template v-slot:placeholder>
                        <v-row
                          class="fill-height ma-0"
                          align="center"
                          justify="center"
                        >
                          <v-progress-circular
                            indeterminate
                            color="accent"
                          ></v-progress-circular>
                        </v-row>
                      </template>
                    </v-img>
                  </v-col>
                </v-row>
                <v-row
                  :v-if="data.externalLink !== ''"
                  class="fill-height ma-0"
                  align="center"
                  justify="center"
                  style="padding-top: 15px;max-height=250px"
                >
                  <link-prevue :url="data.externalLink" :apiUrl="`http://api.linkpreview.net/?key=b2e1a54f64be594d238029afbadfc6bd&q=${data.externalLink}`">
                    <template slot-scope="props">
                      <v-card
                        color="secondary"
                        max-width="500px"
                        link
                        @click="openURL(data.externalLink)"
                        style="padding: 15px"
                      >
                        <v-avatar>
                          <v-img :src="props.img" :alt="props.title"></v-img>
                        </v-avatar>
                        <v-card-title> {{ props.title }} </v-card-title>
                        <v-card-text>
                          {{ props.description }}
                        </v-card-text>
                      </v-card>
                    </template>
                  </link-prevue>
                </v-row>
              </v-card-text>

              <v-card-actions style="margin-left: -5px" v-if="showAction">
                <v-btn
                  class="ma-2"
                  text
                  small
                  outlined
                  color="accent_2"
                  link
                  :to="{ name: 'post', query: { postid: data._id } }"
                >
                  Show More
                </v-btn>
              </v-card-actions>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-card>
  </v-sheet>
  <v-sheet v-else dark class="mx-auto surface" rounded="lg">
    <v-card dark class="pa-md-4 mx-lg-auto" height="300px">
      <div class="d-flex flex-no-wrap justify-center mt-16">
        <img height="125" width="130" src="@/assets/shrug.svg" />
        <div class="mt-5">
          <v-card-text>
            <h2>Nothing to see here</h2>
            <p>Add a post to make some noise</p>
          </v-card-text>
        </div>
      </div>
    </v-card>
  </v-sheet>
</template>

<script>
import LinkPrevue from "link-prevue";
import axios from "axios";
import store from "../store/store";

export default {
  name: "Feed",
  props: {
    feedData: Array,
    showAction: Boolean,
    isOP: Boolean,
    showPin: Boolean
  },
  components: {
    LinkPrevue,
  },
  data: () => ({
    //
  }),
  methods: {
    openURL(url) {
      this.$windowObj.open(url, "_blank");
    },
    async vote(post, type) {
      const postIndex = this.feedData.indexOf(post);
      const previousVote = this.feedData[postIndex].voted;
      var voteType = type;
      if (previousVote !== voteType) {
        if (previousVote === "up" && voteType === "down") {
          voteType = "upOld";
          this.feedData[postIndex].upvotes -= 1;
        } else if (previousVote === "down" && voteType === "up") {
          voteType = "upNew";
          this.feedData[postIndex].downvotes -= 1;
        }
        try {
          await axios.post(
            `${process.env.VUE_APP_BASE_API_URL}/s/post/vote?postid=${post._id}&vote=${voteType}`,
            null,
            {
              withCredentials: true,
            }
          );
          this.feedData[postIndex].voted = type;
          type === "up"
            ? (this.feedData[postIndex].upvotes += 1)
            : (this.feedData[postIndex].downvotes += 1);
        } catch (error) {
          if (error.response.status === 401)
            await store.commit("setUnauthorizedError", true);
          console.log(error);
        }
      }
    },
    async pinPost(post) {
      console.log(post);
      try {
        const pinResponse = await axios.patch(
          `${process.env.VUE_APP_BASE_API_URL}/s/post/${post.subForum}/editstatus?postid=${post._id}`,
          null,
          {
            withCredentials: true,
          }
        );
        console.log(pinResponse);
        post.isPinned = !post.isPinned;
        location.reload();
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>