# monitor

> A Vue.js project

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).



## 离线地图和在线地图配置

### 在线地图

- 入口index.html文件中引入的script标签为

```js
<script src="http://api.map.baidu.com/getscript?v=2.0&ak=VVhWKQn3rAlaaSPKVjX47sdx8kSoPrsw"></script>
<script type="text/javascript" src="http://api.map.baidu.com/library/AreaRestriction/1.2/src/AreaRestriction_min.js"></script>
```

- 开发环境运行命令为npm run dev --online
- 生产环境打包命令为npm run build --online

### 离线地图

- 入口index.html文件中引入的script标签为

```javascript
<script type="text/javascript" src="/offline/map_load.js"></script>
<script type="text/javascript" src="/offline/tools/AreaRestriction_min.js"></script>
```

- 开发环境

  - 运行命令为npm run dev
  - 代理ip和端口配置: 在config/index.js中修改'/offline'的target值

  ```javascript
  '/offline': {
      target: 'http://192.168.0.157:8000',
      changeOrigin: true,
      pathRewrite: {
          '^/offline': '/'
      }
  }
  ```

- 生产环境

  - 打包命令为npm run build
  - 代理ip和端口配置：修改配置文件中的的地址

  ```
  ProxyPass /offline http://127.0.0.1:8000
  ProxyPassReverse /offline http://127.0.0.1:8000
  ```

### npm 异常

原因：安装image-webpack-loader插件出错，可以切换到淘宝源 使用cnpm安装；
解决：1：先uninstall 本地的image-webpack-loader， 
	  2：再npm install cnpm -g --registry=https://registry.npm.taobao.org
	  3：cnpm install --save-dev  image-webpack-loader  

  