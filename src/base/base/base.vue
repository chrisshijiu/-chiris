<template>
  <div class="base_container">
    <el-container class="is-vertical">
      <m-header v-show="!fullScreen"></m-header>
      <transition name="slide">
        <el-main>
          <router-view @stretch="handleFullScreen" @pack="handleClick"></router-view>
        </el-main>
      </transition>
      <m-footer v-show="!fullScreen"></m-footer>
    </el-container>
  </div>
</template>
<script>
import MHeader from '@/base/m-header/m-header'
import MFooter from '@/base/m-footer/m-footer'
import {mapMutations} from 'vuex'
export default {
  data () {
    return {
      fullScreen: false
    }
  },
  methods: {
    handleFullScreen () {
      this.fullScreen = true
      this.setFullScreen(this.fullScreen)
    },
    handleClick () {
      this.fullScreen = false
      this.setFullScreen(this.fullScreen)
    },
    ...mapMutations({
      setFullScreen: 'SET_FULLSCREEN'
    })
  },
  components: {
    MHeader,
    MFooter
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
.el-main
  height calc(100% - 106px)
.toggle_nav
  position absolute
  right 160px
  top -10px
  z-index 101
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s;
}
.fade-enter, .fade-leave-to {
  opacity: 0
}
.slide-enter-active, .slide-leave-active {
  transition: transform 0.8s;
}
.slide-enter, .slide-leave-to {
  transform: translateY(-88px)
}
</style>
