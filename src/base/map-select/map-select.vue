<template>
  <div class="map">
    <!-- 显示地图 -->
    <div id="map-core"></div>
    <div class="search">
      <!-- 搜索地址功能，离线时无法使用 -->
      <div id="r-result" :class="{'hide': ifOfflineMap}">
        <span>搜索定位:</span>
        <input type="text" id="suggestId" v-model="value"/>
      </div>
      <el-button
        type="primary"
        size="mini"
        class="right"
        @click="selectLocation">
        确定
      </el-button>
      <!-- 显示当前选择的经纬度 -->
      <div class="lng-lat">
        <span>当前经度:</span>
        <input type="text" v-model="location.lng"/>
        <span>当前纬度:</span>
        <input type="text" v-model="location.lat"/>
      </div>
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import BMap from 'BMap'
export default {
  data () {
    return {
      map: {},
      ac: {},
      value: '',
      // 运行命令为`npm run dev --online`时，切换为在线
      // 否则为离线
      ifOfflineMap: process.env.MAP !== '--online'
    }
  },
  mounted () {
    this.setMap()
    this.setSearch()
  },
  props: {
    refresh: {
      type: Boolean
    },
    location: {
      type: Object
    }
  },
  methods: {
    // 初始化地图
    setMap () {
      this.map = new BMap.Map('map-core')
      // 定位中心到江门
      // this.map.centerAndZoom(new BMap.Point(113.089, 22.585), 11)
      // 定位中心到广州
      this.map.centerAndZoom(new BMap.Point(113.354, 23.15), 11)
      this.map.addControl(new BMap.NavigationControl())      
      // 鼠标缩放
      this.map.enableScrollWheelZoom()
      // 点击获取经纬度
      const _this = this
      this.map.addEventListener('click', function (e) {
        _this.location.lng = parseFloat(e.point.lng).toFixed(3)
        _this.location.lat = parseFloat(e.point.lat).toFixed(3)
      })
      if (process.env.MAP === '--online') {
        return
      }
      this.map.setMinZoom(5)
      let zoomLevel
      let latStart = 3.131015
      let lngStart = 73.261458
      let latStop = 53.751156
      let lngStop = 135.447143
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
        if (minLat < latStart || maxLat > latStop || minLng < lngStart || maxLng > lngStop) {
          _this.map.setMaxZoom(13)
        } else {
          _this.map.setMaxZoom(15)
        }
        // 限制区域代码，由于限制区域时移到到边界会平滑回到原点，用户体验不好，先注释掉
        // var b = new BMap.Bounds(new BMap.Point(lngStart, latStart), new BMap.Point(lngStop, latStop))
        // try {
        //   BMapLib.AreaRestriction.setBounds(_this.map, b)
        // } catch (e) {
        //   console.log(e)
        // }
      })
    },
    // 根据经纬度绘制地图中的坐标点
    drawLocation () {
      if(this.location.lng !== "" && this.location.lat !== ""){
        this.map.clearOverlays()
        const new_point = new BMap.Point(this.location.lng, this.location.lat)
        this.map.centerAndZoom(new_point, this.map.getZoom())
        const marker = new BMap.Marker(new_point)
        this.map.addOverlay(marker)
        marker.onclick = function (e) {
          e.domEvent.stopPropagation()
        }
        this.map.panTo(new_point) 
      }
    },
    // 搜索位置功能实现
    setSearch () {
      const _this = this
      // 建立一个自动完成的对象
      this.ac = new BMap.Autocomplete({"input" : "suggestId", "location" : _this.map})
      let myValue
      // 鼠标点击下拉列表后的事件
      this.ac.addEventListener("onconfirm", function(e) {
      let _value = e.item.value
        myValue = _value.province +  _value.city +  _value.district +  _value.street +  _value.business
        _this.setPlace(myValue)
      })
    },
    setPlace (myValue) {
      const _this = this
      // 清除地图上所有覆盖物
      this.map.clearOverlays()
      // 智能搜索
      this.local = new BMap.LocalSearch(_this.map, {
        onSearchComplete: _this.onSearchComplete
      })
      this.local.search(myValue)
    },
    onSearchComplete () {
      // 获取第一个智能搜索的结果
      let pp = this.local.getResults().getPoi(0).point
      this.location.lng = parseFloat(pp.lng).toFixed(3)
      this.location.lat = parseFloat(pp.lat).toFixed(3)
      this.map.centerAndZoom(pp, 18)
      // 添加标注
      this.map.addOverlay(new BMap.Marker(pp))
    },
    // 向父组件传递经纬度
    selectLocation () {
      this.$emit('selectLocation', this.location)
    }
  },
  watch: {
    'location': {
      handler () {
        this.drawLocation()
      },
      deep: true
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  .map
    width: 100%;
    height: 100%;
    font-size: 14px;
    #map-core
      width: 100%;
      height: 350px;
    .search
      margin: 10px;
      height: 100%;
      .hide
        visibility hidden
      #r-result
        p
          height: 20px;
          padding-right: 10px;
        input
          width: 76%;
          height: 20px;
      .lng-lat
        margin-top 10px
        p
          height: 20px;
          padding-right: 10px;
        input
          width: 120px;
          height: 20px;
</style>
