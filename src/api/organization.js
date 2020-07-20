import axios from 'axios'

export function getOrganization (params) {
  const url = '/monitor/ou?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addOrganization (params) {
  const url = '/monitor/ou'

  return axios({
    method: 'post',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function renameCheck (params) {
  return axios({
    method: 'get',
    url: '/monitor/ou/isRename?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteOrganization (id) {
  const url = '/monitor/ou/' + id

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getWorker (params) {
  const url = '/monitor/ou-worker?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addWorker (params) {
  const url = '/monitor/ou-worker'

  return axios({
    method: 'post',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function renameWorkerCheck (params) {
  return axios({
    method: 'get',
    url: '/monitor/ou-worker/isRename?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteWorker (id) {
  const url = '/monitor/ou-worker/' + id

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
