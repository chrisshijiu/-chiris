<template>
  <div class="pictures full_container">
    <el-container>
      <el-header height="30px" v-show="!fullScreen">
        <location></location>
      </el-header>
      <el-container>
        <el-aside width="250px" v-show="!fullScreen">
          <side-tree @select="selectTowers"></side-tree>
        </el-aside>
        <el-main @scroll.native="handleScroll">
          <div class="option_wrapper" :style="{height: fullScreen ? '20px' : '50px',lineHeight: fullScreen ? '' : '66px'}">
            <el-button v-show="!fullScreen" class="option" size="mini" type="primary" icon="monitoring_icon" @click="handleInit">展示</el-button>
            <el-button class="option" size="mini" type="primary" icon="full_icon" @click="handleFullScreen">
              {{fullScreen ? '取消全屏' : '全屏'}}</el-button>
          </div>
          <div class="video_content">
            <!--视频窗口展示-->
            <video-config
              @hideWnd="handleHideWnd"
              @showWnd="handleShowWnd"
              :videoWidth="videoWidth"
              :videoHeight="videoHeight"
              v-for="item in videosData"
              :key="item.id"
              :ref="item.cameraDomId"
              :cameraDomId="item.cameraDomId"
              :title="item.title"
              :cameraCodeArr="item.cameraCodeArr"
              :resize="item.resize"
              :layout="item.layout"
              :hideWnd="item.hideWnd"
              :scroll="scroll" :type="0">
              </video-config>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import $ from 'jquery'
import SideTree from '@/base/export-side-tree/export-side-tree'
import location from '@/base/location/location'
import VideoConfig from '@/base/video-config/video-config'
import {getCameraCode} from '@/api/video-config'
import {ERR_OK} from '@/api/config'
import {mapGetters} from 'vuex'
export default {
  data () {
    return {
      isTower: false,
      scrollTop: 0,
      loading: false,
      towerIds: [],
      towers: [],
      scroll: false,
      videoHeight: ($(window).height() - 260) / 2 - 5 - 24,
      videoWidth: ($(window).width() - 330) / 3 - 8,
      videosData: []
    }
  },
  methods: {
    /**
     * 选择杆塔时初始化数据，请求时间轴数据
     *
     * @param { Object } tower 选择的杆塔对象
     */
    selectTowers (towerIds, companyId, towers) {
      this.towerIds = towerIds
      this.towers = towers
    },
    handleInit () {
      // 杆塔数大于6：显示九宫格，小于6：显示六宫格
      if (this.towerIds.length > 6) {
        this.videoHeight = ($(window).height() - 260) / 3 - 5 - 24
      } else {
        this.videoHeight = ($(window).height() - 260) / 2 - 5 - 24
      }
      // 取消勾选的杆塔，在页面中删除
      let deleteArr = []
      this.videosData.forEach((item, index) => {
        if (this.towerIds.indexOf(item.id) === -1) {
          deleteArr.unshift(index)
        }
      })
      if (deleteArr.length) {
        // 取消勾选后，视频数据要重新resize，否则样式会乱
        deleteArr.forEach(index => {
          this.videosData.splice(index, 1)
        })
        this.videosData.forEach(item => {
          item.resize = !item.resize
        })
      }
      let videos = this.videosData.map(item => item.id)
      this.towers.forEach(tower => {
        // 需要请求的杆塔
        if (videos.indexOf(tower.id) === -1) {
          let videoData = {}
          getCameraCode(tower.id).then(res => {
            if (res.state === ERR_OK) {
              let value = res.value
              if (value.code === ERR_OK) {
                let layout = '1x1'
                if (value.data.length > 1) {
                  layout = '2x2'
                }
                videoData = {
                  id: tower.id,
                  cameraDomId: `playWnd${tower.id}`,
                  title: tower.name,
                  resize: false,
                  cameraCodeArr: value.data,
                  layout: layout,
                  hideWnd: false
                }
                this.videosData.push(videoData)
              }
            }
          })
        }
      })
    },
    /**
     * 层级问题
     */
    handleHideWnd () {
      this.videosData.forEach(item => {
        item.hideWnd = true
      })
    },
    handleShowWnd () {
      this.videosData.forEach(item => {
        item.hideWnd = false
      })
    },
    /**
     * 全屏操作（使视频能伪全屏展示）
     */
    handleFullScreen () {
      if (this.fullScreen) {
        this.$emit('pack')
      } else {
        this.$emit('stretch')
      }
    },
    handleScroll () {
      this.scroll = !this.scroll
    }
  },
  watch: {
    /**
     * 视频高度变化时，重新设置宽高
     */
    'videoHeight': function (val, oldVal) {
      this.$nextTick(() => {
        this.videosData.forEach(item => {
          item.resize = !item.resize
        })
      })
    },
    /**
     * 全屏或非全屏时，给视频不同宽高
     */
    'fullScreen': function (val, oldVal) {
      if (val) {
        this.videoWidth = ($(window).width() - 80) / 3 - 8
        this.videoHeight = ($(window).height() - 100) / 3 - 5 - 24
      } else {
        this.videoWidth = ($(window).width() - 350) / 3 - 8
        if (this.towerIds.length > 6) {
          this.videoHeight = ($(window).height() - 260) / 3 - 5 - 24
        } else {
          this.videoHeight = ($(window).height() - 260) / 2 - 5 - 24
        }
      }
    }
  },
  beforeRouteLeave (to, from, next) {
    if (from.path === '/video') {
      if (!this.videosData.length) return next()
      this.$confirm('系统可能不会保存您所做的操作。', '离开此页面？', {
        cancelButtonClass: 'btn-custom-cancel',
        customClass: 'video',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        next()
      }).catch(() => {})
    }
  },
  computed: {
    valueFormat () {
      return 'yyyy-MM-dd'
    },
    ...mapGetters([
      'fullScreen'
    ])
  },
  components: {
    SideTree,
    location,
    VideoConfig
  },
  mounted () {
    $(window).resize(() => {
      // 点击全屏按钮后按F11，宽高重新设置
      if (this.fullScreen) {
        this.videoWidth = ($(window).width() - 80) / 3 - 8
        this.videoHeight = ($(window).height() - 100) / 3 - 5 - 24
      }
    })
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.pictures
  .el-container
    .el-container
      height calc(100% - 30px)
      padding 10px 10px 10px 0
      .el-aside
        margin-right 10px
        bg-color-full #fff
        box-shadow 0px 0px 6px #ededed
      .el-main
        bg-color-full #fff
        box-shadow 0px 0px 6px #ededed
        position relative
        .option_wrapper
          height 50px
          padding 10px 35px
        .video_content
          margin 10px 30px
.el-dialog__footer
  padding 20px !important
</style>
