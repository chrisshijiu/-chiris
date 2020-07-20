import axios from 'axios'

export function getMapTower (params) {
  const url = '/monitor/tower/sensorDetail?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getMapWarning (params) {
  const url = '/monitor/warningData/recently?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
