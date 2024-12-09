import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';
import * as echarts from 'echarts';
import { WzRequest } from '../../../react-services/wz-request';
export class Echarts21 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.myCharts = null;
    this.interval = null;
    this.state = {
      xAxisData: [],
      seriesData: [],
      totalData: []
    }
  }

  async componentDidMount() {
    this.toSearch();
    // this.interval = setInterval(() => this.toSearch(), 60 * 1000);
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.isChangeSize !== prevProps.isChangeSize) {
      this.updateHeight()
    }
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  updateHeight = () => {
    this.myCharts && this.myCharts.resize();
  };
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async toSearch() {
    let xAxisData = [], seriesData = [], totalData = []
    let today = new Date();

    // 创建30天前的日期对象
    let thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));

    // 格式化日期为 yyyy-MM-dd 格式
    function formatDate(date) {
        let year = date.getFullYear();
        let month = (1 + date.getMonth()).toString().padStart(2, '0'); // padStart adds a leading zero if needed
        let day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 获取当前日期和30天前日期的格式化版本
    let todayFormatted = formatDate(today);
    let thirtyDaysAgoFormatted = formatDate(thirtyDaysAgo);
    try {
      const now = new Date()
      // const dataRange = {
      //   from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      //   to: now
      // }
      const res = await WzRequest.apiReq('GET',`/manager/eventlog_analyze?logs_trend`, {});

			let params =(
        ((res || {}).data || {}).data || {}
      ).affected_items[0];
    
//       let paramss={
// all_events_size:'10',
// one_month_all_events_size:'30'
//       }
      if (params.hasOwnProperty('all_events_size')) {
      
     
      } else {
     
        params={
         all_events_size:'0',
one_month_all_events_size:'0'
        }
      }
      seriesData=Object.values(params);
      
//       Object.keys(paramss).forEach(key => {
//         let obj={
// name:key,
// data:paramss[key]
//         }
     
//     });
 
       xAxisData.push(thirtyDaysAgoFormatted,todayFormatted)

    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表4数据查询失败: ' + error,
        3000
      );
    }


    this.setState({ xAxisData, seriesData, totalData }, this.buildChart)
  }

  buildChart() {
    const { xAxisData, seriesData, totalData } = this.state;
    // let series = seriesData.map(k => ({
    //   data: k.data,
    //   type: 'line',
    //   areaStyle: {}
    // }))
    // series.push({
    //   name: '总数',
    //   type: 'line',
    //   label: {
    //     show: true
    //   },
    //   data: totalData
    // })
    let option = {
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data:xAxisData
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          data: seriesData,
          type: 'line',
          areaStyle: {}
        }
      ]
    
    };
    // let option = {
    //   tooltip: {
    //     trigger: 'axis',
    //     axisPointer: {
    //       type: 'shadow'
    //     },
    //   },

    //   xAxis: {
    //     type: 'category',
    //     axisLine: {
    //       lineStyle: {
    //         color: '#d7d7d7'
    //       }
    //     },
    //     data: xAxisData
    //   },
    //   yAxis: {
    //     type: 'value',
    //     name: '数量',
    //     axisLine: {
    //       lineStyle: {
    //         color: '#d7d7d7'
    //       }
    //     },
    //   },
    //   series
    // }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox21');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox21'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox21" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}