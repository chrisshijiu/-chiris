<template>
  <div class="organization full_container">
    <el-container>
      <el-header height="30px">
        <location></location>
      </el-header>
      <el-main>
        <el-tabs v-model="activeName" type="card" @tab-click="handleClick">
          <el-tab-pane label="单位" name="company"></el-tab-pane>
          <el-tab-pane label="部门" name="department"></el-tab-pane>
          <el-tab-pane label="片区" name="area"></el-tab-pane>
          <el-tab-pane label="班组" name="group"></el-tab-pane>
          <el-tab-pane label="人员" name="worker"></el-tab-pane>
        </el-tabs>
        <div class="main_wrapper">
          <el-form
          :inline="true"
          :model="formSearch"
          @submit.native.prevent>
            <el-form-item label="单位" v-if="activeName !== 'company'">
              <el-select
                clearable
                @change="searchCompany"
                v-model="formSearch.companyId"
                placeholder="请选择">
                <el-option
                  v-for="item in orgCompanys"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="部门" v-if="activeName !== 'company' && activeName !== 'department'">
              <el-select
                clearable
                @change="searchDepartment"
                v-model="formSearch.departmentId"
                :no-data-text="formSearch.companyId ? '' : '请先选择单位'"
                placeholder="请选择">
                <el-option
                  v-for="item in orgSearch.orgDepartments"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="片区" v-if="activeName === 'group' || activeName === 'worker'">
              <el-select
                clearable
                @change="searchArea"
                v-model="formSearch.areaId"
                :no-data-text="formSearch.departmentId ? '' : '请先选择部门'"
                placeholder="请选择">
                <el-option
                  v-for="item in orgSearch.orgAreas"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="班组" v-if="activeName === 'worker'">
              <el-select v-model="formSearch.groupId"
                clearable
                :no-data-text="formSearch.areaId ? '' : '请先选择片区'"
                placeholder="请选择">
                <el-option
                  v-for="item in orgSearch.orgGroups"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <div class="right">
              <el-form-item>
                <el-input
                  clearable
                  v-model.trim="formSearch.name"
                  :placeholder="label"
                  @keyup.enter.native="handleSearch">
                </el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="mini"
                  icon="query_icon"
                  @click="handleSearch">
                  查询
                </el-button>
              </el-form-item>
              <el-form-item v-if="search">
                <el-button
                  type="primary"
                  plain
                  size="mini"
                  icon="add_icon"
                  @click="handleOuAdd">
                  新增
                </el-button>
              </el-form-item>
            </div>
          </el-form>
          <el-table :data="tableData">
            <el-table-column v-if="activeName !== 'worker'" :key="Math.random()" prop="companyName" label="单位"></el-table-column>
            <el-table-column v-if="activeName !== 'worker' && activeName !== 'company'" :key="Math.random()" prop="departmentName" label="部门"></el-table-column>
            <el-table-column v-if="activeName !== 'worker' && activeName !== 'company' && activeName !== 'department'" :key="Math.random()" prop="areaName" label="片区"></el-table-column>
            <el-table-column v-if="activeName === 'group'" :key="Math.random()" prop="groupName" label="班组"></el-table-column>
            <el-table-column v-if="activeName === 'worker'" :key="Math.random()" prop="name" label="姓名"></el-table-column>
            <el-table-column v-if="activeName === 'worker'" :key="Math.random()" prop="phoneNumber" label="电话号码"></el-table-column>
            <el-table-column v-if="activeName === 'worker'" :key="Math.random()" prop="email" label="邮箱"></el-table-column>
            <el-table-column v-if="activeName === 'worker'" :key="Math.random()" prop="notifyFlag" label="是否通知">
              <template slot-scope="scope">
                <span style="color:#6091DB" v-if="scope.row.notifyFlag">是</span>
                <span style="color:grey" v-else>否</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="text"
                  size="small"
                  icon="change_icon"
                  @click="handleOuChange(scope.row)">
                  修改
                </el-button>
                <el-button
                  type="text"
                  size="small"
                  icon="delete_icon"
                  @click="handleOuDelete(scope.row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination_wrapper right">
            <el-pagination
            text-color="#fff"
            background
            @current-change="handeleGetAction"
            :current-page.sync="pageEnquiry.pageNum"
            :page-size="pageEnquiry.pageSize"
            :pager-count="5"
            :page-sizes="[10, 25, 50, 100]"
            @size-change="handleSizeChange"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total">
            </el-pagination>
          </div>

          <el-dialog :title="ouDialogTitle" :visible.sync="ouDialogVisible" :close-on-click-modal="false" width="600px">
            <el-form ref="ouForm" :model="selectOu" :rules="ouRules" label-width="80px">
              <el-form-item prop="companyId" label="单位">
                <el-select v-model="selectOu.companyId"
                  :disabled="!isCreate"
                  @change="changeCompany"
                  clearable
                  placeholder="请选择"
                  style="width: 100%;">
                  <el-option
                    v-for="item in orgCompanys"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="departmentId" label="部门" v-if="activeName !== 'department'">
                <el-select v-model="selectOu.departmentId"
                  :no-data-text="selectOu.companyId ? '' : '请先选择单位'"
                  :disabled="activeName === 'worker' && !isCreate"
                  @change="changeDepartment"
                  clearable
                  placeholder="请选择"
                  style="width: 100%;">
                  <el-option
                    v-for="item in orgSelect.orgDepartments"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="areaId" label="片区" v-if="activeName === 'group' || activeName === 'worker'">
                <el-select v-model="selectOu.areaId"
                  :disabled="activeName === 'worker' && !isCreate"
                  :no-data-text="selectOu.departmentId ? '' : '请先选择部门'"
                  @change="changeArea"
                  clearable
                  placeholder="请选择"
                  style="width: 100%;">
                  <el-option
                    v-for="item in orgSelect.orgAreas"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="groupId" label="班组" v-if="activeName === 'worker'">
                <el-select v-model="selectOu.groupId"
                  :disabled="activeName === 'worker' && !isCreate"
                  :no-data-text="selectOu.areaId ? '' : '请先选择片区'"
                  clearable
                  placeholder="请选择"
                  style="width: 100%;">
                  <el-option
                    v-for="item in orgSelect.orgGroups"
                    :key="item.id"
                    :label="item.name"
                    :value="item.id">
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="name" :label="label" label-width="80px">
                <el-input clearable v-model.trim="selectOu.name"
                          auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item prop="email" label="邮箱" label-width="80px" v-if="activeName === 'worker'">
                <el-input clearable v-model.trim="selectOu.email" @clear="emptyInput('email')"
                          auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item prop="phoneNumber" label="电话号码" label-width="80px" v-if="activeName === 'worker'">
                <el-input clearable v-model.trim="selectOu.phoneNumber" @clear="emptyInput('phoneNumber')"
                          auto-complete="off"></el-input>
              </el-form-item>
              <el-form-item prop="notifyFlag" label="是否通知" label-width="80px" v-if="activeName === 'worker'">
                <el-switch
                  v-model="selectOu.notifyFlag"
                  style='margin-top:11px'
                  active-color="#13ce66"
                  inactive-color="#ff4949">
                </el-switch>
              </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
              <el-button type="primary" @click="submit" :loading="isLoading">确 定</el-button>
              <el-button @click="ouDialogVisible = false">取 消</el-button>
            </div>
          </el-dialog>

        </div>
      </el-main>
      <router-view></router-view>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import {getOrganization, addOrganization, renameCheck, deleteOrganization, getWorker, addWorker, renameWorkerCheck, deleteWorker} from '@/api/organization'
import {getOrgTreeData, choseCompany, choseDepartment, choseArea} from '@/common/js/ou'
import {ERR_OK} from '@/api/config'
import {Message} from 'element-ui'
export default {
  data () {
    const checkRename = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入名称'))
      }
      if (this.activeName === 'worker') {
        this.ouId = this.orgSelect.orgGroups ? this.selectOu.groupId : null
        if (!this.ouId) return callback()
        if (this.lastName === value && this.lastOu === this.selectOu.groupId) return callback()
        renameWorkerCheck({name: value, ouId: this.ouId})
          .then((res) => {
            if (res.state === ERR_OK) {
              if (res.value) {
                callback(new Error('该名称已存在！请重新输入'))
              } else {
                callback()
              }
            }
          })
      } else {
        let pid = this.activeName === 'department' ? this.selectOu.companyId : this.activeName === 'area' ? this.selectOu.departmentId
          : this.activeName === 'group' ? this.selectOu.areaId : null
        this.pid = pid
        // 当没有选择pid对应的机构id时，pid为null，不进行重名判断
        if (!pid) return callback()
        if (this.lastName === value && this.lastOu === pid) return callback()
        renameCheck({ouName: value, pid: pid})
          .then((res) => {
            if (res.state === ERR_OK) {
              if (res.value) {
                callback(new Error('该名称已存在！请重新输入'))
              } else {
                callback()
              }
            }
          })
      }
    }
    const checkEmail = (rule, value, callback) => {
      if (value === '') {
        this.selectOu.email = null
      }
      if (!value) {
        return callback()
      }
      setTimeout(() => {
        if (!(/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value))) {
          callback(new Error('请输入正确的邮箱格式'))
        } else {
          callback()
        }
      }, 1000)
    }
    const checkPhoneNumber = (rule, value, callback) => {
      if (value === '') {
        this.selectOu.phoneNumber = null
      }
      if (!value) {
        return callback()
      }
      setTimeout(() => {
        if (!(/^1\d{10}$/.test(value))) {
          callback(new Error('请输入正确的手机号格式'))
        } else {
          callback()
        }
      }, 1000)
    }
    return {
      activeName: 'company',
      search: false,
      formSearch: {
        name: '',
        groupId: null,
        areaId: null,
        departmentId: null,
        companyId: null
      },
      searchParams: {},
      orgSearch: {
        orgDepartments: [],
        orgAreas: [],
        orgGroups: [],
        orgChild: [],
        orgDepChild: []
      },
      orgCompanys: [],
      tableData: [],
      label: '',
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      isLoading: false,
      ouDialogVisible: false,
      isCreate: true,
      selectOu: {
        name: '',
        companyId: null,
        departmentId: null,
        areaId: null,
        groupId: null,
        phoneNumber: null,
        email: null,
        notifyFlag: false
      },
      orgSelect: {
        orgDepartments: [],
        orgAreas: [],
        orgGroups: [],
        orgChild: [],
        orgDepChild: []
      },
      pid: null,
      ouId: null,
      lastName: '',
      lastOu: '',
      ouRules: {
        name: [
          { required: true, validator: checkRename, trigger: 'submit' }
        ],
        companyId: [
          { required: true, message: '请选择单位', trigger: 'submit' }
        ],
        departmentId: [
          { required: true, message: '请选择部门', trigger: 'submit' }
        ],
        areaId: [
          { required: true, message: '请选择片区', trigger: 'submit' }
        ],
        groupId: [
          { required: true, message: '请输入班组', trigger: 'submit' }
        ],
        email: [
          { validator: checkEmail, trigger: 'submit' }
        ],
        phoneNumber: [
          { validator: checkPhoneNumber, trigger: 'submit' }
        ]
      }
    }
  },
  methods: {
    handleSearch () {
      this.searchParams = {...this.formSearch}
      this.pageEnquiry.pageNum = 1
      this.handeleGetAction()
    },
    handleOuAdd () {
      this.isCreate = true
      this.ouDialogVisible = true
      this.isLoading = false
      this.lastName = ''
      this.lastOu = ''
      this.$nextTick(() => {
        this.$refs['ouForm'].resetFields()
        this.selectOu = {
          name: '',
          companyId: null,
          departmentId: null,
          areaId: null,
          groupId: null,
          phoneNumber: null,
          email: null,
          notifyFlag: false
        }
        if (this.orgCompanys.length > 0) {
          this.selectOu.companyId = this.orgCompanys[0].id
          choseCompany(this.selectOu.companyId, null, this.orgSelect)
        }
      })
    },
    handleOuChange (row) {
      if (this.activeName === 'company') {
        this.$confirm('单位名称无法修改', '提示', {
          cancelButtonClass: 'btn-custom-cancel',
          type: 'warning',
          center: true
        }).then(() => {}).catch(() => {})
        return
      }
      this.lastName = row.name
      this.lastOu = this.activeName === 'worker' ? row.groupId : this.activeName === 'group' ? row.areaId
        : this.activeName === 'area' ? row.departmentId : row.companyId
      this.isCreate = false
      this.ouDialogVisible = true
      this.isLoading = false
      this.$nextTick(() => {
        this.$refs['ouForm'].resetFields()
        this.selectOu = {...row}
        choseCompany(this.selectOu.companyId, null, this.orgSelect)
        choseDepartment(this.selectOu.departmentId, null, this.orgSelect)
        choseArea(this.selectOu.areaId, null, this.orgSelect)
      })
    },
    handleOuDelete (id) {
      if (this.activeName === 'company') {
        this.$confirm('单位无法删除', '提示', {
          cancelButtonClass: 'btn-custom-cancel',
          type: 'warning',
          center: true
        }).then(() => {}).catch(() => {})
        return
      }
      this.$confirm('确认删除', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning',
        center: true
      }).then(() => {
        if (this.activeName === 'worker') {
          this._deleteWorker(id)
        } else {
          this._deleteOrganization(id)
        }
      }).catch(() => {})
    },
    handeleGetAction () {
      switch (this.activeName) {
        case 'company':
          this.search = false
          let data1 = Object.assign(this.searchParams, {depth: 1})
          this._getOrganization(data1)
          this.label = '单位'
          break
        case 'department':
          this.search = true
          let data2 = Object.assign(this.searchParams, {depth: 2})
          this._getOrganization(data2)
          this.label = '部门'
          break
        case 'area':
          this.search = true
          let data3 = Object.assign(this.searchParams, {depth: 3})
          this._getOrganization(data3)
          this.label = '片区'
          break
        case 'group':
          this.search = true
          let data4 = Object.assign(this.searchParams, {depth: 4})
          this._getOrganization(data4)
          this.label = '班组'
          break
        case 'worker':
          this.search = true
          this._getWorker(this.searchParams)
          this.label = '人员'
          break
        default:
          break
      }
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.pageEnquiry.pageNum = 1
      this.handeleGetAction()
    },
    async handleTabChange () {
      this.orgCompanys = []
      await getOrgTreeData(this.orgCompanys)
      this.searchParams = {...this.formSearch}
      this.handeleGetAction()
    },
    handleClick (tab, event) {
      this.formSearch = {
        name: '',
        groupId: '',
        areaId: '',
        departmentId: '',
        companyId: ''
      }
      this.orgSearch = {
        orgDepartments: [],
        orgAreas: [],
        orgGroups: [],
        orgChild: [],
        orgDepChild: []
      }
      this.tableData = []
      this.handleTabChange()
    },
    searchCompany (e) {
      choseCompany(e, this.formSearch, this.orgSearch)
    },
    searchDepartment (e) {
      choseDepartment(e, this.formSearch, this.orgSearch)
    },
    searchArea (e) {
      choseArea(e, this.formSearch, this.orgSearch)
    },
    changeCompany (e) {
      choseCompany(e, this.selectOu, this.orgSelect)
    },
    changeDepartment (e) {
      choseDepartment(e, this.selectOu, this.orgSelect)
    },
    changeArea (e) {
      choseArea(e, this.selectOu, this.orgSelect)
    },
    filterPid (name, obj) {
      return obj.filter(item => item.name === name)[0].id
    },
    _getOrganization (params) {
      let datas = Object.assign({
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize
      }, params)
      getOrganization(datas).then((res) => {
        if (res.state === ERR_OK) {
          this.total = res.value.totalElements
          this.tableData = res.value.content
        }
      })
    },
    _addOrganization (params) {
      addOrganization(params).then((res) => {
        if (res.state === ERR_OK) {
          this.ouDialogVisible = false
          this.isLoading = false
          Message({
            type: 'success',
            message: this.isCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this.handeleGetAction()
        }
      })
    },
    _deleteOrganization (id) {
      deleteOrganization(id).then((res) => {
        if (res.state === ERR_OK) {
          if (this.pageEnquiry.pageNum !== 1) {
            this.pageEnquiry.pageNum = ((this.total % 10) === 1)
              ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
          }
          Message({
            type: 'success',
            message: '删除成功',
            duration: 1000
          })
          this.handeleGetAction()
        } else {
          Message({
            type: 'error',
            message: res.errorMessage,
            duration: 2000
          })
        }
      })
    },
    _getWorker (params) {
      let datas = Object.assign({
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize
      }, params)
      getWorker(datas).then((res) => {
        if (res.state === ERR_OK) {
          this.total = res.value.totalElements
          this.tableData = res.value.content
        }
      })
    },
    _addWorker (params) {
      addWorker(params).then((res) => {
        if (res.state === ERR_OK) {
          this.ouDialogVisible = false
          Message({
            type: 'success',
            message: this.isCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this.handeleGetAction()
        }
      })
    },
    _deleteWorker (id) {
      deleteWorker(id).then((res) => {
        if (res.state === ERR_OK) {
          if (this.pageEnquiry.pageNum !== 1) {
            this.pageEnquiry.pageNum = ((this.total % 10) === 1)
              ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
          }
          Message({
            type: 'success',
            message: '删除成功',
            duration: 1000
          })
          this.handeleGetAction()
        } else {
          Message({
            type: 'error',
            message: res.errorMessage,
            duration: 2000
          })
        }
      })
    },
    submit () {
      this.isLoading = true
      this.$refs['ouForm'].validate((valid) => {
        if (valid) {
          let data = Object.assign(this.selectOu, {pid: this.pid, ouId: this.ouId})
          if (this.activeName === 'worker') {
            this._addWorker(data)
          } else {
            this._addOrganization(data)
          }
        } else {
          this.isLoading = false
          return false
        }
      })
    },
    emptyInput (val) {
      this.selectOu[val] = null
    }
  },
  computed: {
    ouDialogTitle () {
      let title = this.isCreate ? '新增' : '修改'
      title += this.label
      return title
    }
  },
  mounted () {
    this.handleTabChange()
  },
  components: {
    location
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.main_wrapper
  padding 20px
  .el-form
    padding 0 10px
  .pagination_wrapper
    margin 10px 0
  .el-dialog
    .el-form-item
      margin-bottom 0 !important
</style>
