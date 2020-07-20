import * as types from './mutation-types'

const mutations = {
  [types.SET_TOWERSLIST] (state, towersList) {
    state.towersList = towersList
  },
  [types.SET_FULLSCREEN] (state, fullScreen) {
    state.fullScreen = fullScreen
  },
  [types.SET_DISPLAYNAME] (state, displayName) {
    localStorage.setItem('displayName', displayName)
    state.displayName = displayName
  }
}

export default mutations
