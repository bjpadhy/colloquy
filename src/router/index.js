import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import SubForum from '../views/SubForum.vue'
import Post from '../views/Post.vue';
import Popular from '../views/Popular.vue';
import Recent from '../views/Recent.vue';
import store from "../store/store";

const isLoggedIn = store.state.loginState;

Vue.use(VueRouter)

// Initialize Router
const routes = [{
    path: "/",
    name: "homepage",
    component: Home
  },
  {
    path: "/u/:username",
    name: "user",
    component: Profile,
    beforeEnter: (to, from, next) => {
      if (!isLoggedIn) {
        store.commit("setUnauthorizedError", true);
        next({ name: 'homepage' });
      }
      else next()
    }
  },
  {
    path: "/s/:subForum",
    name: "subforum",
    component: SubForum,
    beforeEnter: (to, from, next) => {
      if (!isLoggedIn) {
        store.commit("setUnauthorizedError", true);
        next({ name: 'homepage' });
      }
      else next();
    }
  },
  {
    path: "/post",
    name: "post",
    component: Post,
    beforeEnter: (to, from, next) => {
      if (!isLoggedIn) {
        store.commit("setUnauthorizedError", true);
        next({ name: 'homepage' });
      }
      else next();
    }
  },
  {
    path: "/popular",
    name: "popular",
    component: Popular,
    beforeEnter: (to, from, next) => {
      if (!isLoggedIn) {
        store.commit("setUnauthorizedError", true);
        next({ name: 'homepage' });
      }
      else next();
    }
  },
  {
    path: "/recent",
    name: "recent",
    component: Recent,
    beforeEnter: (to, from, next) => {
      if (!isLoggedIn) {
        store.commit("setUnauthorizedError", true);
        next({ name: 'homepage' });
      }
      else next();
    }
  }
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router