import React, { Component } from 'react';
import {
  EuiFlexGrid,
	EuiFlexGroup,
	EuiFlexItem,
	EuiTitle,
  EuiSpacer,
  EuiButtonEmpty,
	EuiFieldNumber,
	EuiFieldText,
	EuiText,
  EuiSelect,
  EuiButton,
  EuiTextColor,
  EuiCodeBlock,
} from '@elastic/eui';
import { getToasts} from '../../../kibana-services';
import { WzRequest } from '../../../react-services/wz-request';

export class TaskLogs extends Component {
  _isMount = false;
  constructor(props) {
    super(props);
    this.offset = 315;
    this.state = {
      formOptions: [
        {label: '任务名称', params: 'title', inputType: 'text'},
        {label: '任务完成时间', params: 'date_created', inputType: 'text'},
      ],
      formParams: {
        title: '',
        date_created: ''
      },
      logsList: ''
    }
  }

  updateHeight = () => {
    this.height = window.innerHeight - this.offset;
    this.forceUpdate();
  };

  async componentDidMount() {
    this.height = window.innerHeight - this.offset;
    window.addEventListener('resize', this.updateHeight);
    this._isMount = true;
    await this.getDetails();
  }

  showToast = (color, title, text, time) => {
    getToasts().add({
      color: color,
      title: title,
      text: text,
      toastLifeTimeMs: time
    });
  };

  async getDetails() {
    try {
      const res = await WzRequest.apiReq('PUT', `/manager/agentmanage?pretty=true&login_alias=${encodeURIComponent(this.props.detailsTasks)}&login_operation=status`, {});
      const tasksItems = (
        ((res || {}).data || {}).data || {}
      ).affected_items[0]
      let formParams = {
        title: tasksItems.task,
        date_created: tasksItems.logtime
      }
      let logsList = tasksItems.log
      this.setState({ formParams, logsList })
    } catch (error) {
      this.showToast(
        'danger',
        '警告',
        '任务运行结果获取失败: ' + error,
        3000
      );
    }
  }

  render() {
    const {
      formParams,
      formOptions,
      logsList
    } = this.state;
    return (
      <div>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiTitle>
              <h2>任务运行日志</h2>
            </EuiTitle>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty
              size="s"
              onClick={() => this.props.toList()}
              iconType="cross"
            >
              关闭
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiSpacer></EuiSpacer>
        <EuiFlexGrid columns={2}>
        {Object.keys(formOptions).map((idx) => (
          <EuiFlexItem key={idx}>
            <EuiFlexGroup alignItems="center">
              <EuiFlexItem grow={false} style={{ minWidth: 105 }}>
                <EuiText textAlign="right">
                  {formOptions[idx].label}:
                </EuiText>
              </EuiFlexItem>
              <EuiFlexItem>
                <p>{formParams[formOptions[idx].params]}</p>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
        ))}
        </EuiFlexGrid>
        <EuiSpacer></EuiSpacer>
        <EuiTitle size={'s'} style={{ padding: '6px 0px' }}>
          <h2>运行日志</h2>
        </EuiTitle>
        <EuiCodeBlock
          fontSize="s"
          paddingSize="m"
          color="dark"
          overflowHeight={this.height}
        >
          {logsList}
        </EuiCodeBlock>
      </div>
    )
  }
}
