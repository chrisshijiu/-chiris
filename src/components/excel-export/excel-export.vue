<template>
  <div class="excel-export full_container">
    <el-container>
      <el-header height="30px">
        <location></location>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <side-tree @select="selectTowers"></side-tree>
        </el-aside>
        <el-main
          v-loading="isGraphLoading"
          element-loading-text="图表生成中..."
          element-loading-spinner="loading_icon"
          element-loading-background="rgba(255, 255, 255, 0.2)">
          <div class="option_wrapper">
            <el-form :inline="true" :model="formInline">
              <el-form-item label="日期">
                <el-select v-model="formInline.datecategory" @change="datecategoryChange">
                  <el-option label="按日筛选" value="date"></el-option>
                  <el-option label="按周筛选" value="week"></el-option>
                  <el-option label="按月筛选" value="month"></el-option>
                  <el-option label="按年筛选" value="year"></el-option>
                </el-select>
              </el-form-item>
              <el-form-item class="datetime">
                <el-date-picker
                v-model="formInline.date[0]"
                :type="formInline.datecategory"
                placeholder="开始日期"
                prefix-icon="date_icon"
                :format="format"
                :value-format="valueFormat"
                :picker-options="pickerBeginDateBefore">
                </el-date-picker>
              </el-form-item>
              <el-form-item label="至" class="datetime">
                <el-date-picker
                v-model="formInline.date[1]"
                :type="formInline.datecategory"
                placeholder="结束日期"
                prefix-icon="date_icon"
                :format="format"
                :value-format="valueFormat"
                :picker-options="pickerBeginDateAfter">
                </el-date-picker>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="mini"
                  icon="create_icon"
                  @click="handleShowGraph"
                  :loading="isGraphLoading">
                  生成
                </el-button>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  size="mini"
                  icon="export_icon"
                  @click="handleExportExcel"
                  :loading="isExportLoading">
                  导出
                </el-button>
              </el-form-item>
            </el-form>
          </div>
          <div class="towers_wrapper">
            <div class="tower_wrapper" v-for="(towerData, index) in towersData" :key="index">
              <div id="tower" v-for="tower in towerData" :key="tower.towerId">
                <div class="title">{{tower.towerName}}</div>
                <div class="incline_wrapper" v-if="tower.inclineDatas.length">
                  <div class="sub_title">{{ tower.inclineDatas[0].inclineTitle }}</div>
                  <div class="incline" v-for="(incline, index) in tower.inclineDatas" :key="index">
                    <div class="echarts" :id="tower.towerName + data.ssn"
                      v-for="(data, index) in incline.datas" :key="index + data.ssn"
                      :style="{height:'calc((100vw - 297px) * 0.25)',width:'calc((100vw - 297px) * 0.5)'}">
                    </div>
                  </div>
                  <div class="clear"></div>
                </div>
                <div class="beidou_wrapper" v-if="tower.beidouDatas.length">
                  <div class="sub_title">{{ tower.beidouDatas[0].beidouTitle }}</div>
                  <div class="beidou" v-for="(beidou, index) in tower.beidouDatas" :key="index">
                    <div class="echarts" :id="tower.towerName + data.ssn"
                      v-for="(data, index) in beidou.datas" :key="index + data.ssn"
                      :style="{height:'calc((100vw - 297px) * 0.25)',width:'calc((100vw - 297px) * 0.5)'}">
                    </div>
                  </div>
                  <div class="clear"></div>
                </div>
                <!--温度-->
                <div class="beidou_wrapper" v-if="tower.temperatureDatas.length">
                  <div class="sub_title">{{ tower.temperatureDatas[0].temperatureTitle }}</div>
                  <div class="beidou" v-for="(temperature, index) in tower.temperatureDatas" :key="index">
                    <div class="echarts" :id="tower.towerName + data.ssn"
                         v-for="(data, index) in temperature.datas" :key="index + data.ssn"
                         :style="{height:'calc((100vw - 297px) * 0.25)',width:'calc((100vw - 297px) * 0.5)'}">
                    </div>
                  </div>
                  <div class="clear"></div>
                </div>
                <!--气象-->
                <div class="beidou_wrapper" v-if="tower.meteorologyDatas.length">
                  <div class="sub_title">{{ tower.meteorologyDatas[0].meteorologyTitle }}</div>
                  <div class="beidou" v-for="(meteorology, index) in tower.meteorologyDatas" :key="index">
                    <div v-for="(data, index) in meteorology.datas" :key="index + data.ssn">
                      <div class="echarts" :id="tower.towerName + data.ssn + 'wind'"
                           :style="{height:'calc((100vw - 297px) * 0.25)',width:'calc((100vw - 297px) * 0.5)'}">
                      </div>
                      <div class="echarts" :id="tower.towerName + data.ssn + 'rain'"
                           :style="{height:'calc((100vw - 297px) * 0.25)',width:'calc((100vw - 297px) * 0.5)'}">
                      </div>
                    </div>
                  </div>
                  <div class="clear"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="progress" v-if="showProgress">
            <el-progress type="circle"
              :percentage="percentage"
              :show-text="true"
              :width="150"
              :stroke-width="5"
              status="text">
              导出中...
            </el-progress>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>
<script>
import location from '@/base/location/location'
import SideTree from '@/base/export-side-tree/export-side-tree'
import {getGraph, exportData, getExcel} from '@/api/excel-export'
import {Message} from 'element-ui'
import echarts from 'echarts'
import axios from 'axios'
import {ERR_OK} from '@/api/config'
const oneDay = 24 * 60 * 60 * 1000
export default {
  data () {
    return {
      formInline: {
        date: [],
        datecategory: ''
      },
      sum: 0,
      finishCount: 0,
      dateType: 1,
      showProgress: false,
      percentage: 0,
      divide: [],
      uuid: null,
      companyId: null,
      towerIds: [],
      towersData: [],
      graphIds: [],
      exportDatas: [],
      exportDatasDivide: [],
      isExportLoading: false,
      isGraphLoading: false,
      pickerBeginDateBefore: {
        firstDayOfWeek: 1,
        disabledDate: (time) => {
          let endDateVal = (this.formInline.date[1]) ? new Date(this.formInline.date[1]).getTime() : ''
          if (endDateVal) {
            return time.getTime() > endDateVal
          }
        }
      },
      pickerBeginDateAfter: {
        firstDayOfWeek: 1,
        disabledDate: time => {
          let startDateVal = (this.formInline.date[0]) ? new Date(this.formInline.date[0]).getTime() : ''
          if (startDateVal) {
            if (this.formInline.datecategory === 'week') {
              return time.getTime() < startDateVal - oneDay
            } else {
              return time.getTime() < startDateVal
            }
          }
        }
      }
    }
  },
  methods: {
    datecategoryChange () {
      this.formInline.date = []
    },
    getCurrentTime (date) {
    // 规范时间格式yyyy-MM-dd HH:mm:ss
      let month = date.getMonth() + 1// 月
      let day = date.getDate()// 日
      let hour = date.getHours()// 时
      let minute = date.getMinutes()// 分
      let second = date.getSeconds()// 秒
      // 补0函数
      let supplement = s => s < 10 ? '0' + s : s
      // 当前时间
      let curTime = date.getFullYear() + '-' + supplement(month) + '-' + supplement(day) +
        ' ' + supplement(hour) + ':' + supplement(minute) + ':' + supplement(second)
      return curTime
    },
    chunk (array, size) {
      let result = []
      for (let i = 0; i < Math.ceil(array.length / size); i++) {
        let start = i * size
        let end = start + size
        result.push(array.slice(start, end))
      }
      return result
    },
    handleShowGraph () {
      let msg = (this.towerIds.length === 0) ? '请先选择杆塔'
        : (!this.formInline.date[0] || !this.formInline.date[1])
          ? '请先选择日期' : null
      if (msg) {
        Message({
          type: 'warning',
          message: msg,
          duration: 1000
        })
        return
      }
      this.towersData = []
      this.exportDatas = []
      this.isGraphLoading = true
      this.isGraphFail = false
      let start = new Date(this.formInline.date[0])
      let end = new Date(this.formInline.date[1])
      this.dateStart = this.getCurrentTime(start)
      this.dateEnd = this.getCurrentTime(end)
      switch (this.formInline.datecategory) {
        case 'date':
          this.dateType = 1
          this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 1 * oneDay))
          break
        case 'week':
          this.dateType = 2
          this.dateStart = this.getCurrentTime(new Date(start.getTime() - oneDay))
          this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 6 * oneDay))
          break
        case 'month':
          this.dateType = 3
          let endTime = end.getTime()
          end.setMonth(end.getMonth() + 1)
          end.setDate(0)
          this.dateEnd = this.getCurrentTime(new Date(endTime + end.getDate() * oneDay))
          break
        case 'year':
          this.dateType = 4
          // 判断是否是闰年
          if (end.getFullYear() % 400 === 0 || (end.getFullYear() % 4 === 0 && end.getFullYear() % 100 !== 0)) {
            this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 366 * oneDay))
          } else {
            this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 365 * oneDay))
          }
          break
        default:
          break
      }
      let divide = this.chunk(this.towerIds, 2)
      let reqList = []
      this.sum = 0
      this.finishCount = 0
      let that = this
      divide.map(item => {
        reqList.push(that._getGraph(item.join(',')))
      })
      axios.all(reqList).then(() => {
        let i = 0
        let timer = setInterval(() => {
          i++
          // 超过2分钟没有渲染完成时，结束计时器
          if (i > 2 * 60 * 10) {
            clearInterval(timer)
            this.isGraphLoading = false
            this.isGraphFail = true
            this.graphIds = []
          }
          if (this.sum === this.finishCount) {
            clearInterval(timer)
            this.isGraphLoading = false
            this.graphIds = this.towerIds
          }
        }, 100)
      }).catch(() => {
        this.isGraphLoading = false
        this.isGraphFail = true
        this.graphIds = []
      })
    },
    handleTowersGraph (towerDatas) {
      towerDatas.forEach((tower, index) => {
        let title = tower.towerName
        let id = tower.towerId
        let directionX = tower.directionX
        let directionY = tower.directionY
        this.exportDatas[id] = {
          uuid: null,
          towerId: id,
          beidouImgBaseDatas: [],
          inclineImgBaseDatas: [],
          temperatureBaseDatas: [],
          meteorologyBaseDatas: []
        }
        if (tower.beidouDatas.length !== 0) {
          tower.beidouDatas.forEach(beidou => {
            if (beidou.datas.length === 0) {
              beidou.beidouTitle = ''
              return
            }
            beidou.datas.forEach(data => {
              let dataEs = []
              let dataNs = []
              let seriesDatas = []
              let legendData = []
              beidou.beidouTitle = '北斗'
              seriesDatas.push(this.handleSeriesDatas(`-${directionX}`, data.dataNs, dataNs, data.id + 1, '北斗'))
              seriesDatas.push(this.handleLostDatas(`-${directionX}`, dataNs, data.id + 1))
              legendData.push(data.id + 1 + `-${directionX}`)
              seriesDatas.push(this.handleSeriesDatas(`-${directionY}`, data.dataEs, dataEs, data.id + 1, '北斗'))
              seriesDatas.push(this.handleLostDatas(`-${directionY}`, dataEs, data.id + 1))
              legendData.push(data.id + 1 + `-${directionY}`)
              this.initChart(data.ssn, title, '北斗', legendData, seriesDatas, index, id, data.pointName, 0)
            })
          })
        }
        if (tower.inclineDatas.length !== 0) {
          tower.inclineDatas.forEach(incline => {
            if (incline.datas.length === 0) {
              incline.inclineTitle = ''
              return
            }
            incline.datas.forEach(data => {
              let dataXs = []
              let dataYs = []
              let seriesDatas = []
              let legendData = []
              incline.inclineTitle = '倾斜'
              seriesDatas.push(this.handleSeriesDatas(`-${directionX}`, data.dataXs, dataXs, data.id + 1, '倾斜'))
              seriesDatas.push(this.handleLostDatas(`-${directionX}`, dataXs, data.id + 1))
              legendData.push(data.id + 1 + `-${directionX}`)
              seriesDatas.push(this.handleSeriesDatas(`-${directionY}`, data.dataYs, dataYs, data.id + 1, '倾斜'))
              seriesDatas.push(this.handleLostDatas(`-${directionY}`, dataYs, data.id + 1))
              legendData.push(data.id + 1 + `-${directionY}`)
              this.initChart(data.ssn, title, '倾斜', legendData, seriesDatas, index, id, data.pointName, 0)
            })
          })
        }
        if (tower.temperatureDatas.length !== 0) {
          tower.temperatureDatas.forEach(temperature => {
            if (temperature.datas.length === 0) {
              temperature.temperatureTitle = ''
              return
            }
            temperature.datas.forEach(data => {
              let dataXs = []
              let seriesDatas = []
              let legendData = []
              temperature.temperatureTitle = '温度'
              seriesDatas.push(this.handleSeriesDatas(`- 温度`, data.datas, dataXs, data.id + 1, '温度'))
              seriesDatas.push(this.handleLostDatas(`- 温度`, dataXs, data.id + 1))
              legendData.push(data.id + 1 + `- 温度`)
              this.initChart(data.ssn, title, '温度', legendData, seriesDatas, index, id, data.pointName, 0)
            })
          })
        }
        if (tower.meteorologyDatas.length !== 0) {
          tower.meteorologyDatas.forEach(meteorology => {
            if (meteorology.datas.length === 0) {
              meteorology.meteorologyTitle = ''
              return
            }
            meteorology.datas.forEach(data => {
              let dataWind = []
              let dataR1 = []
              let dataR2 = []
              let dataR3 = []
              let seriesDatas = []
              let legendData = []
              let seriesDatasWind = []
              let legendDataWind = []
              meteorology.meteorologyTitle = '气象'
              seriesDatasWind.push(this.handleSeriesDatas(`-风速`, data.datas, dataWind, data.id + 1, '气象-风速'))
              seriesDatasWind.push(this.handleLostDatas(`-风速`, dataWind, data.id + 1))
              legendDataWind.push(data.id + 1 + `-风速`)
              this.initChart(data.ssn + 'wind', title, '气象', legendDataWind, seriesDatasWind, index, id, data.pointName, 1)
              seriesDatas.push(this.handleSeriesDatas(`-最近一日雨量`, data.datas, dataR1, data.id + 1, '气象-雨量-日'))
              seriesDatas.push(this.handleLostDatas(`-最近一日雨量`, dataR1, data.id + 1))
              legendData.push(data.id + 1 + `-最近一日雨量`)
              seriesDatas.push(this.handleSeriesDatas(`-最近一小时雨量`, data.datas, dataR2, data.id + 1, '气象-雨量-时'))
              seriesDatas.push(this.handleLostDatas(`-最近一小时雨量`, dataR2, data.id + 1))
              legendData.push(data.id + 1 + `-最近一小时雨量`)
              seriesDatas.push(this.handleSeriesDatas(`-最近一分钟雨量`, data.datas, dataR3, data.id + 1, '气象-雨量-分'))
              seriesDatas.push(this.handleLostDatas(`-最近一分钟雨量`, dataR3, data.id + 1))
              legendData.push(data.id + 1 + `-最近一分钟雨量`)
              this.initChart(data.ssn + 'rain', title, '气象', legendData, seriesDatas, index, id, data.pointName, 2)
            })
          })
        }
      })
    },
    handleExportExcel () {
      let count = 0
      for (let i = 0; i < this.towerIds.length; i++) {
        this.towerIds[i] === this.graphIds[i] && count++
      }
      let msg = !this.exportDatas.length ? '请先生成图表'
        : this.isGraphLoading ? '请等待生成图表'
          : this.isGraphFail ? '生成图表失败，请重新生成'
            : !this.towerIds.length ? '请先选择杆塔，重新生成图表再导出'
              : this.towerIds.length !== this.graphIds.length ||
                this.towerIds.length !== count ? '请重新生成图表再导出' : null
      if (msg) {
        this.showProgress = false
        Message({
          type: 'warning',
          message: msg,
          duration: 1500
        })
        return
      }
      this.isExportLoading = true
      this.percentage = 0
      for (let i = 0; i < 16; i++) {
        setTimeout(() => {
          if (this.percentage > 90) return
          this.percentage = this.percentage + 5
        }, 200)
      }
      this.showProgress = true
      this.exportDatasDivide = []
      let param = []
      param.push(this.exportDatas[this.towerIds[0]])
      this.exportDatasDivide = [...new Set(this.exportDatas)]
      this.exportDatasDivide.splice(0, 2)
      exportData(param).then(res => {
        if (res.state === ERR_OK) {
          this.exportDatasDivide.map(item => {
            item.uuid = res.value
          })
          let divide = this.chunk(this.exportDatasDivide, 3)
          let reqList = []
          divide.map(item => {
            reqList.push(exportData(item))
          })
          axios.all(reqList).then(() => {
            this.percentage = 95
            this._getExcel(res.value)
          }).catch(() => {
            this.showProgress = false
            this.isExportLoading = false
          })
        }
      })
    },
    selectTowers (towerIds, companyId) {
      this.towerIds = towerIds
      this.companyId = companyId
    },
    handleLostDatas (axis, dataCategory, ssn) {
      // 确定丢失数据点的范围(大于两倍平均值)
      let lostData = []
      if (dataCategory.length > 1) {
        let time = index => new Date(dataCategory[index][0].replace(/-/g, '/')).getTime()
        let maxInterval = (time(dataCategory.length - 1) - time(0)) / (dataCategory.length - 1) * 2
        for (let i = 1; i < dataCategory.length; i++) {
          if ((time(i) - time(i - 1)) >= maxInterval) {
            lostData.push([dataCategory[i - 1][0], 0])
            lostData.push([dataCategory[i][0], 0])
            lostData.push('-')
            dataCategory.splice(i, 0, '-')
            i++
          }
        }
      }
      // 丢失点样式
      let lostSeriesDatas = {
        name: ssn + axis,
        type: 'line',
        symbol: 'none',
        itemStyle: {
          normal: {
            lineStyle: {
              color: 'red',
              type: 'dotted',
              width: '3'
            }
          }
        },
        data: lostData
      }
      return lostSeriesDatas
    },
    handleSeriesDatas (axis, data, dataCategory, ssn, itemCategory) {
      data.forEach(item => {
        let xdataXs = []
        if (itemCategory === '北斗') {
          xdataXs.push(item.dt, item.i, item.dq)
        } else if (itemCategory === '倾斜') {
          xdataXs.push(item.dt, item.i)
        } else if (itemCategory === '温度') {
          xdataXs.push(item.dt, item.t, item.v)
        } else if (itemCategory === '气象-风速') {
          xdataXs.push(item.dt, item.ws)
        } else if (itemCategory === '气象-雨量-日') {
          xdataXs.push(item.dt, item.dr)
        } else if (itemCategory === '气象-雨量-时') {
          xdataXs.push(item.dt, item.hr)
        } else if (itemCategory === '气象-雨量-分') {
          xdataXs.push(item.dt, item.mr)
        }
        dataCategory.push(xdataXs)
      })
      let seriesData = {
        name: ssn + axis,
        type: 'line',
        symbol: 'circle',
        data: dataCategory,
        symbolSize: 3
      }
      return seriesData
    },
    _getGraph (ids) {
      return getGraph({
        towerIds: ids,
        logTimestampBegin: this.dateStart,
        logTimestampEnd: this.dateEnd
      }).then(res => {
        if (res.state === ERR_OK) {
          if (res.value.length === 0) return
          this.towersData.push(res.value)
          this.$nextTick(() => {
            this.handleTowersGraph(res.value)
          })
        }
      })
    },
    _getExcel (uuid) {
      getExcel({
        towerIds: this.towerIds.join(','),
        companyId: this.companyId,
        logTimestampBegin: this.dateStart,
        logTimestampEnd: this.dateEnd,
        dateType: this.dateType,
        uuid: uuid
      }).then(res => {
        // 响应头中的Excel-Filename的key值无法直接由对象点，要转换成驼峰命名
        // excel-filename转换成excelFilename
        this.percentage = 100
        Object.keys(res.headers).forEach(key => {
          let newKey = key.replace(/-(\w)/g, (all, letter) => letter.toUpperCase())
          if (newKey !== key) {
            res.headers[newKey] = res.headers[key]
            delete res.headers[key]
          }
        })
        this.isExportLoading = false
        if (!res.data) return
        let blob = new Blob([res.data],
          {type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8'})
        let fileName = decodeURIComponent(res.headers.excelFilename)
        // 判断是否ie浏览器，ie浏览器执行msSaveOrOpenBlob方法下载，其他浏览器模拟a标签点击下载
        // msSaveOrOpenBlob方法支持ie10及其以上版本
        if (!!window.ActiveXObject || 'ActiveXObject' in window) {
          window.navigator.msSaveOrOpenBlob(blob, fileName)
        } else {
          let url = window.URL.createObjectURL(blob)
          let link = document.createElement('a')
          link.style.display = 'none'
          link.href = url
          link.setAttribute('id', 'downloadLink')
          link.setAttribute('download', fileName)
          document.body.appendChild(link)
          link.click()
        }
        this.showProgress = false
      }).catch(() => {
        this.isExportLoading = false
        this.showProgress = false
      })
    },
    initChart (charts, title, category, legendData, seriesDatas, index, id, pointName, rainType) {
      this.sum++
      // echarts初始化
      let element = document.getElementById(title + charts)
      let chart = echarts.init(element)
      let measure = (category === '倾斜') ? '倾斜率' : (category === '北斗') ? '位移量' : (category === '温度') ? '温度' : (rainType === 1) ? '风速' : '雨量'
      let m = (category === '倾斜') ? '‰' : (category === '北斗') ? 'mm' : (category === '温度') ? '℃' : (rainType === 1) ? 'm/s' : 'mm'
      chart.on('finished', () => {
        this.finishCount++
        if (this.finishCount > this.sum) return
        if (category === '倾斜') {
          this.exportDatas[id].inclineImgBaseDatas.push(chart.getDataURL())
        } else if (category === '北斗') {
          this.exportDatas[id].beidouImgBaseDatas.push(chart.getDataURL())
        } else if (category === '温度') {
          this.exportDatas[id].temperatureBaseDatas.push(chart.getDataURL())
        } else {
          this.exportDatas[id].meteorologyBaseDatas.push(chart.getDataURL())
        }
      })
      chart.setOption({
        title: {
          x: 'center',
          text: title,
          textStyle: {
            fontSize: 16,
            color: '#505050' // 主标题文字颜色
          },
          itemGap: 5,
          subtext: category + '(' + pointName + ')-' + measure + '趋势曲线图',
          subtextStyle: {
            fontSize: 11,
            color: '#505050'
          }
        },
        color: ['#357F88', '#7E4B76', '#BF675F', '#1F814A'],
        legend: { // 图表上方的类别显示
          type: 'scroll', // legend类别过多时分页效果
          y: 38,
          data: legendData,
          itemGap: 0,
          textStyle: {
            fontSize: 10,
            color: '#505050'
          }
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            let htmlStr = '<div>' + params[0].value[0] + '</br>监测项：' + category + '</br>'
            for (let i = 0; i < params.length; i++) {
              if (i > 0 && params[i].seriesName === params[i - 1].seriesName) continue
              htmlStr += params[i].seriesName + '：' + params[i].value[1] + ' ' + m + '</br>'
            }
            htmlStr += (params[0].value.length === 3 ? ('dq：' + params[0].value[2] + '</br>') : '') + '</div>'
            return htmlStr
          }
        },
        xAxis: [{
          type: 'time',
          boundaryGap: false,
          name: '时间',
          axisLine: {
            onZero: false // 横轴不要默认从0开始
          },
          axisLabel: {
            textStyle: {
              color: '#000' // 坐标值得具体的颜色
            }
          }
        }],
        yAxis: [
          {
            type: 'value',
            scale: true,
            boundaryGap: [0.2, 0.2],
            name: (category === '倾斜') ? '倾斜率(‰)' : (category === '北斗') ? '位移量(mm)' : (category === '温度') ? '温度(℃)' : (rainType === 1) ? '风速(m/s)' : '雨量(mm)',
            axisLabel: {
              textStyle: {
                color: '#000' // 坐标值得具体的颜色
              }
            }
          }
        ],
        animation: false,
        series: seriesDatas
      })
    }
  },
  beforeRouteLeave (to, from, next) {
    if (from.path === '/excelExport') {
      if (!this.isExportLoading) return next()
      this.$confirm('当前导出未完成，是否放弃导出并跳转页面?', '提示', {
        cancelButtonClass: 'btn-custom-cancel',
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        center: true
      }).then(() => {
        next()
      }).catch(() => {})
    }
  },
  computed: {
    valueFormat () {
      return (this.formInline.datecategory === 'week') ? null : 'yyyy/MM/dd'
    },
    format () {
      return (this.formInline.datecategory === 'week') ? 'yyyy 第WW周' : null
    }
  },
  components: {
    SideTree,
    location
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.excel-export
  .el-container
    .el-container
      height calc(100% - 30px)
      padding 10px 10px 10px 0
      .el-aside
        margin-right 10px
        bg-color-full #fff
        box-shadow 0px 0px 6px #ededed
      .el-main
        bg-color-full #fff
        box-shadow 0px 0px 6px #ededed
        padding 20px 10px
        overflow hidden
        .option_wrapper
          position fixed
        .towers_wrapper
          margin-top 35px
          overflow-Y scroll
          overflow-X hidden
          height calc(100% - 35px)
          #tower
            width 100%
            .title
              color #1a6db6
              text-align center
              margin 30px 80px 10px
              font-weight bold
              font-size 16px
            .content
              color #1a6db6
              text-align center
            .sub_title
              color #1a6db6
              text-align center
              padding 5px 0
            .incline_wrapper
              height 100%
              width calc(100vw - 297px)
            .beidou_wrapper
              height 100%
              width calc(100vw - 297px)
            .echarts
              float left
        .progress
          position fixed
          left 0
          top 100px
          right 0
          bottom 0
          z-index 2000
          overflow hidden
          height calc(100% - 130px)
          .el-progress
            top 50%
            left calc((100% + 250px) / 2)
            transform translate(-50%, -50%)
            -ms-transform translate(-50%, -50%)
            -moz-transform translate(-50%, -50%)
            -webkit-transform translate(-50%, -50%)
            -o-transform translate(-50%, -50%)
</style>
