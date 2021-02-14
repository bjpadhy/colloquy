<template>
  <v-main>
    <v-container>
      <v-row>
        <v-col cols="3">
          <Sidebar />
        </v-col>

        <v-col>
          <v-progress-linear
            :active="loading"
            dark
            :indeterminate="loading"
            rounded
            height="6"
          ></v-progress-linear>
          <Feed :feedData="fetchedPosts"  :showAction='true'/>
        </v-col>
      </v-row>
    </v-container>
  </v-main>
</template>

<script>
import Sidebar from "../components/Sidebar.vue";
import Feed from "../components/Feed.vue";
import axios from "axios";
import moment from "moment";

export default {
  name: "Popular",
  created() {
    this.getFeed();
  },
  components: {
    Sidebar,
    Feed,
  },
  data: () => ({
    fetchedPosts: [],
    loading: false
  }),
  methods: {
    async getFeed() {
      this.loading = true;
      try {
        const response = await axios.get(
          `${process.env.VUE_APP_BASE_API_URL}/mostpopular`,
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
        response.data.forEach((post) => {
            const dateTime = moment.utc(post.createdAt).local().format();
            post.time = moment(dateTime).fromNow();
            this.fetchedPosts.push(post);
        });
        this.loading = false;
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Archivo&display=swap");
</style>
