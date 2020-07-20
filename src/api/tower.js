import axios from 'axios'

export function getTowerMessage (params) {
  const url = '/monitor/tower?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addTower (params) {
  const url = '/monitor/tower'
  return axios({
    method: 'post',
    url: url,
    data: JSON.stringify(params),
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteTower (params) {
  const url = '/monitor/tower/' + params

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function findCompanyLine (params) {
  const url = '/monitor/towerline/findCompanyLine?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function fileUpload (data) {
  return axios({
    method: 'post',
    url: '/monitor/common/imgUpload',
    headers: {'Content-Type': 'multipart/form-data'},
    data: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function renameCheck (params) {
  return axios({
    method: 'get',
    url: '/monitor/tower/isRename?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getMonitor (params) {
  return axios({
    method: 'get',
    url: '/monitor/monitor-item?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addMonitor (params) {
  return axios({
    method: 'post',
    url: '/monitor/monitor-item',
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteMonitor (params) {
  const url = '/monitor/monitor-item/' + params

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function renameItemCheck (params) {
  return axios({
    method: 'get',
    url: '/monitor/monitor-item/isRename?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getConfig (params) {
  const url = '/monitor/monitor-point/' + params + '?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deviceConfig (params) {
  const url = '/monitor/monitor-point'
  return axios({
    method: 'post',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function changeStatus (params) {
  const url = '/monitor/monitor-point'
  return axios({
    method: 'put',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteDevice (params) {
  const url = '/monitor/monitor-point/' + params

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function renamePointCheck (params) {
  return axios({
    method: 'get',
    url: '/monitor/monitor-point/isRename?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSensor (params) {
  const url = '/monitor/sensor/sensorNumberList?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getDevice (params) {
  const url = '/monitor/device/deviceList?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getPerson (id) {
  const url = '/monitor/ou-worker/findByOu?t=' + Date.now()
  const data = {
    ouId: id
  }

  return axios({
    method: 'get',
    url: url,
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
