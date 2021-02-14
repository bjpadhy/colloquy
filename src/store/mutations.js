exports.mutations = {
    setUser(state, payload) {
      state.user = {...payload};
    },
    setLoginState(state, payload) {
      state.loginState = payload;
    },
    setUnauthorizedError(state, payload) {
      state.unauthorizedError = payload;
    },
    setSubscriptions(state, payload) {
      state.subscriptions = payload;
    },
    resetAll(state){
      state.user = {},
      state.subscriptions = [],
      state.unauthorizedError = false,
      state.loginState = false
    }
}