import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import * as echarts from 'echarts';

export class Echarts8 extends Component {
  constructor(props) {
    super(props);
    this.myCharts = null;
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
        cpu: parseFloat(affected_items[0].node_api_config.cpu),
        disk: parseFloat(affected_items[0].node_api_config.disk),
        mem: parseFloat(affected_items[0].node_api_config.mem),
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表8数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ formParams }, this.buildChart)
  }

  buildChart() {
    const { formParams } = this.state;
    const seriesData = [
      {
        name: 'CPU占用率',
        value: formParams.cpu,
        title: {
          offsetCenter: ['0%', '-70%']
        },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '-50%']
        }
      },
      {
        name: '硬盘占用率',
        value: formParams.disk,
        title: {
          offsetCenter: ['0%', '-20%']
        },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '5%']
        }
      },
      {
        name: '内存占用率',
        value: formParams.mem,
        title: {
          offsetCenter: ['0%', '30%']
        },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '55%']
        }
      }
    ]
    let option = {
      series: [
        {
          type: 'gauge',
          radius: '90%' ,
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              borderWidth: 1,
              borderColor: '#464646'
            }
          },
          axisLine: {
            lineStyle: {
              width: 10
            }
          },
          splitLine: {
            show: false,
            distance: 0,
            length: 15
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            show: false,
            distance: 10
          },
          data: seriesData,
          title: {
            fontSize: 12,
            color: '#d7d7d7',
          },
          detail: {
            width: 40,
            height: 12,
            fontSize: 12,
            color: '#d7d7d7',
            borderColor: '#d7d7d7',
            borderRadius: 10,
            borderWidth: 1,
            formatter: '{value}%'
          }
        }
      ]
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox8');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox8'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox8" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}