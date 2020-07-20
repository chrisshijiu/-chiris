<template>
  <div class="header">
    <el-header height="71px">
      <div class="header_left left">
        <div class="head_title_wrapper">
          <!--<i class="head_title_icon"></i>-->
          <span>综合监测预警平台</span>
        </div>
      </div>
      <div class="head_nav_wrapper right">
        <el-menu
          mode="horizontal"
          :default-active="defaultActive"
          background-color="transparent"
          active-text-color="#1a6db6"
          @select="handleSelect"
          router>
          <el-menu-item
            index="/map"
            @mouseenter.native="handleEnter(1)"
            @mouseleave.native="handleLeave"
            :class="{'current':currentIndex==1}">
            <i class="bg_icon map_icon"></i>
            <span slot="title">地图展示</span>
          </el-menu-item>
          <el-submenu
            index="/"
            @mouseenter.native="handleEnter(2)"
            @mouseleave.native="handleLeave"
            :class="{'current':currentIndex==2}">
            <template slot="title">
              <i class="bg_icon warning_icon"></i>
              <span>监测预警</span>
            </template>
            <el-menu-item
              index="/monitorData"
              @mouseenter.native="handleEnter(2)"
              @mouseleave.native="handleLeave">
              监测数据
            </el-menu-item>
            <el-menu-item
              index="/warningData"
              @mouseenter.native="handleEnter(2)"
              @mouseleave.native="handleLeave">
              警报信息
            </el-menu-item>
            <el-submenu
              index="2"
              v-if="hasVideo"
              @mouseenter.native="handleEnter(2)"
              @mouseleave.native="handleLeave"
              :class="{'current':currentIndex==2}">
              <template slot="title">
                <i class="bg_icon equipment_icon"></i>
                <span>视频监控</span>
              </template>
              <el-menu-item
                index="/video"
                @mouseenter.native="handleEnter(2)"
                @mouseleave.native="handleLeave">
                实时视频
              </el-menu-item>
              <el-menu-item
                v-if="hasVideo"
                index="/pictures"
                @mouseenter.native="handleEnter(2)"
                @mouseleave.native="handleLeave">
                历史图片
              </el-menu-item>
            </el-submenu>
            <el-menu-item
              index="/excelExport"
              @mouseenter.native="handleEnter(2)"
              @mouseleave.native="handleLeave">
              导出数据
            </el-menu-item>
          </el-submenu>
          <el-submenu
            index="3"
            @mouseenter.native="handleEnter(3)"
            @mouseleave.native="handleLeave"
            :class="{'current':currentIndex==3}">
            <template slot="title">
              <i class="bg_icon equipment_icon"></i>
              <span>设备管理</span>
            </template>
            <el-menu-item
              index="/tower"
              @mouseenter.native="handleEnter(3)"
              @mouseleave.native="handleLeave">
              杆塔管理
            </el-menu-item>
            <el-menu-item
              index="/line"
              @mouseenter.native="handleEnter(3)"
              @mouseleave.native="handleLeave">
              线路管理
            </el-menu-item>
            <el-menu-item
              index="/device"
              @mouseenter.native="handleEnter(3)"
              @mouseleave.native="handleLeave">
              监测设备
            </el-menu-item>
            <el-menu-item
              index="/sensor"
              @mouseenter.native="handleEnter(3)"
              @mouseleave.native="handleLeave">
              传感器
            </el-menu-item>
          </el-submenu>
          <el-menu-item
            index="/organization"
            @mouseenter.native="handleEnter(5)"
            @mouseleave.native="handleLeave"
            :class="{'current':currentIndex==5}">
            <i class="bg_icon system_icon"></i>
            <span slot="title">机构管理</span>
          </el-menu-item>
          <el-submenu
            index="/setting"
            @mouseenter.native="handleEnter(4)"
            @mouseleave.native="handleLeave"
            :class="{'current':currentIndex==4}">
            <template slot="title">
              <i class="bg_icon user_icon"></i>
              <span slot="title">用户信息</span>
            </template>
            <el-menu-item
              index="/personcenter"
              @mouseenter.native="handleEnter(4)"
              @mouseleave.native="handleLeave">
              个人中心
            </el-menu-item>
            <el-menu-item
              index="/accountConfig"
              @mouseenter.native="handleEnter(4)"
              @mouseleave.native="handleLeave">
              通知设置
            </el-menu-item>
            <el-menu-item
              index=""
              @click="handleLogout"
              @mouseenter.native="handleEnter(4)"
              @mouseleave.native="handleLeave"
              :class="{'current':currentIndex==4}">
              退出登录
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <div class="help_wrapper right">
        <div class="help main_help_icon" @click='handleHelp' v-show="!hasVideo || ($route.path !== '/monitorData' && $route.path !== '/video')">
        </div>
      </div>
      <div class="user_wrapper right">
        <div class="user">
          <i class="company_icon"></i>
          <span><a href='#' @click.prevent='showPersonCenter'>{{displayName}}</a></span>
        </div>
      </div>
    </el-header>
    <el-dialog
      :visible.sync="showHelpMessage"
      :close-on-click-modal="false"
      width="75%"
      center>
      <div class="stepline_wrapper">
        <div class="step" :class="'step' + item.key"  v-for="item in steps" :key="item.key" @click="handleStepClick(item.key)">
          <div class="circle_icon" :class="{'current':currentStep==item.key}"></div>
          <span class="font" :class="{'current':currentStep==item.key}">{{item.content}}</span>
        </div>
      </div>
      <div class="content_wrapper" @scroll="handleScroll" ref="content">
        <div class="img_blue" v-for="item in basedata" :key="item.id">
          <div class="top_bar" v-if="item.id === 1">
            <div class="main_title">操作指引 — <span class="title">数据准备</span></div>
            <img :src="getImage('topbar_blue.png')" alt="" width="100%" height="100%">
          </div>
          <div class="title"><span>{{item.id}}</span>{{item.title}}</div>
          <div class="content">
            <img :src="getImage('basedata_' + item.id + '.jpg')" alt=""  width="100%" height="100%">
          </div>
        </div>
        <div class="img_green">
          <div class="top_bar">
            <div class="main_title">操作指引 — <span class="title">图标介绍</span></div>
            <img :src="getImage('topbar_green.png')" alt="" width="100%" height="100%">
          </div>
          <div class="title"></div>
          <div class="content">
            <img :src="getImage('iconinfo.jpg')" alt=""  width="100%" height="100%">
          </div>
        </div>
        <div class="img_blue" v-for="item in getInterval" :key="item.id + 12">
          <div class="top_bar" v-if="item.id === 1">
            <div class="main_title">操作指引 — <span class="title">采集间隔</span></div>
            <img :src="getImage('topbar_blue.png')" alt="" width="100%" height="100%">
          </div>
          <div class="title"><span>{{item.id}}</span>{{item.title}}</div>
          <div class="content">
            <img :src="getImage('getInterval_' + item.id + '.jpg')" alt=""  width="100%" height="100%">
          </div>
        </div>
        <div class="img_green" v-for="item in warnSetting" :key="item.id + 17">
          <div class="top_bar" v-if="item.id === 1">
            <div class="main_title">操作指引 — <span class="title">警报设置</span></div>
            <img :src="getImage('topbar_green.png')" alt="" width="100%" height="100%">
          </div>
          <div class="title"><span>{{item.id}}</span>{{item.title}}</div>
          <div class="content">
            <img :src="getImage('warnSetting_' + item.id + '.jpg')" alt=""  width="100%" height="100%">
          </div>
        </div>
        <div class="img_blue" v-for="item in msgSetting" :key="item.id + 21">
          <div class="top_bar" v-if="item.id === 1">
            <div class="main_title">操作指引 — <span class="title">通知设置</span></div>
            <img :src="getImage('topbar_blue.png')" alt="" width="100%" height="100%">
          </div>
          <div class="title"><span>{{item.id}}</span>{{item.title}}</div>
          <div class="content">
            <img :src="getImage('msgSetting_' + item.id + '.jpg')" alt=""  width="100%" height="100%">
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {getLogout} from '@/api/login'
import {ERR_OK} from '@/api/config'
import {mapGetters, mapMutations} from 'vuex'
export default {
  data () {
    return {
      currentStep: 1,
      currentIndex: 1,
      lastIndex: 0,
      showHelpMessage: false,
      hasVideo: false,
      activeName: 'first',
      steps: [
        { content: '数据准备', key: '1' },
        { content: '图标介绍', key: '2' },
        { content: '采集间隔', key: '3' },
        { content: '警报设置', key: '4' },
        { content: '通知设置', key: '5' }
      ],
      basedata: [
        {
          id: 1,
          title: '点击设备管理下的监测设备'
        },
        {
          id: 2,
          title: '点击界面中的新增按钮'
        },
        {
          id: 3,
          title: '在新增设备界面输入对应内容'
        },
        {
          id: 4,
          title: '点击设备管理下的传感器'
        },
        {
          id: 5,
          title: '点击界面中的新增按钮'
        },
        {
          id: 6,
          title: '在新增传感器界面输入对应内容'
        },
        {
          id: 7,
          title: '点击设备管理下的杆塔管理'
        },
        {
          id: 8,
          title: '点击界面中的新增按钮'
        },
        {
          id: 9,
          title: '在新增杆塔界面输入对应内容'
        },
        {
          id: 10,
          title: '点击界面中的配置按钮'
        },
        {
          id: 11,
          title: '点击杆塔配置页面的新增按钮'
        },
        {
          id: 12,
          title: '在新增界面输入对应内容'
        }
      ],
      getInterval: [
        {
          id: 1,
          title: '点击界面中的杆塔管理'
        },
        {
          id: 2,
          title: '点击界面中的查询按钮'
        },
        {
          id: 3,
          title: '点击界面中的配置按钮'
        },
        {
          id: 4,
          title: '点击界面中的修改按钮'
        },
        {
          id: 5,
          title: '在新增界面输入对应内容'
        }
      ],
      warnSetting: [
        {
          id: 1,
          title: '点击设备管理下的杆塔管理'
        },
        {
          id: 2,
          title: '点击界面中的配置按钮'
        },
        {
          id: 3,
          title: '点击界面中的修改按钮'
        },
        {
          id: 4,
          title: '在弹窗界面输入对应内容'
        }
      ],
      msgSetting: [
        {
          id: 1,
          title: '点击用户信息下的通知设置'
        },
        {
          id: 2,
          title: '点击界面中的修改按钮'
        },
        {
          id: 3,
          title: '在弹窗界面输入对应内容'
        }
      ]
    }
  },
  methods: {
    getImage (src) {
      return require('@/common/images/' + src)
    },
    handleLogout () {
      getLogout().then((res) => {
        if (res.state === ERR_OK) {
          this.setDisplayName('')
          localStorage.removeItem('showWarn')
          localStorage.removeItem('monitorTypes')
          this.$router.push('/login')
        }
      })
    },
    handleSelect (key, keypath) {
      switch ('/' + key.split('/')[1]) {
        case '/map':
          this.currentIndex = 1
          break
        case '/monitorData':
        case '/warningData':
        case '/video':
        case '/pictures':
        case '/excelExport':
          this.currentIndex = 2
          break
        case '/line':
        case '/tower':
        case '/device':
        case '/sensor':
          this.currentIndex = 3
          break
        case '/personcenter':
        case '/accountConfig':
        case '/setting':
          this.currentIndex = 4
          break
        case '/organization':
          this.currentIndex = 5
          break
        default:
          this.currentIndex = 0
          break
      }
      this.lastIndex = this.currentIndex
    },
    handleEnter (index) {
      this.currentIndex = index
    },
    handleLeave () {
      this.currentIndex = this.lastIndex
    },
    handleScroll (el) {
      let scrollTop = this.$refs.content.scrollTop
      let height = this.$refs.content.clientHeight
      if (scrollTop > 0 && scrollTop < height * 12 - 100) {
        this.currentStep = 1
      } else if (scrollTop >= height * 12 - 100 && scrollTop < height * 13 - 100) {
        this.currentStep = 2
      } else if (scrollTop >= height * 13 - 100 && scrollTop < height * 18 - 100) {
        this.currentStep = 3
      } else if (scrollTop >= height * 18 - 100 && scrollTop < height * 22 - 100) {
        this.currentStep = 4
      } else if (scrollTop >= height * 22 - 100) {
        this.currentStep = 5
      }
    },
    handleStepClick (key) {
      let height = this.$refs.content.clientHeight
      switch (key) {
        case '1':
          this.$refs.content.scrollTop = 1
          break
        case '2':
          this.$refs.content.scrollTop = height * 12
          break
        case '3':
          this.$refs.content.scrollTop = height * 13
          break
        case '4':
          this.$refs.content.scrollTop = height * 18
          break
        case '5':
          this.$refs.content.scrollTop = height * 22
          break
      }
    },
    handleHelp () {
      this.showHelpMessage = true
    },
    showPersonCenter () {
      this.$router.push('/personcenter')
    },
    ...mapMutations({
      setDisplayName: 'SET_DISPLAYNAME'
    })
  },
  computed: {
    defaultActive: function () {
      return '/' + this.$route.path.split('/')[1]
    },
    ...mapGetters([
      'displayName'
    ])
  },
  watch: {
    $route: function (val, oldVal) {
      this.handleSelect(this.$route.path)
    }
  },
  mounted () {
    let monitorTypes = JSON.parse(localStorage.getItem('monitorTypes'))
    if (monitorTypes.filter(item => item.propertyKey === '5').length === 0) {
      this.hasVideo = false
    } else {
      this.hasVideo = true
    }
    this.handleSelect(this.$route.path)
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.el-header
  color #fff
  position relative
  bg-image-full('~@/common/images/header_right.png')
  .header_left
    bg-image-full('~@/common/images/header_left.png')
    background-position -100px
    width 605px
    height 65px
    .head_title_wrapper
      padding 15px 22px
      span
        /*font-size 21px*/
        font-size 28px
        font-family "MicrosoftYaHeiUI"
        font-weight bold
        color #064089
        letter-spacing 2px
        padding 8px 16px
        position absolute
        bottom 14px
      .head_title_icon
        width 186px
        height 34px
        display inline-block
        vertical-align text-bottom
        padding 0 10px
        bg-image-full('~@/common/images/logo.png')
  .head_nav_wrapper
    padding-right 10px
    ul
      z-index 101
    .el-menu.el-menu--horizontal
      border none
    .map_icon
      bg-image('~@/common/images/map.png')
    .warning_icon
      bg-image('~@/common/images/warning.png')
    .equipment_icon
      bg-image('~@/common/images/equipment.png')
    .system_icon
      bg-image('~@/common/images/system.png')
    .user_icon
      bg-image('~@/common/images/user.png')
      left 45px
    .el-menu-item.current
      background-color #fff!important
      color #1a6db6!important
      border none!important
      .map_icon
        bg-image('~@/common/images/map-current.png')
      .system_icon
        bg-image('~@/common/images/system-current.png')
  .help_wrapper
    .help
      font-size 18px
      position absolute
      bottom 7px
      right 615px
  .user_wrapper
    .user
      bg-color-full(#fff)
      border-radius 10px
      position absolute
      bottom 6px
      right 640px
      padding 0 9px
      font-size 13px
      letter-spacing 1px
      .company_icon
        width 20px
        height 20px
        display inline-block
        vertical-align bottom
        bg-image('~@/common/images/company.png')
      a
        color #1a6db6
  .head_userinfo_wrapper
    font-size 12px
    padding 20px
    i
      cursor pointer
      vertical-align middle
      margin 0 6px
.stepline_wrapper
  position absolute
  left 20px
  top 130px
  .circle_icon
    position absolute
    top 6px
    bg_icon('~@/common/images/circle.png', 9px, 9px)
  .circle_icon.current
    position absolute
    top -3px
    left -8px
    bg_icon('~@/common/images/circle_current.png', 26px, 26px)
  .step
    cursor pointer
    color #047ce6
    width 100px
    position absolute
    top 12px
    left 0
    .font
      color #1f3f58
      padding-left 30px
      font-size 13px
      letter-spacing 2px
    .font.current
      color #047ce6
  .step2
    top calc(4vw + 12px)
  .step3
    top calc(8vw + 12px)
  .step4
    top calc(12vw + 12px)
  .step5
    top calc(16vw + 12px)
  .step::after
    content ""
    display inline-block
    width 1px
    height 4vw
    background-color #047ce6
    position absolute
    top -1vw
    left 4px
.content_wrapper
  height 100%
  overflow auto
  .title
    text-align center
    padding 20px
    font-family monospace
    font-weight bold
    font-size 20px
    color #02192b
    letter-spacing 2px
    span
      font-family cursive
      font-size 38px
      color #027ee4
      font-weight bold
  .content
    margin 0 12%
  .top_bar
    width 50%
    height 2vw
    line-height 2vw
    margin 0 auto
    position relative
    color #ffffff
    .main_title
      position absolute
      left 50%
      transform translateX(-50%)
      font-size 18px
      letter-spacing 2px
      .title
        padding 0
        color #ffffff
        font-size 21px
  .img_green
    width 100%
    height 35vw
    bg-image-full('~@/common/images/background_green.jpg')
  .img_blue
    width 100%
    height 35vw
    bg-image-full('~@/common/images/background_blue.jpg')
  img
    display block
</style>
