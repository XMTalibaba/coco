import React, { Component } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPanel,
	EuiText,
  EuiProgress,
  EuiSpacer,
  EuiSelect,
} from '@elastic/eui';
import { getToasts } from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import StatusHandler from '../../management/components/management/status/utils/status-handler';
import WzStatusOverview from '../../management/components/management/status/status-overview';

export class RunningStatus extends Component {
  _isMount = false;
  constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      isLoading: false,
      paramsOptions: [
        {
          title: 'CPU占用率',
          type: 'cpu'
        },
        {
          title: '硬盘占用率',
          type: 'disk'
        },
        {
          title: '内存占用率',
          type: 'mem'
        }
      ],
			formParams: {
        cpu: 0,
        disk: 0,
        mem: 0
      },
      clusterData: {},
      isCluster: false,
      nodeList: [],
      selectedNode: '',
    };
    this.statusHandler = StatusHandler;
    this.interval = null;
	}

  async componentDidMount() {
    this._isMount = true;

    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    let nodeList = [];
    let selectedNode = '';
    if (isCluster) {
      const nodeListTmp = await WzRequest.apiReq(
        'GET',
        '/cluster/nodes',
        {}
      );
      if (
        Array.isArray((((nodeListTmp || {}).data || {}).data || {}).affected_items)
      ) {
        nodeList = nodeListTmp.data.data.affected_items.map(clusterNode => ({
          value: clusterNode.name,
          text: `${clusterNode.name} (${clusterNode.type})`
        }))
        selectedNode = nodeList[0].value;
      }
    }
    this.setState({
      clusterData,
      isCluster,
      nodeList,
      selectedNode
    });
    this.interval = setInterval(() => this.getStatus(), 10000);
    await this.getStatus();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  async getStatus() {
    try {
      this._isMount && this.setState({ isLoading: true });
		  const { isCluster, selectedNode } = this.state;
      const rawRules = await WzRequest.apiReq('GET', `${isCluster ? '/cluster/hardwareusedinfo?pretty=true&&nodes_list=' + selectedNode : '/manager/hardwareusedinfo?pretty=true'}`, {});
      const { affected_items } = ((rawRules || {}).data || {}).data;
      let formParams = {
        cpu: parseFloat(affected_items[0].node_api_config.cpu),
        disk: parseFloat(affected_items[0].node_api_config.disk),
        mem: parseFloat(affected_items[0].node_api_config.mem),
      }

      this._isMount &&
        this.setState({
          formParams,
          isLoading: false
        });
    } catch (error) {
      this.setState({ isLoading: false });
      this.showToast(
        'danger',
        '警告',
        '系统资源使用情况获取失败: ' + error,
        3000
      );
    }
  }

  onNodeChange = e => {
    const { isLoading, selectedNode } = this.state;
    if (isLoading) {
      this.setState(
        {
          selectedNode
        }
      );
      return;
    }
    this.setState(
      {
        selectedNode: e.target.value
      },
      this.getStatus
    );
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  objToArr(obj) {
    const arr = [];
    for (const key in obj) arr.push({ key, value: obj[key] });
    return arr;
  }

  calcColor(value) { // "primary蓝色","secondary绿色","danger红色","subdued棕色","accent粉色"
    if (value <= 60) {
      return 'secondary'
    }
    else if (value <= 80) {
      return 'primary'
    }
    else {
      return 'danger'
    }
  }

  render() {
    const { paramsOptions, formParams, isLoading, isCluster, nodeList, selectedNode } = this.state;
    return (
      <EuiPage>
        <EuiFlexGroup direction="column">
          <EuiFlexItem grow={false}>
            <EuiPanel>
              <EuiFlexGroup justifyContent="flexStart">
                <EuiFlexItem>
                  <EuiFlexGroup alignItems="center">
                    <EuiFlexItem grow={false}>
                      <EuiTitle size="s">
                        <h3>系统资源使用情况</h3>
                      </EuiTitle>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiTextColor color="subdued">查看系统资源使用情况</EuiTextColor>
                    </EuiFlexItem>
                  </EuiFlexGroup>
                </EuiFlexItem>
                { isCluster && (
                  <EuiFlexItem grow={false}>
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem grow={false}>
                        <EuiText textAlign="right">{'node节点'}:</EuiText>
                      </EuiFlexItem>
                      <EuiFlexItem grow={false} style={{ width: 150 }}>
                        <EuiSelect
                          options={nodeList}
                          value={selectedNode}
                          onChange={this.onNodeChange}
                          aria-label="按node节点过滤"
                        />
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                )}
              </EuiFlexGroup>
              <div style={ isLoading ? { padding: '5px 0'} : { padding: '6px 0' }}>
                { isLoading && (
                <EuiProgress size="xs" color="primary" />
                )}
              </div>
              
              {Object.keys(paramsOptions).map((mdx) => (
                <div key={mdx}>
                  <EuiFlexGroup alignItems="center" key={mdx}>
                    <EuiFlexItem grow={false} style={{ width: 80 }}>
                      <EuiText textAlign="right">{paramsOptions[mdx].title}</EuiText>
                    </EuiFlexItem>
                    <EuiFlexItem>
                      <EuiProgress value={formParams[paramsOptions[mdx].type]} max={100} size="m" color={this.calcColor(formParams[paramsOptions[mdx].type])} style={{ borderRadius: '4px' }} />
                    </EuiFlexItem>
                    <EuiFlexItem grow={false}>
                      {formParams[paramsOptions[mdx].type]}%
                    </EuiFlexItem>
                  </EuiFlexGroup>
                  <EuiSpacer size="s"></EuiSpacer>
                </div>
              ))}
            </EuiPanel>
          </EuiFlexItem>
          <EuiFlexItem>
            <WzStatusOverview />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiPage>
    )
  }
}