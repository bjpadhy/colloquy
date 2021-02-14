<template>
  <v-card dark class="justify space-around" min-height="400px">
    <v-progress-circular
      class="justify center"
      v-if="isUploading"
      indeterminate
      color="accent"
    ></v-progress-circular>
    <v-img :src="profileData.bannerURL" max-height="400px" v-if="!isUploading">
      <div class="fill-height bottom-gradient">
        <v-row align="end" class="fill-height">
          <v-col align-self="start" class="pa-7" cols="12">
            <v-avatar class="profile" size="164" color="grey">
              <v-progress-circular
                v-if="isUploading"
                indeterminate
                color="accent"
              ></v-progress-circular>
              <v-img :src="profileData.dpURL" v-if="!isUploading">
                <v-file-input
                  v-if="isOP || isProfile"
                  accept="image/*"
                  class="ml-8"
                  hide-input
                  prepend-icon="mdi-camera"
                  v-model="dpImage"
                  @change="addDP"
                >
                </v-file-input>
              </v-img>
            </v-avatar>
          </v-col>
          <v-col>
            <v-list-item color="rgba(0, 0, 0, .4)" dark>
              <v-list-item-content>
                <v-file-input
                  v-if="isOP || isProfile"
                  accept="image/*"
                  color="accent"
                  hide-input
                  prepend-icon="mdi-camera"
                  v-model="bannerImage"
                  @change="addBanner"
                >
                </v-file-input>
                <v-list-item-title v-if="profileData.name" class="title">
                  {{ profileData.name }}
                </v-list-item-title>
                <v-list-item-title v-else class="title">
                  {{ profileData.title }}
                  <p class="body-2">
                      by
                      <router-link
                        :to="{
                          name: 'user',
                          params: { username: profileData.OP },
                        }"
                        style="color: #3185fc"
                        >u/{{ profileData.OP }}</router-link
                      >
                  </p>
                </v-list-item-title>
                <v-list-item-subtitle v-if="profileData.batch">{{
                  profileData.batch
                }}</v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-col>
        </v-row>
      </div>
    </v-img>
  </v-card>
</template>

<script>
import axios from "axios";

export default {
  name: "ProfileBanner",
  props: {
    profileData: Object,
    isProfile: Boolean,
    isOP: Boolean,
  },
  data: () => ({
    isUploading: false,
    dpImage: {},
    bannerImage: {},
  }),
  methods: {
    async addDP() {
      this.isUploading = true;
      const url =
        this.$router.currentRoute.name === "user"
          ? "/u/edit/dp"
          : `/s/${this.profileData.title}/edit/dp`;
      try {
        let formData = new FormData();
        formData.append("image", this.dpImage, this.dpImage.name);
        const dpResponse = await axios.patch(
          `${process.env.VUE_APP_BASE_API_URL}${url}`,
          formData,
          {
            withCredentials: true,
          }
        );
        this.profileData.dpURL = dpResponse.data.dpURL;
        this.isUploading = false;
      } catch (error) {
        console.log(error);
      }
    },
    async addBanner() {
      this.isUploading = true;
      const url =
        this.$router.currentRoute.name === "user"
          ? "/u/edit/banner"
          : `/s/${this.profileData.title}/edit/banner`;
      try {
        let formData = new FormData();
        formData.append("image", this.bannerImage, this.bannerImage.name);
        const dpResponse = await axios.patch(
          `${process.env.VUE_APP_BASE_API_URL}${url}`,
          formData,
          {
            withCredentials: true,
          }
        );
        this.profileData.bannerURL = dpResponse.data.bannerURL;
        this.isUploading = false;
      } catch (error) {
        console.log(error);
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