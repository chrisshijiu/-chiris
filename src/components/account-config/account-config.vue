<template>
  <div class="full_container account-config">
    <el-container>
      <el-header height='30px'>
        <location></location>
      </el-header>
      <el-main>
        <el-form :inline="true" :model="formSearch" class="demo-form-inline" @submit.native.prevent>
          <div class="right" style="vertical-align:sub">
            <el-form-item>
              <el-input v-model.trim="formSearch.name" @keyup.enter.native="searchMsg(1)" placeholder="称呼" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click='searchMsg(1)' size="mini" icon="query_icon">查询</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click='addMsg' size="mini" icon="add_icon" plain>新增</el-button>
            </el-form-item>
          </div>
        </el-form>
        <el-table :data='tableData' row-class-name="body_row">
          <el-table-column label="称呼" prop="name"></el-table-column>
          <el-table-column label="短信号码" prop="phoneNumber"></el-table-column>
          <el-table-column label="邮箱账号" prop="email"></el-table-column>
          <el-table-column label="操作" width="250px">
            <template slot-scope="scope">
              <el-button icon="change_icon" type="text" size="small" @click="changeMsg(scope.row)">修改</el-button>
              <el-button icon="delete_icon" type="text" size="small" @click="deleteMsg(scope.row.id)">删除</el-button>
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
          :total="total"
          >
          </el-pagination>
        </div>
      </el-main>
      <el-dialog :title="dialogTitle" :visible.sync="dialogVisible" width="600px" :close-on-click-modal="false">
        <el-form :model="selectAccount" ref="formAccount" :rules="accountRules">
          <el-form-item label="称呼" label-width="100px" prop="name">
            <el-input v-model.trim="selectAccount.name" placeholder="请输入称呼" maxlength="32"></el-input>
          </el-form-item>
          <el-form-item label="短信号码" label-width="100px" prop="phoneNumber">
            <el-input v-model.trim="selectAccount.phoneNumber" placeholder="请输入短信号码"></el-input>
          </el-form-item>
          <el-form-item label="邮箱账号" label-width="100px" prop="email">
            <el-input v-model.trim="selectAccount.email" placeholder="请输入邮箱账号" maxlength="64"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="dialogSubmit" :loading="isloading">提交</el-button>
          <el-button type="info" @click="dialogVisible = false">取消</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>

<script>
import location from '@/base/location/location'
import {getAccountMsg, addAccountMsg, deleteAccountMsg} from '@/api/account-config'
import {ERR_OK} from '@/api/config'
import {Message} from 'element-ui'
export default {
  data () {
    const checkPhoneNumber = (rule, value, callback) => {
      if (value && !/^1\d{10}$/.test(value)) {
        callback(new Error('短信号码的格式不正确'))
      }
      if (!value && !this.selectAccount.email) {
        callback(new Error(' '))
      }
      callback()
    }
    const checkEmail = (rule, value, callback) => {
      if (value && !/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(value)) {
        callback(new Error('邮箱账号的格式不正确'))
      }
      if (!value && !this.selectAccount.phoneNumber) {
        callback(new Error('短信号码和邮箱账户中至少输入一个'))
      }
      callback()
    }
    return {
      tableData: [],
      formSearch: {
        name: ''
      },
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      isDialogCreate: true,
      dialogVisible: false,
      selectAccount: {
        id: null,
        name: '',
        phoneNumber: '',
        email: ''
      },
      accountRules: {
        name: [
          {required: true, message: '请输入称呼', trigger: ['submit', 'blur']}
        ],
        phoneNumber: [
          {validator: checkPhoneNumber, trigger: ['submit', 'blur']}
        ],
        email: [
          {validator: checkEmail, trigger: ['submit', 'blur']}
        ]
      },
      isSearch: false,
      isloading: false,
      searchObj: {}
    }
  },
  methods: {
    searchMsg (page) {
      let name = this.formSearch.name ? this.formSearch.name : null
      this.searchObj = {
        name: name
      }
      this.handleCurrentChange(page)
    },
    handleCurrentChange (page) {
      this.pageEnquiry.pageNum = page
      let params = Object.assign(this.searchObj, {pageNum: this.pageEnquiry.pageNum, pageSize: this.pageEnquiry.pageSize})
      this._getAccountMsg(params)
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.handleCurrentChange(1)
    },
    addMsg () {
      // 新增信息
      this.isloading = false
      this.dialogVisible = true
      this.isDialogCreate = true
      this.$nextTick(() => {
        this.$refs['formAccount'].resetFields()
        this.selectAccount = {
          id: null,
          name: '',
          phoneNumber: '',
          email: ''
        }
      })
    },
    changeMsg (row) {
      // 修改信息
      this.isloading = false
      this.dialogVisible = true
      this.isDialogCreate = false
      this.$nextTick(() => {
        this.$refs['formAccount'].resetFields()
        this.selectAccount = {
          id: row.id,
          name: row.name,
          phoneNumber: row.phoneNumber,
          email: row.email
        }
      })
    },
    deleteMsg (id) {
      // 删除信息
      this.$confirm('此操作会永久删除该账户，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        deleteAccountMsg(id).then((res) => {
          if (res.state === ERR_OK) {
            Message({
              type: 'success',
              message: '删除成功',
              duration: 1000
            })
            if (this.pageEnquiry.pageNum !== 1) {
              this.pageEnquiry.pageNum = ((this.total % 10) === 1) ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
            }
            this._getAccountMsg({
              pageNum: this.pageEnquiry.pageNum,
              pageSize: this.pageEnquiry.pageSize
            })
          } else {
            this.$message.error(res.errorMessage)
          }
        })
      }).catch(() => {
      })
    },
    checkDialog (obj) {
      if (!obj.name) {
        this.nameInfo = true
        this.validate = false
      }
      if (obj.phoneNumber && !/^1\d{10}$/.test(obj.phoneNumber)) {
        this.phoneNumberInfo = true
        this.phoneNumberMsg = '短信号码的格式不正确'
        this.validate = false
      }
      if (obj.email && !/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(obj.email)) {
        this.emailInfo = true
        this.emailMsg = '账户邮箱的格式不正确'
        this.validate = false
      }
      if (!obj.email && !obj.phoneNumber) {
        this.emailInfo = true
        this.emailMsg = '短信号码和邮箱账户中至少输入一个'
        this.validate = false
      }
    },
    _getAccountMsg (params) {
      getAccountMsg(params).then((res) => {
        if (res.state === ERR_OK) {
          this.tableData = res.value.content
          this.total = res.value.totalElements
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    dialogSubmit () {
      // 提交信息
      this.isloading = true
      this.$refs['formAccount'].validate((valid) => {
        if (valid) {
          this.selectAccount.phoneNumber = this.selectAccount.phoneNumber ? this.selectAccount.phoneNumber : null
          this.selectAccount.email = this.selectAccount.email ? this.selectAccount.email : null
          addAccountMsg(this.selectAccount).then((res) => {
            if (res.state === ERR_OK) {
              Message({
                type: 'success',
                message: this.isDialogCreate ? '新增成功' : '修改成功',
                duration: 1000
              })
              this._getAccountMsg({
                pageNum: this.pageEnquiry.pageNum,
                pageSize: this.pageEnquiry.pageSize
              })
              this.isloading = false
            }
          }).catch((err) => {
            console.log(err)
          })
          this.dialogVisible = false
        } else {
          this.isloading = false
          return false
        }
      })
    }
  },
  computed: {
    dialogTitle () {
      let title = this.isDialogCreate ? '新增' : '修改'
      title += '账户'
      return title
    }
  },
  mounted () {
    this._getAccountMsg({
      pageNum: 1,
      pageSize: 10
    })
  },
  components: {
    location
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
@import '~@/common/stylus/mixin.styl';
.account-config
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
