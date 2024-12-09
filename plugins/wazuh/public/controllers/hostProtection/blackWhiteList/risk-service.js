import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiText,
	EuiSpacer,
	EuiTextColor,
  EuiSwitch,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';
import { AppState } from '../../../react-services/app-state';

export class RiskService extends Component {
  constructor(props) {
		super(props);
		this.state = {
			isDisabledService: false,
			showWarningRestartIsDisabledService: false,
      isCluster: false,
    };
	}

  async componentDidMount() {
    const isCluster = (AppState.getClusterInfo() || {}).status === 'enabled';
    this.setState({ isCluster });
		await this.getItems();
  }

  async getItems() {
		try {
			const isDisabledServiceItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=active-response`, {});
			const isDisabledServiceItem = (
        ((isDisabledServiceItems || {}).data || {}).data || {}
      ).affected_items[0]['active-response'].find(k => k.command === 'mask-service');
			const isDisabledService = isDisabledServiceItem && (!isDisabledServiceItem.disabled || isDisabledServiceItem.disabled === 'no') ? true : false;

      this.setState({
				isDisabledService
			});
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '禁用高危系统服务状态查询失败: ' + error,
        3000
      );
    }
	}

  async setUpdateIsDisabledService(e) {
    const { isCluster } = this.state;
		let isDisabledService = e.target.checked;
		const rawItems = await WzRequest.apiReq('PUT', `/${isCluster ? 'cluster' : 'manager'}/switch_command?pretty=true&ar_command=mask-service`, {});
      
		const items_message = ((rawItems || {}).data || {}).message;
		if (items_message.includes('success')) {
			this.showToast(
				'success',
				'成功',
				'禁用高危系统服务操作切换成功',
				3000
			);
			
			this.setState({
				isDisabledService,
				showWarningRestartIsDisabledService: true
			});
		}
		else {
			this.showToast(
				'danger',
				'警告',
				'禁用高危系统服务操作切换失败',
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

  render() {
    const { isDisabledService, showWarningRestartIsDisabledService } = this.state;
		return (
			<div>
				<EuiSpacer size="s"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h4>高危系统服务</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">开关开启时，发现高危系统服务则关闭并屏蔽该服务</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
				{showWarningRestartIsDisabledService && (
          <Fragment>
            <EuiSpacer size='s'/>
            <WzRestartClusterManagerCallout
              onRestart={() => this.setState({showWarningRestartIsDisabledService: true})}
              onRestarted={() => this.setState({showWarningRestartIsDisabledService: false})}
              onRestartedError={() => this.setState({showWarningRestartIsDisabledService: true})}
            />
          </Fragment>
        )}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 160 }}>
            <EuiText textAlign="right">是否禁用高危系统服务:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label=""
              checked={isDisabledService}
              onChange={(e) => this.setUpdateIsDisabledService(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
				<EuiSpacer size="xl" />
			</div>
		)
  }
}