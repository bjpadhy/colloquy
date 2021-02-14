/* eslint-disable no-mixed-spaces-and-tabs */
<template>
  <v-main>
    <v-container>
      <ProfileBanner :profileData="subforum" :isOP="isOP" :isProfile="false" />
      <v-row>
        <v-col cols="4">
          <v-card dark elevation="8">
            <v-tabs dark icons-and-text fixed-tabs>
              <v-tabs-slider></v-tabs-slider>
              <v-tab>
                <v-icon color="accent"> fa-id-card </v-icon>
              </v-tab>
              <v-tab>
                <v-icon color="accent"> fa-shield-alt </v-icon>
              </v-tab>

              <v-tab-item>
                <v-card dark tile>
                  <v-card-title> About </v-card-title>
                  <v-card-text>
                    <h3>Created on {{ subforum.createdAt }}</h3>
                    <br />
                    <v-divider class="pb-2"></v-divider>
                    <h3 class="py-2">Total Members: {{ members }}</h3>
                    <p v-if="subforum.isPrivate">Private SubForum</p>
                    <p v-else>Public SubForum</p>
                    <v-divider></v-divider><br />
                    <div class="font-weight-bold">
                      {{ subforum.description }}
                    </div>
                    <v-btn
                      class="pt-2"
                      label
                      small
                      color="accent"
                      v-if="!isMember"
                      @click="join"
                      >Join</v-btn
                    >
                    <v-dialog
                      v-model="subForumSettings"
                      persistent
                      max-width="500"
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-btn
                          v-if="isOP"
                          label
                          small
                          color="accent"
                          v-bind="attrs"
                          v-on="on"
                        >
                          <v-icon small>fa-cogs</v-icon
                          ><span class="ml-2">Edit</span>
                        </v-btn>
                      </template>
                      <v-card dark tile>
                        <v-card-title>SubForum Settings<br /></v-card-title>
                        <v-card-text>
                          <v-form>
                            <v-row
                              class="d-flex justify-start mb-8"
                              style="margin-left: 0px"
                            >
                              <div style="max-width: 250px"></div>
                            </v-row>
                            <v-text-field
                              v-model="subforum.title"
                              readonly
                              disabled
                              label="Title"
                            ></v-text-field>

                            <v-textarea v-model="subforum.description">
                              <template v-slot:label>
                                <div>Description</div>
                              </template>
                            </v-textarea>

                            <v-list-item>
                              <v-list-item-content>
                                <v-list-item-title>Rules</v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>

                            <v-list-item
                              v-for="(rule, index) in subforumRules"
                              :key="index"
                            >
                              <v-list-item-content>
                                <v-chip
                                  close
                                  outlined
                                  label
                                  color="red"
                                  small
                                  @click:close="alterRule(rule)"
                                  >{{ rule }}</v-chip
                                >
                              </v-list-item-content>
                            </v-list-item>

                            <v-row>
                              <v-col cols="2">
                                <v-btn @click="alterRule()" label text
                                  ><v-icon>mdi-plus</v-icon></v-btn
                                >
                              </v-col>
                              <v-col>
                                <v-text-field
                                  dense
                                  v-model="newRule"
                                  outlined
                                  :label="`Rule #${subforumRules.length + 1}`"
                                ></v-text-field>
                              </v-col>
                            </v-row>

                            <v-switch
                              v-model="subforum.isPrivate"
                              label="Private"
                              color="red"
                              inset
                            ></v-switch>
                          </v-form>
                          <v-row>
                            <v-col cols="12">
                              <v-chip
                                v-if="errorChip"
                                class="ma-2"
                                color="primary"
                                label
                                outlined
                                @click:close="errorChip = false"
                              >
                                {{ saveError }}
                              </v-chip>
                            </v-col>
                          </v-row>
                        </v-card-text>
                        <v-card-actions>
                          <v-spacer></v-spacer>
                          <v-btn
                            color="error"
                            :disabled="saving"
                            outlined
                            rounded
                            text
                            @click="subForumSettings = false"
                          >
                            Close
                          </v-btn>
                          <v-btn
                            color="accent"
                            outlined
                            :loading="saving"
                            :disabled="saving"
                            rounded
                            text
                            @click="saveSubForum"
                          >
                            Save
                          </v-btn>
                        </v-card-actions>
                      </v-card>
                    </v-dialog>
                    <v-row>
                      <v-col cols="12">
                        <v-chip
                          v-if="errorChip"
                          class="ma-2"
                          color="primary"
                          label
                          outlined
                          @click:close="errorChip = false"
                        >
                          {{ saveError }}
                        </v-chip>
                      </v-col>
                    </v-row>
                  </v-card-text>
                </v-card>
              </v-tab-item>
              <v-tab-item>
                <v-card dark tile>
                  <v-card-title> Rules </v-card-title>
                  <v-card-text>
                    <div class="font-weight-bold ml-8 mb-2">
                      <li v-for="(rule, index) in subforum.rules" :key="index">
                        {{ rule }}
                      </li>
                    </div>
                  </v-card-text>
                </v-card>
              </v-tab-item>
            </v-tabs>
          </v-card>
        </v-col>
        <v-col>
          <v-card dark color="surface" flat v-if="isMember">
            <v-tabs centered v-model="tabs">
              <v-tabs-slider></v-tabs-slider>
              <v-tab>
                <v-icon class="mr-3">fa-newspaper</v-icon> Timeline
              </v-tab>
              <v-tab>
                <v-icon class="mr-3">fa-bullhorn</v-icon> Announcements
              </v-tab>
            </v-tabs>
          </v-card>
          <v-tabs-items
            v-model="tabs"
            style="background-color: #403f4c"
            v-if="isMember"
          >
            <v-tab-item>
              <v-sheet class="pt-3" color="transparent">
                <Feed
                  :feedData="posts"
                  :showAction="true"
                  :isOP="isOP"
                  :showPin="true"
                />
              </v-sheet>
            </v-tab-item>
            <v-tab-item>
              <v-sheet class="pt-3" color="transparent">
                <Feed
                  :feedData="announcements"
                  :showAction="true"
                  :isOP="isOP"
                  :showPin="true"
                />
              </v-sheet>
            </v-tab-item>
          </v-tabs-items>
          <v-snackbar v-model="snackbar" timeout="6000">
            This is a private Sub-Forum. Please join to view posts.

            <template v-slot:action="{ attrs }">
              <v-btn color="blue" text v-bind="attrs" @click="snackbar = false">
                Close
              </v-btn>
            </template>
          </v-snackbar>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
var _ = require("lodash/array");
import axios from "axios";
import moment from "moment";
import ProfileBanner from "../components/ProfileBanner";
import Feed from "../components/Feed";
import store from "../store/store";

export default {
  name: "subforum",
  created() {
    this.getSubforum();
  },
  components: {
    ProfileBanner,
    Feed,
  },
  data: () => ({
    user: (function () {
      return store.getters.loggedUser;
    })(),
    subscriptions: (function () {
      return store.getters.subscriptions;
    })(),
    errorChip: false,
    saveError: "",
    newRule: "",
    saving: false,
    snackbar: false,
    subForumSettings: false,
    tabs: null,
    subforum: {},
    description: "",
    subforumRules: [],
    isPrivate: null,
    members: 0,
    isOP: true,
    posts: [],
    pinnedPosts: [],
    announcements: [],
    isMember: true,
  }),
  methods: {
    async getSubforum() {
      try {
        const subForumResponse = await axios.get(
          `${process.env.VUE_APP_BASE_API_URL}/s/${this.$route.params.subForum}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        this.subforum = {
          ...subForumResponse.data,
          createdAt: moment(subForumResponse.data.createdAt).format("ll"),
        };
        this.description = this.subforum.description;
        this.subforum.rules.forEach((rule) => this.subforumRules.push(rule));
        this.isPrivate = this.subforum.isPrivate;
        this.members = this.subforum.members.length;
        this.isMember = this.subforum.members.includes(this.user.username);
        if (!this.isMember && this.subforum.isPrivate) {
          this.snackbar = true;
        } else {
          subForumResponse.data.posts.forEach((post) => {
            post.avatarURL = this.subforum.dpURL;
            const dateTime = moment.utc(post.createdAt).local().format();
            post.time = moment(dateTime).fromNow();
          });
          this.posts = subForumResponse.data.posts;
          _.reverse(
            _.remove(this.posts, (post) => post.isPinned)
          ).forEach((post) => this.posts.unshift(post));
          this.announcements = _.remove(
            this.posts,
            (post) => post.isAnnouncement
          );
          this.isOP = this.subforum.OP === this.user.username;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async join() {
      try {
        await axios.post(
          `${process.env.VUE_APP_BASE_API_URL}/s/${this.$route.params.subForum}/join`,
          null,
          {
            withCredentials: true,
          }
        );
        this.isMember = true;
        this.subscriptions.push(this.subforum);
        await store.commit("setSubscriptions", this.subscriptions);
        location.reload();
      } catch (error) {
        console.log(error);
      }
    },
    alterRule(rule) {
      if (rule) {
        if (this.subforumRules.indexOf(rule) > -1)
          this.subforumRules.splice(this.subforumRules.indexOf(rule), 1);
      } else {
        if (this.newRule !== "") this.subforumRules.push(this.newRule);
      }
      this.newRule = "";
    },
    async saveSubForum() {
      this.saving = true;
      try {
        if (this.description !== this.subforum.description) {
          await axios.patch(
            `${process.env.VUE_APP_BASE_API_URL}/s/${this.subforum.title}/edit/description`,
            { description: this.subforum.description },
            {
              withCredentials: true,
            }
          );
        }
        if (this.subforum.rules !== this.subforumRules) {
          await axios.patch(
            `${process.env.VUE_APP_BASE_API_URL}/s/${this.subforum.title}/edit/rules`,
            { rules: this.subforumRules },
            {
              withCredentials: true,
            }
          );
        }
        if (this.isPrivate !== this.subforum.isPrivate) {
          await axios.patch(
            `${process.env.VUE_APP_BASE_API_URL}/s/${this.subforum.title}/edit/privacy`,
            null,
            {
              withCredentials: true,
            }
          );
        }
        this.subForumSettings = false;
        this.saving = false;
        location.reload();
      } catch (error) {
        if (Array.isArray(error.response.data.error))
          this.saveError = error.response.data.error[0];
        else this.saveError = error.response.data.error;
        this.errorChip = true;
      }
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Archivo&display=swap");
</style>
