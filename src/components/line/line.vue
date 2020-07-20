<template>
  <div class="sensor full_container">
    <el-container>
      <el-header height='30px'>
        <location></location>
      </el-header>
      <el-main>
        <el-form
          :inline='true'
          :model='formSearch'
          class="demo-form-inline"
          @submit.native.prevent>
          <el-form-item label='单位'>
            <el-select
              v-model='formSearch.companyId'
              placeholder="请选择"
              clearable>
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label='电压等级(kV)'>
            <el-select
              v-model='formSearch.voltageLevel'
              placeholder="请选择"
              clearable>
              <el-option
                v-for="item in voltageData"
                :key="item.id"
                :label="item.propertyValue"
                :value="item.propertyKey">
              </el-option>
            </el-select>
          </el-form-item>
          <div class="right" style="vertical-align:sub">
            <el-form-item>
              <el-input
                v-model.trim="formSearch.name"
                @keyup.enter.native='handleSearch'
                placeholder="线路名称"
                clearable>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="mini"
                icon='query_icon'
                @click='handleSearch'>查询
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary" plain
                size="mini"
                icon='add_icon'
                @click='handleAdd'>新增
              </el-button>
            </el-form-item>
          </div>
        </el-form>
        <el-table :data='tableData'>
          <el-table-column
            prop="name"
            label="线路名称">
          </el-table-column>
          <el-table-column
            prop="voltageLevelStr"
            label="电压等级(kV)">
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                icon="change_icon"
                @click="handleChange(scope.row)">修改
              </el-button>
              <el-button
                type="text"
                size="small"
                icon="delete_icon"
                @click="handleDelete(scope.row.id)">删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination_wrapper">
          <el-pagination
          text-color="#fff"
          background
          @current-change="_getLine"
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
      <el-dialog
        :title="lineDialogTitle"
        :visible.sync="lineDialogVisible"
        :close-on-click-modal="false"
        width="600px">
        <el-form
          ref="lineSubmit"
          :model="selectLine"
          :rules="lineRules"
          label-width="100px">
          <el-form-item prop="companyId" label="单位">
            <el-select
              v-model="selectLine.companyId"
              :disabled="!isCreate"
              style="width: 100%;"
              clearable>
              <el-option
                v-for="item in companyList"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="voltageLevel" label="电压等级">
            <el-select
              v-model="selectLine.voltageLevel"
              style="width: 100%;"
              clearable>
              <el-option
                v-for="item in voltageData"
                :key="item.id"
                :label="item.propertyValue"
                :value="item.propertyKey">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item prop="name" label="线路名称">
            <el-input v-model.trim="selectLine.name"></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class="dialog-footer">
          <el-button
            type="primary"
            @click='handleSubmit'
            :loading="isloading">提交
          </el-button>
          <el-button
            type="info"
            @click='lineDialogVisible = false'>取消
          </el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import {getLine, addLine, deleteLine, renameCheck} from '@/api/line'
import {getCompanyMessage} from '@/api/ou-level'
import {getProperty} from '@/api/property'
import {ERR_OK} from '@/api/config'
import { Message } from 'element-ui'
export default {
  data () {
    const checkName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入线路名称'))
      }
      if (!this.selectLine.companyId || this.lastName === value) {
        return callback()
      } else {
        renameCheck({
          companyId: this.selectLine.companyId,
          name: value
        }).then((res) => {
          if (res.state === ERR_OK) {
            if (res.value) {
              return callback(new Error('线路名称重复！请重新输入'))
            } else {
              return callback()
            }
          }
        })
      }
    }
    return {
      total: 0,
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      lineDialogVisible: false,
      isloading: false,
      isCreate: true,
      lastName: '',
      companyList: [],
      voltageData: [],
      tableData: [],
      formSearch: {
        companyId: null,
        voltageLevel: '',
        name: ''
      },
      searchObj: {},
      selectLine: {
        companyId: null,
        voltageLevel: '',
        name: ''
      },
      lineRules: {
        companyId: [
          {required: true, message: '请选择单位', trigger: 'submit'}
        ],
        voltageLevel: [
          {required: true, message: '请选择电压等级', trigger: 'submit'}
        ],
        name: [
          {required: true, validator: checkName, trigger: 'submit'}
        ]
      }
    }
  },
  methods: {
    handleSearch () {
      this.pageEnquiry.pageNum = 1
      this.searchObj = {...this.formSearch}
      this._getLine()
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.pageEnquiry.pageNum = 1
      this._getLine()
    },
    handleAdd () {
      this.isloading = false
      this.lineDialogVisible = true
      this.isCreate = true
      this.lastName = ''
      this.$nextTick(() => {
        this.$refs['lineSubmit'].resetFields()
        this.selectLine = {
          companyId: null,
          voltageLevel: '',
          name: ''
        }
        if (this.companyList.length > 0) {
          this.selectLine.companyId = this.companyList[0].id
        }
      })
    },
    handleChange (row) {
      this.isloading = false
      this.lineDialogVisible = true
      this.isCreate = false
      this.lastName = row.name
      this.$nextTick(() => {
        this.$refs['lineSubmit'].resetFields()
        this.selectLine = {...row}
      })
    },
    handleDelete (id) {
      this.$confirm('此操作会永久删除该线路，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this._deleteLine(id)
      }).catch(() => {})
    },
    handleSubmit () {
      this.isloading = true
      this.$refs['lineSubmit'].validate((valid) => {
        if (valid) {
          this._addLine(this.selectLine)
        } else {
          this.isloading = false
          return false
        }
      })
    },
    _getLine () {
      let data = Object.assign(this.searchObj, {
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize
      })
      getLine(data).then(res => {
        if (res.state === ERR_OK) {
          this.tableData = res.value.content
          this.total = res.value.totalElements
        }
      })
    },
    _addLine (params) {
      addLine(params).then(res => {
        if (res.state === ERR_OK) {
          this.isloading = false
          this.lineDialogVisible = false
          Message({
            type: 'success',
            message: this.isCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this._getLine()
        }
      })
    },
    _deleteLine (id) {
      deleteLine(id).then(res => {
        if (res.state === ERR_OK) {
          Message({
            type: 'success',
            message: '删除成功',
            duration: 1000
          })
          if (this.pageEnquiry.pageNum !== 1) {
            this.pageEnquiry.pageNum = ((this.total % 10) === 1)
              ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
          }
          this._getLine()
        } else {
          Message({
            type: 'error',
            message: res.errorMessage,
            duration: 2000
          })
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
    _getvoltageLevels () {
      getProperty('VOLTAGE_LEVEL').then((res) => {
        if (res.state === ERR_OK) {
          if (res.value.length > 0) {
            this.voltageData = res.value
          }
        }
      })
    }
  },
  computed: {
    lineDialogTitle () {
      return this.isCreate ? '新增线路' : '修改线路'
    }
  },
  mounted () {
    this._getCompanyMessage()
    this._getvoltageLevels()
    this._getLine()
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
      margin-bottom 0 !important
</style>
