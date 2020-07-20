import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Login = (resolve) => {
  import('@/components/login/login.vue').then((module) => {
    resolve(module)
  })
}

const Base = (resolve) => {
  import('@/base/base/base.vue').then((module) => {
    resolve(module)
  })
}

const ShowMap = (resolve) => {
  import('@/components/map/map.vue').then((module) => {
    resolve(module)
  })
}

const MonitorData = (resolve) => {
  import('@/components/monitor-data/monitor-data.vue').then((module) => {
    resolve(module)
  })
}

const Video = (resolve) => {
  import('@/components/video/video').then((module) => {
    resolve(module)
  })
}

const Pictures = (resolve) => {
  import('@/components/pictures/pictures').then((module) => {
    resolve(module)
  })
}

const ExcelExport = (resolve) => {
  import('@/components/excel-export/excel-export.vue').then((module) => {
    resolve(module)
  })
}

const Line = (resolve) => {
  import('@/components/line/line.vue').then((module) => {
    resolve(module)
  })
}

const Tower = (resolve) => {
  import('@/components/tower/tower.vue').then((module) => {
    resolve(module)
  })
}

const TowerConfig = (resolve) => {
  import('@/components/tower-config/tower-config.vue').then((module) => {
    resolve(module)
  })
}

const Device = (resolve) => {
  import('@/components/device/device.vue').then((module) => {
    resolve(module)
  })
}

const DeviceDetail = (resolve) => {
  import('@/components/device-detail/device-detail.vue').then((module) => {
    resolve(module)
  })
}

const Sensor = (resolve) => {
  import('@/components/Sensor/Sensor.vue').then((module) => {
    resolve(module)
  })
}

const Organization = (resolve) => {
  import('@/components/organization/organization.vue').then((module) => {
    resolve(module)
  })
}

const Personcenter = (resolve) => {
  import('@/components/personcenter/personcenter.vue').then((module) => {
    resolve(module)
  })
}

const AccountConfig = (resolve) => {
  import('@/components/account-config/account-config.vue').then((module) => {
    resolve(module)
  })
}

const WarningData = (resolve) => {
  import('@/components/warning-data/warning-data.vue').then((module) => {
    resolve(module)
  })
}

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/index',
      component: Base,
      children: [
        {
          path: '',
          redirect: '/map'
        },
        {
          path: '/map',
          component: ShowMap
        },
        {
          path: '/monitorData',
          component: MonitorData,
          meta: ['监测数据']
        },
        {
          path: '/excelExport',
          component: ExcelExport,
          meta: ['导出数据']
        },
        {
          path: '/warningData',
          component: WarningData,
          meta: ['警报信息']
        },
        {
          path: '/video',
          component: Video,
          meta: ['实时视频']
        },
        {
          path: '/pictures',
          component: Pictures,
          meta: ['历史图片']
        },
        {
          path: '/line',
          component: Line,
          meta: ['线路管理']
        },
        {
          path: '/tower',
          component: Tower,
          meta: ['杆塔管理'],
          children: [
            {
              path: '/tower/config',
              component: TowerConfig,
              meta: ['杆塔管理', '杆塔配置']
            }
          ]
        },
        {
          path: '/device',
          component: Device,
          meta: ['监测设备'],
          children: [
            {
              path: '/device/detail',
              component: DeviceDetail,
              meta: ['监测设备', '设备详情']
            }
          ]
        },
        {
          path: '/sensor',
          component: Sensor,
          meta: ['传感器']
        },
        {
          path: '/organization',
          component: Organization,
          meta: ['机构管理']
        },
        {
          path: '/personcenter',
          component: Personcenter,
          meta: ['个人中心']
        },
        {
          path: '/accountconfig',
          component: AccountConfig,
          meta: ['通知设置']
        }
      ]
    },
    {
      path: '*',
      redirect: '/map'
    }
  ]
})
