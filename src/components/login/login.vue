<template>
  <div class="full_container login">
    <el-row>
      <el-col :offset='2' :span='22'>
        <div class="title">
          <!--<i class="title_icon"></i>-->
          <span class="title_after">综合监测预警平台</span>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span='7' :offset='15'>
        <div class="login_com">
          <p class="login_title1">用户登录</p>
          <p class="login_title2">USER LOGIN</p>
          <div class="login_username">
            <i slot="suffix" class="icon_username"></i>
            <span class="input_img"></span>
            <input
              placeholder="用户名"
              v-model="username"
              class="input_username"
              autocomplete="on"
              @blur='checkUsername'>
            <p ref="username">用户名称不能为空</p>
          </div>
          <div class="login_password">
            <i slot="suffix" class="icon_password"></i>
            <span class="input_img"></span>
            <input type="password"
              placeholder="密码"
              v-model="password"
              class="input_password"
              @blur='checkPassword' @keyup.enter="login">
            <p ref="password">用户密码不能为空</p>
          </div>
          <div class="login_checkbox">
            <label><input type="checkbox" v-model='checked' id="checkbtn"><label for="checkbtn"></label><p>记住用户名和密码</p></label>
          </div>
          <div class="login_btn">
            <el-button class="login_btn2" @click="login"><p>登录</p></el-button>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {getLogin} from '@/api/login'
import {getMonitorType} from '@/api/property'
import {ERR_OK} from '@/api/config'
import {Message} from 'element-ui'
import {mapMutations, mapActions} from 'vuex'
export default {
  data () {
    return {
      username: '',
      password: '',
      checked: false
    }
  },
  methods: {
    login () {
      if (!this.username || !this.password) {
        return
      }
      this.saveUser()
      getLogin({
        username: this.username,
        password: this.password
      }).then((res) => {
        if (res.state === ERR_OK) {
          let displayName = res.value.displayName ? res.value.displayName : res.value.username
          this.setDisplayName(displayName)
          let ou = res.value.ouId
          localStorage.setItem('ouId', ou)
          Message({
            type: 'success',
            message: '登录成功',
            duration: 1000
          })
          this.$router.push({ path: '/map' })
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    checkUsername () {
      this.$refs.username.style.visibility = this.username === '' ? 'visible' : 'hidden'
    },
    checkPassword () {
      this.$refs.password.style.visibility = this.password === '' ? 'visible' : 'hidden'
    },
    setCookie (name, value, day) {
      let date = new Date()
      date.setDate(date.getDate() + day)
      document.cookie = this._btoa(name) + '=' + this._btoa(value) + ';expires=' + date
    },
    getCookie (name) {
      let reg
      reg = RegExp(this._btoa(name) + '=([^;]+)')
      let arr = document.cookie.match(reg)
      if (arr) {
        return arr[1]
      } else {
        return ''
      }
    },
    delCookie (name) {
      this.setCookie(name, '', -1)
    },
    saveUser () {
      if (this.checked) {
        this.setCookie('username', this.username, 14)
        this.setCookie('password', this.password, 14)
      } else {
        this.delCookie('username')
        this.delCookie('password')
      }
    },
    _btoa (s) {
      let base64hash = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      let i = 0
      let prev
      let ascii
      let mod
      let result = []
      while (i < s.length) {
        ascii = s.charCodeAt(i)
        mod = i % 3
        switch (mod) {
          case 0:
            result.push(base64hash.charAt(ascii >> 2))
            break
          case 1:
            result.push(base64hash.charAt((prev & 3) << 4 | (ascii >> 4)))
            break
          case 2:
            result.push(base64hash.charAt((prev & 0x0f) << 2 | (ascii >> 6)))
            result.push(base64hash.charAt(ascii & 0x3f))
            break
        }
        prev = ascii
        i++
      }
      if (mod === 0) {
        result.push(base64hash.charAt((prev & 3) << 4))
        result.push('==')
      } else if (mod === 1) {
        result.push(base64hash.charAt((prev & 0x0f) << 2))
        result.push('=')
      }
      return result.join('')
    },
    _atob (s) {
      let base64hash = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
      s = s.replace(/\s|=/g, '')
      let cur
      let prev
      let mod
      let i = 0
      let result = []
      while (i < s.length) {
        cur = base64hash.indexOf(s.charAt(i))
        mod = i % 4
        switch (mod) {
          case 0:
            break
          case 1:
            result.push(String.fromCharCode(prev << 2 | cur >> 4))
            break
          case 2:
            result.push(String.fromCharCode((prev & 0x0f) << 4 | cur >> 2))
            break
          case 3:
            result.push(String.fromCharCode((prev & 3) << 6 | cur))
            break
        }
        prev = cur
        i++
      }
      return result.join('')
    },
    ...mapMutations({
      setDisplayName: 'SET_DISPLAYNAME'
    }),
    ...mapActions([
      'clearVuexList'
    ])
  },
  beforeRouteLeave (to, from, next) {
    if (from.path === '/login') {
      getMonitorType().then((res) => {
        if (res.state === ERR_OK) {
          localStorage.setItem('monitorTypes', JSON.stringify(res.value))
          return next()
        }
      })
    }
  },
  created () {
    this.clearVuexList()
    if (this.getCookie('username') && this.getCookie('password')) {
      let ckUsername = this.getCookie('username')
      let ckPassword = this.getCookie('password')
      this.username = this._atob(ckUsername)
      this.password = this._atob(ckPassword)
      this.checked = true
    }
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.login
 bg-image('~@/common/images/bglogin.png')
 background-size 100% 100%
 height 100%
 width 100%
 .title
  margin-top 5%
  .title_icon
    width 220px
    height 40px
    vertical-align text-bottom
    padding 0 20px
    display inline-block
    bg-image-full('~@/common/images/logo.png')
  span
    padding-left 8px
    letter-spacing 2px
  .title_after
    font-size 32px
    font-weight bold
    color #152b56
    font-family MiscrosoftYaHeiUI
    /*margin-left 16px*/
    margin-left 86px
 .login_com
  margin-top 120px
  .login_title1
    font-size 24px
    color #e5eeff
    font-family MiscrosoftYaHeiUI
  .login_title2
    font-size 15px
    color rgba(149,149,149,0.8)
    font-family ArialMT
  .login_username
    margin-top 40px
    position relative
    .icon_username
      bg-image('~@/common/images/user.png')
      width 30px
      height 30px
      position absolute
      left 20px
      top 11px
    .input_username
      position absolute
      top 0
      width 332px
      height 50px
      background-color transparent
      font-family MiscrosoftYaHeiUI
      font-size 16px
      color #ffffff
      padding-left 60px
    p
      font-size 14px
      padding-left 20px
      color #ed3f14
      padding-top 4px
      visibility hidden
  .login_password
    margin-top 21px
    position relative
    .icon_password
      bg-image('~@/common/images/password.png')
      width 30px
      height 30px
      position absolute
      left 20px
      top 11px
    .input_password
      position absolute
      top 0
      width 332px
      height 50px
      background-color transparent
      font-family MiscrosoftYaHeiUI
      font-size 16px
      color #ffffff
      padding-left 60px
    p
      font-size 14px
      padding-left 20px
      color #ed3f14
      padding-top 4px
      visibility hidden
  .login_checkbox
    margin-top 11px
    input
      width 8px
      height 20px
      vertical-align middle
      visibility hidden
    p
      font-size 16px
      color #ffffff
      display inline
      padding-left 10px
  .login_btn
    margin-top 30px
    .el-button
      bg-image('~@/common/images/login.png')
      width 380px
      margin 0 6px
    p
      font-size 24px
      color #ffffff
input::-webkit-input-placeholder
  font-family MiscrosoftYaHeiUI
  font-size 16px
  color #999999

.input_img
  bg-image('~@/common/images/loginInput.png')
  display block
  width 398px
  height 50px

#checkbtn + label
  display inline-block
  width 20px
  height 20px
  vertical-align middle
  bg-image('~@/common/images/checkbtn.png')

#checkbtn:checked + label
  display inline-block
  width 20px
  height 20px
  vertical-align middle
  bg-image('~@/common/images/checkactivebtn.png')

input:-webkit-autofill
  -webkit-text-fill-color #fff !important
  transition background-color 50000s ease-in-out 0s
</style>
