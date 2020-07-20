<template>
  <div class="side_tree">
    <div class="serach_wrapper">
      <el-input
        v-model.trim="towerName"
        placeholder="杆塔号"
        clearable
        @keyup.enter.native="searchTower">
      </el-input>
      <el-button type="primary" size="mini" @click="searchTower">搜索</el-button>
    </div>
    <div class="tree_wrapper"
      v-loading="loading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading">
      <el-tree
        icon-class='el-icon-arrow-down'
        :data="treeData"
        show-checkbox
        node-key="id"
        ref="tree"
        :filter-node-method="filterNode"
        @check="handleSelect"
        :default-expand-all="true"
        :check-on-click-node="true"
        :props="defaultProps">
        <span class="ellipsis" slot-scope="{ node, data }">
          <i :class="data.className"></i>
          <span :title="data.name">{{ data.name.split(' ')[0] }}<span class="grey"> {{ data.name.split(' ')[1] }}</span></span>
        </span>
      </el-tree>
    </div>
  </div>
</template>
<script>
import {ERR_OK} from '@/api/config'
import {getCompanyTowerTree} from '@/api/ou-level'
export default {
  data () {
    return {
      companyTrees: [],
      towerName: '',
      loading: true,
      treeData: [],
      defaultProps: {
        children: 'towers',
        label: 'name'
      }
    }
  },
  methods: {
    selectTowers (val, companyId, data) {
      this.$emit('select', val, companyId, data)
    },
    handleTreeData () {
      let newArr = []
      let set = new Set(this.companyTrees)
      for (let item of set.values()) {
        let newObj = {}
        newObj.id = item.id
        newObj.name = item.name + ` (${item.towers.length})`
        newObj.companyId = item.id
        newObj.disabled = false
        if (this.$route.path === '/video') {
          newObj.disabled = true
        }
        let towerArr = []
        for (let tower of item.towers) {
          let towerObj = {}
          towerObj.id = tower.id
          towerObj.name = tower.name
          towerObj.companyId = tower.companyId
          towerObj.disabled = false
          towerObj.className = 'tower_icon'
          towerArr.push(towerObj)
        }
        newObj.towers = towerArr
        newArr.push(newObj)
      }
      this.treeData = newArr
    },
    filterNode (value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },
    searchTower () {
      this.$refs.tree.filter(this.towerName)
    },
    handleSelect (val, selectedNodes) {
      if (selectedNodes.checkedNodes.length > 0) {
        if (this.$route.path === '/video') {
          // 杆塔节点总数大于9则禁止再选择其余节点
          let towersArr = this.$refs.tree.getCheckedNodes(true)
          if (towersArr.length > 8) {
            this.treeData.forEach(item => {
              if (item.towers.length === 0) return
              item.towers.forEach(tower => {
                tower.disabled = true
                towersArr.forEach(checkedTower => {
                  if (checkedTower.id === tower.id) {
                    tower.disabled = false
                  }
                })
              })
            })
          } else {
            this.treeData.forEach(item => {
              item.disabled = true
              if (item.towers.length === 0) return
              item.towers.forEach(tower => {
                tower.disabled = false
              })
            })
          }
        }
        if (this.$route.path === '/excelExport') {
          this.treeData.forEach(item => {
            if (item.id === selectedNodes.checkedNodes[0].companyId) {
              item.disabled = false
            } else {
              item.disabled = true
              if (item.towers.length === 0) return
              item.towers.forEach(tower => {
                tower.disabled = true
              })
            }
          })
        }
      } else {
        this.treeData.forEach(item => {
          item.disabled = false
          if (this.$route.path === '/video') {
            item.disabled = true
          }
          if (item.towers.length === 0) return
          item.towers.forEach(tower => {
            tower.disabled = false
          })
        })
      }
      // 选中子元素的key值
      let companyId = this.$refs.tree.getCheckedNodes(true).length > 0 ? (this.$refs.tree.getCheckedNodes(true))[0].companyId : null
      let towers = this.$refs.tree.getCheckedKeys(true)
      this.selectTowers(towers, companyId, this.$refs.tree.getCheckedNodes(true))
    },
    _getCompanyTowerTree () {
      this.loading = true
      getCompanyTowerTree({
        towerName: this.towerName
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.loading = false
          this.companyTrees = res.value
          for (let i = 0; i < this.companyTrees.length; i++) {
            if (this.companyTrees[i].towers.length === 0) {
              this.companyTrees.splice(i--, 1)
            }
          }
          this.handleTreeData()
        }
      })
    }
  },
  mounted () {
    this._getCompanyTowerTree()
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.side_tree
  height 100%
  bg-color-full(#ffffff)
  position relative
  .serach_wrapper
    height 50px
    .el-input
      padding 10px 0 10px 10px
      width 73%!important
    .el-button--mini
      padding 7px 10px
      position absolute
      top 11px
  .tree_wrapper
    width 100%
    position absolute
    top 50px
    left 0
    bottom 0
    overflow auto
    .format
      width 178px
      display inline-block
    .ellipsis
      width 170px
      display inline-block
      position absolute
      left 35px
      top 14px
      .grey
        vertical-align inherit
    .tower_icon
      vertical-align bottom
</style>
