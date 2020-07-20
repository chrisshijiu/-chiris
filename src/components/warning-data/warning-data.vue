<template>
  <div class='full_container warningData'>
    <el-container>
      <el-header height='30px'>
        <location></location>
      </el-header>
      <el-main>
        <el-form :inline="true" :model="formSearch" class="demo-form-inline" @submit.native.prevent>
          <el-form-item label="杆塔名称">
            <el-input v-model.trim="formSearch.towerName" placeholder="杆塔名称" clearable
            @keyup.enter.native="handleSearch(1)"></el-input>
          </el-form-item>
          <el-form-item label="传感器编号">
            <el-input v-model.trim="formSearch.sensorNumber" placeholder="传感器编号" clearable
            @keyup.enter.native="handleSearch(1)"></el-input>
          </el-form-item>
          <el-form-item label="警报等级">
            <el-select v-model="formSearch.warningLevel" clearable>
              <el-option v-for="item in warningLevels" :key="item.id" :label='item.name' :value='item.name'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="处理状态">
            <el-select v-model="formSearch.status" clearable>
              <el-option v-for="item in status" :key="item.id" :label='item.name' :value='item.name'></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="日期">
            <el-date-picker
              v-model="formSearch.date"
              type="datetimerange"
              range-separator="至"
              start-placeholder="开始记录日期"
              end-placeholder="结束记录日期"
              prefix-icon="date_icon"
              value-format="yyyy-MM-dd HH:mm:ss">
            </el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" size="mini" icon='query_icon' @click='handleSearch(1)'>查询</el-button>
          </el-form-item>
        </el-form>
        <div class="right">
          <div class="table_footer" v-show='showTableFooter'>
            <div class="button_wrapper right">
              <el-button type="primary" plain @click="changeStatus(true)">更改为已处理</el-button>
              <el-button type="info" plain @click="changeStatus(false)">更改为未处理</el-button>
              <el-button plain @click="cancelChange">取消选择</el-button>
            </div>
            <div class="clear"></div>
          </div>
        </div>
        <el-table
          :data="warningData"
          row-class-name="body_row"
          ref="tableform"
          @selection-change="selectRow">
          <el-table-column type="selection" width="100px"></el-table-column>
          <el-table-column label="杆塔名称" prop="towerName"></el-table-column>
          <el-table-column label="传感器编号" prop="sensorNumber"></el-table-column>
          <el-table-column label="警报等级">
            <template slot-scope="scope">
              {{filterName(warningLevels,scope.row.warningLevel)}}
            </template>
          </el-table-column>
          <el-table-column label="警报时间" prop="warningTime"></el-table-column>
          <el-table-column label="记录时间" prop="logTimestamp"></el-table-column>
          <el-table-column label="处理状态">
            <template slot-scope="scope">
              {{filterName(status,scope.row.status)}}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button
                v-if="scope.row.status"
                type="text"
                size="small"
                icon="ok_icon"
                @click='chooseRow(scope.row)'
                title="点击更改为未处理">
              </el-button>
              <el-button
                v-if="!scope.row.status"
                type="text"
                size="small"
                icon="error_icon"
                @click='chooseRow(scope.row)'
                title="点击更改为已处理">
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="right">
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
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script>
import location from '@/base/location/location'
import {getWarningData, putSensorStatus} from '@/api/warning-data'
import {ERR_OK} from '@/api/config'
import {Message} from 'element-ui'
export default {
  data () {
    return {
      formSearch: {
        warningLevel: '',
        status: '',
        towerName: '',
        sensorNumber: '',
        date: []
      },
      warningData: [],
      status: [
        {id: 0, name: '未处理'},
        {id: 1, name: '已处理'}
      ],
      warningLevels: [
        {id: 1, name: '预警'},
        {id: 2, name: '报警'}
      ],
      selectRowId: [],
      showTableFooter: false,
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      searchObj: {}
    }
  },
  methods: {
    filterId (array, name) {
      return array.filter(item => item.name === name)[0].id
    },
    filterName (array, id) {
      return array.filter(item => item.id === id)[0].name
    },
    handleSearch (page) {
      this.$router.push({
        path: '/warningData'
      })
      let sensorNumber = this.formSearch.sensorNumber ? this.formSearch.sensorNumber : null
      let towerName = this.formSearch.towerName ? this.formSearch.towerName : null
      let warningLevel = this.formSearch.warningLevel ? this.filterId(this.warningLevels, this.formSearch.warningLevel) : null
      let status = this.formSearch.status ? this.filterId(this.status, this.formSearch.status) : null
      let warningTimeBegin = this.formSearch.date ? this.formSearch.date[0] : null
      let warningTimeEnd = this.formSearch.date ? this.formSearch.date[1] : null
      this.searchObj = {
        sensorNumber: sensorNumber,
        towerName: towerName,
        warningLevel: warningLevel,
        status: status,
        warningTimeBegin: warningTimeBegin,
        warningTimeEnd: warningTimeEnd
      }
      this.handleCurrentChange(page)
    },
    handleCurrentChange (page) {
      this.pageEnquiry.pageNum = page
      let params = Object.assign(this.searchObj, {pageNum: this.pageEnquiry.pageNum, pageSize: this.pageEnquiry.pageSize})
      this._getWarningData(params)
    },
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.handleCurrentChange(1)
    },
    changeStatus (state) {
      let selectList = this.selectRowId.join(',')
      if (state) {
        this.confirmChange(selectList, 1)
      } else {
        this.confirmChange(selectList, 0)
      }
    },
    confirmChange (selectList, status) {
      let content = (status === 1) ? '确定将已选中的所有警报信息更改为已处理?' : '确定将已选中的所有警报信息更改为未处理?'
      this.$confirm(content, '操作提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info',
        center: true
      }).then(() => {
        this._putSensorStatus({
          ids: selectList,
          status: status
        })
      }).catch(() => {
      })
    },
    selectRow (val) {
      this.showTableFooter = (val.length !== 0)
      this.selectRowId = []
      for (let i in val) {
        this.selectRowId[i] = val[i].id
      }
    },
    chooseRow (row) {
      let status = (row.status === 1) ? 0 : 1
      this._putSensorStatus({
        ids: row.id,
        status: status
      })
    },
    cancelChange () {
      this.$refs['tableform'].clearSelection()
    },
    _getWarningData (params) {
      getWarningData(params).then((res) => {
        if (res.state === ERR_OK) {
          this.warningData = res.value.content
          this.total = res.value.totalElements
        }
      }).catch((err) => {
        console.log(err)
      })
    },
    filterStatus (status) {
      return status === '未处理' ? 0 : 1
    },
    _putSensorStatus (params) {
      putSensorStatus(params).then((res) => {
        if (res.state === ERR_OK) {
          Message({
            type: 'success',
            message: '更改成功',
            duration: 1000
          })
          if (this.formSearch.status && params.status !== this.filterStatus(this.formSearch.status)) {
            let flag = this.selectRowId.length > 0 ? 1 : (this.total % 10) === 1
            if (this.pageEnquiry.pageNum !== 1) {
              this.pageEnquiry.pageNum = flag ? this.pageEnquiry.pageNum - 1 : this.pageEnquiry.pageNum
            }
          }
          this.handleSearch(this.pageEnquiry.pageNum)
        }
      }).catch((err) => {
        console.log(err)
      })
    }
  },
  mounted () {
    if (this.$route.query.name) {
      this.formSearch.towerName = decodeURIComponent(this.$route.query.name)
    }
    if (this.$route.query.status) {
      this.formSearch.status = decodeURIComponent(this.$route.query.status)
    }
    this.handleSearch(1)
  },
  components: {
    location
  }
}
</script>

<style lang="stylus" rel='stylesheet/stylus' scoped>
@import '~@/common/stylus/mixin.styl';
.warningData
  .table_footer
    margin 0 0 20px
  .pagination_wrapper
    margin-top 10px
    .el-dropdown
      display inline-block
      width 110px
    .el-pagination
      display inline-block
</style>
