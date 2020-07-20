import axios from 'axios'

export function getSensorMessage (params) {
  const url = '/monitor/sensor?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteSensor (params) {
  const url = '/monitor/sensor'

  return axios({
    method: 'delete',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addSensor (params) {
  return axios({
    method: 'post',
    url: '/monitor/sensor',
    data: JSON.stringify(params),
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function checkSensorName (params) {
  const url = '/monitor/sensor/isRename?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function resetSensorEffValue (params) {
  const url = '/monitor/sensor/resetEffValue'

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
