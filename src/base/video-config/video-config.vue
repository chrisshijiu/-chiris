<template>
  <div class='video'>
    <div class="video-wrapper" :style="{width: `${videoWidth}px`, height: `${videoHeight + 24}px`}">
      <!-- 自定义工具栏部分 -->
      <div class="option" v-if="cameraCodeArr.length || $route.path==='/video'">
        <!-- 杆塔名称 -->
        <span class="title">{{title}}</span>
        <!-- 工具栏右侧图标 -->
        <div class="photo">
          <!-- 开启/停止录像 -->
          <div class="preview" v-show="!type">
              <div class="img left" @click="switchRecord"  v-if="layout === '1x1' || cameraIndexCode"
                :title="record.isRecording ? `预计${stopRecordTime}停止录像,点击提前停止` : '录像'">
                <div v-show="record.show"
                  :class="{'record': record.isRecording}">
                    <img :src="require(`@/common/images/record${disabledRecord ? '-disabled': ''}.png`)"
                      style="width: 100%; height: 100%"/>
                </div>
              </div>
            <div class="img left" @click="handleManualCapture" v-if="layout === '1x1' || cameraIndexCode">
              <img :src="require(`@/common/images/camera${disabledCapture ? '-disabled': ''}.png`)"
              :title="content" style="width: 100%; height: 100%"/>
            </div>
            <div class="img left" @click="switchPreview">
              <img :src="require(`@/common/images/${preview}.png`)" style="width: 100%; height: 100%"
                :title="preview === 'play' ? '开始预览' : '停止预览'"/>
            </div>
          </div>
          <div class="playback" v-show="type">
            <img :src="require(`@/common/images/${playback}.png`)" class="img" @click="switchPlayback"
              :title="playback === 'play' ? '开始回放' : '停止回放'"/>
          </div>
        </div>
      </div>
      <!-- 海康视频播放窗口部分 -->
      <div :id="cameraDomId" :style="{background: `${cameraCodeArr.length ? noVideo ? '#000' : '' : $route.path==='/video' ? '#000' : ''}`,
        height: 'calc(100% - 24px)',textAlign: 'center', color: noVideo ? '#fff' : '#000'}">
        <span v-show="!cameraCodeArr.length || noVideo" style="color: #fff">无视频数据</span>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'
import JSEncrypt from 'JSEncrypt'
import WebControl from 'WebControl'
import {manualRecordStart, manualRecordStop, manualCapture, getVideotapStatus} from '@/api/video-config'
import {ERR_OK} from '@/api/config'
const oneDay = 24 * 60 * 60 * 1000
export default {
  data () {
    return {
      oWebControl: null,
      initCount: 0,
      pubKey: '',
      preview: 'pause',
      playback: 'pause',
      record: {
        isRecording: false,
        timer: null,
        show: true
      },
      disabledCapture: true,
      disabledRecord: true,
      disabledPreview: false,
      disabledPlayback: false,
      recordStartTime: null,
      restDuration: null,
      stopRecordTime: null,
      cameraIndexCode: '',
      content: '抓图',
      showWnd: false,
      noVideo: false
    }
  },
  props: {
    videoWidth: {
      // 视频播放窗口宽度
      type: Number,
      default: 300
    },
    videoHeight: {
      // 视频播放窗口高度
      type: Number,
      default: 300
    },
    scroll: {
      // 是否滚动
      type: Boolean
    },
    type: {
      // 0：实时视频
      // 1：历史视频
      type: Number
    },
    cameraDomId: {
      // 视频播放窗口dom结构的Id
      type: String
    },
    title: {
      // 视频播放窗口的title
      type: String
    },
    resize: {
      // 变化时视频播放窗口重新resize一次
      type: Boolean
    },
    duration: {
      // 默认录像时间：10分钟
      type: Number,
      default: 10
    },
    ssn: {
      // 传感器编号
      type: String
    },
    recordLocation: {
      // 录像存储位置
      type: String,
      default: '0'
    },
    cameraCodeArr: {
      type: Array,
      default: function () {
        return []
      }
    },
    layout: {
      // 窗口布局：1x1或2x2
      type: String,
      default: '1x1'
    },
    hideWnd: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    /**
     * 创建播放实例
     */
    initPlugin () {
      let _this = this
      this.oWebControl = new WebControl({
        szPluginContainer: _this.cameraDomId,
        iServicePortStart: 15900,
        iServicePortEnd: 15909,
        szClassId: '23BF3B0A-2C56-4D97-9C03-0CB103AA8F11',
        cbConnectSuccess: function () {
          _this.oWebControl.JS_StartService('window', {
            dllPath: './VideoPluginConnect.dll'
          }).then(function () {
            $(`#${_this.cameraDomId}`).html('启动插件服务成功，请等待...')
            _this.oWebControl.JS_SetWindowControlCallback({
              cbIntegrationCallBack: _this.cbIntegrationCallBack
            })
            let width = _this.videoWidth
            let height = _this.videoHeight
            _this.oWebControl.JS_CreateWnd(_this.cameraDomId, width, height)
              .then(function () {
                _this.init()
              })
          }, function () { // 启动插件服务失败
            $(`#${_this.cameraDomId}`).html('启动插件服务失败，请重试！')
          })
        },
        // 创建WebControl实例失败
        cbConnectError: function () {
          console.log('cbConnectError')
          _this.oWebControl = null
          $(`#${_this.cameraDomId}`).html('插件未启动，正在尝试启动，请稍候...')
          // 程序未启动时执行error函数，采用wakeup来启动程序
          WebControl.JS_WakeUp('VideoWebPlugin://')
          _this.initCount++
          if (_this.initCount < 3) {
            setTimeout(function () {
              _this.initPlugin()
            }, 3400)
          } else {
            $(`#${_this.cameraDomId}`).html(`插件启动失败，请检查插件是否安装！若未安装，
             请点击<a href="/static/video/VideoWebPlugin.exe" class="install">下载插件</a>并安装`)
            $('.install').css('cursor', 'pointer')
          }
        },
        cbConnectClose: function (bNormalClose) {
          // 异常断开：bNormalClose = false
          // JS_Disconnect正常断开：bNormalClose = true
          console.log('cbConnectClose')
          $(`#${_this.cameraDomId}`).html('插件异常断开，请刷新页面重试...')
          _this.oWebControl = null
        }
      })
    },
    /**
     * 初始化
     */
    init () {
      let _this = this
      this.getPubKey(function () {
        // let appkey = '23608661'// 综合安防管理平台提供的appkey，必填
        let appkey = config.appkey// 综合安防管理平台提供的appkey，必填
        let secret = _this.setEncrypt(config.secret)// 综合安防管理平台提供的secret，必填
        // let secret = _this.setEncrypt('xuivNklsc59jrQmtJ7gB')// 综合安防管理平台提供的secret，必填
        let ip = config.ip // 综合安防管理平台IP地址，必填
        // let ip = '192.168.0.236' // 综合安防管理平台IP地址，必填
        let playMode = _this.type// 初始播放模式：0-预览，1-回放
        let port = 443// 综合安防管理平台端口，若启用HTTPS协议，默认443
        let snapDir = config.snapDir // 抓图存储路径
        let videoDir = config.videoDir // 紧急录像或录像剪辑存储路径
        // let snapDir = 'D:\\SnapDir' // 抓图存储路径
        // let videoDir = 'D:\\VideoDir' // 紧急录像或录像剪辑存储路径
        let layout = _this.layout// playMode指定模式的布局
        let enableHTTPS = 1// 是否启用HTTPS协议与综合安防管理平台交互，是为1，否为0
        let encryptedFields = 'secret'// 加密字段，默认加密领域为secret
        let showToolbar = 1// 是否显示工具栏，0-不显示，非0-显示
        let showSmart = _this.type// 是否显示智能信息（如配置移动侦测后画面上的线框），0-不显示，非0-显示
        let buttonIDs = ''// 自定义工具条按钮
        // 打印播放器插件初始化时参数设置
        console.log('oWebControl.init')
        console.log({
          appkey: appkey, // API网关提供的appkey
          secret: secret, // API网关提供的secret
          ip: ip, // API网关IP地址
          playMode: playMode, // 播放模式（决定显示预览还是回放界面）
          port: port, // 端口
          snapDir: snapDir, // 抓图存储路径
          videoDir: videoDir, // 紧急录像或录像剪辑存储路径
          layout: layout, // 布局
          enableHTTPS: enableHTTPS, // 是否启用HTTPS协议
          encryptedFields: encryptedFields, // 加密字段
          showToolbar: showToolbar, // 是否显示工具栏
          showSmart: showSmart, // 是否显示智能信息
          buttonIDs: buttonIDs // 自定义工具条按钮
        })
        _this.oWebControl.JS_RequestInterface({
          funcName: 'init',
          argument: JSON.stringify({
            appkey: appkey, // API网关提供的appkey
            secret: secret, // API网关提供的secret
            ip: ip, // API网关IP地址
            playMode: playMode, // 播放模式（决定显示预览还是回放界面）
            port: port, // 端口
            snapDir: snapDir, // 抓图存储路径
            videoDir: videoDir, // 紧急录像或录像剪辑存储路径
            layout: layout, // 布局
            enableHTTPS: enableHTTPS, // 是否启用HTTPS协议
            encryptedFields: encryptedFields, // 加密字段
            showToolbar: showToolbar, // 是否显示工具栏
            showSmart: showSmart, // 是否显示智能信息
            buttonIDs: buttonIDs // 自定义工具条按钮
          })
        }).then(function (oData) {
          // 初始化后resize一次，规避firefox下首次显示窗口后插件窗口未与DIV窗口重合问题
          _this.oWebControl.JS_Resize(_this.videoWidth, _this.videoHeight)
          if (_this.type) {
            _this.handlePlayback()
          } else {
            _this.handlePreview()
          }
        })
      })
    },
    /**
     * 获取公钥
     */
    getPubKey (callback) {
      let _this = this
      this.oWebControl.JS_RequestInterface({
        funcName: 'getRSAPubKey',
        argument: JSON.stringify({
          keyLength: 1024
        })
      }).then(function (oData) {
        if (oData.responseMsg.data) {
          _this.pubKey = oData.responseMsg.data
          callback()
        }
      })
    },
    /**
     * RSA加密
     */
    setEncrypt (value) {
      let encrypt = new JSEncrypt()
      encrypt.setPublicKey(this.pubKey)
      return encrypt.encrypt(value)
    },
    switchPreview () {
      if (this.cameraCodeArr.length === 0) {
        this.$message.error('暂无可播放视频')
        return
      }
      if (this.preview === 'play') {
        this.handlePreview()
      } else {
        this.stopPreview()
      }
    },
    /**
     * 视频预览功能
     */
    handlePreview () {
      // 防止短时间内重复点击
      if (this.disabledPreview) {
        return
      }
      this.disabledPreview = true
      setTimeout(() => {
        this.disabledPreview = false
      }, 800)
      clearInterval(this.record.timer)
      this.record.show = true
      this.record.isRecording = false
      let streamMode = 0 // 主子码流标识：0-主码流，1-子码流
      let transMode = 1 // 传输协议：0-UDP，1-TCP
      let gpuMode = 0 // 是否启用GPU硬解，0-不启用，1-启用
      this.cameraCodeArr.forEach((item, index) => {
        let cameraIndexCode = item.cameraCode ? item.cameraCode.replace(/(^\s*)/g, '') : null // 获取输入的监控点编号值，必须
        this.oWebControl.JS_RequestInterface({
          funcName: 'startPreview',
          argument: JSON.stringify({
            cameraIndexCode: cameraIndexCode, // 监控点编号
            streamMode: streamMode, // 主子码流标识
            transMode: transMode, // 传输协议
            gpuMode: gpuMode, // 是否开启GPU硬解
            wndId: index + 1 // 播放窗口序号（在2x2以上布局下可指定播放窗口）
          })
        }).then((oData) => {
          this.setWndCover()
          this.disabledCapture = false
          this.disabledRecord = false
          this.preview = 'pause'
          if (this.cameraCodeArr.length > 1) {
            this.oWebControl.JS_RequestInterface({
              funcName: 'setLayout',
              argument: JSON.stringify({
                layout: '2x2'
              })
            })
            if (this.cameraIndexCode) {
              this.handleInit()
            }
          }
          if (this.cameraCodeArr.length === 1) {
            this._getVideotapStatus(item.ssn)
          }
        })
      })
    },
    /**
     * 获取视频录像的状态，以便前端设置计时器，显示录像闪烁效果
     */
    _getVideotapStatus (ssn) {
      getVideotapStatus(ssn).then(res => {
        if (res.state === ERR_OK) {
          let value = res.value
          if (value.status === 0) {
            this.recordStartTime = value.beginTime
            this.restDuration = value.restDuration * 1000
            this.handleManualRecord()
          }
        }
      })
    },
    /**
     * 停止全部预览
     */
    stopPreview () {
      if (this.disabledPreview) {
        return
      }
      this.oWebControl.JS_RequestInterface({
        funcName: 'stopAllPreview'
      }).then(() => {
        clearInterval(this.record.timer)
        this.record.isRecording = false
        this.record.show = true
        this.disabledCapture = true
        this.disabledRecord = true
        this.preview = 'play'
      })
    },
    switchRecord () {
      // 未预览前，不可操作
      if (this.disabledRecord) {
        return
      }
      // 防止重复点击
      this.disabledRecord = true
      if (this.record.isRecording) {
        // this.handleManualRecordStart()
        this.handleManualRecordStop()
      } else {
        this.handleManualRecordStart()
      }
    },
    /**
     * 开始录像
     */
    handleManualRecordStart () {
      if (!this.duration) {
        this.$message.error('请先输入录像时长')
        this.disabledRecord = false
        return
      }
      if (!(/^\d+(\.\d{0,5})?$/.test(this.duration)) ||
        (Number(this.duration) < 1) || (Number(this.duration) > 10 * 24 * 60)) {
        this.$message.error('请输入合理的录像时长，范围为1-14400(最多10天)')
        this.disabledRecord = false
        return
      }
      let cameraIndexCode = this.cameraCodeArr[0].cameraCode
      if (this.layout === '2x2' && this.cameraIndexCode) {
        cameraIndexCode = this.cameraIndexCode
      }
      manualRecordStart(cameraIndexCode, this.duration).then(res => {
        this.disabledRecord = false
        if (res.state === ERR_OK) {
          let value = res.value
          this.recordStartTime = value.data ? value.data.beginTime : null
          if (value.code === 0) {
            this.$message.success('已开始录像')
            this.restDuration = value.data.restDuration * 1000
            this.handleManualRecord()
          } else if (value.code === 1) {
            this.$message.warning(value.codeStr)
            this.restDuration = value.data.restDuration * 1000
            this.handleManualRecord()
          } else {
            this.record.isRecording = false
            this.$message.error(value.codeStr)
          }
        } else {
          this.record.isRecording = false
          this.$message.error(res.errorMessage)
        }
      }).catch(() => {
        this.$message.error('操作异常')
        this.disabledRecord = false
        this.record.isRecording = false
      })
    },
    /**
     * 录像时前端页面图标闪动的定时器
     */
    handleManualRecord () {
      this.stopRecordTime = this.getCurrentTime(new Date(new Date().getTime() + this.restDuration))
      clearInterval(this.record.timer)
      this.record.isRecording = true
      this.record.timer = setInterval(() => {
        this.record.show = !this.record.show
        if (this.disabledRecord) {
          clearInterval(this.record.timer)
          this.record.isRecording = false
          this.record.show = true
        }
      }, 500)
      setTimeout(() => {
        this.record.isRecording = false
        this.record.show = true
        clearInterval(this.record.timer)
      }, this.restDuration)
    },
    /**
     * 规范时间格式yyyy-MM-dd HH:mm:ss
     */
    getCurrentTime (date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1// 月
      let day = date.getDate()// 日
      let hour = date.getHours()// 时
      let minute = date.getMinutes()// 分
      let second = date.getSeconds()// 秒
      // 补0函数
      let s = s => s < 10 ? `0${s}` : s
      return `${year}-${s(month)}-${s(day)} ${s(hour)}:${s(minute)}:${s(second)}`
    },
    /**
     * 停止录像
     */
    handleManualRecordStop () {
      let cameraIndexCode = this.cameraCodeArr[0].cameraCode
      if (this.layout === '2x2' && this.cameraIndexCode) {
        cameraIndexCode = this.cameraIndexCode
      }
      manualRecordStop(cameraIndexCode, this.recordStartTime).then(res => {
        this.disabledRecord = false
        if (res.state === ERR_OK) {
          let value = res.value
          if (value.code === 0) {
            clearInterval(this.record.timer)
            this.record.show = true
            this.record.isRecording = false
            this.$message.success('录像已停止')
          } else if (value.code === 2) {
            clearInterval(this.record.timer)
            this.record.show = true
            this.record.isRecording = false
            this.$message.success('录像已被提前结束')
          } else {
            this.record.isRecording = true
            this.$message.error(value.codeStr)
          }
        } else {
          this.record.isRecording = true
          this.$message.error(res.errorMessage)
        }
      }).catch(() => {
        this.disabledRecord = false
        this.record.isRecording = false
      })
    },
    /**
     * 抓图
     */
    handleManualCapture () {
      // 未预览前，不可操作
      if (this.disabledCapture) {
        return
      }
      this.content = '正在抓图...'
      // 防止重复点击
      this.disabledCapture = true
      let cameraIndexCode = this.cameraCodeArr[0].cameraCode
      if (this.layout === '2x2' && this.cameraIndexCode) {
        cameraIndexCode = this.cameraIndexCode
      }
      manualCapture(cameraIndexCode).then(res => {
        this.content = '抓图'
        this.disabledCapture = false
        if (res.state === ERR_OK) {
          let value = res.value
          if (value.code === -1) {
            this.$message.error(value.codeStr)
          } else {
            let src = res.value.data
            if (src.split(':')[0] === 'https') {
              src = `/hkssl/${src.split(':443/')[1]}`
            }
            let iWidth = 2 * this.videoWidth
            let iHeight = 2 * this.videoHeight
            let top = ($(window).height() / 2) - iHeight / 2
            let left = ($(window).width() / 2) - iWidth / 2
            this.$message({
              type: 'success',
              showClose: true,
              dangerouslyUseHTMLString: true,
              duration: 0,
              message: `
                <strong>抓图成功</strong>
                <span style="cursor: pointer; color:#1d6db3"
                  onclick="open('${src}', 'newwindow', 'height=${iHeight},width=${iWidth},top=${top},left=${left},toolbar=no,menubar=no,location=no,status=no')">点击查看图片</span>`
            })
          }
        } else {
          this.$message.error(res.errorMessage)
        }
      })
    },
    switchPlayback () {
      if (!this.cameraCodeArr.length) {
        this.$message.error('暂无可播放视频')
        return
      }
      if (this.playback === 'play') {
        this.handlePlayback()
      } else {
        this.handleStopPlayback()
      }
    },
    /**
     * 播放历史视频
     * @params start 回放开始时间
     *         end   回放结束时间
     *         若未传参，默认回放近7天
     */
    handlePlayback (start = new Date(new Date() - 7 * oneDay), end = new Date()) {
      // 防止短时间内重复点击
      if (this.disabledPlayback) {
        return
      }
      this.disabledPlayback = true
      setTimeout(() => {
        this.disabledPlayback = false
      }, 800)
      let startTimeStamp = new Date(start).getTime() // 回放开始时间戳，必填
      let endTimeStamp = new Date(end).getTime() // 回放结束时间戳，必填
      let recordLocation = Number(this.recordLocation) // 录像存储位置：0-中心存储，1-设备存储
      let transMode = 1// 传输协议：0-UDP，1-TCP
      let gpuMode = 0 // 是否启用GPU硬解，0-不启用，1-启用
      // let wndId = -1 // 播放窗口序号（在2x2以上布局下可指定播放窗口）
      this.cameraCodeArr.forEach((item, index) => {
        // 打印播放器插件回放时参数设置
        console.log('oWebControl.playback')
        console.log({
          cameraIndexCode: item.cameraCode, // 监控点编号
          startTimeStamp: Math.floor(startTimeStamp / 1000), // 录像查询开始时间戳，单位：秒
          endTimeStamp: Math.floor(endTimeStamp / 1000), // 录像结束开始时间戳，单位：秒
          recordLocation: recordLocation, // 录像存储类型：0-中心存储，1-设备存储
          transMode: transMode, // 传输协议：0-UDP，1-TCP
          gpuMode: gpuMode, // 是否启用GPU硬解，0-不启用，1-启用
          wndId: index + 1// 可指定播放窗口
        })
        this.oWebControl.JS_RequestInterface({
          funcName: 'startPlayback',
          argument: JSON.stringify({
            cameraIndexCode: item.cameraCode, // 监控点编号
            startTimeStamp: Math.floor(startTimeStamp / 1000), // 录像查询开始时间戳，单位：秒
            endTimeStamp: Math.floor(endTimeStamp / 1000), // 录像结束开始时间戳，单位：秒
            recordLocation: recordLocation, // 录像存储类型：0-中心存储，1-设备存储
            transMode: transMode, // 传输协议：0-UDP，1-TCP
            gpuMode: gpuMode, // 是否启用GPU硬解，0-不启用，1-启用
            wndId: index + 1// 可指定播放窗口
          })
        }).then((data) => {
          console.log(data)
          this.playback = 'pause'
        })
      })
    },
    /**
     *
     * 停止播放历史视频
     *
     */
    handleStopPlayback () {
      if (this.disabledPlayback) {
        return
      }
      this.oWebControl.JS_RequestInterface({
        funcName: 'stopAllPlayback'
      }).then((data) => {
        console.log(data)
        this.playback = 'play'
      })
    },
    /**
     *
     * 设置窗口裁剪
     * 当因滚动条滚动导致窗口需要被遮住的情况下需要JS_CuttingPartWindow部分窗口
     *
     */
    setWndCover () {
      let iWidth = $(window).width() - 10
      let iHeight = $(window).height() - 40
      let oDivRect = $(`#${this.cameraDomId}`).get(0).getBoundingClientRect()
      let iCoverLeft = (oDivRect.left - 260 < 0) ? Math.abs(oDivRect.left - 260) : 0
      let iCoverTop = (oDivRect.top - 110 < 0) ? Math.abs(oDivRect.top - 110) : 0
      let iCoverRight = (oDivRect.right - iWidth > 0) ? Math.round(oDivRect.right - iWidth) : 0
      let iCoverBottom = (oDivRect.bottom - iHeight > 0) ? Math.round(oDivRect.bottom - iHeight) : 0
      iCoverLeft = (iCoverLeft > this.videoWidth) ? this.videoWidth : iCoverLeft
      iCoverTop = (iCoverTop > this.videoHeight) ? this.videoHeight : iCoverTop
      iCoverRight = (iCoverRight > this.videoWidth) ? this.videoWidth : iCoverRight
      iCoverBottom = (iCoverBottom > this.videoHeight) ? this.videoHeight : iCoverBottom
      this.oWebControl.JS_RepairPartWindow(0, 0, this.videoWidth + 1, this.videoHeight) // 多1个像素点防止还原后边界缺失一个像素条
      if (iCoverLeft !== 0) {
        this.oWebControl.JS_CuttingPartWindow(0, 0, iCoverLeft, this.videoHeight + 1)
      }
      if (iCoverTop !== 0) {
        this.oWebControl.JS_CuttingPartWindow(0, 0, this.videoWidth + 1, iCoverTop) // 多剪掉一个像素条，防止出现剪掉一部分窗口后出现一个像素条
      }
      if (iCoverRight !== 0) {
        this.oWebControl.JS_CuttingPartWindow(this.videoWidth - iCoverRight + 1, 0, iCoverRight, this.videoHeight + 1)
      }
      if (iCoverBottom !== 0) {
        this.oWebControl.JS_CuttingPartWindow(0, this.videoHeight - iCoverBottom + 1, this.videoWidth + 1, iCoverBottom)
      }
    },
    /**
     *
     * 窗口大小变化时导致窗口需要被遮住的情况下需要进行resize
     * 规避插件窗口未与DIV窗口重合问题
     *
     * */
    handleResize () {
      if (this.oWebControl != null) {
        this.oWebControl.JS_Resize(this.videoWidth, this.videoHeight)
        this.setWndCover()
      }
    },
    /**
     * 推送消息
     */
    cbIntegrationCallBack (oData) {
      // 窗口选中时
      if (oData.responseMsg.type === 1) {
        this.cameraIndexCode = JSON.parse(oData.responseMsg.msg).cameraIndexCode
        console.log(this.cameraIndexCode)
      }
      // 监听全屏事件
      if (oData.responseMsg.type === 5) {
        let result = JSON.parse(oData.responseMsg.msg).result
        if (result === 1024) {
          // 进入全屏
          this.showWnd = true
          this.$emit('hideWnd')
        }
        if (result === 1025) {
          // 退出全屏
          this.showWnd = false
          this.$emit('showWnd')
        }
      }
    },
    /**
     * 隐藏海康视频窗口
     */
    handleHideWnd () {
      if (this.showWnd) {
        return
      }
      if (this.oWebControl !== null) {
        this.oWebControl.JS_HideWnd()
      }
    },
    /**
     * 显示海康视频窗口
     */
    handleShowWnd () {
      if (this.oWebControl !== null) {
        this.oWebControl.JS_ShowWnd()
      }
    },
    handleUninit () {
      if (this.oWebControl !== null) {
        this.oWebControl.JS_HideWnd()
        this.oWebControl.JS_RequestInterface({
          funcName: 'uninit'
        })
      }
    },
    handleInit () {
      this.record.show = true
      this.record.isRecording = false
      this.disabledRecord = false
      this.disabledCapture = false
      this.content = '抓图'
      clearInterval(this.record.timer)
      if (this.cameraCodeArr.filter(item => item.cameraCode === this.cameraIndexCode).length > 0) {
        let ssn = this.cameraCodeArr.filter(item => item.cameraCode === this.cameraIndexCode)[0].ssn
        this._getVideotapStatus(ssn)
      }
    }
  },
  /**
   *
   * 离开页面前，进行反初始化并隐藏处理
   * 避免出现插件窗口挡住其他页面的情况
   *
   * */
  beforeDestroy () {
    this.$message.closeAll()
    if (this.oWebControl !== null) {
      this.oWebControl.JS_HideWnd()
      this.oWebControl.JS_Disconnect()
      this.oWebControl.JS_RequestInterface({
        funcName: 'uninit'
      })
    }
  },
  watch: {
    'scroll': {
      handler () {
        this.handleResize()
      },
      deep: true
    },
    'cameraCodeArr': {
      handler () {
        let cameraCodeLength = this.cameraCodeArr.filter(item => !item.cameraCode).length
        let cameraCodeArrLength = this.cameraCodeArr.length
        console.log(cameraCodeLength, cameraCodeArrLength)
        if (cameraCodeLength !== cameraCodeArrLength) {
          this.noVideo = false
          this.initPlugin()
        } else {
          this.noVideo = true
          $(`#${this.cameraDomId}`).html('无视频数据')
        }
      },
      deep: true
    },
    'cameraIndexCode': function (val, oldVal) {
      if (this.oWebControl != null) {
        this.handleInit()
      }
    },
    'resize': function (val, oldVal) {
      if (this.oWebControl != null) {
        this.oWebControl.JS_Resize(this.videoWidth, this.videoHeight)
      }
    },
    'hideWnd': function (val, oldVal) {
      if (val) {
        this.handleHideWnd()
      } else {
        this.handleShowWnd()
      }
    }
  },
  mounted () {
    let _this = this
    $(window).resize(() => {
      _this.handleResize()
    })
    if (!this.cameraCodeArr.length) {
      return
    }
    let cameraCodeLength = this.cameraCodeArr.filter(item => !item.cameraCode).length
    let cameraCodeArrLength = this.cameraCodeArr.length
    console.log(cameraCodeLength, cameraCodeArrLength)
    if (cameraCodeLength !== cameraCodeArrLength) {
      this.noVideo = false
      this.initPlugin()
    } else {
      $(`#${this.cameraDomId}`).html('无视频数据')
      this.noVideo = true
    }
  }
}
</script>

<style lang='stylus' rel='stylesheet/stylus' scoped>
.video-wrapper
  margin 2px
  float left
  border 1px solid #e5e5e5
  .option
    width 100%
    height 24px
    background #3D3D3D
    position relative
    color #ffffff
    .title
      vertical-align middle
      margin-left 18px
    .photo
      position absolute
      right 8px
      top 3px
      .el-button+.el-button
        margin-left 5px !important
      .el-form-item
        margin-bottom 10px !important
      .img
        vertical-align middle
        cursor pointer
        width 16px
        height 16px
        margin 2px 8px
      .record
        position relative
      .record::after
        content ''
        position absolute
        top 0
        left -4px
        width 4px
        height 4px
        border-radius 2px
        background #ff0000
</style>
