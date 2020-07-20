import axios from 'axios'

export function getWarningData (params) {
  const url = '/monitor/warningData?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function putSensorStatus (params) {
  const url = '/monitor/warningData'

  return axios({
    method: 'put',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
