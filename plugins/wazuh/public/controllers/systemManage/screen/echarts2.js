import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import * as echarts from 'echarts';

export class Echarts2 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.myCharts = null;
    this.interval = null;
    this.state = {
      seriesData1: [],
      seriesData2: [],
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
    let xAxisData = [], seriesData1 = [], seriesData2 = []
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
      dataList.forEach(bucket => {
        seriesData1.push({
          name: bucket.key.split(' ')[1],
          value: bucket.doc_count - bucket['4'].sum_other_doc_count,
        })
        xAxisData.push(bucket.key.split(' ')[1])
        bucket['4'].buckets.forEach(k => {
          seriesData2.push({
            name: k.key,
            value: k.doc_count,
          })
        })
      })
      dataList.forEach(bucket => {
        bucket['4'].buckets.forEach(k => {
          if (xAxisData.indexOf(k.key)) xAxisData.push(k.key)
        })
      })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表2数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ xAxisData, seriesData1, seriesData2 }, this.buildChart)
  }

  buildChart() {
    const { xAxisData, seriesData1, seriesData2 } = this.state;
    let option = {
      tooltip: {},
      legend: {
        type: 'scroll',
        pageIconColor: '#d7d7d7',
        pageTextStyle: {
          color: '#d7d7d7'
        },
        textStyle: {
          color: '#d7d7d7'
        },
        data: xAxisData
      },
      grid: {
        left: '15px',
        right: '15px',
        bottom: '15px',
        containLabel: true
      },
      series: [
        {
          name: '非法网络分布',
          type: 'pie',
          data: seriesData1,
          radius: [0, '30%'],
          label: {
            show: false
          },
          emphasis: {
            label: {
              show: true,
              color: '#d7d7d7'
            }
          },
        },
        {
          name: '主机告警分布',
          type: 'pie',
          data: seriesData2,
          radius: ['40%', '60%'],
          minShowLabelAngle: 10,
          label: {
            color: '#d7d7d7'
          }
        }
      ]
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox2');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) tthis.myCharts = echarts.init(document.getElementById('echartsBox2'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox2" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}