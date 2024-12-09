import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';
import { AppState } from '../../../react-services/app-state';
import * as echarts from 'echarts';

export class Echarts11 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.clusterFilter = {};
    this.myCharts = null;
    this.interval = null;
    this.state = {
      xAxisData: [],
      totalData: []
    }
  }

  async componentDidMount() {
    const isCluster = (AppState.getClusterInfo() || {}).status === "enabled";
      const clusterFilter = isCluster
        ? { "cluster.name": AppState.getClusterInfo().cluster }
        : { "manager.name": AppState.getClusterInfo().manager };
    this.clusterFilter = clusterFilter;
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
    let xAxisData = [], totalData = []
    try {
      const now = new Date()
      const dataRange = {
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
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
                  { match_phrase: this.clusterFilter },
                  {
                    bool: {
                      minimum_should_match: 1,
                      should: [
                        { match_phrase: { 'rule.id': '100036' } }, // 端口开放
                        { match_phrase: { 'rule.id': '100340' } }, // 时间同步
                        { match_phrase: { 'rule.id': '100050' } }, // 设备连通
                      ]
                    }
                  },
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
        totalData.push({ name: formatUIDate(item.key_as_string), value: item.doc_count })
      })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表11数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ xAxisData, totalData }, this.buildChart)
  }

  buildChart() {
    const { xAxisData, totalData } = this.state;
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
        name: '总数',
        type: 'line',
        data: totalData,
        itemStyle: {
          normal: {
            color: '#6bdd9b',
            lineStyle: {
              color: '#6bdd9b',
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(107, 221, 155, 0.4)'
              }, {
                offset: 0.8,
                color: 'rgba(107, 221, 155, 0.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            }
          }
        },
      }
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox11');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox11'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox11" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}