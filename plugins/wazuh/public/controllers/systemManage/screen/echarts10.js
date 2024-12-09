import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import * as echarts from 'echarts';

export class Echarts10 extends Component {
  constructor(props) {
    super(props);
    this.myCharts1 = null;
    this.myCharts2 = null;
    this.myCharts3 = null;
    this.interval = null;
    this.state = {
      formParams: {
        cpu: 0,
        disk: 0,
        mem: 0
      },
    }
  }

  async componentDidMount() {
    await this.toSearch();
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
    let formParams = {
      cpu: 0,
      disk: 0,
      mem: 0,
    }
    try {
      const rawRules = await WzRequest.apiReq('GET', '/manager/hardwareusedinfo?pretty=true', {});
      const { affected_items } = ((rawRules || {}).data || {}).data;
      formParams = {
        cpu: parseFloat(affected_items[0].node_api_config.cpu).toFixed(2),
        disk: parseFloat(affected_items[0].node_api_config.disk).toFixed(2),
        mem: parseFloat(affected_items[0].node_api_config.mem).toFixed(2),
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表10数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ formParams }, this.buildChart)
  }

  getOption(data) {
    let option = {
      grid: {
        left: '5px',
        right: '5px',
        containLabel: true
      },
      series: [{
        type: 'gauge',
        center: ['50%', '45%'],
        radius: '90%',
        startAngle: 200,
        endAngle: -20,
        axisLine: {
          lineStyle: {
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        pointer: {
          width: 4,
          itemStyle: {
            color: 'auto'
          }
        },
        axisTick: {
          show: false
          // distance: -10,
          // length: 8,
          // lineStyle: {
          //   color: '#fff'
          // }
        },
        splitLine: {
          distance: -12,
          length: 10,
          lineStyle: {
            color: '#fff'
          }
        },
        axisLabel: {
          color: 'inherit',
          fontSize: 12
        },
        detail: {
          valueAnimation: true,
          formatter: '{value} %',
          color: 'inherit',
          fontSize: 20
        },
        data: [
          {
            value: data
          }
        ]
      }]
    }
    return option
  }

  buildChart() {
    const { formParams } = this.state;
    const option1 = this.getOption(Number(formParams.cpu))
    const option2 = this.getOption(Number(formParams.disk))
    const option3 = this.getOption(Number(formParams.mem))
    let timer1 = setInterval(() => {
      let chartDom = document.getElementById('echartsBox10_1');
      if (chartDom) {
        clearInterval(timer1);
        if (!this.myCharts1) this.myCharts1 = echarts.init(document.getElementById('echartsBox10_1'));
        this.myCharts1.setOption(option1);
        if (!this.myCharts2) this.myCharts2 = echarts.init(document.getElementById('echartsBox10_2'));
        this.myCharts2.setOption(option2);
        if (!this.myCharts3) this.myCharts3 = echarts.init(document.getElementById('echartsBox10_3'));
        this.myCharts3.setOption(option3);
      }
    }, 200);
  }

  render() {
    return (
      <div style={{ display: 'flex', height: '100%', justifyContent: 'space-around' }}>
        <div style={{ position: 'relative', width: '30%' }}>
          <div className="echarts10Title">CPU占用率</div>
          <div style={{ width: '100%', height: 'calc(100% - 40px)' }} id="echartsBox10_1" />
          <div className="echarts10Cicle" />
        </div>
        <div style={{ position: 'relative', width: '30%' }}>
        <div className="echarts10Title">硬盘占用率</div>
          <div style={{ width: '100%', height: 'calc(100% - 40px)' }} id="echartsBox10_2" />
          <div className="echarts10Cicle" />
        </div>
        <div style={{ position: 'relative', width: '30%' }}>
        <div className="echarts10Title">内存占用率</div>
          <div style={{ width: '100%', height: 'calc(100% - 40px)' }} id="echartsBox10_3" />
          <div className="echarts10Cicle" />
        </div>
      </div>
    )
  }
}