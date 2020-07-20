<template>
  <div class="tower_config">
    <el-container class="is-vertical">
      <el-main>
        <div class="config_wrapper full_container">
          <el-container>
            <el-header height="30px">
              <location></location>
            </el-header>
            <el-main>
              <div class="operation_wrapper">
                <el-button type="primary" size="mini" @click="handleAddMonitor">新增监测项</el-button>
                <el-button type="primary" plain size="mini" @click="back">返回</el-button>
              </div>
              <div class="table_wrapper">
                <el-table
                :data="propertyCodes"
                :row-key="row => row.id"
                :expand-row-keys="expands"
                @expand-change="handleRowRequest"
                style="width: 100%">
                <el-table-column type="expand">
                  <template slot-scope="props">
                    <el-table :data="propertyValues"
                      style="width: 100%">
                      <el-table-column label="测点名称" prop="name" width="250px">
                      </el-table-column>
                      <el-table-column label="测点编号" prop="sensorNumber" width="250px">
                      </el-table-column>
                      <el-table-column label="设备编号" prop="deviceNumber">
                      </el-table-column>
                      <el-table-column label="测点类型">
                        <template slot-scope="scope">
                          {{scope.row.dataType === 1 ? '移动网络' : scope.row.dataType === 2 ? '北斗' :
                          scope.row.dataType === 3 ? '温度' : scope.row.dataType === 4 ? '气象' : scope.row.dataType === 5 ? '视频' : '短报文'}}
                        </template>
                      </el-table-column>
                      <el-table-column v-if="props.row.type !== 4 && props.row.type !== 5" label="预警值" prop="warn1">
                      </el-table-column>
                      <el-table-column v-if="props.row.type !== 4 && props.row.type !== 5" label="报警值" prop="warn2">
                      </el-table-column>
                      <el-table-column label="操作" width="250px">
                        <template slot-scope="valueScope">
                          <el-button
                            size="small"
                            type="text"
                            icon="change_icon"
                            @click="handleValueEdit(props.row, valueScope.row)">修改
                          </el-button>
                          <el-button
                            size="small"
                            type="text"
                            icon="delete_icon"
                            @click="handleValueDelete(valueScope.row)">删除
                          </el-button>
                          <el-button
                            v-if="props.row.type !== 5"
                            size="small"
                            type="text"
                            :icon="valueScope.row.status ? 'start_icon' : 'stop_icon'"
                            @click="handleGather(props.row, valueScope.row)">{{ valueScope.row.status ? '暂停' : '开启' }}
                          </el-button>
                        </template>
                      </el-table-column>
                    </el-table>
                    <div class="add_value left">
                      <el-button
                        type="primary"
                        plain
                        size="mini"
                        icon="add_icon"
                        @click="handleConfig(props.row)">
                        新增
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column
                  label=""
                  prop="name">
                </el-table-column>
                <el-table-column label="" width="210">
                  <template slot-scope="scope">
                    <el-button
                      size="small"
                      type="text"
                      icon="change_icon"
                      @click="handleEdit(scope.row)">修改
                    </el-button>
                    <el-button
                      size="small"
                      type="text"
                      icon="delete_icon"
                      @click="handleDelete(scope.row)">删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
              </div>
              <div class="pagination_wrapper">
                <el-pagination
                text-color="#fff"
                background
                @current-change="handleCurrentChange"
                :current-page.sync="pageEnquiry.pageNum"
                :page-size="pageEnquiry.pageSize"
                :pager-count="5"
                :page-sizes="[10, 25, 50, 100]"
                @size-change="handleSizeChange"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
              </div>
              <el-dialog
                :title="monitorTypeDialogTitle"
                :visible.sync="monitorTypeVisible"
                :modal-append-to-body="false"
                :close-on-click-modal="false"
                width="500px">
                <el-form :model="selectMonitorType" ref="formMonitorTypeSubmit" :rules="monitorTypeRules">
                  <el-form-item label="监测项名称" prop="name" label-width="110px">
                    <el-input v-model.trim="selectMonitorType.name"></el-input>
                  </el-form-item>
                  <el-form-item label="监测项类型" prop="type" label-width="110px">
                    <el-select :disabled="!isMonitorTypeCreate" clearable v-model="selectMonitorType.type" style="width: 100%;">
                      <el-option v-for="item in monitorTypes" :key="item.id" :label="item.propertyValue" :value="item.propertyValue"></el-option>
                    </el-select>
                  </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button type="primary" @click="addMonitorSubmit" :loading="isMonitorLoading">确 定</el-button>
                  <el-button type="info" @click="monitorTypeVisible = false">取 消</el-button>
                </span>
              </el-dialog>
              <el-dialog
                :title="pointDialogTitle"
                :visible.sync="pointDialogVisible"
                :modal-append-to-body='false'
                :close-on-click-modal="false"
                top="10vh"
                width="500px">
                <el-form :model="pointDatas" ref="formPointSubmit" :rules="pointRules" label-width="110px"
                  v-show="monitorTypeKeys.includes(monitorTypeId)">
                  <el-form-item label-width="80px">
                    <el-radio-group v-if="monitorTypeId === 1" v-model="activeName" style="margin-bottom: 30px;">
                      <el-radio-button :disabled="!isPointCreate && Boolean(pointDatas.dataType)" label="tilt">短报文 </el-radio-button>
                      <el-radio-button :disabled="!isPointCreate && Boolean(!pointDatas.dataType)" label="4G">移动网络</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item prop="name" label="测点名称">
                    <el-input v-model.trim="pointDatas.name"></el-input>
                  </el-form-item>
                  <el-form-item prop="brand" label="设备品牌">
                    <el-select clearable style="width: 100%;" @change="changeBrand" v-model="pointDatas.brand">
                      <el-option v-for="item in brandDatas" :key="item.id" :label="item.propertyValue" :value="item.propertyValue"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item prop="deviceNumber" label="设备编号">
                    <el-select filterable clearable v-model="pointDatas.deviceNumber" style="width: 100%;">
                      <el-option v-for="(item, index) in deviceList" :key="index" :label="item" :value="item"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item prop="sensorNumber" label="传感器编号">
                    <el-select clearable v-model="pointDatas.sensorNumber" style="width: 100%;">
                      <el-option v-for="(item, index) in sensorList" :key="index" :label="item" :value="item"></el-option>
                    </el-select>
                  </el-form-item>
                  <el-form-item prop="height" label="高度(m)" v-if="monitorTypeId === 2">
                    <el-input v-model.trim="pointDatas.height"></el-input>
                  </el-form-item>
                  <el-form-item prop="angle" label="偏北角(°)" v-if="monitorTypeId === 2">
                    <el-input v-model.trim="pointDatas.angle"></el-input>
                  </el-form-item>
                  <el-form-item :label="monitorTypeId === 5 ? `修改${label}配置` : `修改${label}间隔`"
                    v-show="(monitorTypeId === 4 && !isPointCreate) ||
                    (monitorTypeId === 5 && !isPointCreate) ||
                    (monitorTypeId === 1 && !isPointCreate && activeName === '4G')">
                    <el-switch v-model='pointDatas.timeIntervalFlag' active-color="#13ce66"
                      inactive-color="#ff4949" :title="monitorTypeId === 5 ? `修改${label}配置/使用默认${label}配置` : `修改${label}间隔/使用默认${label}间隔`" style='margin-top:7px'>
                    </el-switch>
                    <el-tooltip class="item" effect="dark">
                      <div slot="content">
                        <template v-if="monitorTypeId !== 5">
                          <p>调整传感器的采集时间，范围2-10。</p>
                          <br/>
                          <p>若传感器数据异常，可通过动态调整采集间隔</p>
                          <br/>
                          <p>更好的查看对应的数据情况。</p>
                        </template>
                        <template v-if="monitorTypeId === 5">
                          <p>调整传感器的抓拍配置，抓拍间隔范围大于2分钟小于240分钟</p>
                        </template>
                      </div>
                      <span class="help_icon"></span>
                    </el-tooltip>
                  </el-form-item>
                  <el-form-item prop="timeInterval" :label="`${label}间隔(分钟)`" v-show="pointDatas.timeIntervalFlag && (monitorTypeId === 4 || activeName === '4G')">
                    <el-input v-model.trim="pointDatas.timeInterval"></el-input>
                  </el-form-item>
                  <el-form-item prop="timeAlterValue" :label="`${label}时间段`" v-show="pointDatas.timeIntervalFlag && (monitorTypeId === 5 && !isPointCreate)">
                    <el-time-picker
                      class="time-select-s-e"
                      format="HH:mm"
                      is-range
                      v-model="timeAlterValue"
                      range-separator="至"
                      start-placeholder="开始时间"
                      end-placeholder="结束时间"
                      placeholder="选择时间范围">
                    </el-time-picker>
                  </el-form-item>

                  <el-form-item v-show="monitorTypeId !== 4 && monitorTypeId !== 5" label="警报值设置" class="warn-setting">
                  </el-form-item>
                  <el-form-item v-show="monitorTypeId !== 4 && monitorTypeId !== 5" prop="warn1" :label="'预警值' + measure">
                    <el-input v-model.trim="pointDatas.warn1"></el-input>
                  </el-form-item>
                  <el-form-item v-show="monitorTypeId !== 4 && monitorTypeId !== 5" prop="warn2" :label="'报警值' + measure">
                    <el-input v-model.trim="pointDatas.warn2"></el-input>
                  </el-form-item>
                </el-form>
                <el-form v-show="!monitorTypeKeys.includes(monitorTypeId)">
                  <el-form-item label="暂未接入" label-width="210px">
                  </el-form-item>
                </el-form>
                <span slot="footer" class="dialog-footer">
                  <el-button type="primary" @click="configSubmit" :loading="isPointLoading">确 定</el-button>
                  <el-button type="info" @click="pointDialogVisible = false">取 消</el-button>
                </span>
              </el-dialog>
            </el-main>
          </el-container>
        </div>
      </el-main>
      <m-footer></m-footer>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import MHeader from '@/base/m-header/m-header'
import MFooter from '@/base/m-footer/m-footer'
import {getMonitor, addMonitor, getConfig, deviceConfig, changeStatus, deleteDevice,
  getSensor, getDevice, deleteMonitor, renameItemCheck, renamePointCheck} from '@/api/tower'
import {getProperty} from '@/api/property'
import {ERR_OK} from '@/api/config'
import { Message } from 'element-ui'
export default {
  data () {
    const checkMonitorType = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入监测项名称'))
      }
      if (!this.towerId || this.lastItem === value) {
        return callback()
      } else {
        renameItemCheck({
          towerId: this.towerId,
          itemName: value
        }).then((res) => {
          if (res.state === ERR_OK) {
            if (res.value) {
              callback(new Error('监测项名称重复！请重新输入'))
            } else {
              callback()
            }
          }
        })
      }
    }
    const checkName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入测点名称'))
      }
      if (this.lastPoint === value) {
        callback()
      } else {
        renamePointCheck({
          towerId: this.towerId,
          itemType: this.monitorTypeId,
          name: value
        }).then((res) => {
          if (res.state === ERR_OK) {
            if (res.value) {
              callback(new Error('测点名称重复！请重新输入'))
            } else {
              callback()
            }
          }
        })
      }
    }
    const checkHeight = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入测点高度'))
      }
      setTimeout(() => {
        if (!(/^\d+(\.\d+)?$/.test(value))) {
          return callback(new Error('请输入正数值'))
        } else if (Number(value) > 0) {
          return callback()
        } else {
          return callback(new Error('请输入正数值'))
        }
      }, 500)
    }
    const checkAngle = (rule, value, callback) => {
      setTimeout(() => {
        if (!(/^\d+(\.\d+)?$/.test(value))) {
          return callback(new Error('偏北角范围为0-360'))
        } else if (Number(value) <= 360 && Number(value) >= 0) {
          return callback()
        } else {
          return callback(new Error('偏北角范围为0-360'))
        }
      }, 500)
    }
    const checkInterval = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      setTimeout(() => {
        if (this.monitorTypeId === 5) {
          if (!(/^[1-9]\d*$/).test(value)) {
            return callback(new Error('请输入范围为2-240的整数值'))
          } else if (Number(value) <= 240 && Number(value) >= 2) {
            return callback()
          } else {
            return callback(new Error('抓拍间隔范围为2-240'))
          }
        } else {
          if (!(/^[1-9]\d*$/).test(value)) {
            return callback(new Error('请输入范围为2-10的整数值'))
          } else if (Number(value) <= 10 && Number(value) >= 2) {
            return callback()
          } else {
            return callback(new Error('4G采集间隔范围为2-10'))
          }
        }
      }, 500)
    }
    const checkWarn1 = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      setTimeout(() => {
        if (!(/^\d+(\.\d+)?$/.test(value))) {
          callback(new Error('请输入正数值'))
        } else if (Number(value) <= 0) {
          callback(new Error('请输入正数值'))
        } else {
          if (this.pointDatas.warn2) {
            if (Number(value) < Number(this.pointDatas.warn2)) {
              callback()
            } else {
              callback(new Error('预警值需小于报警值！'))
            }
          } else {
            callback()
          }
        }
      }, 1000)
    }
    const checkWarn2 = (rule, value, callback) => {
      if (!value) {
        return callback()
      }
      setTimeout(() => {
        if (!(/^\d+(\.\d+)?$/.test(value))) {
          callback(new Error('请输入正数值'))
        } else if (Number(value) <= 0) {
          callback(new Error('请输入正数值'))
        } else {
          callback()
        }
      }, 1000)
    }
    const videoTimecheck = (rule, value, callback) => {
      let value1 = this.timeAlterValue
      if (!value1) {
        return callback()
      }
      let _this = this
      if (String(value1[0]).slice(16, 21) === String(value1[1]).slice(16, 21)) {
        callback(new Error('结束时间需要大于开始时间'))
        setTimeout(function () {
          _this.changeTimeAlterValue()
        }, 1500)
      } else {
        callback()
      }
    }
    return {
      monitorTypeKeys: [1, 2, 3, 4, 5], // 接入的监测项
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      activeName: 'tilt',
      activeWarn: 'warnSetting',
      isPointLoading: false,
      isMonitorLoading: false,
      towerId: null,
      itemId: null,
      lastItem: '',
      lastPoint: '',
      monitorTypeVisible: false,
      selectMonitorType: {
        name: '',
        type: ''
      },
      isMonitorTypeCreate: true,
      pointDialogVisible: false,
      pointDatas: {
        name: '',
        brand: '',
        deviceNumber: '',
        sensorNumber: '',
        angle: null,
        height: null,
        timeIntervalFlag: false,
        timeInterval: null,
        rangeBeginTime: null,
        rangeEndTime: null,
        warn1: '',
        warn2: '',
        dataType: 0
      },
      // 默认抓拍时间段初始值
      timeAlterValue: null,
      timeAlterValueDefault: null,
      rangeBeginTimeComputed: null,
      rangeEndTimeComputed: null,
      isPointCreate: true,
      pointRules: {
        name: [
          { required: true, validator: checkName, trigger: 'submit' }
        ],
        deviceNumber: [
          { required: true, message: '请选择设备编号', trigger: 'submit' }
        ],
        sensorNumber: [
          { required: true, message: '请选择传感器编号', trigger: 'submit' }
        ],
        height: [
          { required: true, validator: checkHeight, trigger: 'submit' }
        ],
        angle: [
          { required: true, validator: checkAngle, trigger: 'submit' }
        ],
        timeInterval: [
          { validator: checkInterval, trigger: 'blur' }
        ],
        warn1: [
          { validator: checkWarn1, trigger: 'blur' }
        ],
        warn2: [
          { validator: checkWarn2, trigger: 'blur' }
        ],
        timeAlterValue: [
          { validator: videoTimecheck, trigger: 'change' }
        ]
      },
      monitorTypeRules: {
        name: [
          { required: true, validator: checkMonitorType, trigger: 'blur' }
        ],
        type: [
          { required: true, message: '请选择监测项类型', trigger: 'change' }
        ]
      },
      propertyValues: [],
      propertyCodes: [],
      // 要展开的行，数值的元素是row的key值
      expands: [],
      sensorList: [],
      deviceList: [],
      deviceListAll: [],
      deviceDatas: [],
      brandDatas: [],
      monitorTypeId: null,
      pointDialogTitle: '',
      startGatherStatus: 1,
      monitorTypes: JSON.parse(localStorage.getItem('monitorTypes'))
    }
  },
  watch: {
    // 由于时间段选择控件的赋值形式和接口数据不一致，需要监听初始值变化，修改格式后赋值给控件el-time-picker
    pointDatas () {
      this.changeTimeAlterValue()
    },
    // 监听el-time-picker值改变，取时分格式字符串给rangeBeginTimeComputed、rangeEndTimeComputed，用于接口数据提交
    timeAlterValue (val) {
      let initValue = this.timeAlterValueDefault
      if (!val || val === initValue) {
        this.rangeBeginTimeComputed = null
        this.rangeEndTimeComputed = null
      } else if (val !== initValue) {
        this.rangeBeginTimeComputed = String(val[0]).slice(16, 21)
        this.rangeEndTimeComputed = String(val[1]).slice(16, 21)
      }
    }
  },
  methods: {
    // 当rangeBeginTime和rangeEndTime为空，timeAlterValue显示默认值00：00--23：59
    changeTimeAlterValue () {
      if (this.pointDatas.rangeBeginTime && this.pointDatas.rangeEndTime) {
        let bStr = 'Thu Mar 22 2012 ' + this.pointDatas.rangeBeginTime + ':00 GMT+0800 (中国标准时间)'
        let eStr = 'Thu Mar 22 2012 ' + this.pointDatas.rangeEndTime + ':59 GMT+0800 (中国标准时间)'
        this.timeAlterValue = [bStr, eStr]
      } else {
        this.timeAlterValue = this.timeAlterValueDefault
      }
    },
    back () {
      this.$router.push('/tower')
    },
    handleAddMonitor () {
      this.isMonitorLoading = false
      this.isMonitorTypeCreate = true
      this.monitorTypeVisible = true
      this.lastItem = ''
      this.$nextTick(() => {
        this.$refs['formMonitorTypeSubmit'].resetFields()
        this.selectMonitorType = {}
      })
    },
    handleEdit (row) {
      this.isMonitorLoading = false
      this.isMonitorTypeCreate = false
      this.monitorTypeVisible = true
      this.lastItem = row.name
      this.$nextTick(() => {
        this.$refs['formMonitorTypeSubmit'].resetFields()
        this.selectMonitorType = {...row}
        this.selectMonitorType.type = this.filterValue(this.monitorTypes, String(row.type))
      })
    },
    handleCurrentChange (page) {
      this.pageEnquiry.pageNum = page
      this._getMonitor()
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.handleCurrentChange(1)
    },
    _getMonitor () {
      getMonitor({
        towerId: this.towerId,
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.propertyCodes = res.value.content
          this.total = res.value.totalElements
          if (this.propertyCodes.length > 0) {
            this.expands = []
            this.expands.push(this.propertyCodes[0].id)
            this.propertyValues = res.value.content[0].mpDtos
          }
        }
      })
    },
    _addMonitor () {
      addMonitor({
        id: this.selectMonitorType.id ? this.selectMonitorType.id : null,
        name: this.selectMonitorType.name,
        type: this.filterKey(this.monitorTypes, this.selectMonitorType.type),
        towerId: this.towerId
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.monitorTypeVisible = false
          Message({
            type: 'success',
            message: this.isMonitorTypeCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this._getMonitor()
        }
      })
    },
    addMonitorSubmit () {
      this.isMonitorLoading = true
      this.$refs['formMonitorTypeSubmit'].validate((valid) => {
        if (valid) {
          this._addMonitor()
        } else {
          this.isMonitorLoading = false
          return false
        }
      })
    },
    handleDelete (row) {
      this.$confirm('此操作会永久删除该监测项下所有的测点，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteMonitor(row.id).then((res) => {
          if (res.state === ERR_OK) {
            Message({
              type: 'success',
              message: '删除成功',
              duration: 1000
            })
            if (this.pageEnquiry.pageNum !== 1) {
              this.pageEnquiry.pageNum = ((this.total % 10) === 1) ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
            }
            this._getMonitor()
          }
        })
      }).catch(() => {})
    },
    handleValueDelete (row) {
      this.$confirm('此操作会永久删除该测点，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteDevice(row.id).then((res) => {
          if (res.state === ERR_OK) {
            Message({
              type: 'success',
              message: '删除成功',
              duration: 1000
            })
            getConfig(row.itemId).then((res) => {
              if (res.state === ERR_OK) {
                this.propertyValues = res.value
              }
            })
          }
        })
      }).catch(() => {})
    },
    handleConfig (row) {
      this.startGatherStatus = 1
      this.isPointLoading = false
      this.activeName = 'tilt'
      this.isPointCreate = true
      this.pointDialogVisible = true
      this.lastPoint = ''
      this.monitorTypeId = row.type
      this.pointDialogTitle = this.filterValue(this.monitorTypes, String(row.type))
      this.itemId = row.id
      if (!this.monitorTypeKeys.includes(row.type)) return
      getConfig(row.id).then((res) => {
        if (res.state === ERR_OK) {
          this.propertyValues = res.value
          this.expands = []
          this.expands.push(row.id)
        }
      })
      this.$nextTick(() => {
        this.$refs['formPointSubmit'].resetFields()
        this.pointDatas = {}
        this._getDevice(row.type)
      })
    },
    handleValueEdit (codeRow, valuerow) {
      this.startGatherStatus = valuerow.status ? 1 : 0
      this.isPointLoading = false
      this.isPointCreate = false
      this.pointDialogVisible = true
      this.monitorTypeId = codeRow.type
      this.pointDialogTitle = this.filterValue(this.monitorTypes, String(codeRow.type))
      this.itemId = codeRow.id
      this.lastPoint = valuerow.name
      this.$nextTick(() => {
        this.$refs['formPointSubmit'].resetFields()
        this.pointDatas = {...valuerow}
        this._getDevice(codeRow.type)
        if (!this.pointDatas.dataType) {
          this.activeName = 'tilt'
        } else {
          this.activeName = '4G'
        }
      })
    },
    handleGather (propsRow, row) {
      let msg = row.status ? '暂停' : '开启'
      this.$confirm('此操作会' + msg + '采集该测点下的所有数据，确定' + msg + '?', '' + msg + '采集', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        changeStatus({
          id: row.id,
          status: row.status ? 0 : 1
        }).then(res => {
          if (res.state === ERR_OK) {
            getConfig(propsRow.id).then((res) => {
              if (res.state === ERR_OK) {
                this.propertyValues = res.value
              }
            })
          }
        })
      }).catch(() => {})
    },
    _getDevice (typeId) {
      getSensor({
        ouId: this.$route.query.ouId,
        monitorTypeId: typeId
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.sensorList = res.value
        }
      })
      getDevice({
        ouId: this.$route.query.ouId,
        monitorTypeId: typeId
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.deviceDatas = res.value
          if (res.value.length > 0) {
            this.deviceList = []
            this.deviceListAll = []
            res.value.forEach((item) => {
              if (item.devices.length > 0) {
                item.devices.forEach((device) => {
                  this.deviceList.push(device.number)
                  this.deviceListAll.push(device.number)
                  // 修改时回显设备品牌
                  if (device.number === this.pointDatas.deviceNumber) {
                    this.pointDatas.brand = item.brandName
                  }
                })
              }
            })
            if (!this.isPointCreate) {
              this.deviceList = []
              res.value.forEach(item => {
                if (item.brandName === this.pointDatas.brand) {
                  item.devices.forEach(device => {
                    this.deviceList.push(device.number)
                  })
                }
              })
            }
          }
        }
      })
    },
    filterKey (obj, value) {
      return obj.filter(item => item.propertyValue === value)[0].propertyKey
    },
    filterValue (obj, key) {
      return obj.filter(item => item.propertyKey === key)[0].propertyValue
    },
    changeBrand (e) {
      this.pointDatas = {
        name: this.pointDatas.name,
        brand: e,
        deviceNumber: '',
        sensorNumber: this.pointDatas.sensorNumber,
        warn1: this.pointDatas.warn1,
        warn2: this.pointDatas.warn2,
        dataType: this.pointDatas.dataType,
        id: this.pointDatas.id ? this.pointDatas.id : null
      }
      if (!e) {
        this.deviceList = this.deviceListAll
      } else {
        let devices = this.deviceDatas.filter(item => item.brandId === this.filterKey(this.brandDatas, e))[0]
          ? this.deviceDatas.filter(item => item.brandId === this.filterKey(this.brandDatas, e))[0].devices
          : []
        this.deviceList = []
        if (devices.length > 0) {
          devices.forEach((item) => {
            this.deviceList.push(item.number)
          })
        }
      }
    },
    handleRowRequest (row, expandedRows) {
      if (expandedRows.length === 0) {
        this.expands = []
      } else {
        this.propertyValues = []
        this.expands = []
        this.expands.push(row.id)
        getConfig(row.id).then((res) => {
          if (res.state === ERR_OK) {
            this.propertyValues = res.value
          }
        })
      }
    },
    configSubmit () {
      if (!this.monitorTypeKeys.includes(this.monitorTypeId)) {
        this.pointDialogVisible = false
        return
      }
      this.isPointLoading = true
      this.$refs['formPointSubmit'].validate((valid) => {
        if (valid) {
          if (!this.pointDatas.timeInterval && (this.timeAlterValue === this.timeAlterValueDefault || !this.timeAlterValue)) {
            this.pointDatas.timeIntervalFlag = false
          }
          if (!this.pointDatas.timeIntervalFlag) {
            this.pointDatas.timeInterval = null
            this.timeAlterValue = null
          }
          this.pointDialogVisible = false
          // dataType值：0为北斗短报文，1为4G网络
          this.pointDatas.dataType = this.monitorTypeId === 1 ? (this.activeName === 'tilt') ? 0 : 1 : this.monitorTypeId
          deviceConfig({
            id: this.pointDatas.id ? this.pointDatas.id : null,
            name: this.pointDatas.name,
            deviceNumber: this.pointDatas.deviceNumber,
            sensorNumber: this.pointDatas.sensorNumber,
            angle: this.pointDatas.angle,
            height: this.pointDatas.height,
            warn1: this.pointDatas.warn1,
            warn2: this.pointDatas.warn2,
            itemId: this.itemId,
            dataType: this.pointDatas.dataType,
            status: this.startGatherStatus,
            timeIntervalFlag: this.pointDatas.timeIntervalFlag,
            timeInterval: this.pointDatas.timeInterval,
            rangeBeginTime: this.rangeBeginTimeComputed,
            rangeEndTime: this.rangeEndTimeComputed
          }).then((res) => {
            if (res.state === ERR_OK) {
              Message({
                type: 'success',
                message: this.isPointCreate ? '新增成功' : '修改成功',
                duration: 1000
              })
              getConfig(this.itemId).then((res) => {
                if (res.state === ERR_OK) {
                  this.propertyValues = res.value
                }
              })
            } else {
              Message({
                type: 'error',
                message: res.errorMessage,
                duration: 2000
              })
            }
          })
        } else {
          this.isPointLoading = false
          return false
        }
      })
    },
    _getBrands () {
      getProperty('DEVICE_BRAND').then((res) => {
        if (res.state === ERR_OK) {
          if (res.value.length > 0) {
            this.brandDatas = res.value
          }
        }
      })
    }
  },
  computed: {
    monitorTypeDialogTitle () {
      let title = this.isMonitorTypeCreate ? '新增' : '修改'
      title += '监测项'
      return title
    },
    measure () {
      switch (this.monitorTypeId) {
        case 1 :
          return '(‰)'
        case 2 :
          return '(mm)'
        case 3 :
          return '(℃)'
        default :
          return ''
      }
    },
    label () {
      return this.monitorTypeId === 5 ? '抓拍' : '采集'
    }
  },
  created () {
    this.towerId = this.$route.query.id
    if (!this.towerId) return
    this._getMonitor()
    this._getBrands()
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
.tower_config
  position: fixed
  top: 76px
  left: 0
  bottom: 0
  right: 0
  z-index: 100
  background: #fff
  .config_wrapper
    .add_value
      margin 10px 84px
    .operation_wrapper
      float right
      margin 0 30px 15px
    .pagination_wrapper
      margin 10px 0
      float right
    .el-dialog
      .info
        color #ed3f14
        line-height 15px
        font-size 12px
</style>
