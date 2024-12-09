import React, { Component, Fragment } from 'react';
import {
  EuiPage,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiTextColor,
	EuiPopover,
	EuiButtonIcon,
	EuiPopoverTitle,
	EuiPanel,
	EuiFieldNumber,
	EuiButton,
	EuiText,
	EuiSuperSelect,
	EuiFieldText,
	EuiSelect,
	EuiSpacer,
	EuiCheckboxGroup,
	EuiSwitch,
	EuiTextArea
} from '@elastic/eui';
import { withReduxProvider, withGlobalBreadcrumb, withUserAuthorizationPrompt } from '../../components/common/hocs';
import { compose } from 'redux';
import { WAZUH_MODULES } from '../../../common/wazuh-modules';
import { getToasts, getHttp }  from '../../kibana-services';
import { WzRequest } from '../../react-services/wz-request';
import WzRestartClusterManagerCallout from '../../components/common/restart-cluster-manager-callout';
import { AppState } from '../../react-services/app-state';
import './systemParam.scss';

export const SystemParam = compose(
	withReduxProvider,
	withGlobalBreadcrumb([{ text: '' }, { text: '系统管理' }, { text: '参数配置' }]),
	withUserAuthorizationPrompt(null, AppState.getPagePermission)
)(class SystemParam extends Component {
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
			paramOptions: [
				{
					title: '登录设置',
					description: '配置登录设置(点击保存后下一次登录生效)',
					params: [
						{
							label: '密码尝试次数',
							unit: '次',
							type: 'lockAccount'
						},
						{
							label: '锁定时间',
							unit: '分钟',
							type: 'lockTime'
						},
						{
							label: '登录超时',
							unit: '分钟',
							type: 'outTime'
						},
						
					]
				}
			],
			ruleCheckboxOptions: [
				{
					id: 'upper',
					label: '必须包含大写字母'
				},
				{
					id: 'lower',
					label: '必须包含小写字母'
				},
				{
					id: 'num',
					label: '必须包含数字字符'
				},
				{
					id: 'spechar',
					label: '必须包含特殊字符'
				}
			],
			ruleCheckboxSelected: {
				upper: false,
				lower: false,
				num: false,
				spechar: false
			},
			showErrors: false,
			showErrors2: false,
			systemParams: {
				lockAccount: 10,
				lockTime: 30,
				outTime:30,
				pwdlen: 8,
				pwdte:90,
				ruleId: '',
				IpBlackList: '',
				IpWhiteList:"",
			},
			backupTime: '',
			showWarningRestartBackup: false,
			logKeepParams: {
				logkeepdays: ''
			},
			showDingdingWarningRestart: false,
			dingdingParamOptions: [
				{
          label: '通知开关',
          note: '',
          type: 'dingtalk_notification',
          inputType: 'switch'
        },
        {
          label: '告警等级',
          note: '告警等级范围为12-16',
          type: 'level',
          inputType: 'number'
        },
        {
          label: 'webhook链接',
          note: '',
          type: 'hook_url',
          inputType: 'area'
        }
			],
			dingdingParams: {
				dingtalk_notification: false,
				hook_url: '',
				level: ''
			},
      showEmailWarningRestart: false,
      emailParamOptions: [
				{
          label: '通知开关',
          note: '',
          type: 'email_notification',
          inputType: 'switch'
        },
        {
          label: '告警ID',
          note: '指定id的告警发送邮箱，多个id用英文逗号隔开',
          type: 'email_rule_id',
          inputType: 'text'
        },
        {
          label: '告警等级',
          note: '告警等级范围为8-15',
          type: 'email_level',
          inputType: 'number'
        },
        {
          label: '告警组',
          note: '指定发送告警所属的group，多个group用|隔开',
          type: 'email_group',
          inputType: 'text'
        },
        {
          label: '目的邮箱',
          note: '目的邮箱地址，多个地址用英文逗号分开',
          type: 'email_to',
          inputType: 'area'
        }
			],
      emailParams: {
				email_notification: false,
				email_to: '',
				email_rule_id: '',
				email_level: '',
				email_group: ''
			},
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
			const { ruleCheckboxSelected } = this.state;
			const rawItems = await WzRequest.apiReq('GET', `/manager/webloggingconfig?pretty=true`, {});
			const params = (
        ((rawItems || {}).data || {}).data || {}
      ).affected_items[0];


			let systemParams = {
				lockAccount: params.attempttimes,
				lockTime: params.lockedtimes,
				pwdlen: params.pwdlen,
				pwdte:params.pwdte,
				ruleId: params.passwordrules,
				IpBlackList: params.blackloggingip,
				IpWhiteList:params.whiteloggingip,
				outTime:params.outtimes||30
			}
			// const jsonString=window.localStorage.getItem('outTimeString')
			// systemParams.outTime=Number(JSON.parse(jsonString))||35
			systemParams.ruleId.split(',').map(k => {
				if (k) {
					ruleCheckboxSelected[k] = true;
				}
			})

			const backupItems = await WzRequest.apiReq('GET', `/manager/backup?pretty=true`, {});
			const backupTime = (
        ((backupItems || {}).data || {}).data || {}
      ).affected_items[0].backup_time;

			const logKeepItems = await WzRequest.apiReq('GET', `/manager/configes`, {});
			const logKeep = (
        ((logKeepItems || {}).data || {}).data || {}
      ).affected_items[0];

			let dingdingParams = {
				dingtalk_notification: false,
				hook_url: '',
				level: ''
			};
			let emailParams = {
				email_notification: false,
				email_to: '',
				email_rule_id: '',
				email_level: '',
				email_group: ''
			};

			// try {
			// 	const globalItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=integration`, {});
			// 	const globalParams = (
			// 		((globalItems || {}).data || {}).data || {}
			// 	).affected_items[0].integration[0];
	
			// 	dingdingParams = {
			// 		dingtalk_notification: globalParams.api_key === 'yes',
			// 		hook_url: globalParams.hook_url,
			// 		level: globalParams.level
			// 	}
				
			// } catch (error) {
			// 	this.showToast(
			// 		'danger',
			// 		'警告',
			// 		'钉钉配置查询失败: ' + error,
			// 		3000
			// 	);
			// }
	
			try {
				const emailGlobalItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=global`, {});
				const emailGlobalParams = (
					((emailGlobalItems || {}).data || {}).data || {}
				).affected_items[0].global;
				const alertItems = await WzRequest.apiReq('GET', `/manager/configuration?pretty=true&section=email_alerts`, {});
				const alertParams = (
					((alertItems || {}).data || {}).data || {}
				).affected_items[0].email_alerts;
	
				emailParams = {
					email_notification: emailGlobalParams.email_notification === 'yes',
					email_to: alertParams.email_to.join(','),
					email_rule_id: alertParams.rule_id,
					email_level: alertParams.level,
					email_group: alertParams.group
				}
			} catch (error) {
				console.log( error )
			}

      this.setState({
				systemParams,
				ruleCheckboxSelected,
				backupTime,
				logKeepParams: { logkeepdays: logKeep },
				dingdingParams,
      	emailParams,
			});
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '参数配置查询失败: ' + error,
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

	renderTitle() {
		return (
      <EuiFlexGroup>
        <EuiFlexItem className="wz-module-header-agent-title">
          <EuiFlexGroup justifyContent={'spaceBetween'} alignItems="center">
            <EuiFlexItem grow={false}>
              <span style={{ display: 'inline-flex' }}>
                <EuiTitle size="s">
                  <h1>
                    <span>&nbsp;{WAZUH_MODULES['systemParam'].title}&nbsp;&nbsp;</span>
                  </h1>
                </EuiTitle>
                <EuiPopover
                  button={
                    <EuiButtonIcon
                      iconType="iInCircle"
                      style={{marginTop: 3}}
                      color='primary'
                      aria-label='Open/close'
                      onClick={() => { this.setState({ isDescPopoverOpen: !this.state.isDescPopoverOpen }) }}
                    />
                  }
                  anchorPosition="rightUp"
                  isOpen={this.state.isDescPopoverOpen}
                  closePopover={() => { this.setState({ isDescPopoverOpen: false }) }}>
                  <EuiPopoverTitle>模块说明</EuiPopoverTitle>
                  <div style={{ width: '400px' }}>
                    {WAZUH_MODULES['systemParam'].description}
                  </div>
                </EuiPopover>
              </span>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
						</EuiFlexItem>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
    );
	}

	renderRuleCheckbox() {
		const { ruleCheckboxOptions, ruleCheckboxSelected } = this.state;
		return (
			<EuiCheckboxGroup
        options={ruleCheckboxOptions}
        idToSelectedMap={ruleCheckboxSelected}
        onChange={(id) => this.onChangeRuleCheckbox(id)}
				className="systemParam-ruleCheckbox"
      />
		);
	}

	onChangeRuleCheckbox(id) {
		const { ruleCheckboxSelected } = this.state;
		ruleCheckboxSelected[id] = !ruleCheckboxSelected[id];
		this.setState({ ruleCheckboxSelected });
	}

	testIpList(ips) {
		if (ips === '') return true;
    // 把 ips 按逗号拆成 IP 数组，分别进行验证
    // every 表示每个 ip 验证通过才算通过
    return ips.split(",")
			.every(ip => {
				// 把每个 IP 拆成几段
				const segments = ip.split(".");
				// 如果是精确的 4 段而且每段转换成数字都在 1~255 就对了
				return segments.length === 4
					&& segments
						.map(segment => parseInt(segment, 10) || 0)
						.every(n => n >= 0 && n <= 255);
			});
	}

	async saveLoginDate() {
		const { systemParams, ruleCheckboxSelected } = this.state;
    let reg = /^[0-9]+$/;

		let loginRuleSelected = Object.keys(ruleCheckboxSelected).filter(k => ruleCheckboxSelected[k]);
		systemParams.ruleId = loginRuleSelected.join(',');

		if (!this.testIpList(systemParams.IpBlackList)) {
			this.setState({ showErrors: true });
		}
		else if (!this.testIpList(systemParams.IpWhiteList)) {
			this.setState({ showErrors2: true });
		}
		else if (loginRuleSelected.length < 3) {
			this.showToast(
				'danger',
				'警告',
				'登录参数配置保存失败: 密码强度规则为必填，请至少选择3项',
				3000
			);
		}
		else if (!systemParams.pwdlen ||!systemParams.pwdte || !systemParams.lockAccount || !systemParams.lockTime) {
		// else if (!systemParams.ruleId || !systemParams.lockAccount || !systemParams.lockTime) {
			this.showToast(
				'danger',
				'警告',
				'登录参数配置保存失败: 密码尝试次数、锁定时间、密码最小长度为必填',
				// '登录参数配置保存失败: 密码尝试次数、锁定时间、密码强度规则为必填',
				3000
			);
		}
		else if (!reg.test(systemParams.pwdlen) ||!reg.test(systemParams.pwdte) || !reg.test(systemParams.lockAccount) || !reg.test(systemParams.lockTime)) {
			this.showToast(
				'danger',
				'警告',
				'登录参数配置保存失败: 密码尝试次数、锁定时间、密码最小长度须为正整数',
				3000
			);
		}
		else if (systemParams.pwdlen < 8) {
			this.showToast(
				'danger',
				'警告',
				'登录参数配置保存失败: 密码最小长度不能小于8位',
				3000
			);
		}
		else if (systemParams.pwdte <=999||systemParams.pwdte >=30) {
			this.showToast(
				'danger',
				'警告',
				'登录参数配置保存失败: 密码有效期大于30天小于999天',
				3000
			);
		}
		else {
			this.setState({ showErrors: false, showErrors2: false });
			
			const outTimeString=JSON.stringify(systemParams.outTime)
			window.localStorage.setItem('outTimeString',outTimeString)
			const rawRules = await WzRequest.apiReq('PUT', `/manager/webloggingconfig?pretty=true&&passwordrules=${systemParams.ruleId}&&blackloggingip=${systemParams.IpBlackList}&&whiteloggingip=${systemParams.IpWhiteList}&&attempttimes=${systemParams.lockAccount}&&lockedtimes=${systemParams.lockTime}&&outtimes=${systemParams.outTime}&&pwdte=${systemParams.pwdte}&&pwdlen=${systemParams.pwdlen}`, {});
      
			const affected_rule = ((rawRules || {}).data || {}).data.total_affected_items;
      if (affected_rule === 1) {
				this.getItems();
        this.showToast(
          'success',
          '成功',
          '登录参数配置保存成功',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '登录参数配置保存失败',
          3000
        );
      }
		}
	}

	async saveLogKeep() {
		try {
      const { logKeepParams } = this.state;

			if (logKeepParams.logkeepdays < 180) {
				this.showToast(
					'danger',
					'警告',
					'日志保留天数配置失败: 保留天数不能低于180天',
					3000
				);
				return;
			}
			else {
				await WzRequest.apiReq('PUT', `/manager/configes?logkeepdays=${logKeepParams.logkeepdays}`, {});

				this.getItems();
				this.showToast(
					'success',
					'成功',
					'日志保留天数配置成功',
					3000
				);
			}
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '日志保留天数配置失败: ' + error,
        3000
      );
    }
	}

	async toBackup() {
		const { isCluster } = this.state;
		const rawItems = await WzRequest.apiReq('POST', `${isCluster ? '/cluster/backup' : '/manager/backup'}?pretty=true`, {});
		
		const status = ((rawItems || {}).data || {}).message;
		if (status === 'success') {
			this.showToast(
				'success',
				'成功',
				'备份成功',
				3000
			);
			const backupItems = await WzRequest.apiReq('GET', `/manager/backup?pretty=true`, {});
			const backupTime = (
        ((backupItems || {}).data || {}).data || {}
      ).affected_items[0].backup_time;

      this.setState({
				backupTime
			});
		}
		else {
			this.showToast(
				'danger',
				'警告',
				'备份失败',
				3000
			);
		}
	}

	async toRestore() {
		const { isCluster } = this.state;
		const rawItems = await WzRequest.apiReq('POST', `${isCluster ? '/cluster/backup_import' : '/manager/backup_import'}?pretty=true`, {});
		
		const status = ((rawItems || {}).data || {}).message;
		if (status === 'success') {
			this.showToast(
				'success',
				'成功',
				'恢复成功',
				3000
			);

      this.setState({
				showWarningRestartBackup: true
			});
		}
		else {
			this.showToast(
				'danger',
				'警告',
				'恢复失败',
				3000
			);
		}
	}

	async saveDingdingDate() {
		const { dingdingParams, isCluster } = this.state;
    let urlRegex = /^(https?:\/\/)([0-9a-z.]+)(:[0-9]+)?([/0-9a-z.]+)?(\?[0-9a-z&=]+)?(#[0-9-a-z]+)?/i;
    if (!dingdingParams.level || !dingdingParams.hook_url) {
			this.showToast(
				'danger',
				'警告',
				'钉钉配置保存失败: 告警等级、webhook链接为必填',
				3000
			);
		}
    else if ( dingdingParams.level < 12 || dingdingParams.level > 16 ) {
      this.showToast(
				'danger',
				'警告',
				'钉钉配置保存失败: 告警等级范围为12-16',
				3000
			);
    }
    else if (!urlRegex.test(dingdingParams.hook_url)) {
      this.showToast(
				'danger',
				'警告',
				'钉钉配置保存失败: webhook链接格式不合法',
				3000
			);
    }
		else {
      let params = {
        dingtalk_notification: dingdingParams.dingtalk_notification ? 'yes' : 'no',
        hook_url: dingdingParams.hook_url,
        level: dingdingParams.level
      }
      let url = `${isCluster ? '/cluster/update_integration' : '/manager/update_integration'}?pretty=true`;
      Object.keys(params).map(k => {
        if (params[k]) {
          url += `&${k}=${params[k]}`
        }
      })

			const rawItems = await WzRequest.apiReq('PUT', url, {});
      
			const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('success')) {
        this.setState({ showDingdingWarningRestart: true });
        this.showToast(
          'success',
          '成功',
          '钉钉配置保存成功',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '钉钉配置保存失败',
          3000
        );
      }
		}
	}

  async saveEmailDate() {
		const { emailParams, isCluster } = this.state;
    let emailRegex = /^((([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6}\,))*(([a-z0-9_\.-]+)@([\da-z\.-]+)\.([a-z\.]{2,6})))$/;
    let ruleIdRegex = /^(\d+,?)+$/;
    if ( !emailParams.email_to ) {
      this.showToast(
				'danger',
				'警告',
				'邮箱配置保存失败: 目的邮箱为必填',
				3000
			);
    }
    else if (!emailRegex.test(emailParams.email_to)) {
      this.showToast(
				'danger',
				'警告',
				'邮箱配置保存失败: 目的邮箱格式不合法',
				3000
			);
    }
    else if (emailParams.email_rule_id && !ruleIdRegex.test(emailParams.email_rule_id)) {
      this.showToast(
				'danger',
				'警告',
				'邮箱配置保存失败: 告警ID格式不合法',
				3000
			);
    }
    else if ( emailParams.email_level && emailParams.email_level < 8 || emailParams.email_level > 15 ) {
      this.showToast(
				'danger',
				'警告',
				'邮箱配置保存失败: 告警等级范围为8-15',
				3000
			);
    }
		else if (!emailParams.email_rule_id && !emailParams.email_level && !emailParams.email_group) {
			this.showToast(
				'danger',
				'警告',
				'邮箱配置保存失败: 告警ID、告警等级、告警组不能同时为空',
				3000
			);
		}
		else {
      let params = {
        email_notification: emailParams.email_notification ? 'yes' : 'no',
        email_to: emailParams.email_to,
        email_rule_id: emailParams.email_rule_id,
        email_level: emailParams.email_level,
        email_group: emailParams.email_group,
      }
      let url = isCluster ? `/cluster/emailcfg?` : `/manager/emailcfg?`;
      Object.keys(params).map(k => {
        if (params[k]) {
          url += `${k}=${params[k]}&`
        }
      })

			const rawItems = await WzRequest.apiReq('PUT', url, {});
      
			const items_message = ((rawItems || {}).data || {}).message;
      if (items_message.includes('success')) {
        this.setState({ showEmailWarningRestart: true });
        this.showToast(
          'success',
          '成功',
          '邮箱配置保存成功',
          3000
        );
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '邮箱配置保存失败',
          3000
        );
      }
		}
	}

	onChangeLogin(e, type) {
		let newSystemParams = this.state.systemParams;
		newSystemParams[type] = e.target.value;
		this.setState({ systemParams: newSystemParams });
	}

	onChangeRule(value) {
		const { systemParams } = this.state;
		systemParams.ruleId = value;
		this.setState({ systemParams });
	}

	onChangeLogKeep(e, type) {
		const { logKeepParams } = this.state;
		logKeepParams[type] = e.target.value;
		this.setState({ logKeepParams });
	}

	onChangeDingding(e, type) {
		let { dingdingParams } = this.state;
		dingdingParams[type] = e.target.value;
		this.setState({ dingdingParams });
	}

  onChangeDingdingSwitch(e, type) {
    let { dingdingParams } = this.state;
		dingdingParams[type] = e.target.checked;
		this.setState({ dingdingParams });
  }

  onChangeEmail(e, type) {
		let { emailParams } = this.state;
		emailParams[type] = e.target.value;
		this.setState({ emailParams });
	}

  onChangeEmailSwitch(e, type) {
    let { emailParams } = this.state;
		emailParams[type] = e.target.checked;
		this.setState({ emailParams });
  }

	render() {
		const {
			paramOptions,
			systemParams,
			showErrors,
			showErrors2,
			backupTime,
			showWarningRestartBackup,
			logKeepParams,
			dingdingParamOptions,
			dingdingParams,
			emailParamOptions,
			emailParams,
		} = this.state;
		const title = this.renderTitle();
		const ruleSelect = this.renderRuleCheckbox();

		return (
			<EuiFlexGroup direction="column">
				<EuiFlexItem grow={false}>
					<div className="wz-module">
						<div className='wz-module-header-agent-wrapper'>
							<div className='wz-module-header-agent'>
								{title}
							</div>
						</div>
						<div className='wz-module-body-notab'>
							<EuiPage>
								<EuiFlexGroup direction="column">
								{Object.keys(paramOptions).map((idx) => (
									<EuiFlexItem grow={false} key={idx}>
										<EuiPanel>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiTitle size="s">
														<h3>{paramOptions[idx].title}</h3>
													</EuiTitle>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTextColor color="subdued">{paramOptions[idx].description}</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											{Object.keys(paramOptions[idx].params).map((mdx) => (
												<EuiFlexGroup alignItems="center" key={mdx}>
													<EuiFlexItem grow={false} style={{ width: 100 }}>
														<EuiText textAlign="right">{paramOptions[idx].params[mdx].label}:</EuiText>
													</EuiFlexItem>
													<EuiFlexItem grow={false}>
														<EuiFieldNumber
															value={systemParams[paramOptions[idx].params[mdx].type]}
															onChange={(e) => this.onChangeLogin(e, paramOptions[idx].params[mdx].type)}
															min={0}
														/>
													</EuiFlexItem>
													<EuiFlexItem grow={false}>
														<EuiTextColor color="subdued">{paramOptions[idx].params[mdx].unit}</EuiTextColor>
													</EuiFlexItem>
												</EuiFlexGroup>
											))}
											<EuiSpacer size="m" />
											<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
											<EuiSpacer size="m" />
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiTitle size="s">
														<h3>密码规则</h3>
													</EuiTitle>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTextColor color="subdued">配置密码规则</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false} style={{ width: 100 }}>
													<EuiText textAlign="right">密码最小长度:</EuiText>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													<EuiFieldNumber
														value={systemParams.pwdlen}
														onChange={(e) => this.onChangeLogin(e, 'pwdlen')}
														min={8}
													/>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													<EuiTextColor color="subdued">{'位'}</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false} style={{ width: 100 }}>
													<EuiText textAlign="right">密码强度规则:</EuiText>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													{ruleSelect}
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false} style={{ width: 100 }}>
													<EuiText textAlign="right">密码有效期:</EuiText>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													<EuiFieldNumber
														value={systemParams.pwdte}
														onChange={(e) => this.onChangeLogin(e, 'pwdte')}
														min={30}
													/>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													<EuiTextColor color="subdued">{'天'}</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiSpacer size="m" />
											<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
											<EuiSpacer size="m" />
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiTitle size="s">
														<h3>登录黑名单</h3>
													</EuiTitle>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTextColor color="subdued">配置登录IP黑名单，多条以英文逗号分隔</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												
												<EuiFlexItem grow={false} style={{ width: 100 }}>
													<EuiText textAlign="right">登录IP黑名单:</EuiText>
												</EuiFlexItem>
												<EuiFlexItem grow={false} style={{ width: 300 }}>
													<EuiFieldText
														value={systemParams.IpBlackList}
														onChange={(e) => this.onChangeLogin(e, 'IpBlackList')}
														isInvalid={showErrors}
													/>
												</EuiFlexItem>
												{ showErrors && (
													<EuiFlexItem grow={false}>
														<EuiTextColor color="danger">请检验IP格式，多条以英文逗号分隔</EuiTextColor>
													</EuiFlexItem>
												)}
											</EuiFlexGroup>
											{/* <EuiSpacer size="m" />
											<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
											<EuiSpacer size="m" />
											<EuiButton
												size="s"
												onClick={() => this.saveLoginDate()}
											>
												保存
											</EuiButton> */}
											<EuiSpacer size="m" />
											<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
											<EuiSpacer size="m" />
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiTitle size="s">
														<h3>登录白名单</h3>
													</EuiTitle>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTextColor color="subdued">配置登录IP白名单，多条以英文逗号分隔(空白默认为不开启)</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												
												<EuiFlexItem grow={false} style={{ width: 100 }}>
													<EuiText textAlign="right">登录IP白名单:</EuiText>
												</EuiFlexItem>
												<EuiFlexItem grow={false} style={{ width: 300 }}>
													<EuiFieldText
														value={systemParams.IpWhiteList}
														onChange={(e) => this.onChangeLogin(e, 'IpWhiteList')}
														isInvalid={showErrors2}
													/>
												</EuiFlexItem>
												{ showErrors2 && (
													<EuiFlexItem grow={false}>
														<EuiTextColor color="danger">请检验IP格式，多条以英文逗号分隔</EuiTextColor>
													</EuiFlexItem>
												)}
											</EuiFlexGroup>
											<EuiSpacer size="m" />
											<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
											<EuiSpacer size="m" />
											<EuiButton
												size="s"
												onClick={() => this.saveLoginDate()}
											>
												保存
											</EuiButton>
										</EuiPanel>
									</EuiFlexItem>
									
								))}


								
									<EuiFlexItem grow={false}>
										<EuiPanel>
											{showWarningRestartBackup && (
												<Fragment>
													<EuiSpacer size='s'/>
													<WzRestartClusterManagerCallout
														onRestart={() => this.setState({showWarningRestartBackup: true})}
														onRestarted={() => this.setState({showWarningRestartBackup: false})}
														onRestartedError={() => this.setState({showWarningRestartBackup: true})}
													/>
												</Fragment>
											)}
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiTitle size="s">
														<h3>备份配置</h3>
													</EuiTitle>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTextColor color="subdued">{ backupTime ? `上次备份时间:${backupTime}` : '' }</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiButton
														size="s"
														onClick={() => this.toBackup()}
													>
														备份
													</EuiButton>
												</EuiFlexItem>
											</EuiFlexGroup>
											{ backupTime && (
												<EuiFlexGroup alignItems="center">
													<EuiFlexItem grow={false} >
														<EuiButton
															size="s"
															onClick={() => this.toRestore()}
														>
															恢复
														</EuiButton>
													</EuiFlexItem>
												</EuiFlexGroup>
											)}
										</EuiPanel>
									</EuiFlexItem>
									<EuiFlexItem grow={false}>
										<EuiPanel>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false}>
													<EuiTitle size="s">
														<h3>日志保留天数</h3>
													</EuiTitle>
												</EuiFlexItem>
												<EuiFlexItem>
													<EuiTextColor color="subdued">配置日志保留天数</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiFlexGroup alignItems="center">
												<EuiFlexItem grow={false} style={{ width: 100 }}>
													<EuiText textAlign="right">保留天数:</EuiText>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													<EuiFieldNumber
														value={logKeepParams['logkeepdays']}
														onChange={(e) => this.onChangeLogKeep(e, 'logkeepdays')}
														min={180}
													/>
												</EuiFlexItem>
												<EuiFlexItem grow={false}>
													<EuiTextColor color="subdued">{'天'}</EuiTextColor>
												</EuiFlexItem>
											</EuiFlexGroup>
											<EuiSpacer size="m" />
											<EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
											<EuiSpacer size="m" />
											<EuiButton
												size="s"
												onClick={() => this.saveLogKeep()}
											>
												保存
											</EuiButton>
										</EuiPanel>
									</EuiFlexItem>
									{/* <EuiFlexItem grow={false}>
                    <EuiPanel>
                    {this.state.showDingdingWarningRestart && (
                      <Fragment>
                        <EuiSpacer size='s'/>
                        <WzRestartClusterManagerCallout
                          onRestart={() => this.setState({showDingdingWarningRestart: true})}
                          onRestarted={() => this.setState({showDingdingWarningRestart: false})}
                          onRestartedError={() => this.setState({showDingdingWarningRestart: true})}
                        />
                      </Fragment>
                    )}
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem grow={false}>
                        <EuiTitle size="s">
                          <h3>钉钉通知</h3>
                        </EuiTitle>
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <EuiTextColor color="subdued">进行钉钉通知相关参数配置</EuiTextColor>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    {Object.keys(dingdingParamOptions).map((idx) => (
                      <EuiFlexGroup key={idx} alignItems="center">
                        <EuiFlexItem grow={false} style={{ width: 100 }}>
                          <EuiText textAlign="right">{dingdingParamOptions[idx].label}:</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: 205 }}>
                        { dingdingParamOptions[idx].inputType === 'number' && (
                          <EuiFieldNumber
                            value={dingdingParams[dingdingParamOptions[idx].type]}
                            onChange={(e) => this.onChangeDingding(e, dingdingParamOptions[idx].type)}
                            min={12}
                            max={16}
                          />
                        )}
                        { dingdingParamOptions[idx].inputType === 'text' && (
                          <EuiFieldText
                            value={dingdingParams[dingdingParamOptions[idx].type]}
                            onChange={(e) => this.onChangeDingding(e, dingdingParamOptions[idx].type)}
                          />
                        )}
                        { dingdingParamOptions[idx].inputType === 'textArea' && (
                          <EuiTextArea
                            value={dingdingParams[dingdingParamOptions[idx].type]}
                            onChange={(e) => this.onChangeDingding(e, dingdingParamOptions[idx].type)}
                          />
                        )}
                        { dingdingParamOptions[idx].inputType === 'switch' && (
                          <EuiSwitch
                            label=""
                            checked={dingdingParams[dingdingParamOptions[idx].type]}
                            onChange={(e) => this.onChangeDingdingSwitch(e, dingdingParamOptions[idx].type)}
                          />
                        )}
                        { dingdingParamOptions[idx].inputType === 'area' && (
                          <EuiTextArea
                            value={dingdingParams[dingdingParamOptions[idx].type]}
                            onChange={(e) => this.onChangeDingding(e, dingdingParamOptions[idx].type)}
                          />
                        )}
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiTextColor color="subdued">{dingdingParamOptions[idx].note}</EuiTextColor>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    ))}
                      <EuiSpacer size="m" />
                      <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
                      <EuiSpacer size="m" />
                      <EuiButton
                        size="s"
                        onClick={() => this.saveDingdingDate()}
                      >
                        保存
                      </EuiButton>
                    </EuiPanel>
                  </EuiFlexItem>
*/}
                  <EuiFlexItem grow={false}>
                    <EuiPanel>
                    {this.state.showEmailWarningRestart && (
                      <Fragment>
                        <EuiSpacer size='s'/>
                        <WzRestartClusterManagerCallout
                          onRestart={() => this.setState({showEmailWarningRestart: true})}
                          onRestarted={() => this.setState({showEmailWarningRestart: false})}
                          onRestartedError={() => this.setState({showEmailWarningRestart: true})}
                        />
                      </Fragment>
                    )}
                    <EuiFlexGroup alignItems="center">
                      <EuiFlexItem grow={false}>
                        <EuiTitle size="s">
                          <h3>邮箱通知</h3>
                        </EuiTitle>
                      </EuiFlexItem>
                      <EuiFlexItem>
                        <EuiTextColor color="subdued">进行邮箱通知相关参数配置</EuiTextColor>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                    {Object.keys(emailParamOptions).map((idx) => (
                      <EuiFlexGroup key={idx} alignItems="center">
                        <EuiFlexItem grow={false} style={{ width: 100 }}>
                          <EuiText textAlign="right">{emailParamOptions[idx].label}:</EuiText>
                        </EuiFlexItem>
                        <EuiFlexItem grow={false} style={{ width: 205 }}>
                        { emailParamOptions[idx].inputType === 'number' && (
                          <EuiFieldNumber
                            value={emailParams[emailParamOptions[idx].type]}
                            onChange={(e) => this.onChangeEmail(e, emailParamOptions[idx].type)}
                            min={8}
                            max={15}
                          />
                        )}
                        { emailParamOptions[idx].inputType === 'text' && (
                          <EuiFieldText
                            value={emailParams[emailParamOptions[idx].type]}
                            onChange={(e) => this.onChangeEmail(e, emailParamOptions[idx].type)}
                          />
                        )}
                        { emailParamOptions[idx].inputType === 'textArea' && (
                          <EuiTextArea
                            value={emailParams[emailParamOptions[idx].type]}
                            onChange={(e) => this.onChangeEmail(e, emailParamOptions[idx].type)}
                          />
                        )}
                        { emailParamOptions[idx].inputType === 'switch' && (
                          <EuiSwitch
                            label=""
                            checked={emailParams[emailParamOptions[idx].type]}
                            onChange={(e) => this.onChangeEmailSwitch(e, emailParamOptions[idx].type)}
                          />
                        )}
                        { emailParamOptions[idx].inputType === 'area' && (
                          <EuiTextArea
                            value={emailParams[emailParamOptions[idx].type]}
                            onChange={(e) => this.onChangeEmail(e, emailParamOptions[idx].type)}
                          />
                        )}
                        </EuiFlexItem>
                        <EuiFlexItem grow={false}>
                          <EuiTextColor color="subdued">{emailParamOptions[idx].note}</EuiTextColor>
                        </EuiFlexItem>
                      </EuiFlexGroup>
                    ))}
                      <EuiSpacer size="m" />
                      <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
                      <EuiSpacer size="m" />
                      <EuiButton
                        size="s"
                        onClick={() => this.saveEmailDate()}
                      >
                        保存
                      </EuiButton>
                    </EuiPanel>
                  </EuiFlexItem> 
								</EuiFlexGroup>
							</EuiPage>
						</div>
					</div>
				</EuiFlexItem>
			</EuiFlexGroup>
		);
	}
});