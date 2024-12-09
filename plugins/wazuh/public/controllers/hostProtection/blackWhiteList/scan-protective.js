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

export class ScanProtective extends Component {
  constructor(props) {
		super(props);
		this.state = {
			isIntercept: false,
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
      ).affected_items[0]['active-response'].find(k => k.command === 'scan-attack');
			const isIntercept = isDisabledServiceItem && (!isDisabledServiceItem.disabled || isDisabledServiceItem.disabled === 'no') ? true : false;

      this.setState({
				isIntercept
			});
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '自动拦截状态查询失败: ' + error,
        3000
      );
    }
	}

  async setUpdateIsDisabledService(e) {
    const { isCluster } = this.state;
		let isIntercept = e.target.checked;
		const rawItems = await WzRequest.apiReq('PUT', `/${isCluster ? 'cluster' : 'manager'}/switch_command?pretty=true&ar_command=scan-attack`, {});
      
		const items_message = ((rawItems || {}).data || {}).message;
		if (items_message.includes('success')) {
			this.showToast(
				'success',
				'成功',
				'自动拦截操作切换成功',
				3000
			);
			
			this.setState({
				isIntercept,
				showWarningRestartIsDisabledService: true
			});
		}
		else {
			this.showToast(
				'danger',
				'警告',
				'自动拦截操作切换失败',
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
    const { isIntercept, showWarningRestartIsDisabledService } = this.state;
		return (
			<div>
				<EuiSpacer size="s"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h4>扫描防护自动拦截</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">开关开启时，扫描发现入侵则记录并拦截</EuiTextColor>
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
            <EuiText textAlign="right">是否启用自动拦截:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label=""
              checked={isIntercept}
              onChange={(e) => this.setUpdateIsDisabledService(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
				<EuiSpacer size="xl" />
			</div>
		)
  }
}