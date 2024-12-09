import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import * as echarts from 'echarts';

export class Echarts3 extends Component {
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
      const now = new Date()
      const dataRange = {
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000*100),
        to: now
      }
      let params = {
        params: {
          body: {
            aggs: {
              2: {
                aggs: {
                  3: {
                    terms: {
                      field: "agent.ip",
                      order: {
                        _count: "desc"
                      },
                      size: 5
                    }
                  }
                },
                terms: {
                  field: "data.port.local_port",
                  order: {
                    _count: "desc"
                  },
                  size: 5
                }
              }
            },
            query: {
              bool: {
                filter: [
                  { match_all: {} },
                  { 
                    range: {
                      timestamp: {
                        format: "strict_date_optional_time",
                        gte: dataRange.from.toISOString(),
                        lte: dataRange.to.toISOString()
                      }
                    }
                  }
                ],
                must_not: [{ match_phrase: { "agent.id": "000" } }],
                must: [],
                should: [],
              }
            },
            script_fields: {},
            size: 0,
            stored_fields: ["*"],
            _source: { excludes: ["@timestamp"] }
          },
          index: "wazuh-alerts-*"
        }
      }
      const res = await getHttp().post(`/internal/search/es`, { body: JSON.stringify(params)});
      const dataList = ((((res || {}).rawResponse || {}).aggregations || {})['2'] || {}).buckets
      dataList.forEach(item => {
        xAxisData.push(item.key)
        seriesData.push({
          name: item.key,
          value: item.doc_count
        })
      })
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
        name: '端口',
        axisLine: {
          lineStyle: {
            color: '#d7d7d7'
          }
        },
        axisTick: {
          alignWithLabel: true
        },
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
        name: '端口开放',
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
      let chartDom = document.getElementById('echartsBox3');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox3'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox3" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}