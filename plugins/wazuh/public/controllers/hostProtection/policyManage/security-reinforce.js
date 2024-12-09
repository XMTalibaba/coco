import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiFieldNumber,
	EuiButton,
	EuiText,
	EuiSwitch,
  EuiTextColor,
	EuiOverlayMask,
	EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
	EuiModalFooter,
	EuiButtonEmpty,
  EuiSpacer,
  EuiTitle,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class SecurityReinforce extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      detailsItem: '',
			paramOptions: [
        {
          label: '密码有效时间',
          note: '设定linux账户用户密码时间。规定时间到期后将无法登录linux系统。单位为‘天’',
          type: 'PASS_MAX_DAYS',
          inputType: 'number'
        },
				{
          label: '密码修改最短时间',
          note: '设定linux账户最短用户密码修改时间。单位为‘天’',
          type: 'PASS_MIN_DAYS',
          inputType: 'number'
        },
				{
          label: '密码过期提醒时间',
          note: '设定linux账户密码过期提醒。在该时间过期后用户登录linux系统会被提醒修改密码。单位为‘天’',
          type: 'PASS_WARN_AGE',
          inputType: 'number'
        },
				{
          label: '密码长度',
          note: '设定linux账户最短用户密码。如果设置密码时小于该长度将无法成功。',
          type: 'PASS_MIN_LEN',
          inputType: 'number'
        },
				{
          label: '是否允许root账户登录',
          note: '建议关闭。关闭后只能以普通用户身份登录',
          type: 'PermitRootLogin',
          inputType: 'switch'
        }
			],
			saveParams: {
				PASS_MAX_DAYS: '',
				PASS_MIN_DAYS: '',
				PASS_WARN_AGE: '',
				PASS_MIN_LEN: '',
				PermitRootLogin: false
			},
			isModalVisible: false,
			saveResult: '',
      isCluster: false
    };
	}

	async componentDidMount() {
    this._isMount = true;

    const clusterStatus = await WzRequest.apiReq('GET', `/cluster/status`, {});
    const clusterData = ((clusterStatus || {}).data || {}).data || {};
    const isCluster = clusterData.enabled === 'yes' && clusterData.running === 'yes';
    this.setState({
      isCluster
    });

    this.setState({detailsItem: this.props.policyManageType});
    if (this.props.policyManageType) this.getConfig(this.props.policyManageType);
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (this.props.selectView === 'securityReinforce' && prevProps.policyManageType !== this.props.policyManageType) {
      this.setState({detailsItem: this.props.policyManageType});
      this.getConfig(this.props.policyManageType);
    }
  }

  async getConfig(detailsItem) {
    try {
      const rawItems = await WzRequest.apiReq('GET', `/manager/hostreinforcementconfiguration?PermitRootLoginGroup=${detailsItem}`, {});
      
			const totalItems = ((rawItems || {}).data || {}).data.affected_items;
      if (totalItems.length > 0) {
        let saveParams = {
          PASS_MAX_DAYS: totalItems[0].PASS_MAX_DAYS,
          PASS_MIN_DAYS: totalItems[0].PASS_MIN_DAYS,
          PASS_MIN_LEN: totalItems[0].PASS_MIN_LEN,
          PASS_WARN_AGE: totalItems[0].PASS_WARN_AGE,
          PermitRootLogin: totalItems[0].PermitRootLogin === 'yes' ? true : false
        }
        this.setState({
					saveParams
				});
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '安全加固策略查询失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '安全加固策略查询失败: ' + error,
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

  setUpdateDate(e, type) {
		let { saveParams } = this.state;
		saveParams[type] = e.target.value;
		this.setState({ saveParams });
	}

  setUpdateSwitchDate(e, type) {
    let { saveParams } = this.state;
		saveParams[type] = e.target.checked;
		this.setState({ saveParams });
  }

	async saveDate() {
		const { saveParams, detailsItem, isCluster } = this.state;
    let reg = /^[0-9]+$/;
    if (!saveParams.PASS_MAX_DAYS || !saveParams.PASS_MIN_DAYS || !saveParams.PASS_WARN_AGE || !saveParams.PASS_MIN_LEN) {
			this.showToast(
				'danger',
				'警告',
				'安全加固策略保存失败: 密码有效时间、密码修改最短时间、密码过期提醒时间、密码长度为必填',
				3000
			);
    }
		else if (!reg.test(saveParams.PASS_MAX_DAYS) || !reg.test(saveParams.PASS_MIN_DAYS) || !reg.test(saveParams.PASS_WARN_AGE) || !reg.test(saveParams.PASS_MIN_LEN)) {
			this.showToast(
				'danger',
				'警告',
				'安全加固策略保存失败: 密码有效时间、密码修改最短时间、密码过期提醒时间、密码长度须为正整数',
				3000
			);
		}
		else {
      let url = isCluster ? '/cluster/hostreinforcementconfiguration?pretty=true' : `/manager/hostreinforcementconfiguration?pretty=true`;
      Object.keys(saveParams).map(k => {
        if (saveParams[k] && k !== 'PermitRootLogin') {
          url += `&&${k}=${saveParams[k]}`
        }
				else {
					url += `&&${k}=${saveParams[k] ? 'yes' : 'no'}`
				}
      })
      url += `&&PermitRootLoginGroup=${detailsItem}`

			const rawItems = await WzRequest.apiReq('PUT', url, {});
      
			const total_failed_items = ((rawItems || {}).data || {}).data.total_failed_items;
			// const saveResult = ((rawItems || {}).data || {}).data.affected_items[0]
      if (total_failed_items === 0) {
        this.setState({
					saveResult: '执行成功',
					isModalVisible: true
				});
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '安全加固策略保存失败: ' + error,
          3000
        );
      }
		}
	}

	render() {
		const { paramOptions, saveParams, isModalVisible, saveResult } = this.state;
		let modal;
		if (isModalVisible) {
      modal = (
        <EuiOverlayMask>
          <EuiModal onClose={() => this.setState({isModalVisible: false})} initialFocus="[name=popswitch]">
            <EuiModalHeader>
              <EuiModalHeaderTitle>
                <h1>安全加固策略执行结果</h1>
              </EuiModalHeaderTitle>
            </EuiModalHeader>

            <EuiModalBody style={{maxHeight: '450px', overflowY: 'auto'}}>
							<p style={{whiteSpace: 'pre-wrap'}}>{saveResult}</p>
            </EuiModalBody>

            <EuiModalFooter>
              <EuiButtonEmpty onClick={() => this.setState({isModalVisible: false})}>确认</EuiButtonEmpty>
            </EuiModalFooter>
          </EuiModal>
        </EuiOverlayMask>
      );
    }

		return (
			<div>
        <EuiSpacer size="m"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem>
            <EuiTitle size={'xs'} style={{ padding: '6px 0px' }}>
              <h4>{`安全加固`}</h4>
            </EuiTitle>
          </EuiFlexItem>
        </EuiFlexGroup>
        {Object.keys(paramOptions).map((idx) => (
          <EuiFlexGroup key={idx} alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 175 }}>
              <EuiText textAlign="right">{paramOptions[idx].label}:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 205 }}>
            { paramOptions[idx].inputType === 'number' && (
              <EuiFieldNumber
                value={saveParams[paramOptions[idx].type]}
                onChange={(e) => this.setUpdateDate(e, paramOptions[idx].type)}
                min={0}
              />
            )}
            { paramOptions[idx].inputType === 'switch' && (
              <EuiSwitch
                label=""
                checked={saveParams[paramOptions[idx].type]}
                onChange={(e) => this.setUpdateSwitchDate(e, paramOptions[idx].type)}
              />
            )}
            </EuiFlexItem>
            <EuiFlexItem grow={false} style={{ width: 610 }}>
              <EuiTextColor color="subdued">{paramOptions[idx].note}</EuiTextColor>
            </EuiFlexItem>
          </EuiFlexGroup>
        ))}
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveDate()}
        >
          保存
        </EuiButton>
        {modal}
      </div>
		);
	}
};