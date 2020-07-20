import * as types from './mutation-types'

export const clearVuexList = function ({commit}) {
  // logout时清空vuex中所有数据
  commit(types.SET_TOWERSLIST, [])
  commit(types.SET_DISPLAYNAME, '')
}
