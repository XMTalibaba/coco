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

export class AgentConfiguration extends Component {
  _isMount = false;
	constructor(props) {
		super(props);
		this.state = {
      isDescPopoverOpen: false,
      detailsItem: '',
			paramOptions: [
        {
          label: '系统一致性检查时间',
          note: '秒',
          type: 'rootcheckscantime',
          inputType: 'number'
        },
				{
          label: '系统信息收集时间',
          note: '时',
          type: 'syscollectorscantime',
          inputType: 'number'
        },
				{
          label: '文件完整性扫描时间',
          note: '秒',
          type: 'File_integrityscantime',
          inputType: 'number'
        }
			],
			saveParams: {
				rootcheckscantime: '',
				syscollectorscantime: '',
				File_integrityscantime: ''
			},
			isModalVisible: false,
			saveResult: ''
    };
	}

	async componentDidMount() {
    this._isMount = true;
    this.setState({detailsItem: this.props.policyManageType});
    if (this.props.policyManageType) this.getConfig(this.props.policyManageType);
  }
  componentWillUnmount() {
    this._isMount = false;
  }
  async componentDidUpdate(prevProps, prevState) {
    if (this.props.selectView === 'agentConfiguration' && prevProps.policyManageType !== this.props.policyManageType) {
      this.setState({detailsItem: this.props.policyManageType});
      this.getConfig(this.props.policyManageType);
    }
  }

  async getConfig(detailsItem) {
    try {
      const rawItems = await WzRequest.apiReq('GET', `/agent/configuration?AgentconfGroup=${detailsItem}`, {});
      
			const totalItems = ((rawItems || {}).data || {}).data.affected_items;
      if (totalItems.length > 0) {
        let saveParams = {
          File_integrityscantime: totalItems[0].fileintegrityscantime,
          rootcheckscantime: totalItems[0].rootcheckscantime,
          syscollectorscantime: totalItems[0].syscollectorscantime
        }
        this.setState({
					saveParams
				});
      }
      else {
        this.showToast(
          'danger',
          '警告',
          'Agent策略查询失败',
          3000
        );
      }
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        'Agent策略查询失败: ' + error,
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
		const { saveParams, detailsItem } = this.state;
    let reg = /^[0-9]+$/;
    if (!saveParams.rootcheckscantime || !saveParams.syscollectorscantime || !saveParams.File_integrityscantime) {
			this.showToast(
				'danger',
				'警告',
				'Agent策略保存失败: 系统一致性检查时间、系统信息收集时间、文件完整性扫描时间为必填',
				3000
			);
    }
		else if (!reg.test(saveParams.rootcheckscantime) || !reg.test(saveParams.syscollectorscantime) || !reg.test(saveParams.File_integrityscantime)) {
			this.showToast(
				'danger',
				'警告',
				'Agent策略保存失败: 系统一致性检查时间、系统信息收集时间、文件完整性扫描时间须为正整数',
				3000
			);
		}
		else {
      let url = `/agent/configuration?pretty=true`;
      Object.keys(saveParams).map(k => {
        url += `&&${k}=${saveParams[k]}`
      })
      url += `&&AgentconfGroup=${detailsItem}`

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
          'Agent策略保存失败',
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
                <h1>Agent策略执行结果</h1>
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
              <h4>{`扫描周期`}</h4>
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
            <EuiFlexItem grow={false} style={{ width: 200 }}>
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