import axios from 'axios'

export function getLogin (params) {
  const url = '/monitor/login'

  return axios({
    method: 'post',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getLogout () {
  const url = '/monitor/logout?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
