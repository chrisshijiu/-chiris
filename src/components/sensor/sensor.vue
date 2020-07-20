<template>
  <div class="sensor full_container">
    <el-container>
      <el-header height='30px'>
        <location></location>
      </el-header>
      <el-main>
        <el-form :inline='true' :model='formInline' class="demo-form-inline" @submit.native.prevent>
          <div class="right" style="vertical-align:sub">
            <el-form-item label='监测项类型'>
              <el-select v-model='formInline.monitorTypeId' placeholder="请选择" clearable>
                <el-option v-for="item in monitorTypes" :key="item.id" :label="item.propertyValue" :value="item.propertyKey"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input v-model.trim="formInline.number" @keyup.enter.native='handleSearch' placeholder="传感器编号" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="mini" icon='query_icon' @click='handleSearch'> 查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" plain size="mini" icon='add_icon' @click='handleAdd'> 新增</el-button>
            </el-form-item>
          </div>
        </el-form>
        <el-table :data='tableData' row-class-name="body_row" :cell-style="cellStyle">
          <el-table-column prop="number" label="传感器编号" width="200px"></el-table-column>
          <el-table-column label="监测项类型" prop="monitorTypeName"></el-table-column>
          <el-table-column prop="status" label="使用状态">
            <template slot-scope="scope">
              {{ scope.row.status ? '已使用' : '未使用'}}
            </template>
          </el-table-column>
          <el-table-column label="生效基准值">
            <template slot-scope="scope">
              {{scope.row.effValue}}
            </template>
          </el-table-column>
          <el-table-column prop="workingStatus" label="数据状态"></el-table-column>
          <el-table-column prop="sensorMatter" label="运行状态"></el-table-column>
          <el-table-column prop="logTimestamp" label="最近记录" width="200px"></el-table-column>
          <el-table-column prop="operation" label="操作" width="250px">
            <template slot-scope="scope">
              <el-button type="text" size="small" icon="change_icon" @click="handleChange(scope.row)">修改</el-button>
              <el-button type="text" size="small" icon="delete_icon" @click="handleDelete(scope.row.number,scope.row.status)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination_wrapper">
          <el-pagination
          text-color="#fff"
          background
          @current-change="_getSensorMessage"
          :current-page.sync="pageEnquiry.pageNum"
          :page-size="pageEnquiry.pageSize"
          :pager-count="5"
          :page-sizes="[10, 25, 50, 100]"
          @size-change="handleSizeChange"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
          </el-pagination>
        </div>
      </el-main>
      <el-dialog :title="sensorDialogTitle" :visible.sync="sensorDialogVisible" width="600px" :close-on-click-modal="false">
        <el-form ref="formSensor" :model='selectSensor' :rules='sensorRules'>
          <el-form-item label="单位" label-width="120px" prop='ouId'>
            <el-select v-model="selectSensor.ouId" style="width:100%" clearable :disabled="isUsed">
              <el-option v-for='item in companyList' :key='item.id' :label='item.name' :value='item.id'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="监测项类型" label-width="120px" prop='monitorTypeId'>
            <el-select v-model="selectSensor.monitorTypeId" style="width:100%" clearable :disabled="isUsed">
              <el-option v-for='item in monitorTypes' :key='item.id' :label='item.propertyValue' :value='item.propertyKey'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="传感器编号" label-width="120px" prop='number'>
              <el-input v-model.trim='selectSensor.number' placeholder="请输入传感器编号" maxlength="64" :disabled="!isSensorCreate">
                <i slot="suffix" class="config_icon" title="配置摄像头信息" @click="handleConfig" v-show="selectSensor.monitorTypeId === '5'"></i>
              </el-input>
          </el-form-item>
          <el-form-item label-width="120px" label="修改生效基准值" v-show="selectSensor.monitorTypeId === '1' && !isSensorCreate">
            <el-switch v-model='effValueChange' active-color="#13ce66" inactive-color="#ff4949" title="改变下列输入框的状态" @change='switchChange' style='margin-top:7px'></el-switch>
            <el-button @click='resetEffValue' round v-show='effValueChange' class='resetbtn' title='重置生效基准值'>重置</el-button>
          </el-form-item>
          <el-form-item label="生效基准值X" label-width="120px" prop='effValueX' v-if="selectSensor.monitorTypeId === '1'">
              <el-input v-model.trim='selectSensor.effValueX' placeholder="请输入生效基准值X" maxlength="42" clearable :disabled="!effValueChange"></el-input>
          </el-form-item>
          <el-form-item label="生效基准值Y" label-width="120px" prop='effValueY' v-if="selectSensor.monitorTypeId === '1'">
              <el-input v-model.trim='selectSensor.effValueY' placeholder="请输入生效基准值Y" maxlength="42" clearable :disabled="!effValueChange"></el-input>
          </el-form-item>
          <el-form-item label-width="120px" label="通知">
            <el-switch v-model='selectSensor.notifyFlag' active-color="#13ce66" inactive-color="#ff4949" title="改变下列输入框的状态" @change='notifyChange' style='margin-top:7px'></el-switch>
            <el-tooltip class="item" effect="dark">
               <div slot="content">
                <p>开启后该传感器加入数据状态的监控，</p>
                <br/>
                <p>数据丢失时，将进行邮件短信的提醒。</p>
              </div>
              <span class="help_icon"></span>
            </el-tooltip>
          </el-form-item>
          <el-form-item v-show="selectSensor.monitorTypeId === '5'" label-width="120px" label="定时抓拍">
            <el-switch v-model='selectSensor.photographFlag' active-color="#13ce66" inactive-color="#ff4949"
              title="改变下列输入框的状态" @change='photographFlagChange' style='margin-top:7px'></el-switch>
            <el-tooltip class="item" effect="dark">
              <div slot="content">
                <p>关闭后该传感器不再有定时抓拍数据。</p>
              </div>
              <span class="help_icon"></span>
            </el-tooltip>
          </el-form-item>
          <el-form-item label="使用状态" label-width="120px">
            <el-select v-model="selectSensor.statusName" style="width:100%" disabled>
              <el-option label="未使用" value="未使用"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot='footer' class="dialog-footer">
          <el-button type="primary" @click='selectSensorSubmit' :loading="isloading">提交</el-button>
          <el-button type="info" @click='sensorDialogVisible = false'>取消</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import {getSensorMessage, addSensor, deleteSensor, checkSensorName, resetSensorEffValue} from '@/api/sensor.js'
import {getCompanyMessage} from '@/api/ou-level'
import {ERR_OK} from '@/api/config'
import { Message } from 'element-ui'
export default {
  data () {
    const checkSensorNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入传感器编号'))
      }
      // 温度和气象传感器编号要小写
      const flag = this.selectSensor.monitorTypeId === '3' || this.selectSensor.monitorTypeId === '4'
      if (flag && (/[A-Z]/).test(value)) {
        return callback(new Error('请输入小写的传感器编号'))
      }
      if (this.lastSensorNumber === value) {
        callback()
      } else {
        checkSensorName({
          number: value
        }).then((res) => {
          if (res.state === ERR_OK) {
            if (res.value) {
              callback(new Error('传感器编号重复！请重新输入'))
            } else {
              callback()
            }
          }
        })
      }
    }
    const checkEffvalueX = (rule, value, callback) => {
      if (!(/^(-)?\d+(\.\d{1,3})?$/).test(value) && value) {
        return callback(new Error('生效基准值X必须是数字,且最多有三位小数'))
      } else if ((this.selectSensor.effValueY || this.selectSensor.effValueY === 0) && typeof value !== 'number' && !value) {
        return callback(new Error('请输入生效基准值X'))
      } else {
        return callback()
      }
    }
    const checkEffvalueY = (rule, value, callback) => {
      if (!(/^(-)?\d+(\.\d{1,3})?$/).test(value) && value) {
        return callback(new Error('生效基准值Y必须是数字,且最多有三位小数'))
      } else if ((this.selectSensor.effValueX || this.selectSensor.effValueY === 0) && typeof value !== 'number' && !value) {
        return callback(new Error('请输入生效基准值Y'))
      } else {
        return callback()
      }
    }
    return {
      showConfig: false,
      currentPage1: 3,
      deleteNumber: null,
      deleteStatus: null,
      deletePass: true,
      effValueChange: false,
      companyList: [],
      formInline: {
        monitorTypeId: null,
        number: ''
      },
      total: 0,
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      tableData: [],
      isSensorCreate: true,
      selectSensor: {
        monitorTypeId: null,
        ouId: null,
        number: '',
        effValueX: null,
        effValueY: null,
        notifyFlag: true,
        photographFlag: true,
        statusName: '未使用'
      },
      sensorDialogVisible: false,
      sensorRules: {
        monitorTypeId: [
          {required: true, message: '请选择监测项类型', trigger: 'change'}
        ],
        ouId: [
          {required: true, message: '请选择单位', trigger: 'change'}
        ],
        number: [
          {required: true, validator: checkSensorNumber, trigger: 'submit'}
        ],
        effValueX: [
          {validator: checkEffvalueX, trigger: 'submit'}
        ],
        effValueY: [
          {validator: checkEffvalueY, trigger: 'submit'}
        ]
      },
      lastSensorNumber: '',
      isSearch: false,
      isloading: false,
      searchObj: {},
      isUsed: false,
      beidouSensor: {
        effValueX: null,
        effValueY: null
      },
      monitorTypes: JSON.parse(localStorage.getItem('monitorTypes'))
    }
  },
  methods: {
    handleSearch () {
      this.pageEnquiry.pageNum = 1
      this.searchObj = {
        monitorTypeId: this.formInline.monitorTypeId ? this.formInline.monitorTypeId : null,
        number: this.formInline.number ? this.formInline.number : null
      }
      this._getSensorMessage()
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.pageEnquiry.pageNum = 1
      this._getSensorMessage()
    },
    handleConfig () {
      let url = 'https://' + config.ip + '/portal/cas/loginPage/'
      open(url, 'newwindow')
    },
    handleAdd () {
      this.isUsed = false
      this.isloading = false
      this.effValueChange = true
      this.isSensorCreate = true
      this.sensorDialogVisible = true
      this.lastSensorNumber = ''
      this.$nextTick(() => {
        this.$refs['formSensor'].resetFields()
        this.selectSensor = {
          monitorTypeId: null,
          ouId: null,
          number: '',
          effValueX: null,
          effValueY: null,
          notifyFlag: true,
          photographFlag: true,
          statusName: '未使用'
        }
        if (this.companyList.length === 1) {
          this.selectSensor.ouId = this.companyList[0].id
        }
      })
    },
    handleChange (row) {
      this.isUsed = row.status === 1
      this.isloading = false
      this.effValueChange = false
      this.isSensorCreate = false
      this.sensorDialogVisible = true
      this.lastSensorNumber = row.number
      this.$nextTick(() => {
        this.$refs['formSensor'].resetFields()
        this.selectSensor = {...row}
        this.selectSensor.statusName = row.status ? '已使用' : '未使用'
        this.beidouSensor.effValueX = row.effValueX
        this.beidouSensor.effValueY = row.effValueY
      })
    },
    handleDelete (number, status) {
      this.deleteNumber = number
      this.deleteStatus = status
      this.$confirm('此操作会永久删除该传感器，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this.deletePass = true
        if (this.deleteStatus === 1) {
          this.$message.error('请先删除已绑定该传感器的测点')
          this.deletePass = false
        }
        if (this.deletePass) {
          deleteSensor({number: this.deleteNumber}).then((res) => {
            if (res.state === ERR_OK) {
              Message({
                type: 'success',
                message: '删除成功',
                duration: 1000
              })
              if (this.pageEnquiry.pageNum !== 1) {
                this.pageEnquiry.pageNum = ((this.total % 10) === 1) ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
              }
              this._getSensorMessage({
                pageNum: this.pageEnquiry.pageNum,
                pageSize: 10
              })
            } else {
              this.$message.error(res.errorMessage)
            }
          })
        }
      }).catch(() => {
      })
    },
    _getSensorMessage () {
      let params = Object.assign(this.searchObj, {
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize
      })
      getSensorMessage(params).then((res) => {
        if (res.state === ERR_OK) {
          this.tableData = res.value.content
          this.total = res.value.totalElements
        }
      })
    },
    _getCompanyMessage () {
      getCompanyMessage().then((res) => {
        if (res.state === ERR_OK) {
          this.companyList = res.value
        }
      })
    },
    filterKey (obj, value) {
      return obj.filter(item => item.propertyValue === value)[0].propertyKey
    },
    resetEffValue () {
      this.$confirm('此操作会重置该传感器的生效基准值，确定继续?', '提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        center: true
      }).then(() => {
        resetSensorEffValue({number: this.lastSensorNumber}).then((res) => {
          if (res.state === ERR_OK) {
            this.selectSensor.effValueX = res.value.effValueX
            this.selectSensor.effValueY = res.value.effValueY
            this.selectSensor.effValueZ = res.value.effValueZ
            Message({
              type: 'success',
              message: '重置成功',
              duration: 1000
            })
          } else {
            this.sensorDialogVisible = false
            this._getSensorMessage()
            Message({
              type: 'error',
              message: res.errorMessage,
              duration: 2000
            })
          }
        })
      }).catch(() => {
      })
    },
    switchChange () {
      if (this.effValueChange) {
        this.$confirm('打开此开关可以修改该传感器的生效基准值，确定继续?', '提示', {
          cancelButtonClass: 'btn-custom-cancel',
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          center: true
        }).then(() => {
          this.effValueChange = true
        }).catch(() => {
          this.effValueChange = false
        })
      }
    },
    notifyChange () {
      let msg = (this.selectSensor.notifyFlag) ? '此操作会开启该传感器的数据状态通知，确定继续?'
        : '此操作会关闭该传感器的数据状态通知，确定继续?'
      this.$confirm(msg, '提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
      }).catch(() => {
        this.selectSensor.notifyFlag = !this.selectSensor.notifyFlag
      })
    },
    photographFlagChange () {
      let msg = (this.selectSensor.photographFlag) ? '此操作会开启该传感器的定时抓拍，确定继续?'
        : '此操作会关闭该传感器的定时抓拍，确定继续?'
      this.$confirm(msg, '提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
      }).catch(() => {
        this.selectSensor.photographFlag = !this.selectSensor.photographFlag
      })
    },
    _addSensor () {
      let params = Object.assign(this.selectSensor, {
        brandId: 1,
        typeId: 1,
        status: this.selectSensor.statusName === '已使用' ? 1 : 0,
        effValueX: this.selectSensor.monitorTypeId === '1' ? this.selectSensor.effValueX : this.beidouSensor.effValueX,
        effValueY: this.selectSensor.monitorTypeId === '1' ? this.selectSensor.effValueY : this.beidouSensor.effValueY
      })
      addSensor(params).then((res) => {
        if (res.state === ERR_OK) {
          this.sensorDialogVisible = false
          Message({
            type: 'success',
            message: this.isSensorCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this.isloading = false
          this._getSensorMessage()
        }
      })
      this.effValueChange = false
    },
    selectSensorSubmit () {
      // 提交增加信息
      this.isloading = true
      this.$refs['formSensor'].validate((valid) => {
        if (valid) {
          this._addSensor()
        } else {
          this.isloading = false
          return false
        }
      })
    },
    // 未使用和使用时绑定样式
    cellStyle ({row, column, rowIndex, columnIndex}) {
      if (row.status === 0 && columnIndex === 2) {
        return 'color:rgba(112,128,144,0.8)'
      } else if (row.status === 1 && columnIndex === 2) {
        return 'color:#1E90FF'
      }
    }
  },
  computed: {
    sensorDialogTitle () {
      let title = this.isSensorCreate ? '新增' : '修改'
      title += '传感器'
      return title
    }
  },
  mounted () {
    this._getSensorMessage()
    this._getCompanyMessage()
  },
  components: {
    location
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.sensor
  .el-main
    .el-form
      padding 0 10px
    .pagination_wrapper
      margin 10px 0
      float right
      .el-dropdown
        display inline-block
        width 110px
      .el-pagination
        display inline-block
  .el-dialog
    .el-form-item
      margin-bottom 0
    .el-button--primary
      background-color #1781dd
      border-color #1781dd
    .info
      color #ed3f14
      line-height 15px
      font-size 12px
.resetbtn
  float right
  margin-top 7px
  padding 6px 13px !important
  background-color rgb(245, 247, 250)
.resetbtn:active
  color #409EFF
  border 1px solid #dcdfe6
</style>
