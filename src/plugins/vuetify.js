import Vue from 'vue';
import Vuetify from 'vuetify/lib';
import '@fortawesome/fontawesome-free/css/all.css';

Vue.use(Vuetify);

export default new Vuetify({
    theme: {
        themes: {
            light: {
                primary: "#F6511D", // Red Orange
                secondary: "#D3D5D4", // Light Grey
                accent: "#3185FC", // Azure
                accent_2: "#678D58", // Russian Green
                surface: "#403F4C", // Dark Liver
                dark: "#121212"
            },
        },
    },
    icons: {
        iconfont: 'fa'
    },
});