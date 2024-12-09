import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import * as echarts from 'echarts';

export class Echarts6 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.myCharts = null;
    this.interval = null;
    this.state = {
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
    let seriesData = [], options = [
      { value: 'active', text: '已连接' },
      { value: 'disconnected', text: '未连接' },
      { value: 'never_connected', text: '从未连接' },
    ]
    try {
      for (let i = 0; i < 3; i ++) {
        const k = options[i]
        const rawAgents = await WzRequest.apiReq(
          'GET',
          '/agents',
          { params: { q: `id!=000;(status=${k.value})`} }
        );
        const { total_affected_items } = ((rawAgents || {}).data || {}).data || {}
        seriesData.push({
          name: k.text,
          value: total_affected_items
        })
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表6数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ seriesData }, this.buildChart)
  }

  buildChart() {
    const { seriesData } = this.state;
    let option = {
      tooltip: {},
      grid: {
        left: '15px',
        right: '15px',
        bottom: '15px',
        containLabel: true
      },
      series: [
        {
          name: '连接状态分布',
          type: 'pie',
          data: seriesData,
          radius: '55%',
          center: ['50%', '50%'],
          label: {
            color: '#d7d7d7'
          },
          animationType: 'scale',
          animationEasing: 'elasticOut',
          animationDelay: idx => {
            return Math.random() * 200;
          }
        }
      ]
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox6');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox6'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox6" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}