# fresh-weather

### 项目简介
> 1. 新鲜天气 数据都是来自腾讯地图、和风天气这些免费的 API；   
> 2. 新鲜天气小程序由天气预报页面和心情签到页面组成：  
>   **天气预报页面**：主要是天气数据的展现，定位接口使用腾讯地图，天气数据来自和风天气 API，其中顶部实时天气温度用的是体感温度   
>心情签到页面：使用云开发数据库存储心情，每日可签到一次，不同心情不同颜色

### 项目展示
![weather](./imgs/weather.gif)

### 技术栈

 - Gulp 前端项目构建
 - Sass css预处理
 - Express 实现本地的Mock server,使云函数调试方便 

 ### 项目启动

 #### 下载
 > git clone https://github.com/Marszht/fresh-weather

 #### 进入目录安装依赖
 > npm install

#### 再次进入云函数目录安装依赖
>  依次进入目录  
cd server/cloud-functions/he-weather  
npm i 

```
# mock server 启动
npm run server
# 启动 cloud functions 云函数文件夹同步
npm run cloud
# 编译项目，并且启动 gulp watch 功能
npm run dev
```
#### 项目打包上线
> npm run build