import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
  EuiSpacer,
  EuiTitle,
  EuiFlexGrid,
} from '@elastic/eui';
import { getToasts }  from '../../../../kibana-services';
import { formatUIDate } from '../../../../react-services/time-service';
import { GenericRequest } from '../../../../react-services/generic-request';
import WzTextWithTooltipIfTruncated from '../../../../components/common/wz-text-with-tooltip-if-truncated';
import { WzStat } from '../../../../components/wz-stat';
import { GroupTruncate } from '../../../../components/common/util/agent-group-truncate';

export class Base extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
		this.state = {
      baseInfo: {}
    }
  }

  async componentDidMount() {
    this._isMount = true;
    if (this.props.selectView === 'base') this.getConfig();
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (this.props.selectAgent.id && this.props.selectView === 'base' && Object.keys(this.props.agentData).length > 0
    && (prevProps.selectAgent.id !== this.props.selectAgent.id || prevProps.selectView !== this.props.selectView)) {
      this.getConfig();
    }
  }

  async getConfig() {
    try {
      const { selectAgent } = this.props;
      const rawItems = await GenericRequest.request('GET', `/api/syscollector/${selectAgent.id}`, {});
      const baseInfo = (rawItems || {}).data || {};

      this.setState({
        baseInfo
      })

    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '查询失败: ' + error,
        3000
      );
    }
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  getPlatformIcon(agent) {
    let icon = false;
    const os = (agent || {}).os;

    if (((os || {}).uname || '').includes('Linux')) {
      icon = 'linux';
    } else if ((os || {}).platform === 'windows') {
      icon = 'windows';
    } else if ((os || {}).platform === 'darwin') {
      icon = 'apple';
    }

    return <i
      className={`fa fa-${icon} AgentsTable__soBadge AgentsTable__soBadge--${icon}`}
      aria-hidden="true"
    ></i>
  }

  addTextPlatformRender(agent) {
    const checkField = field => {
      return field !== undefined ? field : '-';
    };

    const os_name =
      checkField(((agent || {}).os || {}).name) +
      ' ' +
      checkField(((agent || {}).os || {}).version);

    const osName = os_name === '- -' ? '-' : os_name;

    return (
      <WzTextWithTooltipIfTruncated position='bottom' elementStyle={{ maxWidth: "250px", fontSize: 12 }}>
        {this.getPlatformIcon(this.props.selectAgent)}
        {' '}{osName}
      </WzTextWithTooltipIfTruncated>
    )
  }

  addHealthRender(agent) {
    // this was rendered with a EuiHealth, but EuiHealth has a div wrapper, and this section is rendered  within a <p> tag. <div> tags aren't allowed within <p> tags.
    const statusText = {
      never_connected: '从未连接',
      disconnected: '未连接',
      active: '已连接',
      pending: '挂起'
    }
    return (
      <span className="euiFlexGroup euiFlexGroup--gutterExtraSmall euiFlexGroup--alignItemsCenter euiFlexGroup--directionRow" style={{ fontSize: '12px' }}>
        <span className="euiFlexItem euiFlexItem--flexGrowZero">
          <svg width="16" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" className={`euiIcon euiIcon--medium euiIcon--${this.color(agent.status)}`} focusable="false" role="img" aria-hidden="true">
            <circle cx="8" cy="8" r="4"></circle>
          </svg>
        </span>
        <span className="euiFlexItem euiFlexItem--flexGrowZero">{statusText[agent.status] ? statusText[agent.status] : agent.status}</span>
      </span>
    )
  }

  color = (status, hex = false) => {
    if (status.toLowerCase() === 'active') { return hex ? '#017D73' : 'success'; }
    else if (status.toLowerCase() === 'disconnected') { return hex ? '#BD271E' : 'danger'; }
    else if (status.toLowerCase() === 'never connected') { return hex ? '#98A2B3' : 'subdued'; }
  }

  buildValue(value) {
    const valueOptions = {
      'high': '高',
      'normal': '中',
      'low': '低'
    }
    return valueOptions[value] ? valueOptions[value] : value
  }

  buildStats(items) {
    const checkField = field => {
      return field !== undefined || field ? field : '-';
    };
    const stats = items.map(item => {
      return (
        <EuiFlexItem key={item.description} style={item.style || null}>
          <WzStat
            title={
              item.description === '操作系统' ? (
                this.addTextPlatformRender(this.props.selectAgent)
              ) : item.description === '代理状态' ? (
                this.addHealthRender(this.props.selectAgent)
              ) : (
                <WzTextWithTooltipIfTruncated position='bottom' elementStyle={{ maxWidth: "250px", fontSize: 12 }}>
                  {checkField(item.title)}
                </WzTextWithTooltipIfTruncated>
              )
            }
            description={item.description}
            titleSize="xs"
          />
        </EuiFlexItem>
      );
    });
    return stats;
  }

  render() {
    const { baseInfo } = this.state;
    const { agentData } = this.props;
    let allStats = []
    let baseStats = []
    let hardwareStats = []
    let realtimeStats = []
    if (Object.keys(baseInfo).length > 0 && Object.keys(baseInfo.hardware).length > 0) {
      allStats = [
        { 
          title: agentData.id, 
          description: 'ID', 
        },
        { 
          title: agentData.ip, 
          description: 'IP', 
        },
        { 
          title: agentData.status, 
          description: '代理状态', 
        },
        { 
          title: !agentData.netbor ? '-' : agentData.netbor === 'netbreak' ? '断网' : '连接',
          description: '网络状态'
        },
        { title: agentData.group !== '-' ? agentData.group.join('，') : '-', description: '组' },
        { title: agentData.os_name, description: '操作系统' },
        {
          title: agentData.node_name && agentData.node_name !== 'unknown' ? agentData.node_name : '-',
          description: '集群节点'
        },
        { title: agentData.tag, description: '标签' },
        { title: this.buildValue(agentData.agent_value), description: '价值标定' },
        { title: agentData.cpu, description: 'CPU占比' },
        { title: agentData.mem, description: '内存占比' },
        { title: agentData.disk, description: '硬盘占比' },
        { title: agentData.net, description: '实时网速' },
        { title: baseInfo.hardware.cpu.name, description: 'CPU' },
        { title: (baseInfo.hardware.ram.total / 1024).toFixed(2), description: '内存' },
        { title: baseInfo.hardware.cpu.cores, description: '核数' },
        { title: baseInfo.os.architecture, description: '架构' },
        {
          title: formatUIDate(agentData.dateAdd),
          description: '注册日期',
        },
        {
          title: formatUIDate(agentData.lastKeepAlive),
          description: '上次连接',
        },
        { title: baseInfo.os && baseInfo.os.scan ? formatUIDate(baseInfo.os.scan.time) : '', description: '最近扫描时间' },
        { title: agentData.connect_net_balel, description: '外联状态' },
      ]

      baseStats = [
        { 
          title: agentData.id, 
          description: 'ID', 
        },
        { 
          title: agentData.ip, 
          description: 'IP', 
        },
        { 
          title: agentData.status, 
          description: '代理状态', 
        },
        { 
          title: !agentData.netbor ? '-' : agentData.netbor === 'netbreak' ? '断网' : '连接',
          description: '网络状态'
        },
        { title: agentData.group !== '-' ? agentData.group.join('，') : '-', description: '组' },
        {
          title: agentData.node_name && agentData.node_name !== 'unknown' ? agentData.node_name : '-',
          description: '集群节点'
        },
        { title: agentData.tag, description: '标签' },
        { title: this.buildValue(agentData.agent_value), description: '价值标定' },
        {
          title: formatUIDate(agentData.dateAdd),
          description: '注册日期',
        },
        {
          title: formatUIDate(agentData.lastKeepAlive),
          description: '上次连接',
        },
        { title: baseInfo.os && baseInfo.os.scan ? formatUIDate(baseInfo.os.scan.time) : '', description: '最近扫描时间' },
        { title: agentData.connect_net_balel, description: '外联状态' },
      ]
  
      hardwareStats = [
        { title: agentData.os_name, description: '操作系统' },
        { title: baseInfo.hardware.cpu.name, description: 'CPU' },
        { title: (baseInfo.hardware.ram.total / 1024).toFixed(2) + 'MB', description: '内存' },
        { title: baseInfo.hardware.cpu.cores, description: '核数' },
        { title: baseInfo.os.architecture, description: '架构' },
      ]
  
      realtimeStats = [
        { title: agentData.cpu, description: 'CPU占比' },
        { title: agentData.mem, description: '内存占比' },
        { title: agentData.disk, description: '硬盘占比' },
        { title: agentData.net, description: '实时网速' },
      ]
    }
    const statsBase = this.buildStats(baseStats);
    const statsHardware = this.buildStats(hardwareStats);
    const statsRealtime = this.buildStats(realtimeStats);
    return (
      <div>
        <EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`基本信息`}</h4>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGrid columns={4}>
          {statsBase}
        </EuiFlexGrid>
        <EuiSpacer size="xl" />
				<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
				<EuiSpacer size="xl" />
        <EuiFlexGrid columns={4}>
          {statsHardware}
        </EuiFlexGrid>
        <EuiSpacer size="xl" />
				<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
				<EuiSpacer size="xl" />
        <EuiFlexGrid columns={4}>
          {statsRealtime}
        </EuiFlexGrid>
      </div>
    )
  }
}