import React, { Component } from 'react';
import {
  EuiFlexItem,
  EuiFlexGroup,
  EuiPanel,
  EuiTitle,
  EuiSpacer,
  EuiBasicTable,
  EuiTextColor,
  EuiButtonEmpty,
  EuiAccordion,
  EuiInMemoryTable,
} from '@elastic/eui';
import { WzRequest } from '../../../react-services/wz-request';
import { getToasts }  from '../../../kibana-services';
import { formatUIDate } from '../../../react-services/time-service';

export class ThreatBackChart extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.offset = 250;
    this.myChart = null;

    this.state = {
      alertsList: []
    }

    this.nameEquivalences = {
      "agent.id": "代理",
      "agent.name": "代理名称",
      "agent.ip": "代理IP",
      "rule.id": "规则ID",
      "rule.description": "描述",
      "rule.level": "等级",
      "rule.mitre.id": "技术",
      "rule.mitre.tactic": "策略",
      "rule.pci_dss": "PCI DSS",
      "rule.gdpr": "GDPR",
      "rule.nist_800_53": "NIST 800-53",
      "rule.tsc": "TSC",
      "rule.hipaa": "HIPAA",
      "data.connection.id": "网络名称",
      "data.connection.uuid": "网络UUID",
      "data.connection.type": "网络类型",
      "data.connection.mac": "MAC地址",
      "syscheck.path": "文件路径",
      "syscheck.event": "文件行为6",
      'data.audit.command': '命令',
      'data.srcip': '源IP',
      'data.srcuser': '用户',
      'data.uid': '用户ID',
      'data.gid': '用户组ID',
      'data.dstuser': '文件路径'
    }
  }

  async componentDidMount() {
    this.height = window.innerHeight - this.offset;
    window.addEventListener('resize', this.updateHeight);
    this.toSearch();
  }

  componentWillUnmount() {
    this._isMount = false;
    window.removeEventListener('resize', this.updateHeight);
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
    this.myChart && this.myChart.resize();
  };

  async toSearch() {
    try {
      const { threatBackSelectAlert } = this.props;
      const paramsKey = ['srcip', 'dstip', 'srcuser', 'dstuser'];
      let url = `/alerts/analysis/${threatBackSelectAlert._source.agent.id}?pretty=true&time=${threatBackSelectAlert._source['@timestamp']}&tactic=${threatBackSelectAlert.phaseSelect}`;
      paramsKey.forEach(k => {
        if (threatBackSelectAlert._source.data && threatBackSelectAlert._source.data[k]) {
          url += `&${k}=${threatBackSelectAlert._source.data[k]}`
        }
      })
      const rawItems = await WzRequest.apiReq('GET', url, {});
			const rawObject = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items;

      let tabText = {
        0: '初始访问',
        1: '执行',
        2: '持久化',
        3: '权限提升',
        4: '防御绕过',
        5: '凭证获取',
        6: '发现/侦察',
        7: '横向移动',
        8: '信息收集',
        9: '命令与控制',
        10: '数据泄漏',
        11: '影响'
      }
      let alertsList = [];
      Object.keys(rawObject).forEach(k => {
        let item = {
          tab: tabText[k],
          alerts: rawObject[k].map(alert => {
            return {
              ...alert._source,
              _id: alert._id,
              actions: alert
            }
          })
        }
        alertsList.push(item)
      })

      this.setState({ alertsList });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '威胁溯源查询失败: ' + error,
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

  columns = () => {
    let columnsList = ['timestamp', 'rule.description', 'rule.level'];
    const columns = columnsList.map((item) => {
      if (item === "timestamp") {
        return {
          field: 'timestamp',
          name: '时间',
          sortable: true,
          render: time => {
            return <span>{formatUIDate(time)}</span>
          },
        }
      }

      let width = false;
      if(item === 'agent.id' || item === 'agent.name') {
        width = '100';
      }
      else if (item === 'rule.level') {
        width = '200';
      }

      let column = {
        field: item,
        name: this.nameEquivalences[item] || item
      }

      if (width) {
        column.width = width;
      }

      return column
    });
    return columns;
  }

  tableRender(alerts) {
    const columns = this.columns();
    const pagination =
      alerts.length > 10
        ? {
          pageSizeOptions: [10, 15]
        }
        : false;
    return (
      <EuiInMemoryTable
        items={alerts}
        columns={columns}
        {...(pagination && { pagination })}
      />
    );
  }

  render() {
    const { alertsList } = this.state;
    return (
      <EuiPanel>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="s">
              <h3>{'威胁溯源'}</h3>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiTextColor color="subdued">{'按攻击阶段溯源'}</EuiTextColor>
          </EuiFlexItem>
          <EuiFlexItem />
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.changeThreatBackSelectAlert(false)}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <div style={{ height: this.height, overflow: 'auto' }}>
          <div>
          {Object.keys(alertsList).map((idx) => (
            <>
              <EuiSpacer />
              <EuiAccordion
                key={idx}
                id={`tab-${idx}`}
                buttonContent={alertsList[idx].tab}
                paddingSize="l"
              >
                {this.tableRender(alertsList[idx].alerts)}
              </EuiAccordion>
            </>
          ))}
          </div>
        </div>
      </EuiPanel>
    )
  }
}