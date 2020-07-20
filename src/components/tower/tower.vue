<template>
  <div class="tower full_container">
    <el-container>
      <el-header height="30px">
        <location></location>
      </el-header>
      <el-main>
         <el-form
          :inline="true"
          :model="formSearch"
          class="demo-form-inline"
          @submit.native.prevent>
          <el-form-item label="单位">
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
          <el-form-item label="部门">
            <el-select
              clearable
              @change="searchDepartment"
              v-model="formSearch.departmentId"
              :no-data-text="formSearch.companyId ? '' : '请先选择管理单位'"
              placeholder="请选择">
              <el-option
                v-for="item in searchOrgobj.orgDepartments"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="片区">
            <el-select
              clearable
              @change="searchArea"
              v-model="formSearch.areaId"
              :no-data-text="formSearch.departmentId ? '' : '请先选择部门'"
              placeholder="请选择">
              <el-option
                v-for="item in searchOrgobj.orgAreas"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="班组">
            <el-select
              clearable
              v-model="formSearch.groupId"
              :no-data-text="formSearch.areaId ? '' : '请先选择片区'"
              placeholder="请选择">
              <el-option
                v-for="item in searchOrgobj.orgGroups"
                :key="item.id"
                :label="item.name"
                :value="item.id">
              </el-option>
            </el-select>
          </el-form-item>
          <div class="right">
            <el-form-item label="线路">
              <el-select
                clearable
                v-model="formSearch.lineId"
                :no-data-text="formSearch.companyId ? '' : '请先选择管理单位'"
                placeholder="请选择">
                <el-option
                  v-for="item in lineData"
                  :key="item.id"
                  :label="item.name"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-input
                clearable
                v-model.trim="formSearch.name"
                placeholder="杆塔号"
                @keyup.enter.native="handleSearch(1)">
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                size="mini"
                icon="query_icon"
                @click="handleSearch(1)">
                查询
              </el-button>
            </el-form-item>
            <el-form-item>
              <el-button
                type="primary"
                plain
                size="mini"
                icon="add_icon"
                @click="handleAdd">
                新增
              </el-button>
            </el-form-item>
          </div>
        </el-form>
        <el-table :data="tableData" row-class-name="body_row">
          <el-table-column label="杆塔号">
            <template slot-scope="scope">
              <router-link :to="{ path: '/monitorData', query: {id: scope.row.id, name: scope.row.name, directionX: scope.row.directionX, directionY: scope.row.directionY}}">
                {{scope.row.name}}
              </router-link>
            </template>
          </el-table-column>
          <el-table-column prop="province" label="地区">
            <template slot-scope="scope">
                {{ scope.row.province }}
            </template>
          </el-table-column>
          <el-table-column prop="voltageLevel" label="电压等级(kV)">
            <template slot-scope="scope">
                {{ scope.row.voltageLevelStr }}
            </template>
          </el-table-column>
          <el-table-column prop="companyName" label="管理单位"></el-table-column>
          <el-table-column prop="departmentName" label="部门名称" ></el-table-column>
          <el-table-column prop="height" label="塔高(m)"></el-table-column>
          <el-table-column label="杆塔图">
            <template slot-scope="scope">
              <img v-lazy="getImage(scope.row.imageName)" width="30px" height="30px" preview="0">
            </template>
          </el-table-column>
          <el-table-column prop="operation" label="操作" width="250px">
            <template slot-scope="scope">
              <el-button
                @click="config(scope.row)"
                type="text"
                size="small"
                icon="set_icon">
                配置
              </el-button>
              <el-button
                type="text"
                size="small"
                icon="change_icon"
                @click="handleChange(scope.row)">
                修改
              </el-button>
              <el-button
                type="text"
                size="small"
                icon="delete_icon"
                @click="handleDelete(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="pagination_wrapper">
          <el-pagination
          text-color="#fff"
          background
          @current-change="_getTower"
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
          :title="towerDialogTitle"
          :visible.sync="towerDialogVisible"
          :close-on-click-modal="false"
          :modal-append-to-body='false'
          width="600px"
          top="10vh">
          <el-form ref="formSubmit" :model="dialogDatas" :rules="rulesAdd">
            <el-form-item label="杆塔号" prop="name" label-width="120px">
              <el-input clearable v-model.trim="dialogDatas.name" placeholder="请输入杆塔号"></el-input>
            </el-form-item>
            <el-form-item label="省份" label-width="120px">
              <el-select clearable v-model="dialogDatas.province" style="width: 100%;">
                <el-option v-for="item in localProvince" :key="item.id" :label="item.name" :value="item.name"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="电压等级(kV)" prop="voltageLevel" label-width="120px">
              <el-select clearable v-model="dialogDatas.voltageLevel" style="width: 100%;">
                <el-option v-for="item in voltageDatas" :key="item.id" :label="item.propertyValue" :value="item.propertyKey"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="经纬度" prop="degree" label-width="120px">
              <el-input v-model.trim="dialogDatas.degree">
                <i slot="suffix" class="map_select_icon" @click="mapSelect"></i>
              </el-input>
              <el-dialog
                title="选择经纬度"
                class="map_dialog"
                :visible.sync="showMap"
                :close-on-click-modal="false"
                width="600px"
                @close="handleClose"
                append-to-body>
                <map-select v-show="showMap" :refresh="refresh" :location="location" @selectLocation='selectLocation'></map-select>
              </el-dialog>
            </el-form-item>
            <el-form-item label="地址" prop="address" label-width="120px">
              <el-input clearable v-model.trim="dialogDatas.address"></el-input>
            </el-form-item>
            <el-form-item label="管理单位" prop="companyId" label-width="120px">
              <el-select clearable @change="addCompany" v-model="dialogDatas.companyId" style="width: 100%;">
                <el-option v-for="item in orgCompanys" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="部门名称" label-width="120px">
              <el-select :no-data-text="dialogDatas.companyId ? '' : '请先选择管理单位'" clearable @change="addDepartment" v-model="dialogDatas.departmentId" style="width: 100%;">
                <el-option v-for="item in dialogAdd.orgDepartments" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="片区" label-width="120px">
              <el-select :no-data-text="dialogDatas.departmentId ? '' : '请先选择部门'" clearable @change="addArea" v-model="dialogDatas.areaId" style="width: 100%;">
                <el-option v-for="item in dialogAdd.orgAreas" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="负责班组" label-width="120px">
              <el-select :no-data-text="dialogDatas.areaId ? '' : '请先选择片区'" clearable @change="addGroup" v-model="dialogDatas.groupId" style="width: 100%;">
                <el-option v-for="item in dialogAdd.orgGroups" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="杆塔负责人" label-width="120px">
              <el-select :no-data-text="dialogDatas.groupId ? '' : '请先选择班组'" clearable v-model="workerId" style="width: 100%;">
                <el-option v-for="item in workerDatas" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="线路" label-width="120px">
              <el-select :no-data-text="dialogDatas.companyId ? '' : '请先选择管理单位'" clearable v-model="dialogDatas.lineId" style="width: 100%;">
                <el-option v-for="item in dialogLineData" :key="item.id" :label="item.name" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="塔高(m)" prop="height" label-width="120px">
              <el-input clearable v-model.trim="dialogDatas.height" placeholder="请输入塔高"></el-input>
            </el-form-item>
            <el-form-item label="走向" prop="directionX" label-width="120px">
              <el-input clearable v-model.trim="dialogDatas.directionX"></el-input>
            </el-form-item>
            <el-form-item label="垂向" prop="directionY" label-width="120px">
              <el-input clearable v-model.trim="dialogDatas.directionY"></el-input>
            </el-form-item>
            <el-form-item label="是否存在隐患" label-width="120px">
              <el-radio-group v-model="dialogDatas.status">
                <el-radio label="1">是</el-radio>
                <el-radio label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="杆塔图片" label-width="120px">
              <el-upload
              ref="uploadImg"
              action=""
              accept=".jpg,.jpeg,.png,.gif,.bmp,.pdf,.JPG,.JPEG,.PBG,.GIF,.BMP,.PDF"
              :show-file-list="false"
              :before-upload="beforeUpload">
                <el-button size="small" round>点击上传</el-button>
                <div slot="tip" class="el-upload__tip" :title="tip">{{tip}}</div>
              </el-upload>
            </el-form-item>
          </el-form>
          <span slot="footer" class="dialog-footer">
            <el-button type="primary" @click="addSubmit" :loading="isLoading">确 定</el-button>
            <el-button type="info" @click="towerDialogVisible = false">取 消</el-button>
          </span>
        </el-dialog>
      </el-main>
      <router-view></router-view>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import MapSelect from '@/base/map-select/map-select'
import {getTowerMessage, fileUpload, addTower, deleteTower, findCompanyLine, renameCheck, getPerson} from '@/api/tower'
import {getProperty} from '@/api/property'
import {getOrgTreeData, choseCompany, choseDepartment, choseArea} from '@/common/js/ou'
import {ERR_OK} from '@/api/config'
import {Message} from 'element-ui'
export default {
  data () {
    const checkTowerName = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入杆塔号'))
      }
      // 管理单位是必选项，必须有管理单位才能判断是否重名
      if (!this.dialogDatas.companyId) {
        return callback()
      } else {
        if (this.lastName === value) {
          callback()
        } else {
          renameCheck({name: value, companyId: this.dialogDatas.companyId})
            .then((res) => {
              if (res.state === ERR_OK) {
                if (res.value) {
                  callback(new Error('杆塔号重复！请重新输入'))
                } else {
                  callback()
                }
              }
            })
        }
      }
    }
    const checkCompanyId = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择管理单位'))
      }
      if (this.dialogDatas.name) {
        this.$refs.formSubmit.validateField('name')
      }
      callback()
    }
    const checkTowerHeight = (rule, value, callback) => {
      if (!(/^\d+(\.\d+)?$/.test(value)) && value) {
        callback(new Error('请输入正数值'))
      } else if (value === '0' || value === 0) {
        callback(new Error('请输入正数值'))
      } else {
        callback()
      }
    }
    const checkTowerdirectionX = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入走向'))
      }
      if (value === this.dialogDatas.directionY) {
        return callback(new Error('走向和垂向值重复'))
      } else {
        return callback()
      }
    }
    const checkTowerDegree = (rule, value, callback) => {
      if (!this.dialogDatas.degree) {
        return callback(new Error('请输入经纬度'))
      }
      setTimeout(() => {
        if (!(/^\d+(\.\d+)?(,){1}\d+(\.\d+)?$/.test(this.dialogDatas.degree))) {
          callback(new Error('请输入正确的经纬度格式'))
        } else {
          callback()
        }
      }, 1000)
    }
    return {
      refresh: false,
      showMap: false,
      // 江门
      // location: {
      //   lng: '113.089',
      //   lat: '22.585'
      // },
      // 广州
      location: {
        lng: '113.354',
        lat: '23.15'
      },
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      tip: '未上传',
      isLoading: false,
      orgCompanys: [],
      orgTree: [],
      isTowerCreate: true,
      towerDialogVisible: false,
      changeDialogVisible: false,
      localProvince: [],
      voltageDatas: [],
      companyLines: [],
      workerId: '',
      workerDatas: [],
      formSearch: {
        companyId: null,
        departmentId: null,
        areaId: null,
        groupId: null,
        lineId: null,
        name: ''
      },
      searchParams: {},
      searchOrgobj: {
        orgDepartments: [],
        orgGroups: [],
        orgAreas: [],
        orgChild: [],
        orgDepChild: []
      },
      tableData: [],
      lastName: '',
      dialogDatas: {},
      dialogAdd: {
        orgDepartments: [],
        orgGroups: [],
        orgAreas: [],
        orgChild: [],
        orgDepChild: []
      },
      rulesAdd: {
        name: [
          { required: true, validator: checkTowerName, trigger: 'submit' }
        ],
        degree: [
          { required: true, validator: checkTowerDegree, trigger: 'submit' }
        ],
        companyId: [
          { required: true, validator: checkCompanyId, trigger: 'submit' }
        ],
        height: [
          { validator: checkTowerHeight, trigger: 'submit' }
        ],
        directionX: [
          { required: true, validator: checkTowerdirectionX, trigger: 'submit' }
        ],
        directionY: [
          { required: true, message: '请输入垂向', trigger: 'submit' }
        ]
      }
    }
  },
  methods: {
    config (row) {
      this.$router.push({
        path: `/tower/config`,
        query: {id: row.id, ouId: row.ouId}
      })
    },
    mapSelect () {
      this.showMap = true
      this.towerDialogVisible = false
    },
    handleClose () {
      this.showMap = false
      this.towerDialogVisible = true
    },
    selectLocation (location) {
      this.dialogDatas.degree = location.lng + ',' + location.lat
      this.showMap = false
      this.towerDialogVisible = true
    },
    handleSearch (page) {
      this.searchParams = {...this.formSearch}
      this.pageEnquiry.pageNum = page
      this._getTower()
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.pageEnquiry.pageNum = 1
      this._getTower()
    },
    getImage (name) {
      if (!name) {
        return require('@/common/images/tower.png')
      } else {
        return '/mediaData/img/' + name
      }
    },
    searchCompany (e) {
      choseCompany(e, this.formSearch, this.searchOrgobj)
    },
    searchDepartment (e) {
      choseDepartment(e, this.formSearch, this.searchOrgobj)
    },
    searchArea (e) {
      choseArea(e, this.formSearch, this.searchOrgobj)
    },
    addCompany (e) {
      this.workerId = null
      this.workerDatas = []
      this.dialogDatas.lineId = null
      choseCompany(e, this.dialogDatas, this.dialogAdd)
    },
    addDepartment (e) {
      this.workerId = null
      this.workerDatas = []
      choseDepartment(e, this.dialogDatas, this.dialogAdd)
    },
    addArea (e) {
      this.workerId = null
      this.workerDatas = []
      choseArea(e, this.dialogDatas, this.dialogAdd)
    },
    addGroup (e) {
      this.workerId = null
      if (!e) {
        this.workerDatas = []
        return
      }
      getPerson(e).then((res) => {
        if (res.state === ERR_OK) {
          this.workerDatas = res.value
        }
      })
    },
    beforeUpload (file) {
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        this.$message.error('上传头像图片大小不能超过 5MB!')
        return
      }
      let fd = new FormData()
      fd.append('file', file)
      fileUpload(fd).then((res) => {
        if (res.state === ERR_OK) {
          this.tip = file.name
          this.dialogDatas.imageName = res.value
        }
      })
    },
    handleAdd () {
      this.isLoading = false
      this.refresh = !this.refresh
      this.isTowerCreate = true
      this.towerDialogVisible = true
      this.lastName = ''
      this.$nextTick(() => {
        this.$refs['formSubmit'].resetFields()
        this.dialogDatas = {
          name: '',
          province: '广东',
          voltageLevel: '',
          // 江门
          // degree: '113.089,22.585',
          // 广州
          degree: '113.354,23.15',
          address: '广东省广州市越秀区',
          companyId: null,
          departmentId: null,
          areaId: null,
          groupId: null,
          lineId: null,
          height: '',
          directionX: '线路走向',
          directionY: '线路垂向',
          imageName: '',
          status: '0'
        }
        // 江门
        // this.location = {
        //   lng: '113.089',
        //   lat: '22.585'
        // }
        // 广州
        this.location = {
          lng: '113.354',
          lat: '23.15'
        }
        this.workerId = null
        this.workerDatas = []
        if (this.orgCompanys.length > 0) {
          this.dialogDatas.companyId = this.orgCompanys[0].id
          choseCompany(this.dialogDatas.companyId, null, this.dialogAdd)
        }
        this.tip = '未上传'
      })
    },
    handleChange (row) {
      this.isLoading = false
      this.refresh = !this.refresh
      this.isTowerCreate = false
      this.towerDialogVisible = true
      this.lastName = row.name
      this.$nextTick(() => {
        this.$refs['formSubmit'].resetFields()
        this.dialogDatas = {...row}
        this.location = {
          lng: row.lng,
          lat: row.lat
        }
        this.dialogDatas.degree = row.lng + ',' + row.lat
        this.dialogDatas.status = (this.dialogDatas.status === 0 ? '0' : '1')
        this.tip = row.imageName
        choseCompany(this.dialogDatas.companyId, null, this.dialogAdd)
        choseDepartment(this.dialogDatas.departmentId, null, this.dialogAdd)
        choseArea(this.dialogDatas.areaId, null, this.dialogAdd)
        this.workerId = null
        this.workerDatas = []
        if (this.dialogDatas.groupName && this.dialogAdd.orgGroups) {
          getPerson(this.dialogDatas.groupId).then(res => {
            if (res.state === ERR_OK) {
              this.workerDatas = res.value
              this.workerId = row.workerId
            }
          })
        }
      })
    },
    handleDelete (id) {
      this.$confirm('此操作会永久删除该杆塔下所有的监测项和测点，确定删除?', '危险操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        this._deleteTower(id)
      }).catch(() => {})
    },
    addSubmit () {
      this.isLoading = true
      this.$refs['formSubmit'].validate((valid) => {
        if (valid) {
          this._addTower()
        } else {
          this.isLoading = false
          return false
        }
      })
    },
    _getTower () {
      let params = Object.assign(this.searchParams, {
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize
      })
      getTowerMessage(params).then((res) => {
        if (res.state === ERR_OK) {
          this.tableData = res.value.content
          this.total = res.value.totalElements
        }
      })
    },
    _addTower () {
      let ouId = this.dialogDatas.groupId ? this.dialogDatas.groupId : this.dialogDatas.areaId
        ? this.dialogDatas.areaId : this.dialogDatas.departmentId ? this.dialogDatas.departmentId
          : this.dialogDatas.companyId
      let params = Object.assign(this.dialogDatas, {
        ouId: ouId,
        lng: this.dialogDatas.degree.split(',')[0],
        lat: this.dialogDatas.degree.split(',')[1],
        status: this.dialogDatas.status === '0' ? 0 : 1,
        workerId: this.workerId
      })
      addTower(params).then((res) => {
        if (res.state === ERR_OK) {
          this.towerDialogVisible = false
          Message({
            type: 'success',
            message: this.isTowerCreate ? '新增成功' : '修改成功',
            duration: 1000
          })
          this._getTower()
        }
      })
    },
    _deleteTower (id) {
      deleteTower(id).then((res) => {
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
          this._getTower()
        }
      })
    },
    _getProvince () {
      // 加载本地的省份json文件
      this.$http.get('../../static/province/province.json').then((res) => {
        this.localProvince = res.data.province
      }).catch(() => {})
    },
    _getvoltageLevels () {
      getProperty('VOLTAGE_LEVEL').then((res) => {
        if (res.state === ERR_OK) {
          if (res.value.length > 0) {
            this.voltageDatas = res.value
          }
        }
      })
    },
    _findCompanyLine () {
      findCompanyLine().then(res => {
        if (res.state === ERR_OK) {
          this.companyLines = res.value
        }
      })
    }
  },
  mounted () {
    this._getTower()
    this._getProvince()
    this._getvoltageLevels()
    this._findCompanyLine()
    getOrgTreeData(this.orgCompanys)
  },
  computed: {
    towerDialogTitle () {
      let title = this.isTowerCreate ? '新增' : '修改'
      title += '杆塔'
      return title
    },
    dialogLineData () {
      if (this.dialogDatas.companyId) {
        return this.companyLines.filter(item => item.id === this.dialogDatas.companyId)[0].children
      } else {
        return []
      }
    },
    lineData () {
      if (this.formSearch.companyId) {
        return this.companyLines.filter(item => item.id === this.formSearch.companyId)[0].children
      } else {
        return []
      }
    }
  },
  components: {
    location,
    MapSelect
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.tower
  .el-form
    padding 0 10px
  .pagination_wrapper
    margin 10px 0
    float right
    .el-dropdown
      display inline-block
      width 110px
      .el-button
        width 110px
    .el-pagination
      display inline-block
  .el-dialog
    .info
      color #ed3f14
      line-height 15px
      font-size 12px
    .el-form-item
      margin-bottom 0
    .el-button--primary
      background-color #1781dd
      border-color #1781dd
    .el-upload__tip
      max-width 240px
      word-wrap break-word
      white-space nowrap
      text-overflow ellipsis
      overflow hidden
      line-height 22px
      position absolute
      left 97px
      top 0
    .el-radio-group
      padding 12px 5px
</style>
