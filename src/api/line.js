import axios from 'axios'

export function getLine (params) {
  const url = '/monitor/towerline?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addLine (params) {
  const url = '/monitor/towerline'

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
    url: '/monitor/towerline/isRename?t=' + Date.now(),
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteLine (id) {
  const url = '/monitor/towerline/' + id

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
