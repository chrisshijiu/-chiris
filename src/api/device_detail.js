import axios from 'axios'

export function getDevDetailMessage (params) {
  const url = '/monitor/device/findOne?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getSensorMageMessage (params) {
  const url = '/monitor/sensor/managedSensor?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
