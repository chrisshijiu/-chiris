<template>
  <div class="device_detail">
    <div class="detail_wrapper full_container">
      <el-container>
        <el-header height='30px'>
          <location></location>
        </el-header>
        <el-main>
          <el-row>
            <el-button type="primary" plain size="mini" @click='back' class="back_btn">返回</el-button>
          </el-row>
          <div :model='data'>
            <el-row>
              <el-col :span="18" :offset="3">
                <div class="device_title">
                  <span>设备详情</span>
                </div>
              </el-col>
            </el-row>
            <el-row class="device_row">
              <el-col :span="4" :offset="4" class="device_key"><div>设备编号</div></el-col>
              <el-col :span="6" class="device_value"><div>{{data.number}}</div></el-col>
              <el-col :span="4" class="device_key"><div>设备品牌</div></el-col>
              <el-col :span="6" class="device_value"><div>{{data.brandName}}</div></el-col>
            </el-row>
            <el-row class="device_row">
              <el-col :span="4" :offset="4" class="device_key"><div>数据状态</div></el-col>
              <el-col :span="6" class="device_value"><div>{{data.workingStatus}}&nbsp;</div></el-col>
              <el-col :span="4" class="device_key"><div>运行状态</div></el-col>
              <el-col :span="6" class="device_value"><div>{{data.deviceMatter}}</div></el-col>
            </el-row>
            <el-row class="device_row">
              <el-col :span="4" :offset="4" class="device_key"><div>设备状态</div></el-col>
              <el-col :span="6" class="device_value"><div>{{format(data.status,deviceStatus)}}</div></el-col>
            </el-row>
            <el-row class="device_row" v-show="beidouVisible">
              <el-col :span="4" :offset="4" class="device_key"><div>示例标志</div></el-col>
              <el-col :span="6" class="device_value"><div></div></el-col>
              <el-col :span="4" class="device_key"><div>示例秘钥</div></el-col>
              <el-col :span="6" class="device_value"><div></div></el-col>
            </el-row>
          </div>
          <div class="com2">
            <el-row>
              <el-col :span="18" :offset="3">
                <div class="device_title">
                  <span>传感器状态</span>
                </div>
              </el-col>
            </el-row>
            <el-table :data="sensors" row-class-name="body_row" style="width: 70%;margin: 0 auto;">
              <el-table-column label="传感器编号">
                <template slot-scope="scope">
                    {{scope.row.number}}
                </template>
              </el-table-column>
              <el-table-column label="监测项类型" prop="monitorTypeName">
              </el-table-column>
              <el-table-column prop='workingStatus' label="数据状态">
              </el-table-column>
              <el-table-column prop="sensorMatter" label="运行状态">
              </el-table-column>
            </el-table>
          </div>
        </el-main>
        <m-footer></m-footer>
      </el-container>
    </div>
  </div>
</template>
<script>
import location from '@/base/location/location'
import MHeader from '@/base/m-header/m-header'
import MFooter from '@/base/m-footer/m-footer'
import {getDevDetailMessage, getSensorMageMessage} from '@/api/device_detail.js'
import {ERR_OK} from '@/api/config'
export default {
  data () {
    return {
      beidouVisible: false,
      deviceNumber: null,
      data: {},
      sensors: [],
      deviceStatus: [
        {id: 0, name: '未使用'},
        {id: 1, name: '已使用'}
      ]
    }
  },
  methods: {
    back () {
      this.$router.push('/device')
    },
    format (id, array) {
      let name
      array.forEach((item) => {
        if (item.id === id) {
          name = item.name
        }
      })
      return name
    },
    _getDevDetailMessage (params) {
      getDevDetailMessage(params).then((res) => {
        if (res.state === ERR_OK) {
          this.data = res.value
        }
      })
    },
    _getSensorMageMessage (params) {
      getSensorMageMessage(params).then((res) => {
        if (res.state === ERR_OK) {
          this.sensors = res.value
        }
      })
    }
  },
  created () {
    this.deviceNumber = this.$route.query.number
    this._getDevDetailMessage({
      number: this.deviceNumber
    })
    this._getSensorMageMessage({
      deviceNumber: this.deviceNumber
    })
  },
  components: {
    MHeader,
    MFooter,
    location
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.device_detail
  position: fixed
  top: 76px
  left: 0
  bottom: 0
  right: 0
  z-index: 100
  background: #fff
  .detail_wrapper
    z-index 200
    .el-main
      .back_btn
        float right
        margin-right 11.4%
        z-index 1000
      .device_title
        height 30px
        color #ffffff
        margin-top 30px
        background url('~@/common/images/devDeColumn.png')
        width 100%
        span
          font-size 16px
          color #3aa2eb
          font-weight bold
          position relative
          left 10%
      .device_row
        height 60px
        width 65.5%
        margin 0 auto
        border-bottom 1px solid #ededed
        .device_key
          line-height 60px
          font-size 14px
          color #3aa2eb
          font-weight bold
        .device_value
          line-height 60px
          font-size 14px
          color #3d3d3d
.device_detail
  a
    color #3aa2eb
    text-decoration underline
</style>
