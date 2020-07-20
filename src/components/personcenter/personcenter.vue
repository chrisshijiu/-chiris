<template>
  <div class="full_container personcenter">
    <el-container>
      <el-header height="30px">
        <location></location>
      </el-header>
      <el-main class="person_com">
        <el-container>
          <el-aside width='220px'>
            <div class="aside_top">
              <i></i>
              <p>ID: {{personMsg.username}}</p>
              <p>{{personMsg.displayName}}</p>
              <p class="persontab">基本资料</p>
            </div>
          </el-aside>
          <el-main>
            <el-button size="medium" icon="editp_icon" @click='editMsg' type="primary"> 编辑</el-button>
            <div style="width:800px">
              <el-row>
                <el-col :span="3">
                  <i class="company_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">企业名称</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent">{{personMsg.ouName}}</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="3">
                  <i class="displayName_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">用户名称</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent" v-show="!showInput">{{personMsg.displayName}}</p>
                  <el-input v-model.trim="temp.displayName" v-show="showInput" maxlength="32"></el-input>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="3">
                  <i class="phoneNumber_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">手机</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent" v-show="!showInput">{{personMsg.phoneNumber}}</p>
                  <el-input v-model.trim="temp.phoneNumber" v-show="showInput"></el-input>
                  <p v-show="phoneNumberInfo" class="info">请输入正确的手机号码</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="3">
                  <i class="email_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">邮箱</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent" v-show="!showInput">{{personMsg.email}}</p>
                  <el-input v-model.trim="temp.email" v-show="showInput" maxlength="32"></el-input>
                  <p v-show="emailInfo" class="info">请输入正确的邮箱格式</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="3">
                  <i class="position_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">职位</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent">{{format(personMsg.position,position)}}</p>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="3">
                  <i class="location_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">地址</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent" v-show="!showInput">{{personMsg.location}}</p>
                  <el-input v-model.trim="temp.location" v-show="showInput" maxlength="32"></el-input>
                </el-col>
              </el-row>
              <el-row style="padding-bottom:10px">
                <el-col :span="3">
                  <i class="password_person"></i>
                </el-col>
                <el-col :span="4" :offset="1">
                  <p class="headMsg">密码</p>
                </el-col>
                <el-col :span="12">
                  <p class="headContent">******</p>
                </el-col>
                <el-col :span="3" :offset="1">
                  <el-button type="primary" plain @click="handleChange" icon="changep_icon" class="changebtn" id="changebtn"> 修改</el-button>
                </el-col>
              </el-row>
              <el-row style="padding-top:25px;border:none">
                <el-col :span="24">
                  <div v-show="showInput" class="footbtns center">
                    <el-button type="primary" @click="saveMsg" size="mini">保存</el-button>
                    <el-button type="info" @click="cancelMsg" size="mini" style="margin-left:100px">取消</el-button>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-main>
        </el-container>
      </el-main>
      <el-dialog title="修改密码" :visible.sync="changePasswordVisible" width="600px" :close-on-click-modal="false">
        <el-form :model="password" ref="formPassword" :rules="passwordRules">
          <el-form-item label="旧密码" label-width="120px" prop="old">
            <el-input v-model="password.old" placeholder="请输入旧密码" type="password" maxlength="18"></el-input>
          </el-form-item>
          <el-form-item label="新密码" label-width="120px" prop="new1">
            <el-input v-model="password.new1" placeholder="请输入新密码" type="password" maxlength="18"></el-input>
          </el-form-item>
          <el-form-item label="再次输入密码" label-width="120px" prop="new2">
            <el-input v-model="password.new2" placeholder="请再次输入新密码" type="password" maxlength="18"></el-input>
          </el-form-item>
        </el-form>
        <span slot='footer' class="dialog-footer">
          <el-button type="primary" @click='changePassword'>提交</el-button>
          <el-button type="info" @click='changePasswordVisible = false'>取消</el-button>
        </span>
      </el-dialog>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import {getPersonMsg, putPersonMsg, putPassword} from '@/api/person'
import {ERR_OK} from '@/api/config'
import {Message} from 'element-ui'
import {mapMutations} from 'vuex'
export default {
  data () {
    const checkOld = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入旧密码'))
      } else {
        if (value.length > 0 && value.length < 6) {
          callback(new Error('旧密码的长度不少于六位'))
        }
      }
      callback()
    }
    const checkNew1 = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入新密码'))
      } else {
        if (value.length > 0 && value.length < 6) {
          callback(new Error('新密码的长度不得少于六位'))
        }
      }
      callback()
    }
    const checkNew2 = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请再次输入新密码'))
      } else {
        if (value !== this.password.new1) {
          callback(new Error('两次输入的密码不一致'))
        }
      }
      callback()
    }
    return {
      showInput: false,
      changePasswordVisible: false,
      validate: true,
      oldPasswordInfo: false,
      new1PasswordInfo: false,
      new2PasswordInfo: false,
      ouNameInfo: false,
      displayNameInfo: false,
      emailInfo: false,
      phoneNumberInfo: false,
      oldPasswordMsg: '',
      new1PasswordMsg: '',
      new2PasswordMsg: '',
      oldPasswordstr: '',
      personMsg: {},
      temp: {},
      password: {
        old: '',
        new1: '',
        new2: ''
      },
      passwordRules: {
        old: [
          {required: true, validator: checkOld, trigger: ['submit', 'blur']}
        ],
        new1: [
          {required: true, validator: checkNew1, trigger: ['submit', 'blur']}
        ],
        new2: [
          {required: true, validator: checkNew2, trigger: ['submit']}
        ]
      },
      position: [
        {id: 0, name: '无'},
        {id: 1, name: '班长'}
      ]
    }
  },
  methods: {
    editMsg () {
      this.showInput = true
      this.temp = {...this.personMsg}
    },
    saveMsg () {
      this.validate = true
      this.resetInfo()
      this.checkMsg()
      if (!this.validate) {
        return
      }
      this.personMsg = {...this.temp}
      this.showInput = false
      this._putPersonMsg(this.personMsg)
    },
    checkMsg () {
      if (!this.temp.ouName) {
        this.ouNameInfo = true
        this.validate = false
      }
      if (this.temp.email && !/^[A-Za-z\d]+([-_.][A-Za-z\d]+)*@([A-Za-z\d]+[-.])+[A-Za-z\d]{2,4}$/.test(this.temp.email)) {
        this.emailInfo = true
        this.validate = false
      }
      if (this.temp.phoneNumber && !/^1\d{10}$/.test(this.temp.phoneNumber)) {
        this.phoneNumberInfo = true
        this.validate = false
      }
    },
    cancelMsg () {
      this.resetInfo()
      this.showInput = false
    },
    resetInfo () {
      this.ouNameInfo = false
      this.displayNameInfo = false
      this.emailInfo = false
      this.phoneNumberInfo = false
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
    handleChange () {
      this.changePasswordVisible = true
      this.$nextTick(() => {
        this.$refs['formPassword'].resetFields()
        this.password = {
          old: '',
          new1: '',
          new2: ''
        }
      })
    },
    ...mapMutations({
      setDisplayName: 'SET_DISPLAYNAME'
    }),
    changePassword () {
      this.$refs['formPassword'].validate((valid) => {
        if (valid) {
          this._putPassword({password: this.password.old, newPassword: this.password.new2})
        } else {
          return false
        }
      })
    },
    _putPersonMsg (params) {
      let displayName = this.personMsg.displayName ? this.personMsg.displayName : null
      let email = this.personMsg.email ? this.personMsg.email : null
      let phoneNumber = this.personMsg.phoneNumber ? this.personMsg.phoneNumber : null
      let location = this.personMsg.location ? this.personMsg.location : null
      putPersonMsg({
        id: this.personMsg.id,
        ouName: this.personMsg.ouName,
        displayName: displayName,
        email: email,
        phoneNumber: phoneNumber,
        position: this.personMsg.position,
        location: location
      }).then((res) => {
        if (res.state === ERR_OK) {
          let displayName = this.personMsg.displayName ? this.personMsg.displayName : this.personMsg.username
          this.setDisplayName(displayName)
          Message({
            type: 'success',
            message: '保存成功',
            duration: 1000
          })
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    _putPassword (params) {
      putPassword(params).then((res) => {
        if (res.state === ERR_OK) {
          Message({
            type: 'success',
            message: '修改成功',
            duration: 1000
          })
          this.changePasswordVisible = false
        } else if (res.state === 1) {
          Message({
            type: 'error',
            message: res.errorMessage,
            duration: 2000
          })
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  },
  mounted () {
    getPersonMsg().then((res) => {
      if (res.state === ERR_OK) {
        this.personMsg = res.value
        let displayName = this.personMsg.displayName ? this.personMsg.displayName : this.personMsg.username
        this.setDisplayName(displayName)
      }
    }).catch((err) => {
      console.log(err)
    })
  },
  components: {
    location
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.personcenter
  .person_com
    .el-aside
      height 100%
      background-color #D1E2F5
      position relative
      i
        bg-image-full("~@/common/images/personHead.png")
        width 80px
        height 80px
        display inline-block
        position relative
        top 50px
        left 70px
      p
        position relative
        top 70px
        text-align center
        font-family MicrosoftYaHei
        font-size 14px
        color #777777
        line-height 30px
      .persontab
        position absolute
        top 250px
        width 220px
        text-align center
        line-height 42px
        background-color #fff
        color #ff8423
        font-family MicrosoftYaHeiUI
        font-size 16px
    .el-main
      padding 20px 0 0 80px
      .el-button
        width 96px
        height 33px
        padding-top 6px
        margin-bottom 20px
      .el-row
        padding 21px 0 15px 0
        border-bottom 1px solid #ededed
        .headMsg
          font-weight bold
          font-size 16px
          font-family MicrosoftYaHeiUI
          line-height 30px
          color #505050
        .headMsg
          font-weight bold
          font-size 16px
          font-family MicrosoftYaHeiUI
          line-height 30px
          color #505050
        .headContent
          font-size 15px
          font-family MicrosoftYaHei
          color #4c4c4c
          line-height 30px
        .headContent
          font-size 15px
          font-family MicrosoftYaHei
          color #4c4c4c
          line-height 30px
        .el-input
          width 196px
          font-size 15px
        .info
          color #ed3f14
          font-size 12px
          height 0px
        .company_person
          personMsg_icon('~@/common/images/company_person.png')
        .displayName_person
          personMsg_icon('~@/common/images/displayName_person.png')
        .phoneNumber_person
          personMsg_icon('~@/common/images/phoneNumber_person.png')
        .email_person
          personMsg_icon('~@/common/images/email_person.png')
        .position_person
          personMsg_icon('~@/common/images/position_person.png')
        .location_person
          personMsg_icon('~@/common/images/location_person.png')
        .password_person
          personMsg_icon('~@/common/images/password_person.png')
  .el-dialog
    .el-form-item
      margin-bottom 0
      .info
        color #ed3f14
        line-height 15px
        font-size 12px
      .el-input:-webkit-autofill
        -webkit-text-fill-color #000 !important
        transition background-color 50000s ease-in-out 0s
    .el-button--primary
      background-color #1781dd
      border-color #1781dd
</style>
