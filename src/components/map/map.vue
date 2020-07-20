<template>
  <div class="map_container">
    <el-container>
      <el-aside width="250px">
        <side-tree @chose="choseTower"></side-tree>
      </el-aside>
      <el-main>
        <baidu-map
          class="map"
          :scroll-wheel-zoom="true"
          :center="center"
          :zoom="zoom"
          @ready="handler">
          <bm-marker
            v-for="(tower, index) in towersList"
            :key="index"
            :icon="showIcon(tower)"
            :position="getPosition(tower)"
            @click="showInfo(tower)"
            :top="tower.id===currentTower.id">
          </bm-marker>
          <bm-info-window
            @close="infoWindow.show = false"
            @open="infoWindow.show = true"
            :position="getPosition(currentTower)"
            :offset="{height: -25}"
            :show="infoWindow.show"
            :width="295"
            :title="currentTower.name">
            <div class="info-window-wrapper">
              <div>
                <p>
                  <span class="info-key">杆塔号: </span>
                  <span class="ellipsis addr"
                  :title="currentTower.name">
                    {{currentTower.name}}
                  </span>
                </p>
                <p>
                  <span class="info-key">地区: </span>
                  {{currentTower.province}}
                </p>
                <p>
                  <span class="info-key">电压等级(kV): </span>
                  {{currentTower.voltageLevelStr}}
                </p>
                <p>
                  <span class="info-key">塔高(m): </span>
                  {{currentTower.height}}
                </p>
                <p>
                  <span class="info-key">未处理警报: </span>
                  <router-link :to="toWarningData(currentTower)">
                    {{ `${currentTower.warningCount}条` }}
                  </router-link>
                </p>
                <p>
                  <span class="info-key">地址: </span>
                  <span class="ellipsis addr" :title="address">
                    {{address}}
                  </span>
                </p>
                <div class="sensor_wrapper">
                  <div class="sensor left"
                    v-for="(sensor, index) in currentTower.sensorList"
                    :key="index">
                    <router-link :to="toMonitorData(currentTower, sensor)">
                      <div :title="sensor.pointName" class="sensor_img">
                        <img :src="sensorImg(sensor.showStatus)"
                        width="40px" height="40px">
                      </div>
                    </router-link>
                    <p class="ellipsis"
                    :title="filterName(sensor.monitorTypeId, sensor.id)">
                      {{filterName(sensor.monitorTypeId, sensor.id)}}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </bm-info-window>
        </baidu-map>
        <div class="warning_box">
          <transition name="circle_fade">
            <div class="show_box"
              v-show="showWarnInfo"
              @click="handleWarnInfo">
              <span class="red_icon"
              v-if="showWarnRed">
                {{warningCount}}
              </span>
            </div>
          </transition>
          <transition name="fade">
            <div class="content_box"
              v-show="!showWarnInfo">
              <div class="title">
                警报信息
                <div class="el-icon-close right close"
                  @click="showWarnInfo = !showWarnInfo">
                </div>
              </div>
              <div class="content">
                <ul>
                  <li class="newWarning"
                    v-for="item in newWarnData"
                    :key="item.id">
                    <div>
                      <i class="newWarning_icon"></i>
                      <span class="warn"
                        :title="`${item.towerName}触发报警！`">
                        {{item.towerName}}触发报警！
                      </span>
                      <i class="newFlag_icon"></i>
                      <span class="right">
                        {{item.warningTime}}
                      </span>
                    </div>
                  </li>
                  <li class="oldWarning"
                    v-for="item in oldWarnData" :key="item.id">
                    <div>
                      <i class="oldWarning_icon"></i>
                      <span class="warn"
                        :title="`${item.towerName}触发报警！`">
                        {{item.towerName}}触发报警！
                      </span>
                      <span class="grey right">
                        {{item.warningTime}}
                      </span>
                    </div>
                  </li>
                </ul>
                <div class="noData grey"
                  v-if="!newWarnData.length && !oldWarnData.length">
                  七日内暂无警报
                </div>
                <div class="showWarnData right">
                  <router-link to="/warningData">
                    查看更多 >>
                  </router-link>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import SideTree from '@/base/side-tree/side-tree'
import {getMapTower, getMapWarning} from '@/api/map'
import {ERR_OK} from '@/api/config'
import {mapGetters} from 'vuex'
import BMap from 'BMap'
export default {
  data () {
    return {
      infoWindow: {show: false},
      // 定位中心到江门
      // center: {lng: 113.089, lat: 22.585},
      // 定位中心到广州
      center: {lng: 113.354, lat: 23.15},
      position: {},
      zoom: 13,
      currentTower: {},
      towers: {},
      selectedTower: {},
      address: '',
      showWarnInfo: true,
      showWarnRed: true,
      warningCount: 0,
      newWarnData: [],
      oldWarnData: []
    }
  },
  methods: {
    handler ({BMap, map}) {
      this.map = map
      this.BMap = BMap
      let MAP = process.env.MAP
      if (MAP === '--online') {
        return
      }
      this.map.setMinZoom(5)
      let zoomLevel
      let latStart = 3.131015
      let lngStart = 73.261458
      let latStop = 53.751156
      let lngStop = 135.447143
      let _this = this
      this.map.addEventListener('zoomend', function () {
        zoomLevel = _this.map.getZoom()
        if (zoomLevel > 13) {
          latStart = 20.192654
          lngStart = 104.422454
          latStop = 26.457927
          lngStop = 117.300562
        } else {
          latStart = 3.131015
          lngStart = 73.261458
          latStop = 53.751156
          lngStop = 135.447143
        }
        let minLng = _this.map.getBounds().getSouthWest().lng
        let minLat = _this.map.getBounds().getSouthWest().lat
        let maxLng = _this.map.getBounds().getNorthEast().lng
        let maxLat = _this.map.getBounds().getNorthEast().lat
        if (minLat < latStart || maxLat > latStop ||
          minLng < lngStart || maxLng > lngStop) {
          _this.map.setMaxZoom(13)
        } else {
          _this.map.setMaxZoom(15)
        }
      })
    },
    showIcon (tower) {
      let img = tower.status ? tower.status === 3 ? 'red.png' : 'yellow.png' : 'green.png'
      return {
        url: require(`@/common/images/${img}`),
        size: {
          width: 40,
          height: 55
        }
      }
    },
    choseTower (tower, towers) {
      this.infoWindow.show = true
      this.selectedTower = tower
      this.towers = towers
      this.center = {
        lng: tower.lng,
        lat: tower.lat
      }
      this._getMapTower(this.selectedTower.id)
    },
    showInfo (tower) {
      this._getMapTower(tower.id)
    },
    toMonitorData (currentTower, sensor) {
      return {
        path: '/monitorData',
        query: {
          id: currentTower.id,
          name: encodeURIComponent(currentTower.name),
          directionX: encodeURIComponent(currentTower.directionX),
          directionY: encodeURIComponent(currentTower.directionY),
          monitorTypeId: sensor.monitorTypeId,
          pointName: encodeURIComponent(sensor.pointName)
        }
      }
    },
    toWarningData (currentTower) {
      return {
        path: '/warningData',
        query: {
          name: encodeURIComponent(currentTower.name)
        }
      }
    },
    handleWarnInfo () {
      this.showWarnInfo = !this.showWarnInfo
      this.showWarnRed = false
      localStorage.setItem('showWarn', this.showWarnRed)
    },
    getPosition (tower) {
      return {
        lng: tower.lng,
        lat: tower.lat
      }
    },
    getAddress (lng, lat) {
      // 由经纬度得到地址
      let point = new BMap.Point(this.currentTower.lng, this.currentTower.lat)
      let geoc = new BMap.Geocoder()
      let that = this
      geoc.getLocation(point, rs => {
        let loc = rs.addressComponents
        that.address = loc.province + loc.city + loc.district + loc.street + loc.streetNumber
      })
    },
    _getMapTower (id) {
      getMapTower({id}).then((res) => {
        if (res.state === ERR_OK) {
          this.currentTower = res.value
          this.address = this.currentTower.address
          this.getAddress(this.currentTower.lng, this.currentTower.lat)
          this.infoWindow.show = true
          this.center = {
            lng: this.currentTower.lng,
            lat: this.currentTower.lat
          }
        }
      })
    },
    _getMapWarning () {
      getMapWarning().then(res => {
        if (res.state === ERR_OK) {
          this.warningCount = res.value.newCount
          if (!this.warningCount) {
            this.showWarnRed = false
          } else if (this.warningCount >= 5) {
            this.warningCount = '5+'
          }
          this.newWarnData = res.value.newWarnData
          this.oldWarnData = res.value.oldWarnData
        }
      })
    },
    filterName (monitorTypeId, id) {
      let monitorTypes = JSON.parse(localStorage.getItem('monitorTypes'))
      let propertyValue = monitorTypeId ? monitorTypes.filter(item => item.propertyKey === monitorTypeId)[0].propertyValue : ''
      return propertyValue + (id + 1)
    },
    sensorImg (status) {
      let src = require(`@/common/images/sensor-null.png`)
      switch (status) {
        case 0 :
          src = require(`@/common/images/sensor-normal.png`)
          break
        case 3 :
          src = require(`@/common/images/sensor-error.png`)
          break
        default :
          break
      }
      return src
    }
  },
  created () {
    if (localStorage.getItem('showWarn')) {
      this.showWarnRed = localStorage.getItem('showWarn') === 'true'
    }
    this._getMapWarning()
    if (!this.$route.query.id) return
    this._getMapTower(this.$route.query.id)
  },
  computed: {
    ...mapGetters([
      'towersList'
    ])
  },
  components: {
    SideTree
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.map_container
  height 100%
  bg-color-full(#f0f7fe)
  .el-container
    padding 10px 10px 10px 0
    .el-header
      padding 8px 35px
      bg-color-full(#fff)
    .el-aside
      margin-right 10px
      border-right 1px solid #ededed
    .map
      width 100%
      height 100%
      .info-window-wrapper
        border-top 1px solid #ccc
        color #666
        a
          cursor pointer
        .addr
          width 185px
          display inline-block
          vertical-align text-bottom
        .info-key
          display inline-block
          width 100px
          line-height 25px
        .sensor_wrapper
          margin-top 10px
          max-height 126px
          overflow-y scroll
          .sensor
            width 25%
            text-align center
            .sensor_img
              text-align center
    .warning_box
      .fade-enter-active, .circle_fade-enter-active
        transition: all .3s ease
      .fade-leave-active, .circle_fade-leave-active
        transition: all .5s cubic-bezier(1.0, 0.5, 0.8, 1.0)
      .fade-enter, .fade-leave-to, .circle_fade-enter, .circle_fade-leave-to
        transform: scale(0.5,0.5)
        -ms-transform scale(0.5,0.5)
        -moz-transform scale(0.5,0.5)
        -webkit-transform scale(0.5,0.5)
        -o-transform scale(0.5,0.5)
        opacity 0
      .show_box
        cursor pointer
        position absolute
        z-index 2000
        right 10px
        top  300px
        height 50px
        width 50px
        background url('~@/common/images/warn.png') no-repeat center/cover
        .red_icon
          color #ffffff
          text-align center
          position absolute
          right 0
          top -4px
          width 18px
          height 18px
          bg-color-full(#ff0000)
          border-radius 18px
          line-height 18px
          font-size 12px
      .content_box
        position absolute
        z-index 99999
        right 10px
        top  300px
        width 360px
        bg-color-full(#ffffff)
        .title
          bg-color-full(#215296)
          color #efefef
          padding 5px 15px
          font-family MicrosoftYaHei
          .close
            font-size 20px
            cursor pointer
        .content
          height 240px
          padding 0 15px
          .noData
            line-height 240px
            text-align center
            margin 20px 0
            font-size 14px
          ul
            li
              margin 10px 0
              bg-color-full(#f4f4f4)
              padding 10px
            li:hover
              transform scale(1.03, 1.3)
              -ms-transform scale(1.03, 1.3)
              -moz-transform scale(1.03, 1.3)
              -webkit-transform scale(1.03, 1.3)
              -o-transform scale(1.03, 1.3)
              transition: all .2s ease
              div
                transform scale(1, 0.8)
            .warn
              display inline-block
              white-space nowrap
              text-overflow ellipsis
              overflow hidden
              vertical-align bottom
              max-width 150px
            .right
              font-size 13px
            .newWarning
              box-shadow -4px 4px 6px rgba(5,56,126,0.15)
              color #215296
              .newWarning_icon
                bg_icon('~@/common/images/new.png', 5px, 6px)
                vertical-align middle
              .newFlag_icon
                bg_icon('~@/common/images/newFlag.png', 13px, 16px)
            .oldWarning
              color #4d4d4d
              .oldWarning_icon
                bg_icon('~@/common/images/old.png', 5px, 6px)
                vertical-align middle
        .showWarnData
          font-size 11px
          height 30px
          a
            color #999999
</style>
