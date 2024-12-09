import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiText,
	EuiSpacer,
	EuiFieldNumber,
	EuiTextColor,
	EuiButton,
	EuiSwitch,
} from '@elastic/eui';
import { CDBList } from './CDB-list';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';
import { BruteForceBlackList } from './brute-force-blackList';

export class BruteForce extends Component {
	constructor(props) {
		super(props);
		this.state = {
			bruteForceParams: {
				ar_timeout: ''
			},
			isIntercept: false,
			showWarningRestartBruteForce: false,
      isCluster: false
    };
	}

	async componentDidMount() {
		const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({
      isCluster
    });

		await this.getItems();
  }

	async getItems() {
		try {
			const bruteForceItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=active-response`, {});
			const bruteForce = (
        ((bruteForceItems || {}).data || {}).data || {}
      ).affected_items[0]['active-response'].find(k => k.command === 'host-deny');
			let ar_timeout = bruteForce ? bruteForce.timeout : '';
			let isIntercept = bruteForce && (!bruteForce.disabled || bruteForce.disabled === 'no') ? true : false;

      this.setState({
				bruteForceParams: { ar_timeout },
				isIntercept
			});
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '封停时间配置查询失败: ' + error,
        3000
      );
    }
	}

	async setUpdateIsIntercept(e) {
		let isIntercept = e.target.checked;
		const rawItems = await WzRequest.apiReq('PUT', `/manager/arcfg?ar_command=host-deny&ar_disabled=${isIntercept ? 'no' : 'yes'}`, {});
      
		const items_message = ((rawItems || {}).data || {}).message;
		if (items_message.includes('success')) {
			this.showToast(
				'success',
				'成功',
				'拦截攻击源操作切换成功',
				3000
			);
			
			this.setState({
				isIntercept,
				showWarningRestartIsolateFile: true
			});
		}
		else {
			this.showToast(
				'danger',
				'警告',
				'拦截攻击源操作切换失败',
				3000
			);
		}
  }

	async saveBruteForceDate() {
		const { bruteForceParams, isCluster } = this.state;
    let reg = /^[0-9]+$/;
		if (!bruteForceParams.ar_timeout) {
			this.showToast(
				'danger',
				'警告',
				'暴力破解封停参数配置保存失败: 封停时间为必填',
				3000
			);
		}
		else if (!reg.test(bruteForceParams.ar_timeout)) {
			this.showToast(
				'danger',
				'警告',
				'暴力破解封停参数配置保存失败: 封停时间须为正整数',
				3000
			);
		}
		else {
			const rawItems = await WzRequest.apiReq('PUT', `${isCluster ? '/cluster/arcfg' : '/manager/arcfg'}?ar_command=host-deny&ar_timeout=${bruteForceParams.ar_timeout}`, {});
      
			const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('success')) {
				// this.getItems();
        this.showToast(
          'success',
          '成功',
          '暴力破解封停参数配置保存成功',
          3000
        );

				this.setState({
					showWarningRestartBruteForce: true
				});
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '暴力破解封停参数配置保存失败',
          3000
        );
      }
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

	onChangeBruteForce(e, type) {
		const { bruteForceParams } = this.state;
		bruteForceParams[type] = e.target.value;
		this.setState({ bruteForceParams });
	}

	render() {
		const { bruteForceParams, showWarningRestartBruteForce, isIntercept } = this.state;
		return (
			<div>
        <EuiSpacer size="s"></EuiSpacer>
				{showWarningRestartBruteForce && (
					<Fragment>
						<EuiSpacer size='s'/>
						<WzRestartClusterManagerCallout
							onRestart={() => this.setState({showWarningRestartBruteForce: true})}
							onRestarted={() => this.setState({showWarningRestartBruteForce: false})}
							onRestartedError={() => this.setState({showWarningRestartBruteForce: true})}
						/>
					</Fragment>
				)}
				<EuiFlexGroup alignItems="center">
					<EuiFlexItem grow={false}>
						<EuiTitle size="xs">
							<h4>拦截攻击源配置</h4>
						</EuiTitle>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiTextColor color="subdued"></EuiTextColor>
					</EuiFlexItem>
				</EuiFlexGroup>
				<EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">是否拦截攻击源:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label=""
              checked={isIntercept}
              onChange={(e) => this.setUpdateIsIntercept(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
				{ isIntercept && (
					<div>
						<EuiSpacer size="xl" />
							<EuiFlexGroup alignItems="center">
								<EuiFlexItem grow={false}>
									<EuiTitle size="xs">
										<h4>封停时间配置</h4>
									</EuiTitle>
								</EuiFlexItem>
								<EuiFlexItem>
									<EuiTextColor color="subdued">配置暴力破解封停时间</EuiTextColor>
								</EuiFlexItem>
							</EuiFlexGroup>
							<EuiFlexGroup alignItems="center">
								<EuiFlexItem>
									<EuiFlexGroup alignItems="center">
										<EuiFlexItem grow={false} style={{ width: 130 }}>
											<EuiText textAlign="right">封停时间:</EuiText>
										</EuiFlexItem>
										<EuiFlexItem grow={false}>
											<EuiFieldNumber
												value={bruteForceParams['ar_timeout']}
												onChange={(e) => this.onChangeBruteForce(e, 'ar_timeout')}
												min={0}
											/>
										</EuiFlexItem>
										<EuiFlexItem grow={false}>
											秒
										</EuiFlexItem>
									</EuiFlexGroup>
								</EuiFlexItem>
								<EuiFlexItem grow={false}>
									<EuiButton
										size="s"
										onClick={() => this.saveBruteForceDate()}
									>
										保存
									</EuiButton>
								</EuiFlexItem>
							</EuiFlexGroup>
							<EuiSpacer size="xl" />
							<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
							<EuiSpacer size="xl" />
							<CDBList filename="SSH_IPList"></CDBList>
							<EuiSpacer size="xl" />
							<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
							<BruteForceBlackList />
							<EuiSpacer size="xl" />
					</div>	
				)}
			</div>
		)
	}
}