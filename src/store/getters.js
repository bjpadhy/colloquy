exports.getters ={
    loggedUser: (state) => {
      return state.user;
    },
    unauthorizedError: (state) => {
      return state.unauthorizedError;
    },
    loginState: (state) => {
      return state.loginState;
    },
    subscriptions: (state) => {
      return state.subscriptions;
    }
}