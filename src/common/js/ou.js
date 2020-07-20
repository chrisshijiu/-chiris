import {getOrgTree} from '@/api/ou-level'
import {ERR_OK} from '@/api/config'

let orgTree = {}

export function getOrgTreeData (obj) {
  return getOrgTree().then((res) => {
    if (res.state === ERR_OK) {
      orgTree = res.value
      res.value.forEach((item) => {
        if (item.depth === 1) {
          obj.push(item)
        }
      })
    }
  }).then(res => {
    return Promise.resolve(res)
  })
}

function _choseCompany (e, obj) {
  orgTree.forEach((item) => {
    if (item.id === e) {
      obj.orgChild = item.children
      item.children.forEach((node) => {
        if (node.depth === 2) {
          obj.orgDepartments.push(node)
        }
      })
    }
  })
}

function _choseDepartment (e, obj) {
  obj.orgChild.forEach((item) => {
    if (item.id === e) {
      obj.orgDepChild = item.children
      item.children.forEach((node) => {
        if (node.depth === 3) {
          obj.orgAreas.push(node)
        }
      })
    }
  })
}

function _choseArea (e, obj) {
  obj.orgDepChild.forEach((item) => {
    if (item.id === e) {
      item.children.forEach((node) => {
        if (node.depth === 4) {
          obj.orgGroups.push(node)
        }
      })
    }
  })
}

export function choseCompany (e, obj, orgObj) {
  if (obj) {
    obj.departmentId = null
    obj.areaId = null
    obj.groupId = null
    obj.lineId = null
  }
  orgObj.orgDepartments = []
  orgObj.orgAreas = []
  orgObj.orgGroups = []
  _choseCompany(e, orgObj)
}

export function choseDepartment (e, obj, orgObj) {
  if (obj) {
    obj.areaId = null
    obj.groupId = null
  }
  orgObj.orgAreas = []
  orgObj.orgGroups = []
  _choseDepartment(e, orgObj)
}

export function choseArea (e, obj, orgObj) {
  if (obj) {
    obj.groupId = null
  }
  orgObj.orgGroups = []
  _choseArea(e, orgObj)
}
