<template>
  <div class="breadcrumb_wrapper">
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/index' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item v-for="(item, index) in $route.meta" :key="index" :to="{ path: $route.matched[index+1].path }">{{item}}</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script type="text/ecmascript-6">
</script>

<style lang="stylus" rel="stylesheet/stylus">
.el-breadcrumb__item:last-child .el-breadcrumb__inner
  color #1a6db6

.el-breadcrumb__inner
  font-size 14px
  font-weight 200!important
  font-family "Microsoft YaHei"

</style>
