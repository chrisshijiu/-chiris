import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import BaiduMap from 'vue-baidu-map'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VuePreview from 'vue-photo-preview'
import 'vue-photo-preview/dist/skin.css'
import VueAxios from 'vue-axios'
import createAxios from '@/api/axios'
import '@/common/stylus/index.styl'
import VueLazyload from 'vue-lazyload'

Vue.use(VueLazyload, {
  preLoad: 1.5,
  error: require('@/common/images/default.png'),
  loading: require('@/common/images/default.png'),
  listenEvents: [ 'scroll' ]
})
Vue.use(VuePreview)
Vue.use(ElementUI)
Vue.use(BaiduMap, {
  ak: 'VVhWKQn3rAlaaSPKVjX47sdx8kSoPrsw'
})

// axios
const axios = createAxios(router)
Vue.use(VueAxios, axios)
Vue.config.productionTip = false
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

// 全局导航钩子
router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    if (localStorage.getItem('displayName')) {
      next({
        path: '/map'
      })
    } else {
      next()
    }
  } else {
    next()
  }
})
