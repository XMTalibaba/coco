import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';
import * as echarts from 'echarts';

export class Echarts14 extends Component {
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
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000* 1000),
        to: now
      }
      let params = {
        params: {
          body: {
            aggs: {
              2: {
                date_histogram: {
                  calendar_interval: '1h',
                  field: "timestamp",
                  min_doc_count: 1,
                  time_zone: "Asia/Shanghai"
                }
              }
            },
            query: {
              bool: {
                filter: [
                  { match_all: {} },
                  { match_phrase: { 'rule.id': '100340' } },
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
        xAxisData.push(formatUIDate(item.key_as_string))
        seriesData.push({
          name: formatUIDate(item.key_as_string),
          value: item.doc_count
        })
      })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表14数据查询失败: ' + error,
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
          type: 'line'
        },
      },
      // legend: {
      //   type: 'scroll',
      //   pageIconColor: '#d7d7d7',
      //   pageTextStyle: {
      //     color: '#d7d7d7'
      //   },
      //   textStyle: {
      //     color: '#d7d7d7'
      //   }
      // },
      grid: {
        left: '30px',
        right: '45px',
        bottom: '15px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        name: '时间',
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
        name: '时间同步',
        type: 'line',
        data: seriesData,
        itemStyle: {
          normal: {
            color: '#f29701',
            lineStyle: {
              color: '#f29701',
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(242, 151, 1, 0.4)'
              }, {
                offset: 0.8,
                color: 'rgba(242, 151, 1, 0.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            }
          }
        },
      }
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox14');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox14'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox14" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}