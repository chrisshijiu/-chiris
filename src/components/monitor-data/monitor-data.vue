<template>
  <div class="monitor_data full_container">
    <el-container>
      <el-header height="30px">
        <location></location>
      </el-header>
      <el-container>
        <el-aside width="250px">
          <side-tree @chose="choseTower"></side-tree>
        </el-aside>
        <el-main @scroll.native="handleScroll">
          <!-- 选择杆塔时，页面显示对应 -->
          <div class="item-status-wrapper" v-if="isTower || $route.query.id">
            <!-- 列表和曲线图的切换 -->
            <div class="moniter_item">
              <el-switch
                class="item"
                v-show="activeName !== '总表'"
                v-model="switchValue"
                active-color="#1a6db6"
                inactive-color="#1a6db6"
                active-text="监测数据列表"
                inactive-text="监测数据曲线图"
                @change="handleMoniterItem">
              </el-switch>
              <el-button
                class="item"
                type="primary"
                plain
                size="mini"
                v-show="activeName === '总表'"
                @click="$router.push('/monitorData')">
                返回
              </el-button>
            </div>
            <!-- 总表和不同监测项（倾斜/北斗/温度/气象/视频）的tab切换 -->
            <el-tabs
              class="tab_wrapper"
              v-model="activeName"
              @tab-click="handleMoniterItem"
              type="card">
              <el-tab-pane
                label="总表" name="总表">
              </el-tab-pane>
              <el-tab-pane v-for="item in monitorTypes" :key="item.id"
                :label="item.propertyValue" :name="item.propertyKey">
              </el-tab-pane>
            </el-tabs>
            <!-- 监测数据曲线图部分 -->
            <div class="dataGraph" v-if="!showSingleData && !switchValue">
              <!-- 曲线图的查询筛选条件 -->
              <div class="option_wrapper">
                <el-form :inline="true" :model="formInline">
                  <el-form-item label="监测项">
                    <el-dropdown trigger="click" :hide-on-click="false">
                      <el-input :value="item" :title="item" readonly>
                      </el-input>
                      <el-dropdown-menu slot="dropdown" v-if="activeName !== '5' || itemOptions.length">
                        <el-dropdown-item>
                          <el-checkbox
                            v-if="activeName !== '5'"
                            :indeterminate="isItemIndeterminate"
                            v-model="checkItemAll"
                            label="全选/反选"
                            @change="handleItemCheckAllChange">
                          </el-checkbox>
                          <el-checkbox-group v-model="itemDatas"
                            @change="handleItemCheckedChange">
                            <el-checkbox
                              v-for="(item, index) in itemOptions"
                              :key="index"
                              :label="item">
                            </el-checkbox>
                          </el-checkbox-group>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </el-form-item>
                  <el-form-item label="测点">
                    <el-dropdown
                      trigger="click"
                      :hide-on-click="false">
                      <el-input :value="point" :title="point" readonly>
                      </el-input>
                      <el-dropdown-menu slot="dropdown" v-if="activeName !== '5' || pointOptions.length">
                        <el-dropdown-item>
                          <el-checkbox
                            v-if="activeName !== '5'"
                            :indeterminate="isIndeterminate"
                            v-model="checkAll"
                            label="全选/反选"
                            @change="handlePointAllChange">
                          </el-checkbox>
                          <el-checkbox-group v-model="pointDatas"
                            @change="handlePointChange">
                            <el-checkbox
                              v-for="(option, index) in pointOptions"
                              :key="index"
                              :label="option.pointName">
                            </el-checkbox>
                          </el-checkbox-group>
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </el-form-item>
                  <el-form-item label="类型" v-show="activeName === '1' || activeName === '2'">
                    <el-select
                      v-model="formInline.category" @change="handleCategoryChange">
                      <el-option label="倾斜率" value="倾斜率" v-show="activeName === '1'"></el-option>
                      <el-option label="位移量" value="位移量" v-show="activeName === '2'"></el-option>
                      <el-option label="累计变化(mm)" value="累计变化(mm)" v-show="activeName === '2'"></el-option>
                      <el-option label="累计变化(cm)" value="累计变化(cm)" v-show="activeName === '2'"></el-option>
                      <el-option label="本次变化" value="本次变化"></el-option>
                      <el-option label="累计变化" value="累计变化" v-show="activeName === '1'"></el-option>
                    </el-select>
                  </el-form-item>
                  <span v-show="activeName !== '5'">
                    <el-form-item label="日期">
                      <el-select v-model="formInline.datecategory" @change="datecategoryChange">
                        <el-option label="按日筛选" value="datetime"></el-option>
                        <el-option label="按周筛选" value="week"></el-option>
                        <el-option label="按月筛选" value="month"></el-option>
                        <el-option label="按年筛选" value="year"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item class="datetime">
                      <el-date-picker
                      v-model="formInline.date[0]"
                      :type="formInline.datecategory"
                      placeholder="开始日期"
                      prefix-icon="date_icon"
                      :clearable="false"
                      :format="format"
                      :value-format="valueFormat"
                      :picker-options="pickerBeginDateBefore">
                      </el-date-picker>
                    </el-form-item>
                    <el-form-item label="至" class="datetime">
                      <el-date-picker
                      v-model="formInline.date[1]"
                      :type="formInline.datecategory"
                      placeholder="结束日期"
                      prefix-icon="date_icon"
                      :clearable="false"
                      :format="format"
                      :value-format="valueFormat"
                      :picker-options="pickerBeginDateAfter">
                      </el-date-picker>
                    </el-form-item>
                  </span>
                  <el-form-item class="right">
                    <el-button
                      type="primary"
                      size="mini"
                      icon="query_icon"
                      @click="handleGraphSearch">
                      查询
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
              <!-- 有温度、电压、湿度参数时，显示 -->
              <div class="params_wrapper">
                <span class="temperature" v-if="deviceStatus.temperature">
                  <span>温度：</span>
                  <span class="showText" :class="{red: deviceStatus.temperatureStatus}">
                    {{deviceStatus.temperature}} ℃（{{ filterStatus(deviceStatus.temperatureStatus) }}）
                  </span>
                </span>
                <span class="voltage" v-if="deviceStatus.voltage">
                  <span>电压：</span>
                  <span class="showText" :class="{red: deviceStatus.voltageStatus}">
                    {{deviceStatus.voltage}} V（{{ filterStatus(deviceStatus.voltageStatus) }}）
                  </span>
                </span>
                <span class="humidity" v-if="deviceStatus.humidity">
                  <span>湿度：</span>
                  <span class="showText" :class="{red: deviceStatus.humidityStatus}">
                    {{deviceStatus.humidity}} rh（{{ filterStatus(deviceStatus.humidityStatus) }}）
                  </span>
                </span>
              </div>
              <!-- echarts曲线图展示 -->
              <div class="echarts_wrapper" v-show="activeName !== '5'">
                <div class="echarts" :style="{height:'calc(100vh - 355px)',width:'100%'}" ref="myEchart" v-show="activeName !== '4'">
                </div>
                <div class="left" :style="{height:'calc(100vh - 320px)',width:'50%'}" v-show="activeName === '4'">
                  <span class="title" v-for="item in meteoStatus" :key='item.id'>
                    <span class="wind_icon"></span>
                    <span>{{`${item.id + 1}-`}}风向：</span>
                    <span class="showText">
                      {{item.windDirectionStr === null ? '无数据' : item.windDirectionStr}}
                    </span>
                  </span>
                  <div class="echarts" ref="myEchart1" :style="{height:'calc(100% - 40px)',width:'100%'}"></div>
                </div>
                <div class="left" :style="{height:'calc(100vh - 320px)',width:'50%'}" v-show="activeName === '4'">
                  <span class="title" v-for="item in meteoStatus" :key='item.id'>
                    <span class="rain_icon"></span>
                    <span>{{`${item.id + 1}-`}}总雨量：</span>
                    <span class="showText">
                      {{item.allRainfall === null ? `无数据` : `${item.allRainfall}mm`}}
                    </span>
                  </span>
                  <div class="echarts" ref="myEchart2" :style="{height:'calc(100% - 40px)',width:'100%'}"></div>
                </div>
              </div>
              <!-- 视频展示 -->
              <div class="video_wrapper" v-if="activeName === '5'">
                <div class="real-time-video left">
                  <div class="title">{{title}}</div>
                  <div class="subTitle">{{`${videoSubTitle}-`}}实时视频</div>
                  <el-form :inline="true" class="playback" v-show="activeName === '5'">
                    <el-form-item label="录像时长(min)" class="datetime">
                      <el-input v-model.number="duration" placeholder="请输入录像时长" type="number" step="0.1"></el-input>
                    </el-form-item>
                  </el-form>
                  <!-- 海康视频组件引入，传入对应参数即可 -->
                  <video-config ref="playWnd1" @hideWnd="$refs.playWnd2.handleHideWnd()" @showWnd="$refs.playWnd2.handleShowWnd()"
                  :videoWidth ="videoWidth" :videoHeight ="videoHeight" cameraDomId="playWnd1" :title="title"
                  :cameraCodeArr="cameraCodeArr" :scroll="scroll" :type="0" :duration="duration"></video-config>
                </div>
                <div class="history-video left">
                  <div class="title">{{title}}</div>
                  <div class="subTitle">{{`${videoSubTitle}-`}}历史视频</div>
                  <el-form :inline="true" class="playback" v-show="activeName === '5'">
                    <!-- 存储位置选择 -->
                    <div class="location">
                      <el-form-item label="历史视频存储位置" class="datetime">
                        <el-select v-model="recordLocation" placeholder="请选择">
                          <el-option label="中心存储" value="0"></el-option>
                          <el-option label="设备存储" value="1"></el-option>
                        </el-select>
                      </el-form-item>
                      <el-form-item>
                        <i class="config_icon" title="配置摄像头参数" @click="handleConfig"></i>
                      </el-form-item>
                    </div>
                    <!-- 回放录像时间段选择 -->
                    <el-form-item class="datetime">
                      <el-date-picker
                      ref="datePoint"
                      popper-class="datetime-point"
                      v-model="formInline.date[0]"
                      :type="formInline.datecategory"
                      placeholder="开始日期"
                      prefix-icon="date_icon"
                      @focus="handleVideoFocus"
                      :clearable="false"
                      :format="format"
                      :value-format="valueFormat"
                      :picker-options="pickerBeginDateBefore">
                      </el-date-picker>
                    </el-form-item>
                    <el-form-item label="至" class="datetime">
                      <el-date-picker
                      ref="datePoint"
                      popper-class="datetime-point"
                      v-model="formInline.date[1]"
                      :type="formInline.datecategory"
                      placeholder="结束日期"
                      prefix-icon="date_icon"
                      @focus="handleVideoFocus"
                      :clearable="false"
                      :format="format"
                      :value-format="valueFormat"
                      :picker-options="pickerBeginDateAfter">
                      </el-date-picker>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        size="mini"
                        @click="handlePlayBack">
                        回放
                      </el-button>
                    </el-form-item>
                  </el-form>
                  <!-- 海康视频组件引入，传入对应参数即可 -->
                  <video-config ref="playWnd2" @hideWnd="$refs.playWnd1.handleHideWnd()" @showWnd="$refs.playWnd1.handleShowWnd()"
                    :videoWidth ="videoWidth" :videoHeight ="videoHeight" cameraDomId="playWnd2" :title="title" :show="true"
                    :cameraCodeArr="cameraCodeArr" :scroll="scroll" :type="1" :recordLocation="recordLocation"></video-config>
                </div>
              </div>
            </div>
            <!-- 监测数据列表部分 -->
            <div class="dataList" v-show="!showSingleData && switchValue">
              <!-- 监测数据列表的筛选条件 -->
              <div class="option_wrapper">
                <el-form :inline="true" :model="formInline">
                  <div class="searchForm">
                    <el-form-item label="数据状态" v-if="activeName === '1'">
                      <el-select v-model="status" clearable>
                        <el-option label="正常" value="正常"></el-option>
                        <el-option label="异常" value="异常"></el-option>
                      </el-select>
                    </el-form-item>
                    <el-form-item class="datetime" label="日期">
                      <el-date-picker
                        v-model="listDateStart"
                        type="date"
                        placeholder="开始日期"
                        prefix-icon="date_icon"
                        :picker-options="pickerDateBefore">
                      </el-date-picker>
                    </el-form-item>
                    <el-form-item label="至" class="datetime">
                      <el-date-picker
                        v-model="listDateEnd"
                        type="date"
                        placeholder="结束日期"
                        prefix-icon="date_icon"
                        :picker-options="pickerDateAfter">
                      </el-date-picker>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        size="mini"
                        icon="query_icon"
                        @click="handleListDateSearchBefore">
                        查询
                      </el-button>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        type="primary"
                        size="mini"
                        class="MultHandle"
                        @click="handleMultDataByDate">
                        数据状态设置
                      </el-button>
                    </el-form-item>
                  </div>
                  <div class="selectBtns" v-show="showMultBtns">
                    <el-form-item>
                      <el-button
                        class="setInvalid"
                        plain
                        size="mini"
                        @click="handleSetDataEffect">
                        更改为有效
                      </el-button>
                    </el-form-item>
                    <el-form-item>
                      <el-button
                        class="setEffect"
                        plain
                        type="info"
                        size="mini"
                        @click="handleSetDataInvalid">
                        更改为失效
                      </el-button>
                    </el-form-item>
                  </div>
                </el-form>
              </div>
              <!-- 监测数据列表表格显示 -->
              <div class="datas_wrapper">
                <el-table :data="monitorDatas" row-class-name="body_row" @selection-change="handleSelectionChange">>
                  <el-table-column type="selection" width="55"></el-table-column>
                  <el-table-column prop="ssn" label="测点编号"></el-table-column>
                  <el-table-column prop="dataTimestamp" label="数据采集时间" width="180px"></el-table-column>
                  <el-table-column prop="status" label="数据状态" v-if="activeName === '1'">
                    <template slot-scope="scope">
                      <span v-if="!scope.row.status" class="ok">正常</span>
                      <span v-if="scope.row.status" class="error">异常</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="x" label="X轴(°)" v-if="activeName === '1'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="y" label="Y轴(°)" v-if="activeName === '1'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="dq" label="dq" v-if="activeName === '2'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="e" label="E轴(mm)" v-if="activeName === '2'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="n" label="N轴(mm)" v-if="activeName === '2'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="u" label="U轴(mm)" v-if="activeName === '2'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="temperature" label="温度(℃)" v-if="activeName === '3'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="voltage" label="传感器电压(V)" v-if="activeName === '3'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="windSpeed" label="风速(m/s)" v-if="activeName === '4'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="windDirectionStr" label="风向" v-if="activeName === '4'" :key="Math.random()"></el-table-column>
                  <el-table-column prop="allRainfall" label="总雨量(mm)" v-if="activeName === '4'" :key="Math.random()"></el-table-column>
                  <el-table-column label="图片" v-if="activeName === '5'" :key="Math.random()">
                    <template slot-scope="scope">
                      <img v-lazy="getImage(scope.row.path, scope.row.name)" width="30px" height="30px" preview="0">
                    </template>
                  </el-table-column>
                  <el-table-column label="操作">
                    <template slot-scope="scope">
                      <el-button
                        v-if="scope.row.validFlag"
                        type="text"
                        size="small"
                        icon="ok_icon"
                        @click='handleValid(scope.row)'
                        title="点击使数据失效">
                      </el-button>
                      <el-button
                        v-if="!scope.row.validFlag"
                        type="text"
                        size="small"
                        icon="error_icon"
                        @click='handleValid(scope.row)'
                        title="点击使数据生效">
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <!-- 页码显示 -->
              <div class="pagination_wrapper right">
                <el-pagination
                text-color="#fff"
                background
                @current-change="handleCurrentChange"
                :current-page.sync="pageEnquiry.pageNum"
                :page-size="pageEnquiry.pageSize"
                :pager-count="5"
                :page-sizes="[10, 25, 50, 100]"
                @size-change="handleSizeChange"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
              </div>
            </div>
            <!-- 单表部分，当tab切换为“总表”时显示 -->
            <div class="singleTableList"
              v-show="showSingleData">
              <el-table :data="singleData" :span-method="objectSpanMethod">
                <el-table-column prop="monitorType" label="监测项类型" width="150px">
                  <template slot-scope="scope">
                    {{ scope.row.monitorType ? filterValue(scope.row.monitorType) : '' }}
                  </template>
                </el-table-column>
                <el-table-column prop="itemName" label="监测项"></el-table-column>
                <el-table-column prop="pointName" label="测点"></el-table-column>
                <el-table-column prop="values" label="数值" width="320px">
                  <template slot-scope="scope">
                    <div>
                      <img v-lazy="getImage(scope.row.values[0], scope.row.values[1])" v-show="String(scope.row.monitorType) === '5'"
                        width="30px" height="30px" preview="0">
                      <el-table :data="filterData(scope.row.values)" v-show="String(scope.row.monitorType) !== '5'">
                        <el-table-column v-for="(item, index) in scope.row.values" :key="index" :prop="`${index}`"></el-table-column>
                      </el-table>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column prop="logTimeStamp" label="最近记录">
                </el-table-column>
              </el-table>
            </div>
          </div>
          <!-- 未选择杆塔时，页面显示所有杆塔的状态数据 -->
          <div class="total-status-wrapper" v-if="!isTower && !$route.query.id">
            <div class="option">
              <el-form :inline="true" :model="summarySearch">
                <el-form-item label="单位">
                  <el-select v-model="summarySearch.companyId" clearable>
                    <el-option v-for='item in companyList' :key='item.id' :label='item.name' :value='item.id'></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="数据状态">
                  <el-select v-model="summarySearch.status" clearable>
                    <el-option label='异常' :value='-1'></el-option>
                  </el-select>
                </el-form-item>
                <div class="right">
                  <el-form-item>
                    <el-input v-model.trim="summarySearch.towerName" @keyup.enter.native='handleSearch' placeholder="杆塔号" clearable>
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <el-button
                      type="primary"
                      size="mini"
                      icon="query_icon"
                      @click="handleSearch">
                      查询
                    </el-button>
                  </el-form-item>
                </div>
              </el-form>
            </div>
            <el-table :data="summaryTableData" row-class-name="body_row">
              <el-table-column label="单位" prop="companyName"></el-table-column>
              <el-table-column label="杆塔号" prop="towerName">
                <template slot-scope="scope">
                  <a href="javascript::" @click="handleChoseTower(scope.row)">
                    {{ scope.row.towerName }}
                  </a>
                </template>
              </el-table-column>
              <el-table-column v-for="(item, index) in monitorTypes" :key="item.id"
                :label="item.propertyValue">
                <template slot-scope="scope">
                  <el-tooltip class="item" placement="bottom">
                    <div slot="content" v-show="filterSummaryStatus(scope.row.monitorStatusDtos, index).status > 0">
                      <p>
                        <span>测点</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>警报等级</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>警报时间</span>
                      </p>
                      <br/>
                      <p v-for="item in statusData" :key="item.id">
                        <span :title="item.pointName">{{ item.pointName }}</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>{{ item.warningLevel === 1 ? '预警' : '报警' }}</span>
                        <el-divider direction="vertical"></el-divider>
                        <span>{{ item.warningTime }}</span>
                      </p>
                      <el-button
                        class="right"
                        type="text"
                        size="small"
                        @click="showWarning(scope.row.towerName)">
                        查看更多 >>
                      </el-button>
                    </div>
                    <div slot="content" class="content" v-show="filterSummaryStatus(scope.row.monitorStatusDtos, index).status === -2">
                        <p>
                          <span>丢失测点</span>
                          <el-divider direction="vertical"></el-divider>
                          <span>丢失时间</span>
                        </p>
                        <br/>
                        <p v-for="item in statusData" :key="item.id">
                          <span :title="item.pointName">{{ item.pointName }}</span>
                          <el-divider direction="vertical"></el-divider>
                          <span>{{ item.loseDuration || '暂无数据' }}</span>
                        </p>
                    </div>
                    <div slot="content" v-show="filterSummaryStatus(scope.row.monitorStatusDtos, index).status === 0
                      || filterSummaryStatus(scope.row.monitorStatusDtos, index).status === -1">
                      {{ filterSummaryStatus(scope.row.monitorStatusDtos, index).statusStr }}
                    </div>
                    <el-button
                      type="text"
                      size="small"
                      @mouseenter.native="_getStatusData(scope.row.towerId, filterSummaryStatus(scope.row.monitorStatusDtos, index).monitorType,
                        filterSummaryStatus(scope.row.monitorStatusDtos, index).status)"
                      :icon="filterSummaryStatus(scope.row.monitorStatusDtos, index).icon">
                    </el-button>
                  </el-tooltip>
                </template>
              </el-table-column>
            </el-table>
            <div class="pagination_wrapper right">
              <el-pagination
              text-color="#fff"
              background
              @current-change="handleSummaryCurrentChange"
              :current-page.sync="summaryPageEnquiry.pageNum"
              :page-size="summaryPageEnquiry.pageSize"
              :pager-count="5"
              :page-sizes="[10, 25, 50, 100]"
              @size-change="handleSummarySizeChange"
              layout="total, sizes, prev, pager, next, jumper"
              :total="summary">
              </el-pagination>
            </div>
          </div>
        </el-main>
      </el-container>
    </el-container>

    <!--批量操作时间段内数据-->
    <el-dialog title="监测数据批量处理" :visible.sync="DialogVisible" :close-on-click-modal="false" width="450px" top="15vh" class="MultDataForm">
      <el-form ref="MultDataForm" :model="selectDateTime" :rules="DateTimeRules" label-width="120px">
        <el-form-item prop="logTimestampBegin" label="选择起始时间" label-width="120px">
          <el-date-picker
            v-model="selectDateTime.logTimestampBegin"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerMultBeginDateBefore"
            placeholder="选择起始时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="logTimestampEnd" label="选择截止时间" label-width="120px">
          <el-date-picker
            v-model="selectDateTime.logTimestampEnd"
            type="datetime"
            value-format="yyyy-MM-dd HH:mm:ss"
            :picker-options="pickerMultBeginDateAfter"
            placeholder="选择截止时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item prop="validFlag" label="数据调整" label-width="120px" class="radioBtn">
          <el-radio v-model="selectDateTime.validFlag" :label="true">全部生效</el-radio>
          <el-radio v-model="selectDateTime.validFlag" :label="false">全部失效</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="MultDataFormSubmit" :loading="isLoading">确 定</el-button>
        <el-button @click="DialogVisible = false">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import $ from 'jquery'
import echarts from 'echarts'
import SideTree from '@/base/side-tree/side-tree'
import location from '@/base/location/location'
import VideoConfig from '@/base/video-config/video-config'
import {getMonitorGraph, getMonitorData, putValidFlag, putAllChangeValidFlag, getSummaryData, getSingleData, getStatusData, getVideoData} from '@/api/moniter-data'
import {getCompanyMessage} from '@/api/ou-level'
import {Message} from 'element-ui'
import {ERR_OK} from '@/api/config'
// 一天对应的毫秒数
const oneDay = 24 * 60 * 60 * 1000
export default {
  data () {
    const checkEndTime = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请选择截止时间'))
      }
      let startDateVal = this.selectDateTime.logTimestampBegin ? new Date(this.selectDateTime.logTimestampBegin).getTime() : ''
      let endDateVal = this.selectDateTime.logTimestampEnd ? new Date(this.selectDateTime.logTimestampEnd).getTime() : ''
      if (startDateVal && endDateVal && (startDateVal > endDateVal)) {
        return callback(new Error('截止时间必须晚于起始时间！'))
      } else {
        return callback()
      }
    }
    return {
      pickerMultBeginDateBefore: {
        firstDayOfWeek: 1,
        disabledDate: (time) => {
          let endDateVal = this.selectDateTime.logTimestampEnd ? new Date(this.selectDateTime.logTimestampEnd).getTime() : ''
          if (endDateVal) {
            return time.getTime() > endDateVal
          }
        }
      },
      pickerMultBeginDateAfter: {
        firstDayOfWeek: 1,
        disabledDate: time => {
          let startDateVal = this.selectDateTime.logTimestampBegin ? new Date(this.selectDateTime.logTimestampBegin).getTime() : ''
          if (startDateVal) {
            return time.getTime() < startDateVal - oneDay
          }
        }
      },
      isLoading: false,
      DialogVisible: false,
      selectDateTime: {
        validFlag: true,
        logTimestampBegin: null,
        logTimestampEnd: null
      },
      DateTimeRules: {
        validFlag: [
          { required: true, message: '请选择单位', trigger: 'submit' }
        ],
        logTimestampBegin: [
          { required: true, message: '请选择起始时间', trigger: 'submit' }
        ],
        logTimestampEnd: [
          { required: true, validator: checkEndTime, trigger: 'submit' }
        ]
      },
      MultData: [],
      showMultBtns: false,
      status: '',
      isTower: false,
      spanArr: [],
      towerName: '',
      companyList: [],
      summarySearch: {
        companyId: null,
        towerName: '',
        status: ''
      },
      summarySearchParams: {},
      summaryTableData: [],
      showSingleData: false,
      singleData: [],
      statusData: [],
      summaryPageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      summary: 0,
      pageEnquiry: {
        pageNum: 1,
        pageSize: 10
      },
      total: 0,
      formInline: {
        point: '',
        category: '',
        date: [],
        datecategory: ''
      },
      searchParams: {
        logDateBegin: '',
        logDateEnd: '',
        status: ''
      },
      listDateStart: null,
      listDateEnd: null,
      itemDatas: [],
      itemOptions: [],
      pointDatas: [],
      pointOptions: [],
      checkAll: [],
      checkItemAll: [],
      isIndeterminate: true,
      isItemIndeterminate: true,
      switchValue: false,
      activeName: '',
      dateStart: '',
      dateEnd: '',
      monitorGraphDatas: [],
      monitorDatasAll: [],
      deviceStatus: {},
      meteoStatus: [],
      item: '',
      point: '',
      title: '',
      monitorDatas: [],
      yAxisName: '',
      towerId: null,
      directionX: '',
      directionY: '',
      scroll: false,
      videoWidth: ($(window).width() - 430) / 2 - 8,
      videoHeight: ($(window).height() - 240) / 2,
      cameraCodeArr: [],
      videoSubTitle: '',
      recordLocation: '0',
      duration: null,
      monitorTypes: JSON.parse(localStorage.getItem('monitorTypes')),
      pickerBeginDateBefore: {
        firstDayOfWeek: 1,
        disabledDate: (time) => {
          let endDateVal = (this.formInline.date[1]) ? new Date(this.formInline.date[1]).getTime() : ''
          if (endDateVal) {
            return time.getTime() > endDateVal
          }
        }
      },
      pickerBeginDateAfter: {
        firstDayOfWeek: 1,
        disabledDate: time => {
          let startDateVal = (this.formInline.date[0]) ? new Date(this.formInline.date[0]).getTime() : ''
          if (startDateVal) {
            if (this.formInline.datecategory === 'week') {
              return time.getTime() < startDateVal - oneDay
            } else {
              return time.getTime() < startDateVal
            }
          }
        }
      },
      pickerDateBefore: {
        disabledDate: (time) => {
          let endDateVal = (this.listDateEnd) ? new Date(this.listDateEnd).getTime() : ''
          if (endDateVal) {
            return time.getTime() > endDateVal
          }
        }
      },
      pickerDateAfter: {
        disabledDate: (time) => {
          let endDateVal = (this.listDateStart) ? new Date(this.listDateStart).getTime() : ''
          if (endDateVal) {
            return time.getTime() < endDateVal
          }
        }
      }
    }
  },
  methods: {
    /**
     * 数据初始化
     */
    initParams () {
      this.monitorGraphDatas = []
      this.deviceStatus = {}
      this.meteoStatus = []
      this.itemOptions = []
      this.itemDatas = []
      this.item = ''
      this.pointOptions = []
      this.pointDatas = []
      this.point = ''
      this.status = ''
      this.formInline = {
        point: '',
        category: '',
        date: [],
        datecategory: 'datetime'
      }
      this.listDateStart = null
      this.listDateEnd = null
      this.monitorDatas = []
      this.pageEnquiry = {
        pageNum: 1,
        pageSize: 10
      }
      this.total = 0
      this.yAxisName = ''
      this.cameraCodeArr = []
      this.duration = null
      this.recordLocation = '0'
      this.videoSubTitle = ''
    },
    handleScroll () {
      this.scroll = !this.scroll
    },
    handlePlayBack () {
      if (this.formInline.date.length < 2) {
        this.$message.warning('请选择时间')
        return
      }
      this.$refs.playWnd2.handlePlayback(this.formInline.date[0], this.formInline.date[1])
    },
    handleConfig () {
      let url = 'https://' + config.ip + '/portal/cas/loginPage/'
      open(url, 'newwindow')
    },
    getImage (path, name) {
      if (!name || !path) {
        return require('@/common/images/default.png')
      } else {
        return '/mediaData/media/' + path + name
      }
    },
    filterData (values) {
      if (values.length === 0) {
        return []
      }
      let data = [
        values
      ]
      return data
    },
    filterValue (key) {
      return this.monitorTypes.length ? this.monitorTypes.filter(item => item.propertyKey === String(key))[0].propertyValue : ''
    },
    /**
     * status为0：正常
     * status为1：异常
     * @return 对应状态的文字描述
     */
    filterStatus (status) {
      return !status ? '正常' : '异常'
    },
    /**
     * 根据不同状态，显示不同颜色
     */
    filterSummaryStatus (statusDtos, index) {
      if (!statusDtos || statusDtos.length === 0) return
      let icon = 'unavailable_icon'
      switch (statusDtos[index].status) {
        case -2:
          icon = 'lose_icon'
          break
        case -1:
          icon = 'unavailable_icon'
          break
        case 0:
          icon = 'good_icon'
          break
        case 1:
          icon = 'warn1_icon'
          break
        case 2:
          icon = 'warn2_icon'
          break
      }
      return {
        icon: icon,
        monitorType: statusDtos[index].monitorType,
        status: statusDtos[index].status,
        statusStr: statusDtos[index].statusStr
      }
    },
    /**
     * 点击总表上异常数据查看更多，跳转
     */
    showWarning (name) {
      this.$router.push({
        path: '/warningData',
        query: {
          name: encodeURIComponent(name),
          status: encodeURIComponent('未处理')
        }
      })
    },
    getSpanArr (data) {
      let flag
      for (let i = 0; i < data.length; i++) {
        if (i === 0) {
          flag = i
          this.spanArr.push(1)
        } else {
        // 判断当前元素与上一个元素是否相同
          if (data[i].monitorType === data[i - 1].monitorType) {
            this.spanArr[flag] += 1
            this.spanArr.push(0)
          } else {
            flag = i
            this.spanArr.push(1)
          }
        }
      }
    },
    objectSpanMethod ({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 0) {
        const _row = this.spanArr[rowIndex]
        return {
          rowspan: _row,
          colspan: 1
        }
      }
    },
    /**
     * 总表搜索操作
     */
    handleSearch () {
      this.summaryPageEnquiry.pageNum = 1
      this.summarySearchParams = { ...this.summarySearch }
      this._getSummaryData()
    },
    handleVideoFocus () {
      this.$nextTick(() => {
        $('.datetime-point').attr('x-placement', 'top-start')
      })
    },
    /**
     * 切换不同监测项或切换列表和曲线图展示时
     * 统一处理
     */
    handleMoniterItem () {
      if (this.activeName === '总表') {
        this.choseTower()
        return
      }
      this.initParams()
      this.showSingleData = false
      if (!this.towerId) return
      // tab切换或switch切换使页面变化时
      // 将从地图页跳转而来的monitorTypeId和pointName参数清除掉
      this.$router.push({
        path: '/monitorData',
        query: {
          id: this.towerId,
          name: this.$route.query.name.indexOf('%') === -1 ? encodeURIComponent(this.$route.query.name) : this.$route.query.name,
          directionX: this.directionX.indexOf('%') === -1 ? encodeURIComponent(this.directionX) : this.directionX,
          directionY: this.directionY.indexOf('%') === -1 ? encodeURIComponent(this.directionY) : this.directionY
        }
      })
      this.handleMoniterRender()
    },
    /**
     * 根据筛选条件，确定请求参数值及请求接口
     */
    handleMoniterRender () {
      if (!this.switchValue) {
        this.formInline.datecategory = 'datetime'
        // 倾斜：最近1天的数据，北斗：近15天的数据
        if (this.activeName === '1') {
          this.formInline.category = '倾斜率'
          this.yAxisName = '倾斜率(‰)'
        }
        if (this.activeName === '2') {
          this.formInline.category = '位移量'
          this.yAxisName = '位移量(mm)'
        }
        // 倾斜：最近1天的数据，北斗：近15天的数据
        let days = 1
        if (this.activeName === '2' && this.formInline.category !== '累计变化(cm)') {
          days = 15
        }
        if (this.activeName === '5') {
          days = 7
        }
        // 默认起始时间设置
        this.dateStart = this.getCurrentTime(new Date(new Date() - days * oneDay))
        this.dateEnd = this.getCurrentTime(new Date())
        this.formInline.date = []
        this.formInline.date.push(new Date(new Date() - days * oneDay), new Date())
        this.$nextTick(() => {
          if (this.activeName === '5') {
            // tab切换为‘5’，监测项为视频，获取视频接口数据
            this._getVideoData()
            return
          }
          // 获取曲线图接口
          this._getMonitorGraph()
        })
      } else {
        this.listDateStart = null
        this.listDateEnd = null
        // 获取列表接口
        this.pageEnquiry.pageNum = 1
        this.handleListDateSearch()
      }
    },
    /**
     * 选中监测项全选按钮时，设置选中监测项值
     */
    handleItemCheckAllChange (val) {
      this.itemDatas = val ? this.itemOptions : []
      this.isItemIndeterminate = false
      this.handleItemCheckedChange()
    },
    /**
     * 选中监测项为1时，输入框显示监测项名
     * >1时，输入框显示几项被选中
     */
    handleItemCheckedChange () {
      // 选择监测项时执行
      let checkedCount = this.itemDatas.length
      this.checkItemAll = this.itemOptions.length === 0 ? false : checkedCount === this.itemOptions.length
      this.isItemIndeterminate =
        checkedCount > 0 && checkedCount < this.itemOptions.length
      this.item = this.itemDatas.length !== 0 ? this.itemDatas.length > 1
        ? this.itemDatas.length + '项被选中' : this.itemDatas[0] : ''
      this.getPointOptions()
      // 不管测点数据是否为空，都默认选中第一个
      this.pointDatas = []
      if (this.pointOptions.length > 0) {
        this.pointDatas.push(this.pointOptions[0].pointName)
      }
      this.handlePointChange()
    },
    /**
     * 当前选中监测项下的所有测点赋给pointOptions
     */
    getPointOptions () {
      this.pointOptions = []
      this.monitorDatasAll.forEach((data) => {
        this.itemDatas.forEach((item) => {
          if (data.itemName === item) {
            // 当前监测项下没有测点数据时返回
            if (data.datas.length === 0) return
            // 当前所选监测项对应的所有测点
            data.datas.forEach((point) => {
              this.pointOptions.push(point)
            })
          }
        })
      })
    },
    /**
     * 选中测点全选按钮时，设置选中测点值
     */
    handlePointAllChange (flag) {
      // flag为true时全选，false取消全选
      let point = []
      this.pointOptions.forEach((item) => {
        point.push(item.pointName)
      })
      this.pointDatas = flag ? point : []
      this.isIndeterminate = false
      this.handlePointChange()
    },
    /**
     * 选中测点变化时切换界面显示
     * 选中测点为1时，输入框显示测点名
     * >1时，输入框显示几项被选中
     */
    handlePointChange () {
      if (this.activeName === '5' && this.pointDatas.length > 1) {
        this.pointDatas.shift()
      }
      let checkedCount = this.pointDatas.length
      this.checkAll = this.pointOptions.length === 0 ? false : checkedCount === this.pointOptions.length
      this.isIndeterminate = checkedCount > 0 && checkedCount < this.pointOptions.length
      this.point = this.pointDatas.length !== 0 ? this.pointDatas.length > 1
        ? this.pointDatas.length + '项被选中' : this.pointDatas[0] : ''
    },
    handleCategoryChange () {
      if (this.activeName !== '2') {
        return
      }
      this.formInline.date = []
      let days = 1
      if (this.formInline.category !== '累计变化(cm)') {
        days = 15
      }
      this.formInline.date.push(new Date(new Date() - days * oneDay), new Date())
    },
    /**
     * 切换按日/周/月/年筛选时，重置日期
     */
    datecategoryChange () {
      this.formInline.date = []
    },
    /**
     * echarts图上预警报警线数据设置
     * @return
     *    符合echarts组件series格式的数据标线数据
     */
    handleWarnData (legend, warn, color) {
      // echarts警报线样式
      // 符合series.markLine格式的数据
      let markLine = {}
      if (warn) {
        markLine = {
          // 样式：显示为虚线
          // 预警黄色，警报红色
          itemStyle: {
            normal: {
              lineStyle: {
                color: color,
                type: 'dotted',
                width: '2'
              },
              label: {
                show: false
              }
            }
          },
          // 提示框格式为 => 警报值：2
          tooltip: {
            trigger: 'item',
            formatter: params => `<div>${legend}值:${params.value}</div>`
          },
          // 数据，无论警报还是报警，都需要正负值显示
          data: [
            { yAxis: warn }, { yAxis: -warn }
          ]
        }
      }
      let seriesData = {
        name: legend,
        type: 'line',
        symbol: 'circle',
        color: color,
        data: [],
        markLine: markLine
      }
      return seriesData
    },
    /**
     * @return
     *    符合echarts组件series格式的展示数据
     */
    handleSeriesDatas (legend, data) {
      let seriesData = []
      let lostData = []
      // 确定丢失数据点的范围(大于两倍平均值)
      if (data.length > 1) {
        let time = index => new Date(data[index][0].replace(/-/g, '/')).getTime()
        let maxInterval = (time(data.length - 1) - time(0)) / (data.length - 1) * 3
        for (let i = 1; i < data.length; i++) {
          if ((time(i) - time(i - 1)) >= maxInterval) {
            if (this.pointDatas.length === 1) {
              lostData.push([data[i - 1][0], 0])
              lostData.push([data[i][0], 0])
            } else {
              lostData.push(data[i - 1])
              lostData.push(data[i])
            }
            lostData.push('-')
            data.splice(i, 0, '-')
            i++
          }
        }
      }
      seriesData = [
        {
          name: legend,
          type: 'line',
          symbol: 'circle',
          data: data
        },
        {
          // 丢失点样式
          // 选中单个测点时显示为粗点
          // 选中多个测点时显示为细虚线
          name: legend,
          type: 'line',
          symbol: 'none',
          itemStyle: {
            normal: {
              lineStyle: {
                color: 'red',
                type: this.pointDatas.length === 1 ? 'dotted' : 'dashed',
                width: this.pointDatas.length === 1 ? 5 : 2
              }
            }
          },
          data: lostData
        }
      ]
      return seriesData
    },
    /**
     * 根据当前选中监测项和测点
     * 整理单个测点符合echarts组件series数据格式的所有数据
     */
    handleChange (value) {
      // 每个测点数据处理
      let datas = []
      let series = {
        seriesDatas: [],
        legendData: [],
        seriesDatasWind: [],
        legendDataWind: []
      }
      let key = ''
      // 后台接口数据封装 =>
      // 倾斜 a: 累计变化，c: 本次变化，i：倾斜率, v: 速度
      // 北斗 a: 累计变化，c: 本次变化，i：位移量, v: 速度
      let a = this.formInline.category === '累计变化(mm)' || this.formInline.category === '累计变化(cm)' || this.formInline.category === '累计变化'
      let i = this.formInline.category === '倾斜率' || this.formInline.category === '位移量'
      switch (this.activeName) {
        case '1':
          this.yAxisName = a ? '累计值(°)' : i ? '倾斜率(‰)' : '本次值(°)'
          key = a ? 'a' : i ? 'i' : 'c'
          datas = [['-X', value.dataXs], ['-Y', value.dataYs]]
          if (i) datas = [[`-${this.directionX}`, value.dataXs], [`-${this.directionY}`, value.dataYs]]
          break
        case '2':
          this.yAxisName = this.formInline.category === '累计变化(mm)' ? '累计值(mm)' : this.formInline.category === '累计变化(cm)' ? '累计值(cm)' : i ? '位移量(mm)' : '本次值(mm)'
          key = a ? 'a' : i ? 'i' : 'c'
          datas = [['-E', value.dataEs], ['-N', value.dataNs], ['-U', value.dataUs]]
          if (i) datas = [[`-${this.directionX}`, value.dataNs], [`-${this.directionY}`, value.dataEs]]
          break
        case '3':
          let t = this.handleSeriesDatas(`${value.id + 1}-温度`, value.datas.map(item => [item.dt, item.t, item.v]))
          series.seriesDatas = series.seriesDatas.concat(t)
          series.legendData = series.legendData.concat(`${value.id + 1}-温度`)
          break
        case '4':
          let ws = this.handleSeriesDatas(`${value.id + 1}-风速`, value.datas.map(item => [item.dt, item.ws]))
          series.seriesDatasWind = series.seriesDatasWind.concat(ws)
          series.legendDataWind = series.legendDataWind.concat(`${value.id + 1}-风速`)
          let dr = this.handleSeriesDatas(`${value.id + 1}-最近一日雨量`, value.datas.map(item => [item.dt, item.dr]))
          let hr = this.handleSeriesDatas(`${value.id + 1}-最近一小时雨量`, value.datas.map(item => [item.dt, item.hr]))
          let mr = this.handleSeriesDatas(`${value.id + 1}-最近一分钟雨量`, value.datas.map(item => [item.dt, item.mr]))
          let lg = [`${value.id + 1}-最近一日雨量`, `${value.id + 1}-最近一小时雨量`, `${value.id + 1}-最近一分钟雨量`]
          series.seriesDatas = series.seriesDatas.concat(dr, hr, mr)
          series.legendData = series.legendData.concat(lg)
          break
        default:
          break
      }
      // 北斗/倾斜数据统一处理
      datas.forEach(data => {
        let a = this.handleSeriesDatas(`${value.id + 1}${data[0]}`, data[1].map(item => [item.dt, item[key], item.dq]))
        series.seriesDatas = series.seriesDatas.concat(a)
        series.legendData.push(`${value.id + 1}${data[0]}`)
      })
      // 需要显示预警报警值：倾斜监测项下类型为倾斜率，北斗监测项下类型为累计变化，温度监测项
      // warn1：预警 warn2：报警
      if ((this.pointDatas.length === 1) &&
        ((this.activeName === '1' && i) ||
        (this.activeName === '2' && this.formInline.category === '累计变化(mm)') ||
        this.activeName === '3')) {
        if (value.warn1) {
          series.seriesDatas.push(this.handleWarnData('预警', value.warn1, '#FFBA15'))
          series.legendData.push('预警')
        }
        if (value.warn2) {
          series.seriesDatas.push(this.handleWarnData('报警', value.warn2, '#F54A4A'))
          series.legendData.push('报警')
        }
      }
      return series
    },
    handleRenderChart (value, pointName, isSearch) {
      let data = {}
      value.forEach(item => {
        item.datas.forEach(point => {
          if (point.pointName === pointName) {
            if (!isSearch) {
              this.pointDatas = []
              this.pointDatas.push(pointName)
              this.itemDatas = []
              this.itemDatas.push(item.itemName)
              this.item = item.itemName
            }
            this.getPointOptions()
            this.handlePointChange()
            data = this.handleChange(point)
            if (this.itemDatas.length === 1 && item.itemType === 1 && item.deviceStatus.length !== 0) {
              this.deviceStatus = item.deviceStatus[0]
            }
            if (item.itemType === 4) {
              this.meteoStatus.push(point)
            }
          }
        })
      })
      return data
    },
    /**
     * 处理请求到的监测数据曲线图数据
     */
    _getMonitorGraph (search = false) {
      // 初始化曲线图
      // 气象展示两张曲线图，其余监测项为一张
      this.meteoStatus = []
      this.deviceStatus = {}
      if (this.activeName === '3') this.yAxisName = '温度(℃)'
      let element, element1, element2
      if (this.activeName === '4') {
        element1 = echarts.init(this.$refs.myEchart1)
        element1.showLoading({ text: '数据正在努力加载...' })
        this.initChart(element1, '风速(m/s)', '风速', [], [])
        element2 = echarts.init(this.$refs.myEchart2)
        element2.showLoading({ text: '数据正在努力加载...' })
        this.initChart(element2, '雨量(mm)', '雨量', [], [])
      } else {
        element = echarts.init(this.$refs.myEchart)
        element.showLoading({ text: '数据正在努力加载...' })
        this.initChart(element, this.yAxisName, this.formInline.category, [], [])
      }
      let item = ['1', '2', '3', '4']
      if (item.indexOf(this.activeName) === -1) {
        if (element) {
          element.hideLoading()
        }
        return
      }
      // 获取监测数据曲线图数据
      getMonitorGraph({
        beidouType: this.formInline.category === '累计变化(cm)' ? 1 : 0,
        towerId: this.towerId,
        logTimestampBegin: this.dateStart,
        logTimestampEnd: this.dateEnd
      }, this.string).then((res) => {
        if (res.state === ERR_OK) {
          // showLoading遮盖层隐藏
          if (this.activeName === '4') {
            element1.hideLoading()
            element2.hideLoading()
          } else {
            element.hideLoading()
          }
          // 判断是否全选
          this.checkItemAll = this.itemOptions.length === 0 ? false
            : this.itemDatas.length === this.itemOptions.length
          if (res.value.length === 0) {
            this.itemOptions = []
            this.pointOptions = []
            this.item = ''
            this.point = ''
            return
          }
          this.monitorDatasAll = res.value
          this.itemOptions = []
          res.value.forEach((item) => {
            this.itemOptions.push(item.itemName)
          })
          let datas = {
            seriesDatas: [],
            legendData: [],
            seriesDatasWind: [],
            legendDataWind: []
          }
          if (search) {
            // 点击查询按钮时，根据当前已选测点的已选类型确定显示曲线
            this.pointDatas.forEach(point => {
              let data = this.handleRenderChart(res.value, point, true)
              for (let key in data) {
                datas[key] = datas[key].concat(data[key])
              }
            })
          } else {
            // 从map页的传感器跳转而来时，选中对应测点，否则默认选中第一个监测项的第一个测点
            if (res.value[0].datas.length === 0) return
            let pointName = this.$route.query.pointName ? decodeURIComponent(this.$route.query.pointName) : res.value[0].datas[0].pointName
            datas = this.handleRenderChart(res.value, pointName, false)
          }
          if (this.activeName === '4') {
            this.initChart(element1, '风速(m/s)', '风速', datas.seriesDatasWind, datas.legendDataWind)
            this.initChart(element2, '雨量(mm)', '雨量', datas.seriesDatas, datas.legendData)
          } else {
            this.initChart(element, this.yAxisName, this.formInline.category, datas.seriesDatas, datas.legendData)
          }
        }
      })
    },
    /**
     * 处理参数
     * 请求监测数据列表数据
     */
    _getMonitorDatas () {
      if (!this.towerId) {
        Message({
          type: 'warning',
          message: '请先选择杆塔',
          duration: 1000
        })
        return
      }
      this.monitorDatas = []
      if (this.activeName !== '1') {
        this.searchParams.status = null
      }
      let params = {
        towerId: this.towerId,
        logDateBegin: this.searchParams.logDateBegin,
        logDateEnd: this.searchParams.logDateEnd,
        pageNum: this.pageEnquiry.pageNum,
        pageSize: this.pageEnquiry.pageSize,
        status: this.searchParams.status
      }
      // 获取监测数据列表数据
      getMonitorData(params, this.string).then((res) => {
        if (res.state === ERR_OK) {
          this.monitorDatas = res.value.content
          this.total = res.value.totalElements
        }
      })
    },
    /**
     * 获取视频数据,并处理
     */
    _getVideoData (search = false) {
      // 获取视频数据
      getVideoData(this.towerId).then(res => {
        if (res.state === ERR_OK) {
          this.checkItemAll = this.itemOptions.length === 0 ? false
            : this.itemDatas.length === this.itemOptions.length
          if (res.value.length === 0) {
            this.itemOptions = []
            this.pointOptions = []
            this.item = ''
            this.point = ''
            return
          }
          this.monitorDatasAll = res.value
          if (search) {
            if (this.pointDatas.length === 0) {
              return
            }
            this.duration = null
            // 点击查询按钮时，根据当前已选测点确定cameraIndexCode
            res.value.forEach(item => {
              item.datas.forEach(point => {
                if (point.pointName === this.pointDatas[0]) {
                  // 每次切换前先销毁上一个
                  this.$refs.playWnd1.handleUninit()
                  this.$refs.playWnd2.handleUninit()
                  this.videoSubTitle = `${this.item}-${this.point}`
                  this.cameraCodeArr = [point]
                }
              })
            })
            return
          }
          this.itemOptions = []
          res.value.forEach((item) => {
            this.itemOptions.push(item.itemName)
          })
          this.itemDatas = []
          this.itemDatas.push(res.value[0].itemName)
          this.handleItemCheckedChange()
          if (res.value[0].datas.length > 0) {
            this.videoSubTitle = `${this.item}-${this.point}`
            this.cameraCodeArr = [res.value[0].datas[0]]
            // this.cameraIndexCode = res.value[0].datas[0].cameraCode
            // this.ssn = res.value[0].datas[0].ssn
          }
        }
      })
    },
    /**
     * 数据失效/生效请求
     */
    _putValidFlag (params, string, row) {
      putValidFlag(params, string).then(res => {
        if (res.state === ERR_OK) {
          row.validFlag = !row.validFlag
        }
      })
    },
    /**
     * 获取总表数据
     */
    _getSummaryData () {
      let params = Object.assign(this.summarySearchParams, this.summaryPageEnquiry)
      getSummaryData(params).then(res => {
        if (res.state === ERR_OK) {
          this.summaryTableData = res.value.content
          this.summary = res.value.totalElements
        }
      })
    },
    _getSingleData () {
      if (!this.towerId) {
        this.$message.error('请先选择杆塔')
        return
      }
      getSingleData(this.towerId).then(res => {
        if (res.state === ERR_OK) {
          this.spanArr = []
          this.singleData = res.value
          let indexArr = []
          this.singleData.forEach((data, index) => {
            if (this.monitorTypes.length && this.monitorTypes
              .filter(item => item.propertyKey === String(data.monitorType)).length === 0) {
              indexArr.unshift(index)
            }
          })
          indexArr.forEach(item => {
            this.singleData.splice(item, 1)
          })
          this.getSpanArr(this.singleData)
        }
      })
    },
    _getCompanyMessage () {
      getCompanyMessage().then((res) => {
        if (res.state === ERR_OK) {
          this.companyList = res.value
        }
      })
    },
    /**
     * 点击总表中有异常杆塔的异常信息
     */
    _getStatusData (towerId, monitorType, status) {
      this.statusData = []
      if (status === 0 || status === -1) return
      getStatusData({
        towerId: towerId,
        type: monitorType,
        status: status
      }).then((res) => {
        if (res.state === ERR_OK) {
          this.statusData = res.value
        }
      })
    },
    /**
     * 规范时间格式
     * @rerurn
     *    yyyy-MM-dd HH:mm:ss
     */
    getCurrentTime (date) {
      let year = date.getFullYear()
      let month = date.getMonth() + 1// 月
      let day = date.getDate()// 日
      let hour = date.getHours()// 时
      let minute = date.getMinutes()// 分
      let second = date.getSeconds()// 秒
      // 补0函数
      let s = s => s < 10 ? `0${s}` : s
      return `${year}-${s(month)}-${s(day)} ${s(hour)}:${s(minute)}:${s(second)}`
    },
    /**
     * 点击总表上杆塔名称，跳转到对应杆塔的监测数据
     */
    handleChoseTower (row) {
      let tower = {
        id: row.towerId,
        name: row.towerName,
        directionX: row.directionX,
        directionY: row.directionY
      }
      this.choseTower(tower)
      return false
    },
    /**
     * 侧边树结构选择杆塔时显示倾斜监测项的第一个测点数据
     */
    choseTower (tower = null) {
      this.activeName = '总表'
      this.singleData = []
      if (tower) {
        this.$router.push({
          path: '/monitorData',
          query: {
            id: tower.id,
            name: tower.name.indexOf('%') === -1 ? encodeURIComponent(tower.name) : tower.name,
            directionX: tower.directionX.indexOf('%') === -1 ? encodeURIComponent(tower.directionX) : tower.directionX,
            directionY: tower.directionY.indexOf('%') === -1 ? encodeURIComponent(tower.directionY) : tower.directionY
          }
        })
        this._choseTower(tower.id, tower.name, tower.directionX, tower.directionY)
      }
      this._getSingleData()
      this.isTower = true
      this.showSingleData = true
    },
    _choseTower (id, name, directionX, directionY) {
      // 选择杆塔后执行
      this.initParams()
      this.switchValue = false
      this.title = name
      this.towerId = id
      this.directionX = directionX
      this.directionY = directionY
      this.$nextTick(() => {
        if (!this.$refs.myEchart) {
          return
        }
        this.initChart(echarts.init(this.$refs.myEchart), '', '', [], [])
      })
      if (this.activeName === '总表') {
        return
      }
      if (this.monitorTypes.length > 0) {
        this.activeName = this.monitorTypes[0].propertyKey
      }
      if (this.$route.query.monitorTypeId) {
        this.activeName = this.$route.query.monitorTypeId
      }
      this.handleMoniterRender()
    },
    /**
     * 曲线图页点击查询按钮时根据筛选条件请求数据
     */
    handleGraphSearch () {
      let msg = (!this.towerId) ? '请先选择杆塔' : (this.pointDatas.length === 0) ? '请选择测点'
        : (!this.formInline.date[0] || !this.formInline.date[1]) ? '请选择时间' : null
      if (msg) {
        Message({
          type: 'warning',
          message: msg,
          duration: 1000
        })
        return
      }
      this.$router.push({
        path: '/monitorData',
        query: {
          id: this.towerId,
          name: this.$route.query.name.indexOf('%') === -1 ? encodeURIComponent(this.$route.query.name) : this.$route.query.name,
          directionX: this.directionX.indexOf('%') === -1 ? encodeURIComponent(this.directionX) : this.directionX,
          directionY: this.directionY.indexOf('%') === -1 ? encodeURIComponent(this.directionY) : this.directionY
        }
      })
      let start = new Date(this.formInline.date[0])
      let end = new Date(this.formInline.date[1])
      this.dateStart = this.getCurrentTime(start)
      this.dateEnd = this.getCurrentTime(end)
      switch (this.formInline.datecategory) {
        case 'week':
          this.dateStart = this.getCurrentTime(new Date(start.getTime() - oneDay))
          this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 6 * oneDay))
          break
        case 'month':
          let endTime = end.getTime()
          end.setMonth(end.getMonth() + 1)
          end.setDate(0)
          this.dateEnd = this.getCurrentTime(new Date(endTime + end.getDate() * oneDay))
          break
        case 'year':
          // 判断是否是闰年
          if (end.getFullYear() % 400 === 0 || (end.getFullYear() % 4 === 0 && end.getFullYear() % 100 !== 0)) {
            this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 366 * oneDay))
          } else {
            this.dateEnd = this.getCurrentTime(new Date(end.getTime() + 365 * oneDay))
          }
          break
        default:
          break
      }
      if (this.activeName === '5') {
        this._getVideoData(true)
        return
      }
      this._getMonitorGraph(true)
    },
    /**
     * 根据查询参数，获取监测数据列表接口
     */
    handleListDateSearchBefore () {
      this.pageEnquiry.pageNum = 1
      this.handleListDateSearch()
    },
    handleListDateSearch () {
      let item = ['1', '2', '3', '4', '5']
      if (item.indexOf(this.activeName) === -1) {
        return
      }
      this.searchParams = {
        logDateBegin: !this.listDateStart ? null : this.getCurrentTime(new Date(this.listDateStart)),
        logDateEnd: !this.listDateEnd ? null : this.getCurrentTime(new Date(this.listDateEnd)),
        status: this.status === '' ? null : this.status === '正常' ? 0 : 1
      }
      this._getMonitorDatas()
    },
    handleCurrentChange (page) {
      this.pageEnquiry.pageNum = page
      this._getMonitorDatas()
    },
    /**
     * 调整每页显示条数
     */
    handleSizeChange (size) {
      this.pageEnquiry.pageSize = size
      this.handleCurrentChange(1)
    },
    handleSummaryCurrentChange (page) {
      this.summaryPageEnquiry.pageNum = page
      this._getSummaryData()
    },
    handleSummarySizeChange (size) {
      this.summaryPageEnquiry.pageSize = size
      this.handleSummaryCurrentChange(1)
    },
    /**
     * 数据失效/生效请求的确认框
     */
    handleValid (row) {
      let label = this.activeName === '5' ? '历史图片页' : '曲线图中'
      let msg = row.validFlag ? `此操作会使数据失效，在${label}隐藏该点，确定继续？`
        : `此操作会使数据生效，在${label}显示该点，确定继续?`
      this.$confirm(msg, '提示', {
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning',
        center: true
      }).then(() => {
        let params = [{
          ssn: row.ssn,
          dataTimestamp: row.dataTimestamp,
          validFlag: !row.validFlag,
          type: this.activeName === '5' ? row.type : null
        }]
        this._putValidFlag(params, this.string, row)
      }).catch(() => {})
    },
    /**
     * 批量操作 数据失效/生效请求的确认框
     */
    handleValidMult (type) {
      let label = this.activeName === '5' ? '历史图片页' : '曲线图中'
      let msg = !type ? `此操作会使选中数据全部失效，在${label}隐藏该点，确定继续？`
        : `此操作会使选中数据全部生效，在${label}显示该点，确定继续?`
      this.$confirm(msg, '提示', {
        cancelButtonClass: 'btn-custom-cancel',
        type: 'warning',
        center: true
      }).then(() => {
        let params = []
        Array.prototype.forEach.call(this.MultData, (item) => {
          params.push({
            ssn: item.ssn,
            dataTimestamp: item.dataTimestamp,
            validFlag: type,
            type: this.activeName === '5' ? item.type : null
          })
        })
        putValidFlag(params, this.string).then(res => {
          if (res.state === ERR_OK) {
            this.handleListDateSearch()
          }
        })
      }).catch(() => {})
    },
    /**
     * echarts数据初始化
     */
    initChart (element, yAxisName, category, seriesDatas, legendData) {
      let item = this.filterValue(this.activeName)
      element.clear()
      element.setOption({
        title: {
          x: 'center',
          text: this.title,
          textStyle: {
            color: '#505050' // 主标题文字颜色
          },
          subtext: `${item}-${category}趋势曲线图`,
          subtextStyle: {
            fontSize: 14,
            color: '#505050'
          }
        },
        color: ['#357F88', '#7E4B76', '#BF675F', '#1F814A', '#673509', '#310937',
          '#B5C334', '#F3A43B', '#60C0DD', '#FE8463', '#9BCA63', '#26C0C0'],
        legend: { // 图表上方的类别显示
          type: 'scroll', // legend类别过多时分页效果
          y: 50,
          data: legendData
        },
        tooltip: {
          trigger: 'axis',
          formatter: params => {
            let r = []
            r.push(`<div>${params[0].value[0]}</br>监测项：${item}</br>`)
            let measure = yAxisName.split('(')[1].split(')')[0]
            for (let i = 0; i < params.length; i++) {
              if (i > 0 && params[i].seriesName === params[i - 1].seriesName) continue
              r.push(`${params[i].seriesName}：${params[i].value[1]} ${measure}</br>`)
              if (this.activeName === '3' && params[0].value.length === 3) {
                r.push(`${params[i].seriesName.split('-')[0]}-电压：${params[0].value[2]} V</br>`)
              }
            }
            if (this.activeName === '2' && this.yAxisName === '位移量(mm)') {
              r.push(`dq：${params[0].value[2]}</br>`)
            }
            r.push(`</div`)
            return r.join('')
          }
        },
        dataZoom: {// 区域缩放控件
          show: true,
          realtime: true,
          height: 5,
          start: 0,
          end: 100,
          handleSize: 16,
          handleStyle: {
            borderColor: '#cacaca',
            borderWidth: '2',
            shadowBlur: 5,
            background: '#fff',
            shadowColor: '#fff',
            color: '#fff'
          },
          handleIcon: 'M100,100 m-75,0 a75,75 0 1,0 150,0 a75,75 0 1,0 -150,0 Z',
          fillerColor: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
            // 设置渐变色 前面4个参数，第一个设置1，第四个设置0，是水平渐变，第一个设置0，第四个设置1，就是垂直渐变
            offset: 0,
            color: '#1a6db6'
          },
          {
            offset: 1,
            color: '#f0f7ff'
          }])
        },
        grid: {
          y2: '90px',
          y: '105px',
          x: '80px',
          x2: '60px'
        },
        xAxis: [{
          type: 'time',
          boundaryGap: false,
          name: '时间',
          splitNumber: this.activeName === '4' ? 10 : 13, // 分割段数
          axisLine: {
            onZero: false // 横轴不要默认从0开始
          },
          axisLabel: {
            textStyle: {
              color: '#000' // 坐标值得具体的颜色
            }
          }
        }],
        yAxis: [
          {
            type: 'value',
            scale: true,
            boundaryGap: [0.2, 0.2],
            name: yAxisName,
            axisLabel: {
              textStyle: {
                color: '#000' // 坐标值得具体的颜色
              }
            }
          }
        ],
        series: seriesDatas
      })
    },
    initMounted () {
      this.isTower = false
      this.showSingleData = false
      this._getCompanyMessage()
      this._getSummaryData()
      if (!this.$route.query.id) return
      let tower = {
        id: this.$route.query.id,
        name: decodeURIComponent(this.$route.query.name),
        directionX: decodeURIComponent(this.$route.query.directionX),
        directionY: decodeURIComponent(this.$route.query.directionY)
      }
      if (!this.$route.query.monitorTypeId) {
        this.choseTower(tower)
        return
      }
      this.showSingleData = false
      this.isTower = true
      this._choseTower(tower.id, tower.name, tower.directionX, tower.directionY)
    },
    handleSelectionChange (val) {
      if (val.length) {
        this.showMultBtns = true
        this.MultData = val
      } else {
        this.showMultBtns = false
        this.MultData = []
      }
    },
    /**
     * 设置选中数据失效
     * */
    handleSetDataInvalid () {
      this.handleValidMult(false)
    },
    /**
     * 设置选中数据生效
     * */
    handleSetDataEffect () {
      this.handleValidMult(true)
    },
    /**
     * 批量操作筛选时间区间内数据
     * */
    handleMultDataByDate () {
      this.DialogVisible = true
      this.$nextTick(() => {
        this.$refs['MultDataForm'].resetFields()
      })
    },
    MultDataFormSubmit () {
      this.$refs['MultDataForm'].validate((valid) => {
        if (valid) {
          let params = {
            type: Number(this.activeName),
            validFlag: this.selectDateTime.validFlag,
            logTimestampBegin: this.selectDateTime.logTimestampBegin,
            logTimestampEnd: this.selectDateTime.logTimestampEnd,
            towerId: this.towerId
          }
          putAllChangeValidFlag(params).then(res => {
            if (res.state === ERR_OK) {
              this.DialogVisible = false
              this.handleListDateSearch()
            }
          })
        }
      })
    }
  },
  mounted () {
    this.initMounted()
  },
  watch: {
    // 路由变化时退出
    '$route': function (val, oldVal) {
      if (!val.query.id) {
        this.initMounted()
      }
    }
  },
  computed: {
    valueFormat () {
      return (this.formInline.datecategory === 'week') ? null : 'yyyy/MM/dd HH:mm:ss'
    },
    format () {
      return (this.formInline.datecategory === 'week') ? 'yyyy 第WW周' : null
    },
    /**
     * tab切换到不同监测项时，对应的请求的string参数不同
     */
    string () {
      switch (this.activeName) {
        case '1':
          return 'incline'
        case '2':
          return 'beidou'
        case '3':
          return 'temp'
        case '4':
          return 'meteo'
        case '5':
          return 'media'
        default:
          return ''
      }
    }
  },
  components: {
    SideTree,
    location,
    VideoConfig
  }
}
</script>
<style lang="stylus" rel="stylesheet/stylus" scoped>
@import '~@/common/stylus/mixin.styl';
.monitor_data
  .el-container
    .el-container
      height calc(100% - 30px)
      padding 10px 10px 10px 0
      .el-aside
        margin-right 10px
        bg-color-full #fff
        box-shadow 0px 0px 6px #ededed
      .el-main
        bg-color-full #fff
        box-shadow 0px 0px 6px #ededed
        .moniter_item
          position relative
          .item
            position absolute
            right 60px
            top 9px
            z-index 1
          .el-switch
            border 1px solid #dbeeff
            border-radius 15px
            padding 5px 15px
            bg-color-full(#dbeeff)
        .tab_wrapper
        .dataGraph
          padding 10px 35px 0
        .dataList
          padding 10px 35px 0
          .option_wrapper
            display block
            >>>.el-form
              padding-right 11px
              display flex
              flex-direction row
              justify-content space-between
              flex-wrap wrap
              .searchForm
                display inline-block
                .MultHandle
                  padding 8px 15px
              .selectBtns
                display inline-block
                .setInvalid
                  color #1a6db6
                  background-color #fff
                  border-color #1a6db6
                .setEffect
                  color #909399
                  background #f4f4f5
                  border-color #d3d4d6
                .el-button--mini, .el-button--mini.is-round
                  padding 8px 15px
        .singleTableList
          padding 10px 35px
        .params_wrapper
          margin 0 20px
          .temperature, .voltage, .humidity
            color #606266
          .showText
            font-size 24px
            color #1a6db6
            padding-right 20px
          .red
            color #D80000!important
        .echarts_wrapper
          width calc(100vw - 340px)
          position absolute
          bottom 60px
          .title
            display inline-block
            margin 0 0 20px 20px
            .showText
              font-size 22px
              color #1a6db6
        .video_wrapper
          margin 35px 20px
          .real-time-video
            margin-right 30px
          .history-video
            position relative
          .title
            font-size 20px
            color #606266
            font-weight bold
            text-align center
          .subTitle
            color #606266
            text-align center
            font-size 14px
            padding 10px 0
          .playback
            text-align center
            .el-date-editor
              width 180px !important
          .location
            position absolute
            right 0
            top -76px
        .option_wrapper
          display inline-block
          margin-left 20px
          .el-input
            width 90px!important
          .el-select
            width 125px!important
          .el-range-editor.el-input__inner
            padding 0!important
          .el-date-editor .el-range-separator
            line-height 30px!important
          .datetime .el-date-editor
            width 180px !important
          .echarts
            margin-top 10px
        .datas_wrapper
          margin 10px 15px
          .ok
            color rgb(30, 144, 255)
          .error
            color rgba(112, 128, 144, 0.8)
        .total-status-wrapper
          padding 0 20px
          .option
            margin 20px
.MultDataForm
  >>>.el-dialog__body
    padding: 15px 30px 0 !important;
    .radioBtn
      .el-form-item__content
        line-height 33px!important
</style>
