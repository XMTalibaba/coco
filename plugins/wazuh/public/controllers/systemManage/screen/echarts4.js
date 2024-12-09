import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';
import * as echarts from 'echarts';

export class Echarts4 extends Component {
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
    let xAxisData = [], seriesData = [], totalData = []
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
                      field: "agent.name",
                      order: {
                        _count: "desc"
                      },
                      size: 5
                    }
                  }
                },
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
        let total = 0
        item['3'].buckets.forEach(k => {
          let serieIndex = seriesData.findIndex(s => s.name === k.key)
          if (serieIndex === -1) {
            let serie = { name: k.key, data: [] }
            seriesData.push(serie)
          }
          total += k.doc_count
        })
        totalData.push({ name: formatUIDate(item.key_as_string), value: total })
      })
      dataList.forEach(item => {
        seriesData.forEach(s => {
          let bucket = item['3'].buckets.find(b => b.key === s.name)
          if (bucket) {
            s.data.push({ name: formatUIDate(item.key_as_string), value: bucket.doc_count })
          }
          else {
            s.data.push({ name: formatUIDate(item.key_as_string), value: 0 })
          }
        })
      })
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
    let series = seriesData.map(k => ({
      name: k.name,
      type: 'bar',
      stack: 'total',
      emphasis: {
        focus: 'series'
      },
      data: k.data
    }))
    series.push({
      name: '总数',
      type: 'line',
      label: {
        show: true
      },
      data: totalData
    })
    let option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
      },
      legend: {
        type: 'scroll',
        pageIconColor: '#d7d7d7',
        pageTextStyle: {
          color: '#d7d7d7'
        },
        textStyle: {
          color: '#d7d7d7'
        }
      },
      grid: {
        left: '15px',
        right: '15px',
        bottom: '15px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: '#d7d7d7'
          }
        },
        data: xAxisData
      },
      yAxis: {
        type: 'value',
        name: '数量',
        axisLine: {
          lineStyle: {
            color: '#d7d7d7'
          }
        },
      },
      series
    }

    let timer = setInterval(() => {
      let chartDom = document.getElementById('echartsBox4');
      if (chartDom) {
        clearInterval(timer);
        if (!this.myCharts) this.myCharts = echarts.init(document.getElementById('echartsBox4'));
        this.myCharts.setOption(option);
      }
    }, 200);
  }

  render() {
    return (
      <div id="echartsBox4" style={{ height: '100%', width: '100%' }}></div>
    )
  }
}