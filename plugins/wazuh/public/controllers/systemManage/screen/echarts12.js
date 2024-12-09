import React, { Component, Fragment } from 'react';
import { getToasts, getHttp }  from '../../../kibana-services';
import { tagcloud } from './Bubble.js'

export class Echarts12 extends Component {
  constructor(props) {
    super(props);
    this.interval = null;
    this.state = {
      seriesData: [],
    }
  }
  async componentDidMount() {
    this.toSearch();
    this.interval = setInterval(() => this.toSearch(), 60 * 1000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async toSearch() {
    let seriesData = []
    try {
      const colors = ['#73C0DE', '#3BA272', '#FC8452', '#9A60B3', '#FAC858']
      const now = new Date()
      const dataRange = {
        from: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        to: now
      }
      let params = {
        params: {
          body: {
            aggs: {
              3: {
                terms: {
                  field: "data.account.user_name",
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
      const dataList = ((((res || {}).rawResponse || {}).aggregations || {})['3'] || {}).buckets
      const minValue = dataList.length > 0 ? dataList[dataList.length - 1].doc_count : 0
      dataList.forEach((bucket, i) => {
        seriesData.push({
          name: bucket.key,
          value: bucket.doc_count,
          color: colors[i % 5],
          size: 50 + (bucket.doc_count / minValue * 20)
        })
      })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表12数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ seriesData }, this.buildChart)
  }

  buildChart() {
    /*3D标签云*/
    tagcloud({
      selector: ".tagcloud",  //元素选择器
      fontsize: 6,       //基本字体大小, 单位px
      radius: 40,         //滚动半径, 单位px 页面宽度和高度的五分之一
      mspeed: "slow",   //滚动最大速度, 取值: slow, normal(默认), fast
      ispeed: "slow",   //滚动初速度, 取值: slow, normal(默认), fast
      direction: 0,     //初始滚动方向, 取值角度(顺时针360): 0对应top, 90对应left, 135对应right-bottom(默认)...
      keep: false          //鼠标移出组件后是否继续随鼠标滚动, 取值: false, true(默认) 对应 减速至初速度滚动, 随鼠标滚动
    });
  }

  render() {
    const { seriesData } = this.state;
    return (
      <div className='tagcloud'>
        {seriesData.map((k, i) => (
          <p key={`tagcloud_${i}`} title={`数量：${k.value}`} style={{ border: `2px solid ${k.color}`, boxShadow: `inset 0 0 20px ${k.color}`, width: `${k.size}px`, height: `${k.size}px`}}>{k.name}</p>
        ))}
      </div>
    )
  }
}