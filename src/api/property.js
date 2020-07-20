import axios from 'axios'

export function getProperty (category) {
  const url = '/monitor/propertyValue?t=' + Date.now()
  const data = {
    categoryCode: category
  }
  return axios({
    method: 'get',
    url: url,
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getMonitorType () {
  const url = '/monitor/company-monitortype?t=' + Date.now()

  return axios({
    method: 'get',
    url: url
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
