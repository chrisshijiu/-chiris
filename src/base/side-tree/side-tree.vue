<template>
  <div class="side_tree">
    <div class="serach_wrapper">
      <el-input
        v-model.trim="towerName"
        placeholder="杆塔号"
        clearable
        @keyup.enter.native="handlesearchTower">
        <el-button slot="prepend" size="mini" icon="switch_icon"
          :title="title" @click="switchTree">
        </el-button>
      </el-input>
      <el-button type="primary" size="mini" @click="handlesearchTower">搜索</el-button>
    </div>
    <div class="nodata_wrapper" v-if="nodata">
      暂无数据
    </div>
    <div class="tree_wrapper"
      v-loading="loading"
      element-loading-text="加载中..."
      element-loading-spinner="el-icon-loading">
      <el-menu
        :default-active="defaultActive"
        :default-openeds="defaultOpened">
        <el-submenu :index="'company'+company.id" v-for="company in companyTrees" :key="company.id">
          <template slot="title">
            <span class="ellipsis format" :title="company.name+'('+ filterCompanyTowers(company.name) +')'">{{company.name}}<span class="grey"> ({{ filterCompanyTowers(company.name) }})</span></span>
          </template>
          <el-menu-item @click="choseTower(companyTower, companyTrees.towers)" :index="''+companyTower.id"
            v-for="companyTower in company.towers" :key="companyTower.id">
            <i class="tower_icon"></i>
            <span slot="title" class="ellipsis format" :title="companyTower.name">{{companyTower.name}}</span>
          </el-menu-item>
          <el-submenu :index="'department'+department.id" v-for="department in company.children" :key="department.name + department.id">
            <template slot="title">
              <span class="ellipsis format" :title="department.name +'('+ department.towers.length +')'">{{department.name}}<span class="grey"> ({{ department.towers.length }})</span></span>
            </template>
            <el-menu-item @click="choseTower(tower, department.towers)" :index="''+tower.id" v-for="tower in department.towers" :key="tower.id">
              <i class="tower_icon"></i>
              <span slot="title" class="ellipsis format" :title="tower.name">{{tower.name}}</span>
            </el-menu-item>
          </el-submenu>
        </el-submenu>
      </el-menu>
    </div>
  </div>
</template>
<script>
import {ERR_OK} from '@/api/config'
import {mapMutations} from 'vuex'
import {getTowerShortTree} from '@/api/ou-level'
export default {
  data () {
    return {
      lineTree: false,
      pathParams: 'ou/findOuTowerShortLevel',
      companyTrees: [],
      companyTowersCount: 0,
      towerName: '',
      towerId: null,
      towersList: [],
      defaultOpened: [],
      nodata: false,
      loading: true
    }
  },
  methods: {
    choseTower (tower, towers) {
      this.towerId = tower.id
      if (this.$route.path === '/map') {
        this.$router.push({
          query: {
            id: this.towerId
          }
        })
      }
      this.$emit('chose', tower, towers)
    },
    filterCompanyTowers (name) {
      let companyTree = this.companyTrees.filter(item => item.name === name)[0]
      let companyTowers = companyTree.towers.length
      let departmentTowers = 0
      companyTree.children.forEach(item => {
        departmentTowers += item.towers.length
      })
      return companyTowers + departmentTowers
    },
    switchTree () {
      this.lineTree = !this.lineTree
      sessionStorage.setItem('isLineTree', this.lineTree)
      this.towerName = ''
      this.searchTower()
    },
    handlesearchTower () {
      this.searchTower(false)
    },
    searchTower (isMounted) {
      this.loading = true
      this.nodata = false
      this.lineTree = sessionStorage.getItem('isLineTree') === 'true'
      this.pathParams = this.lineTree ? 'towerline/findLineTowerShortLevel' : 'ou/findOuTowerShortLevel'
      this._getTowerShortTree(isMounted)
    },
    handleTowersList () {
      // 用于地图页的Marker展示
      this.companyTrees.forEach(item => {
        this.towersList = this.towersList.concat(item.towers)
        if (item.children.length !== 0) {
          item.children.forEach(department => {
            this.towersList = this.towersList.concat(department.towers)
          })
        }
      })
      this.setTowersList(this.towersList)
    },
    handleFilter () {
      // 有搜索条件时，将无杆塔的单位部门过滤掉
      if (this.companyTrees.length > 0) {
        for (let i = 0; i < this.companyTrees.length; i++) {
          let count = 0
          if (this.companyTrees[i].children.length > 0) {
            count = this.companyTrees[i].children.length
            for (let j = 0; j < this.companyTrees[i].children.length; j++) {
              if (this.companyTrees[i].children[j].towers.length === 0) {
                this.companyTrees[i].children.splice(j--, 1)
                count--
              }
            }
          }
          if (count === 0 && this.companyTrees[i].towers.length === 0) {
            this.companyTrees.splice(i--, 1)
          }
        }
      }
      this.nodata = this.companyTrees.length === 0
      // 有搜索条件时，全部展开
      this.defaultOpened = []
      if (this.companyTrees.length > 0) {
        this.companyTrees.forEach((item) => {
          this.defaultOpened.push('company' + item.id)
          if (item.children.length > 0) {
            item.children.forEach(child => {
              this.defaultOpened.push('department' + child.id)
            })
          }
        })
      }
    },
    _getTowerShortTree (isMounted = false) {
      getTowerShortTree(this.pathParams, {
        towerName: this.towerName
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.loading = false
          this.companyTrees = res.value
          if (this.companyTrees.length === 0) {
            this.nodata = true
            return
          }
          if (isMounted) {
            this.handleTowersList()
          }
          if (!this.towerName) {
            // 当搜索条件为空时，不用全部展开，展开第一个公司即可
            if (this.companyTrees.length > 0) {
              this.defaultOpened = ['company' + this.companyTrees[0].id]
            }
          } else {
            // 有搜索条件时，全部展开
            this.handleFilter()
          }
        }
      })
    },
    ...mapMutations({
      setTowersList: 'SET_TOWERSLIST'
    })
  },
  computed: {
    defaultActive () {
      return '' + this.$route.query.id
    },
    title () {
      return this.lineTree ? '展示机构树' : '展示线路树'
    }
  },
  mounted () {
    this.searchTower(true)
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
    >.el-button--mini
      padding 7px 10px
      position absolute
      top 11px
  .nodata_wrapper
    padding 15px
    color #303133
  .tree_wrapper
    width 100%
    position absolute
    top 50px
    left 0
    bottom 0
    overflow-y scroll
    overflow-x hidden
    .format
      width 160px
      display inline-block
  .el-menu
    border none
    .el-submenu
      margin 0!important
      .el-submenu
        .el-menu-item
          padding-left 70px !important
</style>
