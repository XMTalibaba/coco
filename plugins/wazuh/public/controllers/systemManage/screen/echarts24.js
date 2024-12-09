import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import * as echarts from 'echarts';
import { WzRequest } from '../../../react-services/wz-request';
export class Echarts24 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.myCharts = null;
    this.interval = null;
    this.state = {
      xAxisData: [],
      seriesData: [],
    }
  }

  async componentDidMount() {
    this.toSearch();
    this.interval = setInterval(() => this.toSearch(), 60 * 1000);
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
    let xAxisData = [], seriesData = []
    try {
    
      const res = await WzRequest.apiReq('GET',`/manager/eventlog_analyze?name=top_five_host`, {});
      const dataList = (
          ((res || {}).data || {}).data || {}
        ).affected_items[0];

        for (let key in dataList) {
          if (dataList.hasOwnProperty(key)) {
            let name = key;
            let value = dataList[key];
    
            // 创建一个包含键名和数值的对象
            let entry = { name, value };
            xAxisData.push(name)
            // 将对象推入数组
            seriesData.push(entry);
          }
      }
     
  
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表3数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ xAxisData, seriesData }, this.buildChart)
  }

  buildChart() {
    const { xAxisData, seriesData } = this.state;
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
      },
      grid: {
        left: '15px',
        right: '45px',
        bottom: '15px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: '名称',
        axisLine: {
          lineStyle: {
            color: '#d7d7d7'
          }
        },
        // axisTick: {
        //   alignWithLabel: true
        // },
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        name: '数量',
        axisLine: {
          show: true,
          lineStyle: {
            color: '#d7d7d7'
          }
        },
        axisTick: {
          show: false
        },
        splitLine: {
          show: false
        }
      },
      series: {
        name: '输入源名称',
        type: 'bar',
        barWidth: 30,
        emphasis: {
          focus: 'series'
        },
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ])
        },
        data: seriesData
      }
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox24');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox24'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox24" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}