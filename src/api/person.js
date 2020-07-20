import axios from 'axios'

export function getPersonMsg () {
  const url = '/monitor/user?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function putPersonMsg (params) {
  const url = '/monitor/user'

  return axios({
    method: 'put',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function putPassword (params) {
  const url = '/monitor/user/updatePassword'

  return axios({
    method: 'put',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
