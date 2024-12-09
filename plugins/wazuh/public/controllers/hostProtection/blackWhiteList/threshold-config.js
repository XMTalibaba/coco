import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiText,
	EuiSpacer,
	EuiTextColor,
  EuiSelect,
  EuiButton,
  EuiSwitch,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';

export class ThresholdConfig extends Component {
  _isMount = false;
	constructor(props) {
    super(props);
		this.state = {
			alarmParams: {
				level_low: '',
				level_high: ''
			},
      paramDormancyOptions: [
        {
          label: '内存',
          note: '',
          type: 'mem',
          inputType: 'select'
        },
				{
          label: 'CPU',
          note: '',
          type: 'cpu',
          inputType: 'select'
        },
			],
      isDormancy: false,
			dormancyParams: {
				mem: '',
				cpu: '',
			},
			showWarningRestart: false,
    }
  }

  async componentDidMount() {
    this._isMount = true;
    await this.getAlertItems();
    await this.getDormancyItems();
  }
  componentWillUnmount() {
    this._isMount = false;
  }

  async getAlertItems() {
    try {
      const alarmItems = await WzRequest.apiReq('GET', `/agents/hardwareusedinforagentconfig?pretty=true`, {});
			const alarmParams = (
        ((alarmItems || {}).data || {}).data || {}
      ).affected_items[0];

      this._isMount &&
        this.setState({
          alarmParams
        });
    } catch (error) {
      console.log(error)
    }
  }

  async getDormancyItems() {
    try {
      const rawItems = await WzRequest.apiReq('GET', `/manager/microisolation/agentdaemon?pretty=true&wait_for_complete=true`, {
        params:{
          raw: true
        }
      });

      const result = (rawItems || {}).data || '';
      let isDormancy = false
      let dormancyParams = {
				mem: '',
				cpu: '',
			}
      
			result.split('\n').forEach(k => {
        let arr = k.split(':');
        if (arr[0] === 'status') {
          isDormancy = arr[1] === '1'
        }
        else {
          dormancyParams[arr[0]] = arr[1];
        }
      });
      this.setState({ isDormancy, dormancyParams })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '休眠配置查询失败: ' + error,
        3000
      );
    }
  }

  async saveAlarmDate() {
		const { alarmParams } = this.state;

		if (!alarmParams.level_low || !alarmParams.level_high) {
			this.showToast(
				'danger',
				'警告',
				'告警阈值配置保存失败: 代理告警最低等级、代理告警最高等级为必填',
				3000
			);
		}
		else {
			const rawAlarm = await WzRequest.apiReq('PUT', `/agents/hardwareusedinforagentconfig?pretty=true&&level_low=${alarmParams.level_low}&&level_high=${alarmParams.level_high}`, {});
      
			const affected_alarm = ((rawAlarm || {}).data || {}).data.total_affected_items;
      if (affected_alarm === 1) {
				this.getAlertItems();
        this.showToast(
          'success',
          '成功',
          '告警阈值配置保存成功',
          3000
        );
        this.setState({
          showWarningRestart: true
        });
      }
      else {
        this.showToast(
          'danger',
          '警告',
          '告警阈值配置保存失败',
          3000
        );
      }
		}
	}

  setUpdateIsDormancy(e) {
    let isDormancy = e.target.checked;
    this.setState({ isDormancy }, this.saveDormancyDate)
  }

  async saveDormancyDate() {
		const { isDormancy, dormancyParams } = this.state;
    if (!dormancyParams.mem || !dormancyParams.cpu) {
			this.showToast(
				'danger',
				'警告',
				'休眠配置保存失败: 内存、CPU不可传空',
				3000
			);
    }
		else {
      try {
        const content = `status:${isDormancy ? '1' : '0'}\nmem:${dormancyParams.mem}\ncpu:${dormancyParams.cpu}`
        await WzRequest.apiReq('PUT', `/manager/microisolation/agentdaemon?pretty=true&wait_for_complete=true`, {
          params: {
            overwrite: true
          },
          body: content.toString(),
          origin: 'raw'
        });

        this.showToast(
          'success',
          '成功',
          '休眠配置保存成功',
          3000
        );

        this.getDormancyItems()
      } catch (error) {
        this.showToast(
          'danger',
          '警告',
          '休眠配置保存失败: ' + error,
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

  onChangeAlarm(e, type) {
		const { alarmParams } = this.state;
		alarmParams[type] = e.target.value;
		this.setState({ alarmParams });
	}

  setUpdateDate(e, type) {
		let { dormancyParams } = this.state;
		dormancyParams[type] = e.target.value;
		this.setState({ dormancyParams });
	}

  render() {
    const { alarmParams, paramDormancyOptions, dormancyParams, showWarningRestart, isDormancy } = this.state;
    const alarmOptions = [
			{ value: '10%', text: '10%'},
			{ value: '20%', text: '20%'},
			{ value: '30%', text: '30%'},
			{ value: '40%', text: '40%'},
			{ value: '50%', text: '50%'},
			{ value: '60%', text: '60%'},
			{ value: '70%', text: '70%'},
			{ value: '80%', text: '80%'},
			{ value: '90%', text: '90%'}
		];
    const percentOptions = [
			{ value: '', text: '请选择'},
			{ value: '10', text: '10%'},
			{ value: '20', text: '20%'},
			{ value: '30', text: '30%'},
			{ value: '40', text: '40%'},
			{ value: '50', text: '50%'},
			{ value: '60', text: '60%'},
			{ value: '70', text: '70%'},
			{ value: '80', text: '80%'},
			{ value: '90', text: '90%'}
		];

    return (
			<div>
        <EuiSpacer size="s"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h4>告警阈值配置</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">代理CPU、内存超过配置阈值，会出现对应等级告警</EuiTextColor>
          </EuiFlexItem>
        </EuiFlexGroup>
        {showWarningRestart && (
          <Fragment>
            <EuiSpacer size='s'/>
            <WzRestartClusterManagerCallout
              onRestart={() => this.setState({showWarningRestart: true})}
              onRestarted={() => this.setState({showWarningRestart: false})}
              onRestartedError={() => this.setState({showWarningRestart: true})}
            />
          </Fragment>
        )}
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">中危等级:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiSelect
              options={alarmOptions}
              value={alarmParams.level_low}
              onChange={(e) => this.onChangeAlarm(e, 'level_low')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">高危等级:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false} style={{ width: 205 }}>
            <EuiSelect
              options={alarmOptions}
              value={alarmParams.level_high}
              onChange={(e) => this.onChangeAlarm(e, 'level_high')}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveAlarmDate()}
        >
          保存
        </EuiButton>
        <EuiSpacer size="m" />
        <EuiSpacer size="xs" style={{backgroundColor: '#E5F1FA'}} />
        <EuiSpacer size="m" />
        <EuiFlexGroup alignItems="center">
					<EuiFlexItem grow={false}>
						<EuiTitle size="xs">
							<h4>自动休眠配置</h4>
						</EuiTitle>
					</EuiFlexItem>
					<EuiFlexItem>
						<EuiTextColor color="subdued"></EuiTextColor>
					</EuiFlexItem>
				</EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 130 }}>
            <EuiText textAlign="right">是否开启自动休眠:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiSwitch
              label=""
              checked={isDormancy}
              onChange={(e) => this.setUpdateIsDormancy(e)}
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        { isDormancy && (
          <div>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false}>
                <EuiTitle size={'xs'}>
                  <h4>{`休眠阈值配置`}</h4>
                </EuiTitle>
              </EuiFlexItem>
              <EuiFlexItem>
                <EuiTextColor color="subdued">当代理应用占用系统资源超过以下设置的阈值，Agent自动休眠</EuiTextColor>
              </EuiFlexItem>
            </EuiFlexGroup>
            {Object.keys(paramDormancyOptions).map((idx) => (
              <EuiFlexGroup key={idx} alignItems="center">
                <EuiFlexItem grow={false} style={{ width: 100 }}>
                  <EuiText textAlign="right">{paramDormancyOptions[idx].label}:</EuiText>
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ width: 205 }}>
                { paramDormancyOptions[idx].inputType === 'select' && (
                  <EuiSelect
                    options={percentOptions}
                    value={dormancyParams[paramDormancyOptions[idx].type]}
                    onChange={(e) => this.setUpdateDate(e, paramDormancyOptions[idx].type)}
                  />
                )}
                </EuiFlexItem>
                <EuiFlexItem grow={false} style={{ width: 200 }}>
                  <EuiTextColor color="subdued">{paramDormancyOptions[idx].note}</EuiTextColor>
                </EuiFlexItem>
              </EuiFlexGroup>
            ))}
            <EuiSpacer></EuiSpacer>
            <EuiButton
              size="s"
              onClick={() => this.saveDormancyDate()}
            >
              保存
            </EuiButton>
          </div>
        )}
      </div>
    )
  }
}