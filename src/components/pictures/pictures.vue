<template>
  <div class="pictures full_container">
    <el-container>
      <el-header height="30px">
        <location></location>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <side-tree @chose="choseTower"></side-tree>
        </el-aside>
        <el-container>
          <el-header height="72px">
            <div class="option-wrapper">
              <div class="option">
                <el-form :inline="true" class="right">
                  <el-form-item class="timelineRange">
                    <el-date-picker
                      v-model="date"
                      type="daterange"
                      range-separator="至"
                      start-placeholder="开始日期"
                      end-placeholder="结束日期"
                      prefix-icon="date_icon"
                      :value-format="valueFormat"
                      :picker-options="pickerOptions">
                    </el-date-picker>
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      size="mini"
                      icon="query_icon"
                      @click="searchPics">
                      查询
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </div>
          </el-header>
          <el-main
            @scroll.native="handleScroll">
            <div class="pictures-wrapper">
              <div class="timeline-wrapper">
                <div class="timeline right">
                  <ul class="line" ref="timeline">
                    <div class="year-wrapper">
                      <div class="year"
                        :class="{'current': currentYear== year.time,
                        'transform':year.transform == true }"
                        v-for="year in timelineData" :key="year.time"
                        @click="currentYear = year.time"
                        @mouseenter="year.transform = true"
                        @mouseleave="year.transform = false">
                        <span>{{ year.time }}</span>
                      </div>
                    </div>
                    <div class="month-wrapper">
                      <div v-for="(year, index) in timelineData" :key="index">
                        <div class="list-group"
                          v-show="currentYear== year.time">
                          <li
                            v-for="(month, index) in year.childrenTime" :key="index"
                            :style="{height: `calc((100vh - 250px) / ${year.childrenTime.length})`}"
                            :class="{'current':(currentDate.split('-')[0]== year.time)
                            && (currentDate.split('-')[1] == supplement(month.time))}">
                            {{ supplement(month.time) }}
                            <div class="day">
                              <li v-for="(day, index) in month.childrenTime" :key="index"
                                :style="{height: `calc((100% / ${month.childrenTime.length})`}"
                                :class="{'current':currentDate== day.time}"
                                @click="selectDate(day.time)"
                                @mouseenter="day.scale = true"
                                @mouseleave="day.scale = false">
                                <transition name="fade">
                                  <div class="date" v-show="day.scale == true">
                                    {{ day.time.split('-')[2] }}
                                  </div>
                                </transition>
                              </li>
                            </div>
                          </li>
                        </div>
                      </div>
                    </div>
                  </ul>
                </div>
                <div class="picture"
                  @mousewheel="handleMouseWheel">
                  <div class="more" v-show="currentDateIndex && !isSearch">
                    <el-button type="text" size="mini" @click="loadTopMore">
                      更多<i class="el-icon-arrow-down"></i>
                    </el-button>
                  </div>
                  <el-timeline>
                    <el-timeline-item v-for="(item, dataIndex) in picturesData"
                      :key="item.dayTime"
                      :timestamp="item.dayTime.replace(/-/g, '.')"
                      placement="top"
                      :id="`a${item.dayTime.split('-').join('')}`">
                      <div :class="!item.collapse ? 'collapse' : ''" class="img-wrapper">
                        <img v-for="(pic, index) in collapsePicturesData[dataIndex].medias" :key="index"
                          v-show="!item.collapse"
                          :style="{width:'calc(10% - 20px)', height: '80px'}"
                          v-lazy="showImage(pic.path + pic.name)"
                          preview="0">
                        <img v-for="(pic, index) in item.medias" :key="`collapse${index}`"
                          v-show="item.collapse"
                          :style="{width:'calc(10% - 20px)', height: '80px'}"
                          v-lazy="showImage(pic.path + pic.name)"
                          preview="0">
                      </div>
                      <el-button
                        v-show="item.medias.length > 10"
                        class="right"
                        type="text"
                        size="mini"
                        @click="handleCollapse(item)">
                        {{ !item.collapse ? '展开' : '收起'}}
                        <i v-show="!item.collapse" class="el-icon-d-arrow-right el-icon--right"></i>
                        <i v-show="item.collapse" class="el-icon-d-arrow-left el-icon--right"></i>
                      </el-button>
                      <el-divider></el-divider>
                    </el-timeline-item>
                  </el-timeline>
                  <div class="more" v-show="!isSearch">
                    <el-button type="text" size="mini"
                      @click="loadMore"
                      v-if="bottomMore && timelineRange.length > 4">
                      更多<i class="el-icon-arrow-down"></i>
                    </el-button>
                    <el-button type="text" size="mini"
                      v-if="!bottomMore && picturesData.length > 0
                      && timelineData.length > 0">
                      没有更多了
                    </el-button>
                  </div>
                  <div class="default" v-show="isTower &&
                    !bottomMore && picturesData.length === 0">
                    <i class="null_icon"></i>
                    暂无数据
                  </div>
                </div>
              </div>
            </div>
          </el-main>
        </el-container>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import SideTree from '@/base/side-tree/side-tree'
import location from '@/base/location/location'
import {getTimeLine, getHistoricalPics} from '@/api/pictures.js'
import {ERR_OK} from '@/api/config'
export default {
  data () {
    return {
      isTower: false,
      scrollTop: 0,
      loading: false,
      towerId: null,
      date: null,
      lastIndex: 0,
      isSearch: false,
      bottomMore: false,
      offset: 0,
      currentYear: '',
      // 首行显示的图片日期
      currentDate: '',
      // 首行显示的图片日期在timelineRange中的索引
      currentDateIndex: null,
      // 所有有历史图片数据的日期
      timelineRange: [],
      // 已加载历史图片的日期在timelineRange中的索引
      picturesIndexArr: [],
      // 已加载历史图片的日期
      picturesData: [],
      // 收起时展示的图片数据
      collapsePicturesData: [],
      timelineData: [],
      pickerOptions: {
        disabledDate: (time) => {
          return time.getTime() > Date.now()
        }
      }
    }
  },
  methods: {
    /**
     * 选择杆塔时初始化数据，请求时间轴数据
     *
     * @param { Object } tower 选择的杆塔对象
     */
    choseTower (tower) {
      this.isTower = true
      this.towerId = tower.id
      this.picturesData = []
      this.timelineData = []
      this.timelineRange = []
      this.currentDateIndex = null
      this.currentDate = ''
      this.currentYear = ''
      this.date = []
      this.loading = true
      this.bottomMore = true
      this._getTimeLine()
    },
    /**
     * 小于10时补零函数
     */
    supplement (s) {
      return s < 10 ? '0' + s : s
    },
    /**
     * 点击时间轴上日期时执行
     *
     * @param { String } time 点击的日期
     */
    selectDate (time) {
      let index = this.timelineRange.indexOf(time)
      let beginTime = this.timelineRange[this.timelineRange.length - 1]
      let restCount = this.timelineRange.length - 1 - index
      if (restCount > 4) {
        beginTime = this.timelineRange[index + 3]
      }
      this._getHistoricalPics(beginTime, time, 'on')
    },
    /**
     * 点击查询按钮时执行
     */
    searchPics () {
      if (!this.towerId) {
        this.$message.error('请先选择杆塔')
        return
      }
      if (!this.date || this.date.length === 0) {
        // 日期为空时点击查询
        this.currentYear = this.timelineRange[0]
        let endTime = this.timelineRange[0]
        let beginTime = this.timelineRange.length > 4 ? this.timelineRange[3]
          : this.timelineRange[this.timelineRange.length - 1]
        this._getHistoricalPics(beginTime, endTime, 'on')
        return
      }
      // 查询时间段后禁用上拉下拉事件
      this.bottomMore = false
      this.picturesData = []
      this._getHistoricalPics(this.date[0], this.date[1], 'search')
    },
    handleCollapse (item) {
      item.collapse = !item.collapse
    },
    /**
     * 鼠标滚轮滚动事件
     *
     * @param {*} e
     */
    handleMouseWheel (e) {
      if (this.isSearch) {
        // 选择日期点击查询按钮时，禁用上下滚动事件
        return
      }
      if (e.wheelDelta < 0) {
        // 鼠标向下滚动
        this.loadMore()
      } else {
        // 鼠标向上滚动
        this.loadTopMore()
      }
    },
    /**
     * 滚动条滚动事件
     *
     * @param {*} e
     */
    handleScroll (e) {
      if (this.isSearch || e.target.scrollTop === 0) {
        // 选择日期点击查询按钮时或滚动高为0时，禁用滚动条滚动事件
        return
      }
      let timelineItems = e.target.children[0].children[0].children[1].children[1].children
      // 获取当前滚动到页面顶部的日期
      for (let i = 0; i < timelineItems.length; i++) {
        if (timelineItems[i].offsetTop >= e.target.scrollTop) {
          // 去掉innerText中的回车和换行符
          let innerText = timelineItems[i].innerText.replace(/[\r\n]/g, '')
          // 通过空格分割字符串，取到当前日期值
          this.currentDate = innerText.split(' ')[0]
          // 格式转换xxxx.xx.xx转换为xxxx-xx-xx
          this.currentDate = this.currentDate.replace(/\./g, '-')
          this.currentDateIndex = this.timelineRange.indexOf(this.currentDate)
          this.currentYear = this.currentDate.split('-')[0]
          break
        }
      }
      this.scrollTop = e.target.scrollTop
      this.scrollHeight = e.target.scrollHeight
      this.clientHeight = e.target.clientHeight
      // 当滚动条滑到最底部时，加载更多
      if (Math.ceil(this.scrollTop + this.clientHeight) === this.scrollHeight) {
        this.loadMore()
      }
    },
    /**
     * 上拉加载更多
     */
    loadTopMore () {
      // 首行显示的图片日期在timelineRange中的索引
      this.currentDate = this.picturesData[0].dayTime
      this.currentDateIndex = this.timelineRange.indexOf(this.currentDate)
      if (!this.currentDateIndex) {
        // 首行显示的图片日期为timelineRange的第一张图，不显示上拉加载更多,不加载
        return
      }
      // 判断上拉加载日期的数目
      let beginIndex = this.currentDateIndex - 1
      // 上拉<=4个日期时
      let endIndex = 0
      if (this.currentDateIndex > 3) {
        // 上拉>4个日期时
        endIndex = this.currentDateIndex - 4
      }
      this.loadHistoricalPics(beginIndex, endIndex, 'up')
    },
    /**
     * 下拉加载更多
     */
    loadMore () {
      if (!this.bottomMore) {
        // 没有更多了，不加载
        return
      }
      let beginIndex = this.timelineRange.length - 1
      let endIndex = this.currentDateIndex + 4
      let restCount = this.timelineRange.length - 1 - endIndex
      if (restCount > 4) {
        beginIndex = endIndex + 3
      }
      this.loadHistoricalPics(beginIndex, endIndex, 'down')
    },
    /**
     * 加载数据
     */
    loadHistoricalPics (beginIndex, endIndex, operation) {
      let beginTime = this.timelineRange[beginIndex]
      let endTime = this.timelineRange[endIndex]
      let time = operation === 'down' ? endTime : beginTime
      // 判断是否已加载
      let flag = false
      this.picturesData.forEach(item => {
        if (item.dayTime === time) {
          flag = true
        }
      })
      if (!flag) {
        this._getHistoricalPics(beginTime, endTime, operation)
      }
    },
    /**
     * 显示图片，如果没有图片，则显示默认图
     */
    showImage (name) {
      if (!name) {
        return require('@/common/images/default.png')
      } else {
        return '/mediaData/media/' + name
      }
    },
    /**
     * 获取时间轴数据,并加载最近四天的历史图片
     */
    _getTimeLine () {
      getTimeLine({
        type: 1,
        towerId: this.towerId
      }).then(res => {
        if (res.state === ERR_OK) {
          if (res.value.length === 0) {
            this.bottomMore = false
            return
          }
          res.value.forEach(year => {
            year.transform = false
            year.childrenTime.forEach(month => {
              // 每月有数据的天数大于10时，处理为最多显示10个点
              let count = Math.ceil(month.childrenTime.length / 10)
              let dayArr = []
              month.childrenTime.forEach(date => {
                this.timelineRange.push(date.time)
                date.scale = false
              })
              if (count > 1) {
                month.childrenTime.forEach((item, index) => {
                  if (index % count === 0) {
                    dayArr.push(item)
                  }
                })
                month.childrenTime = dayArr
              }
            })
          })
          this.timelineData = res.value
          this.currentYear = this.timelineRange[0]
          let endTime = this.timelineRange[0]
          let beginTime = this.timelineRange.length > 4 ? this.timelineRange[3]
            : this.timelineRange[this.timelineRange.length - 1]
          this._getHistoricalPics(beginTime, endTime, 'on')
        }
      })
    },
    _getHistoricalPics (beginTime, endTime, direction = null) {
      if (!beginTime || !endTime) {
        // 开始时间、结束时间不能为空
        return
      }
      getHistoricalPics({
        type: 1,
        towerId: this.towerId,
        beginTime: beginTime,
        endTime: endTime
      }).then(res => {
        if (res.state === ERR_OK) {
          if (res.value.length === 0) {
            return
          }
          if (res.value.length > 4) {
            res.value = res.value.slice(0, 4)
          }
          if (direction === 'on' || direction === 'search') {
            this.picturesData = res.value
          } else {
            for (let i = 0; i < this.picturesData.length; i++) {
              for (let j = 0; j < res.value.length; j++) {
                if (this.picturesData[i].dayTime === res.value[j].dayTime) {
                  return
                }
              }
            }
          }
          this.currentYear = res.value[0].dayTime.split('-')[0]
          // 存储已请求的日期在timelineRange中的索引
          let indexArr = []
          res.value.forEach(item => {
            let index = this.timelineRange.indexOf(item.dayTime)
            this.picturesIndexArr.push(index)
          })
          // 历史图片默认为收起
          res.value.forEach(item => {
            this.$set(item, 'collapse', false)
          })
          // 判断上滑/下滑加载更多
          if (!direction || direction === 'down') {
            this.picturesIndexArr = this.picturesIndexArr.concat(indexArr)
            this.picturesData = this.picturesData.concat(res.value)
          } else if (direction === 'up') {
            this.picturesIndexArr = indexArr.concat(this.picturesIndexArr)
            this.picturesData = res.value.concat(this.picturesData)
          }
          if (direction === 'on' || direction === 'search') {
            this.currentDate = res.value[0].dayTime
            this.currentDateIndex = this.timelineRange.indexOf(this.currentDate)
          }
          if (direction === 'search') {
            this.isSearch = true
          } else {
            this.isSearch = false
          }
          if (this.picturesData[this.picturesData.length - 1].dayTime ===
            this.timelineRange[this.timelineRange.length - 1]) {
            this.bottomMore = false
          } else {
            this.bottomMore = true
          }
        }
        this.collapsePicturesData = JSON.parse(JSON.stringify(this.picturesData))
        // this.collapsePicturesData = Object.assign(this.picturesData, [])
        this.collapsePicturesData.forEach(item => {
          item.medias = item.medias.splice(0, 10)
        })
      })
    }
  },
  computed: {
    valueFormat () {
      return 'yyyy-MM-dd'
    }
  },
  components: {
    SideTree,
    location
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
      .el-container
        height 100%
        width 100%
        padding 0
        .option
          position relative
          .el-form
            position absolute
            top 10px
            right 20px
        .el-main
          width 100%
          position relative
          bg-color-full #fff
          box-shadow 0px 0px 6px #ededed
          p
            text-align center
            color #98A5B4
          .pictures-wrapper
            height 100%
            .timeline-wrapper
              height 100%
              .fade-enter-active, .fade-leave-active
                transition: all .3s ease
              .fade-enter, .fade-leave-to
                opacity: 0
              .timeline
                width 120px
                height calc(100% - 240px)
                position fixed
                right 30px
                overflow hidden
                background url('~@/common/images/dot.png') 64px top repeat-y !important
                .line
                  height 100%
                  .year-wrapper
                    position absolute
                  .year.current
                    background #348ADA
                    color #ffffff
                  .year.transform
                    background #348ADA
                    opacity 0.6
                    color #ffffff
                  .year
                    transition: all .5s
                    text-align center
                    border-radius 25px
                    margin-bottom 25px
                    padding 3px 10px
                    color #505050
                  .list-group>li
                    text-align center
                    width 30%
                    padding-left 66px
                    background: url('~@/common/images/bigdot.png') 62px 5px no-repeat !important
                    color #B8B8B8
                    .day
                      height calc(100% - 10px)
                      margin-top -6px
                      li
                        position relative
                      li::before
                        content ''
                        position absolute
                        top 50%
                        display block
                        width 4px
                        height 1px
                        background #bbbbbb
                      .date
                        width 30px
                        height 30px
                        color #348ada
                        font-size 14px
                        text-align center
                        position absolute
                        left 26px
                        top 50%
                        transform scale(1.5)
                        transition all .3s ease
                        z-index 100
                  .list-group>li.current
                    background: url('~@/common/images/dot_current.png') 52px top no-repeat !important
                    color #505050
                    font-size 18px
                    li.current::before
                      background #348ada
              .picture
                width calc(100% - 200px)
                margin 0 40px
                .more
                  text-align center
                .el-timeline
                  .el-timeline-item
                    img
                      padding 5px 10px
                    .el-button--text
                      i
                        transform rotate(90deg)
                .default
                  position absolute
                  left 50%
                  top 50%
                  transform translate(-50%, -50%)
                  text-align center
                  color #b8bcc7
</style>
