import axios from 'axios'

export function getTimeLine (params) {
  const url = '/monitor/monitorDataMedia/timeline?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getHistoricalPics (params) {
  const url = '/monitor/monitorDataMedia/rangeMedia?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
