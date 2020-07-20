import axios from 'axios'

export function getMonitorGraph (params, string) {
  const url = '/monitor/monitor-data/' + string + '?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getMonitorData (params, string) {
  const url = '/monitor/monitor-data/' + string + '-table?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function putValidFlag (params, string) {
  const url = '/monitor/monitor-data/' + string + '-changeValidFlag'

  return axios({
    method: 'put',
    url: url,
    data: JSON.stringify(params),
    headers: {'datatype': 'json', 'Content-Type': 'application/json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function putAllChangeValidFlag (params) {
  const url = '/monitor/monitor-data/all-changeValidFlag'

  return axios({
    method: 'put',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSummaryData (params) {
  const url = '/monitor/monitor-data/towerMonitor-all?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSingleData (towerId) {
  const url = '/monitor/monitor-data/towerMonitor-single?t=' + Date.now()
  let params = {
    towerId: towerId
  }

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getStatusData (params) {
  const url = '/monitor/monitor-data/towerMonitor-status?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getVideoData (id) {
  const url = '/monitor/monitor-data/video?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: {
      towerId: id
    }
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
