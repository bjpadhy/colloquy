<template>
  <v-menu
    offset-y
    dark
    bottom
    left
    transition="scale-transition"
    rounded
    min-width="200px"
  >
    <template v-slot:activator="{ on: menu, attrs }">
      <v-tooltip bottom>
        <template v-slot:activator="{ on: tooltip }">
          <v-btn
            v-if="loginState"
            color="accent"
            label
            v-bind="attrs"
            v-on="{ ...tooltip, ...menu }"
            small
            text
            ><v-icon>mdi-plus</v-icon><v-icon>mdi-menu-down</v-icon></v-btn
          >
        </template>
        <span>Create</span>
      </v-tooltip>
    </template>
    <v-list>
      <v-dialog v-model="createPostDialog" persistent max-width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item link v-bind="attrs" v-on="on">
            <v-list-item-title> New Post </v-list-item-title>
          </v-list-item>
        </template>
        <v-card dark>
          <v-tabs dark fixed-tabs>
            <v-tabs-slider></v-tabs-slider>
            <v-tab> Text </v-tab>
            <v-tab> Link </v-tab>

            <v-tab-item>
              <v-card dark tile>
                <v-card-subtitle>
                  You are submitting a text-based post. Speak your mind. A title
                  is required, but expanding further in the text field is
                  not.</v-card-subtitle
                >
                <v-card-text>
                  <v-form>
                    <v-row
                      class="d-flex justify-start mb-8"
                      style="margin-left: 0px"
                    >
                      <h3 style="margin-top: 30px; padding-right: 20px">
                        Post in
                      </h3>
                      <div style="max-width: 250px; margin-top: 2px">
                        <v-autocomplete
                          v-model="postForm.subForum"
                          :items="subscriptions"
                          chip
                          label="SubForum"
                          item-text="title"
                          item-value="title"
                        >
                          <template v-slot:selection="data">
                            <v-chip
                              small
                              color="red"
                              label
                              outlined
                              v-bind="data.attrs"
                              :input-value="data.selected"
                              @click="data.select"
                            >
                              <v-avatar left>
                                <v-img :src="data.item.dpURL"></v-img>
                              </v-avatar>
                              {{ data.item.title }}
                            </v-chip>
                          </template>
                          <template v-slot:item="data">
                            <template>
                              <v-list-item-avatar>
                                <img :src="data.item.dpURL" />
                              </v-list-item-avatar>
                              <v-list-item-content>
                                <v-list-item-title
                                  v-html="data.item.title"
                                ></v-list-item-title>
                              </v-list-item-content>
                            </template>
                          </template>
                        </v-autocomplete>
                      </div>
                    </v-row>
                    <v-text-field
                      v-model="postForm.title"
                      label="Title"
                      required
                    ></v-text-field>

                    <v-textarea v-model="postForm.body">
                      <template v-slot:label>
                        <div>Text <small>(optional)</small></div>
                      </template>
                    </v-textarea>

                    <v-file-input
                      accept="image/*"
                      small-chips
                      show-size
                      prepend-icon="mdi-paperclip"
                      label="Add Image (Max 3)"
                      multiple
                      counter
                      v-model="postForm.media"
                    >
                      <template v-slot:selection="{ text }">
                        <v-chip label outlined color="accent">
                          {{ text }}
                        </v-chip>
                      </template>
                    </v-file-input>

                    <v-switch
                      v-model="postForm.isAnnouncement"
                      label="Announcement"
                      color="red"
                      inset
                    ></v-switch>

                    Please be mindful of the content you post.
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="error"
                    outlined
                    rounded
                    text
                    @click="createPostDialog = false"
                  >
                    Close
                  </v-btn>
                  <v-btn color="accent" outlined rounded text @click="savePost">
                    Create
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-tab-item>

            <v-tab-item>
              <v-card dark tile>
                <v-card-text>
                  <v-form>
                    <v-row
                      class="d-flex justify-start mb-8"
                      style="margin-left: 0px"
                    >
                      <h3 style="margin-top: 30px; padding-right: 20px">
                        Post in
                      </h3>
                      <div style="max-width: 250px; margin-top: 2px">
                        <v-autocomplete
                          v-model="postForm.subForum"
                          :items="subscriptions"
                          chip
                          label="SubForum"
                          item-text="title"
                          item-value="title"
                        >
                          <template v-slot:selection="data">
                            <v-chip
                              small
                              color="red"
                              label
                              outlined
                              v-bind="data.attrs"
                              :input-value="data.selected"
                              @click="data.select"
                            >
                              <v-avatar left>
                                <v-img :src="data.item.dpURL"></v-img>
                              </v-avatar>
                              {{ data.item.title }}
                            </v-chip>
                          </template>
                          <template v-slot:item="data">
                            <template>
                              <v-list-item-avatar>
                                <img :src="data.item.dpURL" />
                              </v-list-item-avatar>
                              <v-list-item-content>
                                <v-list-item-title
                                  v-html="data.item.title"
                                ></v-list-item-title>
                              </v-list-item-content>
                            </template>
                          </template>
                        </v-autocomplete>
                      </div>
                    </v-row>
                    <v-text-field
                      v-model="postForm.title"
                      label="Title"
                      required
                    ></v-text-field>

                    <v-text-field
                      v-model="postForm.externalLink"
                      label="URL"
                      required
                    ></v-text-field>

                    <v-switch
                      v-model="postForm.isAnnouncement"
                      label="Announcement"
                      color="red"
                      inset
                    ></v-switch>

                    Please be mindful of the content you post.
                  </v-form>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="error"
                    outlined
                    rounded
                    text
                    :disabled="creating"
                    @click="createPostDialog = false"
                  >
                    Close
                  </v-btn>
                  <v-btn
                    color="accent"
                    outlined
                    :loading="creating"
                    :disabled="creating"
                    rounded
                    text
                    @click="savePost"
                  >
                    Create
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-dialog>

      <!-- Create SubForum -->
      <v-dialog v-model="createSubForumDialog" persistent max-width="500">
        <template v-slot:activator="{ on, attrs }">
          <v-list-item v-if="user.isPrivileged" link v-bind="attrs" v-on="on">
            <v-list-item-title>New SubForum</v-list-item-title>
          </v-list-item>
        </template>
        <v-card dark tile>
          <v-card-title>New SubForum<br /></v-card-title>
          <v-card-subtitle>
            <br />You are creating a Sub-Forum. The best place to start a
            colloquy. A title <span style="color: red">without spaces</span> and
            description is required. You can edit the display picture and banner
            image from the Sub-Forum home page.</v-card-subtitle
          >
          <v-card-text>
            <v-form>
              <v-row class="d-flex justify-start mb-8" style="margin-left: 0px">
                <div style="max-width: 250px"></div>
              </v-row>
              <v-text-field
                v-model="subForumForm.title"
                label="Title"
                required
              ></v-text-field>

              <v-textarea v-model="subForumForm.description">
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
                v-for="(rule, index) in subForumForm.rules"
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
                    :label="`Rule #${subForumForm.rules.length + 1}`"
                  ></v-text-field>
                </v-col>
              </v-row>

              <v-switch
                v-model="subForumForm.isPrivate"
                label="Private"
                color="red"
                inset
              ></v-switch>

              Psssst. It's advisable to add a few posting rules!
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
              :disabled="creating"
              outlined
              rounded
              text
              @click="createSubForumDialog = false"
            >
              Close
            </v-btn>
            <v-btn
              color="accent"
              outlined
              :loading="creating"
              :disabled="creating"
              rounded
              text
              @click="saveSubForum"
            >
              Create
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-list>
  </v-menu>
</template>

<script>
import axios from "axios";
import store from "../store/store";

function initialState(form) {
  if (form)
    return {
      title: "",
      body: "",
      isAnnouncement: false,
      subForum: "",
      media: [],
      externalLink: "",
    };
  else
    return {
      title: "",
      description: "",
      rules: [],
      isPrivate: false,
    };
}
export default {
  name: "CreateMenu",
  computed: {
    subscriptions: {
      get: () => {
        return store.getters.subscriptions;
      },
    },
  },
  props: {
    loginState: Boolean,
    user: Object,
  },
  data: () => ({
    creating: false,
    errorChip: false,
    saveError: "",
    newRule: "",
    createSubForumDialog: false,
    createPostDialog: false,
    subForumForm: {
      title: "",
      description: "",
      rules: [],
      isPrivate: false,
    },
    postForm: {
      title: "",
      body: "",
      isAnnouncement: false,
      subForum: "",
      media: [],
      externalLink: "",
    },
  }),
  methods: {
    clearFormData(type) {
      Object.assign(this.postForm, initialState(type));
    },
    async savePost() {
      this.creating = true;
      try {
        let formData = new FormData();
        if (this.postForm.media.length > 0) {
          for (let image of this.postForm.media) {
            formData.append("media", image, image.name);
          }
        }
        formData.append("title", this.postForm.title);
        formData.append("body", this.postForm.body);
        formData.append("isAnnouncement", this.postForm.isAnnouncement);
        formData.append("subForum", this.postForm.subForum);
        formData.append("externalLink", this.postForm.externalLink);

        const postResponse = await axios.post(
          `${process.env.VUE_APP_BASE_API_URL}/s/post/create`,
          formData,
          {
            withCredentials: true,
          }
        );
        this.createPostDialog = false;
        this.clearFormData("post");
        this.creating = false;
        this.$router.push(`/post?postid=${postResponse.data._id}`);
      } catch (error) {
        console.log(error);
      }
    },
    alterRule(rule) {
      if (rule) {
        if (this.subForumForm.rules.indexOf(rule) > -1)
          this.subForumForm.rules.splice(
            this.subForumForm.rules.indexOf(rule),
            1
          );
      } else {
        if (this.newRule !== "") this.subForumForm.rules.push(this.newRule);
      }
      this.newRule = "";
    },
    async saveSubForum() {
      this.creating = true;
      try {
        const subforum = await axios.post(
          `${process.env.VUE_APP_BASE_API_URL}/s/create`,
          this.subForumForm,
          {
            withCredentials: true,
          }
        );
        this.createSubForumDialog = false;
        const subForum = this.subForumForm.title;
        this.clearFormData();
        this.subscriptions.push(subforum.data.savedData);
        await store.commit("setSubscriptions", this.subscriptions);
        this.creating = false;
        this.$router.push(`/s/${subForum}`);
      } catch (error) {
        this.creating = false;
        if (Array.isArray(error.response.data.error))
          this.saveError = error.response.data.error[0];
        else this.saveError = error.response.data.error;
        this.errorChip = true;
      }
    },
  },
};
</script>