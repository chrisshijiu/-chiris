/**
 * Created by gaozengyang on 2018/4/15.
 */
import axios from 'axios'
import { Message, Notification } from 'element-ui'
import { config } from '@/api/config'

const isDev = process.env.NODE_ENV === 'development'

export default (router) => {
  // axios 配置
  // axios.defaults.timeout = 5000
  axios.defaults.headers.post['Content-Type'] = 'application/json'
  // axios.defaults.headers.common['Authorization'] = 'bearer '+ localStorage.getItem('currentUser_token')

  // 配置运行环境路径  配合apache使用
  if (!isDev) {
    axios.defaults.baseURL = config.ihUrlApache
  }

  // http response 拦截器
  axios.interceptors.response.use(
    response => {
      let msg = ''
      let title = '错误'
      const er = response.data
      const status = parseInt(er.returnCode)
      if (status) {
        if (status === 20011) { // 未登录
          Message({
            type: 'error',
            message: er.returnMsg,
            duration: 2000
          })
          localStorage.clear()
          router.replace({
            path: '/login'
          })
          return
        }
        Notification({
          title: title,
          message: msg,
          offset: 100,
          type: 'error',
          duration: 2000
        })
      }
      return response
    },
    err => {
      if (err && err.response) {
        err.title = '错误'
        switch (err.response.status) {
          case 400:
            err.message = errorForParams(err)
            break

          case 401:
            err.message = '账号或密码错误'
            break

          case 403:
            err.message = '拒绝访问'
            break

          case 404:
            err.message = '请求的服务不存在，请联系管理员'
            break

          case 405:
            err.message = '请求的服务不存在，请联系管理员'
            break

          case 408:
            err.message = '请求超时'
            break

          case 500:
            err.message = '服务器内部错误'
            break

          case 501:
            err.message = '服务未实现'
            break

          case 502:
            err.message = '连接服务端超时或异常，请稍后重试'
            break

          case 503:
            err.message = '服务暂不可用，请联系管理员'
            break

          case 504:
            err.message = '网关超时'
            break

          case 505:
            err.message = 'HTTP版本不受支持'
            break

          default:
        }
      }
      if (!!err.response.data && !!err.response.data.errorMessage) {
        // err.title = err.response.data.errorMessage
        err.title = err.response.data.errorMessage
        if (err.message === '账号或密码错误') {
          err.title = '错误'
        }
        if (err.response.data.value !== null) {
          // 只显示第一条错误消息
          const val = err.response.data.value
          for (let key in val) {
            err.message = val[key]
            break
          }
        }
      }
      Notification({
        title: err.title,
        message: err.message,
        offset: 100,
        type: 'error',
        duration: 2000
      })
      return Promise.reject(err)
    })
  return axios
}

function errorForParams (er) {
  let msg = null
  const data = er.response.data
  if (data !== null) {
    if (data.value !== null) {
      // 只显示第一条错误消息
      for (const key in data.value) {
        msg = data.value[key]
        break
      }
    } else {
      msg = data.errorMessage
    }
  } else if (er.errorMessage !== null) {
    msg = er.errorMessage
  } else {
    msg = '系统异常，请联系管理员'
  }
  return msg
}
