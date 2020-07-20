export const towersList = state => state.towersList
export const fullScreen = state => state.fullScreen
export const displayName = state => {
  if (localStorage.getItem('displayName')) {
    state.displayName = localStorage.getItem('displayName')
  }
  return state.displayName
}
