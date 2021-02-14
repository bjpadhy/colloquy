<template>
  <v-app id="app">
    <Appbar />

    <router-view class="surface"></router-view>
    <v-snackbar v-model="unauthorizedError" timeout="2000">
      Please register or Login to continue!
      <template v-slot:action="{ attrs }">
        <v-btn color="red" text v-bind="attrs" @click="setUnauthorizedError">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script>
import Appbar from "./components/Appbar";
import store from "./store/store";

export default {
  name: "App",
  components: {
    Appbar,
  },
  computed: {
    unauthorizedError: {
      get: () => {
        return store.getters.unauthorizedError;
      },
      set: () => {
        return store.commit("setUnauthorizedError", false);
      }
    },
  },
  data: () => ({
    //
  }),
  methods: {
    async setUnauthorizedError() {
      await store.commit("setUnauthorizedError", false);
    },
  },
};
</script>

<style lang="scss">
@import url("https://fonts.googleapis.com/css2?family=Maven+Pro:wght@400;500;600&display=swap");
@import url("https://fonts.googleapis.com/css2?family=Archivo&display=swap");
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
}
a {
  text-decoration: none;
}
</style>
