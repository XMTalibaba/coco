import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiPanel,
	EuiButton,
  EuiToolTip,
  EuiButtonIcon,
  EuiTabs,
  EuiTab,
  EuiOverlayMask,
  EuiConfirmModal,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import { Base } from './agentDetails/base';
import { Netiface } from './agentDetails/netiface';
import { Port } from './agentDetails/port';
import { Netaddr } from './agentDetails/netaddr';
import { Packages } from './agentDetails/packages';
import { Processes } from './agentDetails/processes';
import { WeakPassword } from './agentDetails/weak-password';
import { TaskCollect } from './agentDetails/task-collect';
import { DeviceInfo } from './agentDetails/device-info';
import { Autostart } from './agentDetails/autostart';
import { WebServices } from './agentDetails/web-services';
import { MirrorContain } from './agentDetails/mirror-contain';
import '../../hostProtection/blackWhiteList/blackWhiteList.scss';

export class AgentDetails extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.offset = 200;
		this.state = {
      tabs: [
        { id: 'base', name: '基本信息' },
        { id: 'netiface', name: '网络接口' },
        { id: 'port', name: '端口' },
        { id: 'netaddr', name: '网络设置' },
        { id: 'packages', name: '程序包' },
        { id: 'processes', name: '进程' },
        { id: 'weakPassword', name: '弱口令' },
        { id: 'taskCollect', name: '任务采集' },
        { id: 'deviceInfo', name: '外设信息' },
        { id: 'autostart', name: '开机启动项' },
        { id: 'webServices', name: 'Web服务' },
        { id: 'mirrorContain', name: '容器' },
      ],
      selectView: '',
      agentData: {},
      isBrokenNetworkModalVisible: false,
      isConnnectNetworkModalVisible: false,
      isCluster: false
    }
  }

  async componentDidMount() {
		this.height = window.innerHeight - this.offset;
		this.forceUpdate();
    window.addEventListener('resize', this.updateHeight);

    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({
      isCluster
    });
	}

	componentWillUnmount() {
    window.removeEventListener('resize', this.updateHeight);
  }

  async componentDidUpdate(prevProps, prevState) {
    if (Object.keys(this.props.selectAgent).length > 0  && !this.state.selectView) {
      await this.getAgentData();
    }
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

  async getAgentData() {
    try {
      const { isCluster } = this.state;
      const { selectAgent } = this.props;
      const url = {
        isCluster: `/cluster/${selectAgent.node_name}/agents/${selectAgent.id}/usage?pretty=true`,
        noCluster: `/agents/${selectAgent.id}/usage?pretty=true`
      }
      const rawItems = await WzRequest.apiReq('GET', `${isCluster ? url.isCluster : url.noCluster}`, {});
      const data = ((rawItems || {}).data || {}).data;
      const agentData = {
        ...selectAgent,
        cpu: data.cpu,
        disk: data.disk,
        mem: data.mem,
        net: data.net,
        netbor: data.netbor,
      }
      this.setState({
        agentData,
        selectView: 'base'
      });
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '查询失败: ' + error,
        3000
      );
    }
  }
  setBrokenNetworkModal(flag) {
    this.setState({isBrokenNetworkModalVisible: flag});
  }

  setConnnectNetworkModal(flag) {
    this.setState({isConnnectNetworkModalVisible: flag});
  }

  renderActionsButtons() {
    const { agentData } = this.state;
    return (
      <EuiFlexItem grow={false}>
        { agentData.netbor && agentData.netbor === 'netrelease' && (
          <EuiButton
            size="s"
            onClick={() => this.setBrokenNetworkModal(true)}
          >
            一键断网
          </EuiButton>
        )}
        { agentData.netbor && agentData.netbor === 'netbreak' && (
          <EuiButton
            size="s"
            onClick={() => this.setConnnectNetworkModal(true)}
          >
            恢复网络连接
          </EuiButton>
        )}
      </EuiFlexItem>
    )
  }

  renderTabs() {
		const { selectView } = this.state;
		return (
			<EuiTabs className="columnTabs" >
				{this.state.tabs.map((tab, index) => {
					return <EuiTab
						onClick={() => this.onSelectedTabChanged(tab.id)}
						isSelected={selectView === tab.id}
						key={index}
					>
						{tab.name}
					</EuiTab>
				}
				)}
			</EuiTabs>
    );
	}

  onSelectedTabChanged(id) {
    if (id !== this.state.selectView) {
			this.setState({ selectView: id });
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

  async toBrokenNetwork() {
    try {
      const { selectAgent } = this.props;
      let params = {
        command: 'netbreak.sh',
        custom: true
      }
      const rawItems = await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${selectAgent.id}`, params);
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        // this.getAgentData();
        this.showToast(
          'success',
          '成功',
          '一键断网成功，网络状态延时更新',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '一键断网失败: ' + error,
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '一键断网失败: ' + error,
        3000
      );
    }
    this.setBrokenNetworkModal(false)
  }

  async toConnnectNetwork() {
    try {
      const { selectAgent } = this.props;
      let params = {
        command: 'netrelease.sh',
        custom: true
      }
      const rawItems = await WzRequest.apiReq('PUT', `/active-response?pretty=true&agents_list=${selectAgent.id}`, params);
      const { total_affected_items } = ((rawItems || {}).data || {}).data;
      if (total_affected_items === 1) {
        // this.getAgentData();
        this.showToast(
          'success',
          '成功',
          '恢复连接成功，网络状态延时更新',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '恢复连接失败: ' + error,
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '恢复连接失败: ' + error,
        3000
      );
    }
    this.setConnnectNetworkModal(false)
  }

  render() {
		const { selectView, agentData, isBrokenNetworkModalVisible, isConnnectNetworkModalVisible } = this.state;
    const { selectAgent } = this.props;
		const tabs = this.renderTabs();
		const actionsButtons = this.renderActionsButtons();
    let brokenNetworkModal, connnectNetworkModal;
    if (isBrokenNetworkModalVisible) {
      brokenNetworkModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认将该代理一键断网吗？"
            onCancel={() => this.setBrokenNetworkModal(false)}
            onConfirm={() => this.toBrokenNetwork()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }

    if (isConnnectNetworkModalVisible) {
      connnectNetworkModal = (
        <EuiOverlayMask>
          <EuiConfirmModal
            title="确认将该代理恢复连接吗？"
            onCancel={() => this.setConnnectNetworkModal(false)}
            onConfirm={() => this.toConnnectNetwork()}
            cancelButtonText="取消"
            confirmButtonText="确认"
            buttonColor="danger"
            defaultFocusedButton="confirm"
          >
          </EuiConfirmModal>
        </EuiOverlayMask>
      );
    }
		return (
			<EuiPage>
        <EuiPanel>
          <div style={{ paddingBottom: '16px', borderBottom: '1px solid rgb(211, 218, 230)'}}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false} style={{ marginRight: 0 }}>
                    <EuiToolTip position="right" content={`返回主机管理`}>
                      <EuiButtonIcon
                        aria-label="Back"
                        style={{ paddingTop: 8 }}
                        color="primary"
                        iconSize="l"
                        iconType="arrowLeft"
                        onClick={() => {
                          this.setState({ selectView: '' });
                          this.props.goBack();
                        }}
                      />
                    </EuiToolTip>
                  </EuiFlexItem>
                  <EuiFlexItem grow={false}>
                    <EuiTitle>
                      <h1>{selectAgent.name}</h1>
                    </EuiTitle>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
              {actionsButtons}
            </EuiFlexGroup>
          </div>
          <EuiFlexGroup style={{ height: this.height }}>
            <EuiFlexItem grow={false} style={{ borderRight: '1px solid #D3DAE6', overflowY: 'auto' }}>
              {tabs}
            </EuiFlexItem>
            { selectAgent && (
              <EuiFlexItem style={{ overflowY: 'auto', overflowX: 'hidden' }}>
              { selectView === 'base' && (
                <Base { ...this.props } selectView={selectView} agentData={agentData} />
              )}
              { selectView === 'netiface' && (
                <Netiface { ...this.props } selectView={selectView} />
              )}
              { selectView === 'port' && (
                <Port { ...this.props } selectView={selectView} />
              )}
              { selectView === 'netaddr' && (
                <Netaddr { ...this.props } selectView={selectView} />
              )}
              { selectView === 'packages' && (
                <Packages { ...this.props } selectView={selectView} />
              )}
              { selectView === 'processes' && (
                <Processes { ...this.props } selectView={selectView} />
              )}
              { selectView === 'weakPassword' && (
                <WeakPassword { ...this.props } selectView={selectView} />
              )}
              { selectView === 'taskCollect' && (
                <TaskCollect { ...this.props } selectView={selectView} />
              )}
              { selectView === 'deviceInfo' && (
                <DeviceInfo { ...this.props } selectView={selectView} />
              )}
              { selectView === 'autostart' && (
                <Autostart { ...this.props } selectView={selectView} />
              )}
              { selectView === 'webServices' && (
                <WebServices { ...this.props } selectView={selectView} />
              )}
              { selectView === 'mirrorContain' && (
                <MirrorContain { ...this.props } selectView={selectView} />
              )}
              </EuiFlexItem>
            )}
          </EuiFlexGroup>
        </EuiPanel>
        {brokenNetworkModal}
        {connnectNetworkModal}
      </EuiPage>
		);
	}
}