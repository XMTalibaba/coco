import React, { Component, Fragment } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
	EuiText,
	EuiSpacer,
	EuiTextColor,
  EuiDatePicker,
  EuiButton,
} from '@elastic/eui';
import { getToasts }  from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';
import WzRestartClusterManagerCallout from '../../../components/common/restart-cluster-manager-callout';
import moment from 'moment';

export class NonWorkingTime extends Component {
  constructor(props) {
		super(props);
		this.state = {
			formParams: {
        startTime: null,
        endTime: null
      },
			showWarningRestartIsDisabledService: false,
    };
	}

  async componentDidMount() {
		await this.getItems();
  }

  async getItems() {
		try {
      let formParams = {
        startTime: null,
        endTime: null
      }
			const resItems = await WzRequest.apiReq('GET', `/rules?pretty=true&rule_ids=17101&select=details.time`, {});
			const { time } = ((((resItems || {}).data || {}).data || {}).affected_items[0] || {}).details
			formParams = {
        startTime: moment(time.split('-')[0], 'HH:mm'),
        endTime: moment(time.split('-')[1], 'HH:mm')
      }

      this.setState({
				formParams
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

  async saveDate() {
		const { formParams } = this.state;
		const rawItems = await WzRequest.apiReq('PUT', `/manager/update_rule?pretty=true&filename=0215-policy_rules.xml&rule_id=17101&field=time&condition=${formParams.startTime.format('HH:mm')}-${formParams.endTime.format('HH:mm')}`, {});
      
		const items_message = ((rawItems || {}).data || {}).message;
		if (items_message.includes('failed')) {
      this.showToast(
				'danger',
				'警告',
				'工作时间保存失败',
				3000
			);
			return
		}
    else if (!items_message.includes('no change')) {
			this.setState({
				showWarningRestartIsDisabledService: true
			});
    }
    this.showToast(
      'success',
      '成功',
      '工作时间保存成功',
      3000
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

  changeDate(date, type) {
    const { formParams } = this.state;
    formParams[type] = date;
    this.setState({ formParams })
  }

  render() {
    const { formParams, showWarningRestartIsDisabledService } = this.state;
		return (
			<div>
				<EuiSpacer size="s"></EuiSpacer>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false}>
            <EuiTitle size="xs">
              <h4>非工作时间</h4>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiTextColor color="subdued">配置非工作时间段，用于检测账户非工作时间登录异常告警</EuiTextColor>
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
          <EuiFlexItem grow={false} style={{ width: 75 }}>
            <EuiText textAlign="right">开始时间:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiDatePicker
              showTimeSelect
              showTimeSelectOnly
              selected={formParams.startTime}
              onChange={(date) => this.changeDate(date, 'startTime')}
              dateFormat="HH:mm"
              timeFormat="HH:mm"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 75 }}>
            <EuiText textAlign="right">结束时间:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiDatePicker
              showTimeSelect
              showTimeSelectOnly
              selected={formParams.endTime}
              onChange={(date) => this.changeDate(date, 'endTime')}
              dateFormat="HH:mm"
              timeFormat="HH:mm"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
				<EuiSpacer></EuiSpacer>
        <EuiButton
          size="s"
          onClick={() => this.saveDate()}
        >
          保存
        </EuiButton>
			</div>
		)
  }
}