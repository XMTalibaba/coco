import React, { Component, Fragment } from 'react';
import { EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';
import { AppState } from '../../../react-services/app-state';
import AwesomeSwiper from 'react-awesome-swiper';
import { WzRequest } from '../../../react-services/wz-request';
export class Echarts22 extends Component {
  constructor(props) {
    super(props);
    this.KibanaServices = getDataPlugin();
    this.timefilter = this.KibanaServices.query.timefilter.timefilter;
    this.clusterFilter = {};
    this.interval = null;
    this.state = {
      alerts: [],
      config: {
        loop: true,
        autoplay: {
          delay: 3000
        },
        lazy: true,
        speed: 500,
        direction: 'vertical',
        height: 220,
        // autoHeight: true,
        slidesPerView: 9,
        spaceBetween: 10,
      },
      swiperRef: React.createRef(),
    }
  }

  async componentDidMount() {
    const { config } = this.state;
    let timer = setInterval(() => {
      let box = document.getElementById('echartsBox22'); // 获取容器
      if (box.clientHeight !== 0) {
        clearInterval(timer)
        config.height = box.clientHeight
        this.setState({ config })
      }
    }, 100)
    const isCluster = (AppState.getClusterInfo() || {}).status === "enabled";
      const clusterFilter = isCluster
        ? { "cluster.name": AppState.getClusterInfo().cluster }
        : { "manager.name": AppState.getClusterInfo().manager };
    this.clusterFilter = clusterFilter;
    await this.getIndexPattern();
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
    const { config } = this.state;
    let box = document.getElementById('echartsBox22'); // 获取容器
    config.height = box.clientHeight
    this.setState({ config })
  };
  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async getIndexPattern () {
    this.indexPattern = {...await this.KibanaServices.indexPatterns.get(AppState.getCurrentPattern())};
    const fields = [];
    Object.keys(this.indexPattern.fields).forEach(item => {
      fields.push(this.indexPattern.fields[item]);
    })
    this.indexPattern.fields = fields;
  }

  async toSearch() {
    if (!this.indexPattern) return;
    let alerts = []
    try {
      // const newFilters = this.buildFilter();
      // const res = await getHttp().post(`/elastic/alerts`, { body: JSON.stringify(newFilters)});
      const res = await WzRequest.apiReq('GET',`/manager/eventlog_analyze?name=sericuty_events`, {});
		alerts = (
        ((res || {}).data || {}).data || {}
      ).affected_items[0];
  
			// let params =(
      //   ((res || {}).data || {}).data || {}
      // ).affected_items[0];
      // alerts = ((res || {}).hits || {}).hits.map(alert => {
      //   return {
      //     ip: alert._source.agent.ip,
      //     description: alert._source.rule.description,
      //     timestamp: alert._source.timestamp
      //   }
      // });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表5数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ alerts })
  }


  render() {
    const { alerts, config, swiperRef } = this.state
    return (
      <div style={{ width: '100%', height: '100%' }}>
        <div style={{ display: 'flex', height: '20px', lineHeight: '20px', backgroundColor: '#224B77', marginBottom: '10px' }}>
          <p style={{ flex: '1', paddingLeft: '8px' }}>IP地址</p>
          <p style={{ flex: '1', paddingLeft: '8px' }}>登录账号</p>
          <p style={{ flex: '1', paddingLeft: '8px' }}>结果</p>
          <p style={{ flex: '1', paddingLeft: '8px' }}>时间</p>
        </div>
        <div style={{ height: 'calc(100% - 40px)', overflow: 'hidden', padding: '0 8px' }} id="echartsBox22">
          <AwesomeSwiper ref={swiperRef} config={config}>
            <div className="swiper-wrapper">
              {alerts.map((item, index) => (
                <div className="swiper-slide" key={`echartsBox22_${index}`}>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={2} style={{ width: 300 }}><p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.ip}</p></EuiFlexItem>
                    <EuiFlexItem grow={1} style={{ width: 150 }}><p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{item.user}</p></EuiFlexItem>
                    <EuiFlexItem grow={1} style={{ width: 150}}><p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={item.result}>{item.result}</p></EuiFlexItem>
                    <EuiFlexItem grow={1} style={{ width: 150 }}><p style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{formatUIDate(item.timestamp)}</p></EuiFlexItem>
                  </EuiFlexGroup>
                </div>
              ))}
            </div>
          </AwesomeSwiper>
        </div>
      </div>
    )
  }
}