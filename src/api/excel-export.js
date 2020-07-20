import axios from 'axios'

export function getGraph (params) {
  const url = '/monitor/export/monitor-data?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function exportData (params) {
  const url = '/monitor/export/imgBaseUpload'

  return axios({
    method: 'post',
    url: url,
    data: JSON.stringify(params),
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getExcel (params) {
  const url = '/monitor/export/getExcel?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: params,
    responseType: 'blob'
  }).then((res) => {
    return Promise.resolve(res)
  })
}
