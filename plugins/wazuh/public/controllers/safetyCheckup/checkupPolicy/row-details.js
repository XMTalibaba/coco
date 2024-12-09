import React, { Component } from 'react';
import {
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
	EuiFieldText,
	EuiText,
  EuiButton,
  EuiSelect,
  EuiTextColor,
  EuiOverlayMask,
  EuiModal,
  EuiModalHeader,
  EuiModalHeaderTitle,
  EuiModalBody,
  EuiModalFooter,
  EuiCheckboxGroup,
} from '@elastic/eui';
import './row-details.scss';

export class RowDetails extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.state = {
      checkboxOptions: [
        {
					id: 'risk_password',
					label: '高危账号'
				},
        {
					id: 'sca',
					label: '缺陷配置'
				},
        {
					id: 'virus',
					label: '木马病毒'
				},
        {
					id: 'webshell',
					label: '网页后门'
				},
        {
					id: 'shell_process',
					label: '反弹shell'
				},
        {
					id: 'abnormal_account',
					label: '异常账号'
				},
        {
					id: 'log_delete',
					label: '日志删除'
				},
        {
					id: 'abnormal_process',
					label: '异常进程'
				},
        {
					id: 'system_cmd',
					label: '系统命令校验'
				}
      ],
      checkboxSelected: {}
    }
  }

  async componentDidMount() {
    this._isMount = true;

    const { checkboxOptions } = this.state;
    const { selectItem } = this.props;
    let checkboxSelected = {}
    checkboxOptions.forEach(k => {
      let key = k.id
      if (selectItem[key] === 'True') {
        checkboxSelected[key] = true
      }
      else{
        checkboxSelected[key] = false
      }
    })
    this.setState({ checkboxSelected })
  }

  render() {
    const { checkboxOptions, checkboxSelected } = this.state;
    const { selectItem } = this.props;
    return (
      <div>
        <EuiFlexGroup alignItems="center">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">监控对象:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            {selectItem.agent_list !== 'empty' && ('主机')}
            {selectItem.agent_group !== 'empty' && ('主机分组')}
          </EuiFlexItem>
        </EuiFlexGroup>
        {selectItem.agent_list !== 'empty' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">监控主机:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {selectItem.agent_list}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        {selectItem.agent_group !== 'empty' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">监控主机分组:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {selectItem.agent_group}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        {selectItem.task_mode === 'period' && (
          <EuiFlexGroup alignItems="center">
            <EuiFlexItem grow={false} style={{ width: 100 }}>
              <EuiText textAlign="right">每日体检时间:</EuiText>
            </EuiFlexItem>
            <EuiFlexItem>
              {selectItem.period_time}
            </EuiFlexItem>
          </EuiFlexGroup>
        )}
        <EuiFlexGroup alignItems="stretch">
          <EuiFlexItem grow={false} style={{ width: 100 }}>
            <EuiText textAlign="right">体检项目:</EuiText>
          </EuiFlexItem>
          <EuiFlexItem>
            <EuiCheckboxGroup
              options={checkboxOptions}
              idToSelectedMap={checkboxSelected}
              onChange={() => {}}
              disabled={true}
              className="wz-checkup-toggle"
            />
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    )
  }

}