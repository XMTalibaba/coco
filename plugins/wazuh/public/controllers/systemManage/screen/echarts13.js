import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import * as echarts from 'echarts';

export class Echarts13 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.myCharts = null;
    this.interval = null;
    this.state = {
      xAxisData: [],
      seriesData: []
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
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        to: now
      }
      let params = {
        params: {
          body: {
            aggs: {
              2: {
                aggs: {
                  3: {
                    aggs: {
                      4: {
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
                      field: "rule.description",
                      order: {
                        _count: "desc"
                      },
                      size: 5
                    }
                  }
                },
                filters: {
                  filters: {
                    'rule.id:100011': {
                      bool: {
                        filter: [
                          {
                            bool: {
                              minimum_should_match: 1,
                              should: [{ match: { 'rule.id': 100011 } }]
                            }
                          }
                        ]
                      }
                    }
                  }
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
      const dataList = ((((((res || {}).rawResponse || {}).aggregations || {})['2'] || {}).buckets || {})['rule.id:100011'] || {})['3'].buckets
      dataList.forEach(item => {
        xAxisData.push(item.key.split(' ')[1])
        seriesData.push({ name: item.key.split(' ')[1], value: item.doc_count })
      })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表13数据查询失败: ' + error,
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
        left: '15px',
        right: '70px',
        bottom: '15px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        name: '非法网络',
        boundaryGap: false,
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
        data: seriesData,
        itemStyle: {
          normal: {
            color: '#1faeea',
            lineStyle: {
              color: '#1faeea',
              width: 2
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                offset: 0,
                color: 'rgba(31, 174, 234, 0.4)'
              }, {
                offset: 0.8,
                color: 'rgba(31, 174, 234, 0.1)'
              }], false),
              shadowColor: 'rgba(0, 0, 0, 0.1)',
            }
          }
        },
      }
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox13');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox13'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox13" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}