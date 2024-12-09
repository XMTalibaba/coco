import React, { Component, Fragment } from 'react';
import { getDataPlugin, getToasts, getHttp }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class Echarts9 extends Component {
  constructor(props) {
    super(props);
    this.interval = null;
    this.state = {
      formParams: {},
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
    let formParams = {}, options = [
      { value: 'total_active_count', text: '已连接' },
      { value: 'total_disconnected_count', text: '未连接' },
      { value: 'agent_count', text: '设备主机' }
    ], total = 0,other=0
    try {

     
      const res = await WzRequest.apiReq('GET',`/manager/eventlog_analyze?name=host_counts`, {});
      const rawAgents = (
        ((res || {}).data || {}).data || {}
      ).affected_items[0];

            for (let i = 0; i < 3; i ++) {
        const k = options[i]
        formParams[k.value] = rawAgents[k.value]
  
    }

      total += rawAgents.total_count
      other=total-rawAgents.agent_count
    formParams['total'] = total
    formParams['other'] = other
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '图表9数据查询失败: ' + error,
        3000
      );
    }
    this.setState({ formParams })
  }

  render() {
    const { formParams } = this.state;
    return (
      <div>
        <div className="echartsCenterSphere">
          <div className="echartsCenterSum">
            <p className="echartsCenterSpan">检测主机总量</p>
            <p className="echartsCenterP">{formParams.total}</p>
          </div>
        </div>
        <div className="echartsCenterCicle3" />
        <div className="echartsCenterCicle4" />
        <div className="echartsCenterCicle5" />
        <div className="echartsCenterCicle6" />
        <div className="echartsCenterCicle7" />
        <div className="echartsCenterCicle" style={{ animation: 'rotate5 20s linear infinite', background: `url(${getHttp().basePath.prepend('/plugins/wazuh/assets/large/circle2.png')}) no-repeat center`, color: '#0ac1c7' }}>
          <p className="echartsCenterCicleP">已连接</p>
          <p className="echartsCenterCicleSpan">{formParams.total_active_count}</p>
        </div>
        <div className="echartsCenterCicle" style={{ animation: 'rotate6 20s linear infinite' }} >
          <p className="echartsCenterCicleP">未连接</p>
          <p className="echartsCenterCicleSpan">{formParams.total_disconnected_count}</p>
        </div>
        <div className="echartsCenterCicle" style={{ animation: 'rotate7 20s linear infinite' }}>
          <p className="echartsCenterCicleP">外部主机</p>
          <p className="echartsCenterCicleSpan">{formParams.agent_count}</p>
        </div>
        <div className="echartsCenterCicle" style={{ animation: 'rotate8 20s linear infinite' }}>
          <p className="echartsCenterCicleP">设备主机</p>
          <p className="echartsCenterCicleSpan">{formParams.other}</p>
        </div>
      </div>
    )
  }
}