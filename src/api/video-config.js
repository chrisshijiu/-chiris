import axios from 'axios'

export function getCameraCode (id) {
  const url = '/monitor/monitorDataMedia/cameraCode?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: {
      towerId: id
    }
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function manualRecordStart (cameraIndexCode, duration) {
  const url = '/monitor/monitorDataMedia/manualRecordStart'
  const data = {
    cameraIndexCode: cameraIndexCode,
    duration: duration
  }
  return axios({
    method: 'post',
    url: url,
    params: data,
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function manualRecordStop (cameraIndexCode, beginTime) {
  const url = '/monitor/monitorDataMedia/manualRecordStop'
  const data = {
    cameraIndexCode: cameraIndexCode,
    beginTime: beginTime
  }

  return axios({
    method: 'post',
    url: url,
    params: data,
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function manualCapture (params) {
  const url = '/monitor/monitorDataMedia/manualCapture'
  const data = {
    'cameraIndexCode': params}

  return axios({
    method: 'post',
    url: url,
    params: data,
    headers: {'datatype': 'json'}
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

export function getVideotapStatus (ssn) {
  const url = '/monitor/monitorDataMedia/videotapStatus?t=' + Date.now()

  return axios({
    method: 'get',
    url: url,
    params: {
      ssn: ssn
    }
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}
