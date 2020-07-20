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



## ���ߵ�ͼ�����ߵ�ͼ����

### ���ߵ�ͼ

- ���index.html�ļ��������script��ǩΪ

```js
<script src="http://api.map.baidu.com/getscript?v=2.0&ak=VVhWKQn3rAlaaSPKVjX47sdx8kSoPrsw"></script>
<script type="text/javascript" src="http://api.map.baidu.com/library/AreaRestriction/1.2/src/AreaRestriction_min.js"></script>
```

- ����������������Ϊnpm run dev --online
- ���������������Ϊnpm run build --online

### ���ߵ�ͼ

- ���index.html�ļ��������script��ǩΪ

```javascript
<script type="text/javascript" src="/offline/map_load.js"></script>
<script type="text/javascript" src="/offline/tools/AreaRestriction_min.js"></script>
```

- ��������

  - ��������Ϊnpm run dev
  - ����ip�Ͷ˿�����: ��config/index.js���޸�'/offline'��targetֵ

  ```javascript
  '/offline': {
      target: 'http://192.168.0.157:8000',
      changeOrigin: true,
      pathRewrite: {
          '^/offline': '/'
      }
  }
  ```

- ��������

  - �������Ϊnpm run build
  - ����ip�Ͷ˿����ã��޸������ļ��еĵĵ�ַ

  ```
  ProxyPass /offline http://127.0.0.1:8000
  ProxyPassReverse /offline http://127.0.0.1:8000
  ```

### npm �쳣

ԭ�򣺰�װimage-webpack-loader������������л����Ա�Դ ʹ��cnpm��װ��
�����1����uninstall ���ص�image-webpack-loader�� 
	  2����npm install cnpm -g --registry=https://registry.npm.taobao.org
	  3��cnpm install --save-dev  image-webpack-loader  

  