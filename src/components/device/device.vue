<template>
  <div class="device full_container">
    <el-container>
      <el-header height='30px'>
        <location></location>
      </el-header>
      <el-main>
        <el-form :inline='true' :model='formSearch' class="demo-form-inline" @submit.native.prevent>
          <div class="right" style="vertical-align:sub">
            <el-form-item>
              <el-input v-model.trim="formSearch.valueName" @keyup.enter.native="handleSearch(1)" placeholder="设备编号" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" size="mini" icon='query_icon' @click='handleSearch(1)'> 查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" plain size="mini" icon='add_icon' @click='handleAdd'> 新增</el-button>
            </el-form-item>
          </div>
        </el-form>
        <el-table :data='tableData' row-class-name="body_row" :cell-style="cellStyle">
          <el-table-column prop="number" label="设备编号"></el-table-column>
          <el-table-column prop="brandName" label="设备品牌"></el-table-column>
          <el-table-column label="使用状态">
            <template slot-scope="scope">
                {{format(scope.row.status,deviceStatus)}}
            </template>
          </el-table-column>
          <el-table-column prop="workingStatus" label="数据状态"></el-table-column>
          <el-table-column prop="deviceMatter" label="运行状态"></el-table-column>
          <el-table-column prop="operation" label="操作" width="250px">
            <template slot-scope="scope">
              <el-button type="text" size="small" icon="set_icon" @click="config(scope.row)">查看</el-button>
              <el-button type="text" size="small" icon="change_icon" @click="handleChange(scope.row)">修改</el-button>
              <el-button type="text" size="small" icon="delete_icon" @click="handleDelete(scope.row.number,scope.row.status)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
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
      </el-main>
      <router-view></router-view>
      <el-dialog :title="deviceDialogTitle" :visible.sync="deviceDialogVisible" width="600px" :close-on-click-modal="false">
        <el-form ref="formDeviceSubmit" :model='selectDevice' :rules="deviceRules">
          <el-form-item label="单位" label-width="100px" prop="company">
            <el-select v-model="selectDevice.company" style="width:100%" clearable :disabled="isUsed">
              <el-option v-for='item in companyList' :key='item.id' :label='item.name' :value='item.name'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备品牌" label-width="100px" prop="brand">
            <el-select clearable v-model.trim="selectDevice.brand" style="width:100%">
              <el-option v-for="item in deviceBrand" :key="item.id" :label='item.propertyValue' :value="item.propertyValue"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="设备编号" label-width="100px" prop="number">
              <el-input :disabled="!isDeviceCreate" v-model.trim='selectDevice.number' placeholder="请输入设备编号" maxlength="64" clearable></el-input>
          </el-form-item>
          <el-form-item label="使用状态" label-width="100px">
            <el-select v-model="selectDevice.status" style="width:100%" disabled clearable>
              <el-option v-for="item in deviceStatus" :key="item.id" :label='item.name' :value="item.name"></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <span slot='footer' class="dialog-footer">
          <el-button type="primary" @click='selectDeviceSubmit' :loading="isloading">提交</el-button>
          <el-button type="info" @click='deviceDialogVisible = false'>取消</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import {getDeviceMessage, addDevice, deleteDevice, checkDeviceName} from '@/api/device.js'
import {getProperty} from '@/api/property'
import {getCompanyMessage} from '@/api/ou-level'
import {ERR_OK} from '@/api/config'
import { Message } from 'element-ui'
export default {
  data () {
    const checkDeviceNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入设备编号'))
      }
      if (this.lastDeviceNumber === value) {
        callback()
      } else {
        checkDeviceName({
          number: value
        }).then((res) => {
          if (res.state === ERR_OK) {
            if (res.value) {
              callback(new Error('设备编号重复！请重新输入'))
            } else {
              callback()
            }
          }
        })
      }
    }
    return {
      total: 0,
      companyList: [],
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      formSearch: {
        valueName: ''
      },
      tableData: [],
      lastDeviceNumber: '',
      selectDevice: {
        id: null,
        number: '',
        status: '未使用',
        brand: '',
        company: ''
      },
      deviceBrand: [],
      deviceStatus: [
        {id: 0, name: '未使用'},
        {id: 1, name: '已使用'}
      ],
      deviceDialogVisible: false,
      isDeviceCreate: true,
      deviceRules: {
        company: [
          { required: true, message: '请选择单位', trigger: 'change' }
        ],
        brand: [
          { required: true, message: '请选择设备品牌', trigger: 'change' }
        ],
        number: [
          { required: true, validator: checkDeviceNumber, trigger: ['submit', 'blur'] }
        ]
      },
      isSearch: false,
      isloading: false,
      searchObj: {},
      isUsed: false
    }
  },
  methods: {
    format (id, array) {
      let name
      array.forEach((item) => {
        if (item.id === id) {
          name = item.name
        }
      })
      return name
    },
    handleAdd () {
      this.isUsed = false
      this.isloading = false
      this.isDeviceCreate = true
      this.deviceDialogVisible = true
      this.lastDeviceNumber = ''
      this.$nextTick(() => {
        this.$refs['formDeviceSubmit'].resetFields()
        this.selectDevice = {
          id: null,
          number: '',
          status: '未使用',
          brand: '',
          company: ''
        }
        if (this.companyList.length === 1) {
          this.selectDevice.company = this.companyList[0].name
        }
      })
    },
    handleChange (row) {
      this.isUsed = row.status === 1
      this.isloading = false
      this.isDeviceCreate = false
      this.deviceDialogVisible = true
      this.lastDeviceNumber = row.number
      this.$nextTick(() => {
        this.$refs['formDeviceSubmit'].resetFields()
        this.selectDevice = {
          id: row.id,
          number: row.number,
          status: this.format(row.status, this.deviceStatus),
          brand: this.filterValue(this.deviceBrand, String(row.brandId)),
          company: this.format(row.ouId, this.companyList)
        }
      })
    },
    handleDelete (number, status) {
      this.$confirm('此操作会永久删除该监测设备，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        if (status === 1) {
          this.$message.error('请先删除已绑定该监测设备的测点')
          return
        }
        deleteDevice({number: number}).then((res) => {
          if (res.state === ERR_OK) {
            Message({
              type: 'success',
              message: '删除成功',
              duration: 1000
            })
            if (this.pageEnquiry.pageNum !== 1) {
              this.pageEnquiry.pageNum = ((this.total % 10) === 1) ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
            }
            this.handleSearch(this.pageEnquiry.pageNum)
          } else {
            this.$message.error(res.errorMessage)
          }
        })
      }).catch(() => {
      })
    },
    handleSearch (page) {
      let valueName = this.formSearch.valueName ? this.formSearch.valueName : null
      this.searchObj = {
        number: valueName
      }
      this.handleCurrentChange(page)
    },
    dialogGetId (name, array) {
      let id
      array.forEach((item) => {
        if (item.name === name) {
          id = item.id
        }
      })
      return id
    },
    _getDeviceMessage (params) {
      getDeviceMessage(params).then((res) => {
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
    filterValue (obj, key) {
      return obj.filter(item => item.propertyKey === key)[0].propertyValue
    },
    _addDevice () {
      this.deviceDialogVisible = false
      let status = this.dialogGetId(this.selectDevice.status, this.deviceStatus)
      let brandId = this.filterKey(this.deviceBrand, this.selectDevice.brand)
      addDevice(
        {
          number: this.selectDevice.number,
          typeId: 1,
          secretKey: '',
          secretValue: '',
          status: status,
          brandId: brandId,
          ouId: this.dialogGetId(this.selectDevice.company, this.companyList)
        }
      ).then((res) => {
        if (res.state === ERR_OK) {
          Message({
            type: 'success',
            message: this.isDeviceCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this.isloading = false
          this.handleSearch(this.pageEnquiry.pageNum)
        }
      })
    },
    selectDeviceSubmit () {
      this.isloading = true
      this.$refs['formDeviceSubmit'].validate((valid) => {
        if (valid) {
          this._addDevice()
        } else {
          this.isloading = false
          return false
        }
      })
    },
    config (row) {
      this.$router.push({
        path: `/device/detail`,
        query: {number: row.number}
      })
    },
    handleCurrentChange (page) {
      this.pageEnquiry.pageNum = page
      let params = Object.assign(this.searchObj, {pageNum: this.pageEnquiry.pageNum, pageSize: this.pageEnquiry.pageSize})
      this._getDeviceMessage(params)
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.handleCurrentChange(1)
    },
    _getBrands () {
      getProperty('DEVICE_BRAND').then((res) => {
        if (res.state === ERR_OK) {
          if (res.value.length > 0) {
            this.deviceBrand = res.value
          }
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
  mounted () {
    this._getDeviceMessage({
      pageNum: 1,
      pageSize: 10
    })
    this._getCompanyMessage()
    this._getBrands()
  },
  computed: {
    deviceDialogTitle () {
      let title = this.isDeviceCreate ? '新增' : '修改'
      title += '设备'
      return title
    }
  },
  components: {
    location
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.device
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
</style>
