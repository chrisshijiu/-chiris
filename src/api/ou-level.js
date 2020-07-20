import axios from 'axios'

export function getOrgTree () {
  const url = '/monitor/ou/findOuLevel?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getTowerTree () {
  const url = '/monitor/ou/findOuTowerLevel?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getTowerShortTree (pathParms, params) {
  const url = '/monitor/' + pathParms + '?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getTowerLineTree () {
  const url = '/monitor/towerline/findLineTowerLevel?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getTowerLineShortTree (params) {
  const url = '/monitor/towerline/findLineTowerShortLevel?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getCompanyTowerTree (params) {
  const url = '/monitor/ou/findCompanyTowerLevel?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getCompanyMessage () {
  const url = '/monitor/ou/findCompanyList?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
