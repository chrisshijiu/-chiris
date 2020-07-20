import axios from 'axios'

export function getDeviceMessage (params) {
  const url = '/monitor/device?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteDevice (params) {
  const url = '/monitor/device'

  return axios({
    method: 'delete',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addDevice (params) {
  return axios({
    method: 'post',
    url: '/monitor/device',
    data: JSON.stringify(params),
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function checkDeviceName (params) {
  const url = '/monitor/device/isRename?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
