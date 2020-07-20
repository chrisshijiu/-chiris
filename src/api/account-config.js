import axios from 'axios'

export function getAccountMsg (params) {
  const url = '/monitor/informAccount?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function addAccountMsg (params) {
  const url = '/monitor/informAccount'

  return axios({
    method: 'post',
    url: url,
    data: JSON.stringify(params),
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function deleteAccountMsg (params) {
  const url = '/monitor/informAccount/' + params

  return axios({
    method: 'delete',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
